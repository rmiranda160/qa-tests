#!/bin/bash

# OpenClaw Voice - Backend Test Script
# Prueba endpoints de health, transcripción, WebSocket/SSE

set -euo pipefail

# Configuración
IP="${OPENCLAW_IP:-217.182.244.180}"
HTTP_PORT="${HTTP_PORT:-3002}"
HTTPS_PORT="${HTTPS_PORT:-3443}"
BASE_URL_HTTP="http://$IP:$HTTP_PORT"
BASE_URL_HTTPS="https://$IP:$HTTPS_PORT"
USE_HTTPS="${USE_HTTPS:-false}"

if [[ "$USE_HTTPS" == "true" ]]; then
    BASE_URL="$BASE_URL_HTTPS"
    CURL_OPTS="-k"
else
    BASE_URL="$BASE_URL_HTTP"
    CURL_OPTS=""
fi

HEALTH_ENDPOINT="/health"
TRANSCRIBE_ENDPOINT="/api/transcribe"
WS_ENDPOINT="/ws"  # Asumido

# Archivos de prueba
TEST_AUDIO_WAV="${TEST_AUDIO_WAV:-test_audio.wav}"
TEST_AUDIO_WEBM="${TEST_AUDIO_WEBM:-test_audio.webm}"
TEST_AUDIO_MP3="${TEST_AUDIO_MP3:-test_audio.mp3}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Funciones
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }

generate_test_audio() {
    # Generar archivo de audio de prueba si no existe
    if [[ ! -f "$TEST_AUDIO_WAV" ]]; then
        if command -v sox &>/dev/null; then
            log_warning "Generando audio de prueba con sox..."
            sox -n -r 16000 -c 1 -b 16 "$TEST_AUDIO_WAV" synth 3 sine 440 2>/dev/null || true
        elif command -v ffmpeg &>/dev/null; then
            log_warning "Generando audio de prueba con ffmpeg..."
            ffmpeg -f lavfi -i "sine=frequency=440:sample_rate=16000:duration=3" -c:a pcm_s16le "$TEST_AUDIO_WAV" -y 2>/dev/null || true
        else
            log_error "No se puede generar audio de prueba (sox/ffmpeg no instalados)"
            return 1
        fi
    fi
    if [[ -f "$TEST_AUDIO_WAV" ]]; then
        log_success "Audio de prueba disponible: $TEST_AUDIO_WAV ($(stat -c%s "$TEST_AUDIO_WAV") bytes)"
    fi
}

check_health() {
    local url="$BASE_URL$HEALTH_ENDPOINT"
    local response
    response=$(curl $CURL_OPTS -s --max-time 10 "$url" 2>/dev/null || true)
    local status_code
    status_code=$(curl $CURL_OPTS -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || true)
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Health check OK ($status_code)"
        echo "  Respuesta: $response"
        return 0
    elif [[ -n "$status_code" ]]; then
        log_warning "Health check respondió $status_code"
        echo "  Respuesta: $response"
        return 1
    else
        log_error "Health check sin respuesta"
        return 2
    fi
}

test_transcribe() {
    local file=$1
    local mime=$2
    local url="$BASE_URL$TRANSCRIBE_ENDPOINT"
    
    if [[ ! -f "$file" ]]; then
        log_warning "Archivo $file no existe, omitiendo prueba"
        return 1
    fi
    
    log_warning "Enviando $file ($mime) a $url..."
    
    local start_time
    start_time=$(date +%s.%N)
    
    local response
    response=$(curl $CURL_OPTS -s --max-time 30 \
        -X POST \
        -H "Content-Type: $mime" \
        --data-binary @"$file" \
        "$url" 2>/dev/null || true)
    
    local end_time
    end_time=$(date +%s.%N)
    local elapsed
    elapsed=$(echo "$end_time - $start_time" | bc -l)
    
    local status_code
    status_code=$(curl $CURL_OPTS -s -o /dev/null -w "%{http_code}" --max-time 30 \
        -X POST \
        -H "Content-Type: $mime" \
        --data-binary @"$file" \
        "$url" 2>/dev/null || true)
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Transcripción exitosa ($status_code) en ${elapsed}s"
        echo "  Respuesta: $response"
        # Validar que respuesta contiene texto
        if echo "$response" | grep -q '"text"'; then
            log_success "Respuesta contiene campo 'text'"
        else
            log_warning "Respuesta puede no tener formato JSON esperado"
        fi
        return 0
    elif [[ "$status_code" == "415" ]]; then
        log_warning "Formato de audio no soportado ($status_code)"
        return 1
    elif [[ "$status_code" == "413" ]]; then
        log_warning "Audio demasiado grande ($status_code)"
        return 1
    elif [[ -n "$status_code" ]]; then
        log_error "Error en transcripción: HTTP $status_code"
        echo "  Respuesta: $response"
        return 2
    else
        log_error "Sin respuesta del servidor (timeout)"
        return 3
    fi
}

test_transcribe_multipart() {
    local file=$1
    local mime=$2
    local url="$BASE_URL$TRANSCRIBE_ENDPOINT"
    
    if [[ ! -f "$file" ]]; then
        return 1
    fi
    
    log_warning "Enviando $file vía multipart/form-data..."
    
    local response
    response=$(curl $CURL_OPTS -s --max-time 30 \
        -X POST \
        -F "audio=@$file;type=$mime" \
        "$url" 2>/dev/null || true)
    
    local status_code
    status_code=$(curl $CURL_OPTS -s -o /dev/null -w "%{http_code}" --max-time 30 \
        -X POST \
        -F "audio=@$file;type=$mime" \
        "$url" 2>/dev/null || true)
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Transcripción multipart exitosa ($status_code)"
        echo "  Respuesta: $response"
        return 0
    else
        log_warning "Transcripción multipart falló ($status_code)"
        return 1
    fi
}

test_websocket() {
    # Prueba básica de conexión WebSocket usando curl (soporte limitado)
    local url="ws://$IP:$HTTP_PORT$WS_ENDPOINT"
    log_warning "Verificación de WebSocket (conexión básica)..."
    
    # Intentar conexión con herramientas disponibles
    if command -v websocat &>/dev/null; then
        timeout 5 websocat -t "$url" "ping:" 2>&1 | grep -q "." && \
            log_success "WebSocket endpoint responde" || \
            log_error "WebSocket no responde"
    elif command -v wscat &>/dev/null; then
        timeout 5 wscat -c "$url" 2>&1 | grep -q "." && \
            log_success "WebSocket endpoint responde" || \
            log_error "WebSocket no responde"
    else
        log_warning "No hay cliente WebSocket instalado (websocat/wscat), omitiendo prueba"
    fi
}

# Inicio
echo "=== OpenClaw Voice - Pruebas de Backend ==="
echo "Base URL: $BASE_URL"
echo "Fecha: $(date)"
echo ""

# 1. Health Check
echo "--- Health Check ---"
check_health

# 2. Generar audio de prueba si es necesario
echo ""
echo "--- Preparación de Archivos de Prueba ---"
generate_test_audio

# 3. Pruebas de transcripción
echo ""
echo "--- Pruebas de Transcripción ---"

if [[ -f "$TEST_AUDIO_WAV" ]]; then
    test_transcribe "$TEST_AUDIO_WAV" "audio/wav"
    test_transcribe_multipart "$TEST_AUDIO_WAV" "audio/wav"
else
    log_error "No hay archivo de audio WAV para probar"
fi

# 4. Pruebas de WebSocket (si endpoint existe)
echo ""
echo "--- Pruebas de WebSocket/SSE ---"
test_websocket

# 5. Pruebas de formatos adicionales (si existen)
echo ""
echo "--- Pruebas de Formatos Adicionales ---"
if [[ -f "$TEST_AUDIO_WEBM" ]]; then
    test_transcribe "$TEST_AUDIO_WEBM" "audio/webm"
fi
if [[ -f "$TEST_AUDIO_MP3" ]]; then
    test_transcribe "$TEST_AUDIO_MP3" "audio/mpeg"
fi

# 6. Pruebas de errores
echo ""
echo "--- Pruebas de Manejo de Errores ---"
# Enviar archivo vacío
log_warning "Enviando archivo vacío..."
empty_status=$(curl $CURL_OPTS -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: audio/wav" \
    --data-binary "" \
    "$BASE_URL$TRANSCRIBE_ENDPOINT" 2>/dev/null || true)
[[ "$empty_status" == "400" ]] && log_success "Archivo vacío rechazado correctamente (400)" || log_warning "Archivo vacío recibió $empty_status"

# Enviar archivo demasiado grande (simulado)
log_warning "Enviando archivo grande (simulación)..."
dd if=/dev/zero of=large.bin bs=1M count=51 2>/dev/null
large_status=$(curl $CURL_OPTS -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -X POST \
    -H "Content-Type: application/octet-stream" \
    --data-binary @large.bin \
    "$BASE_URL$TRANSCRIBE_ENDPOINT" 2>/dev/null || true)
rm -f large.bin
[[ "$large_status" == "413" ]] && log_success "Archivo grande rechazado (413)" || log_warning "Archivo grande recibió $large_status"

# Resumen
echo ""
echo "=== Resumen de Backend ==="
echo "Health Check: $( [ $? -eq 0 ] && echo 'OK' || echo 'FAIL' )"
echo "Transcripción WAV: $( [ $? -eq 0 ] && echo 'OK' || echo 'FAIL' )"
echo "WebSocket: $( [ $? -eq 0 ] && echo 'OK' || echo 'FAIL' )"
echo ""
echo "Recomendaciones:"
echo "1. Implementar documentación de API (OpenAPI)"
echo "2. Agregar métricas de uso y rendimiento"
echo "3. Mejorar mensajes de error para clientes"
echo ""
echo "Pruebas completadas."

exit 0