#!/bin/bash

# OpenClaw Voice - Performance Test Script
# Pruebas de carga, latencia, uso de recursos

set -euo pipefail

IP="${OPENCLAW_IP:-217.182.244.180}"
HTTP_PORT="${HTTP_PORT:-3002}"
HTTPS_PORT="${HTTPS_PORT:-3443}"
USE_HTTPS="${USE_HTTPS:-false}"
BASE_URL="http://$IP:$HTTP_PORT"
if [[ "$USE_HTTPS" == "true" ]]; then
    BASE_URL="https://$IP:$HTTPS_PORT"
fi
HEALTH_ENDPOINT="/health"
TRANSCRIBE_ENDPOINT="/api/transcribe"

# Parámetros de prueba
CONCURRENT_USERS="${CONCURRENT_USERS:-5}"
REQUESTS_PER_USER="${REQUESTS_PER_USER:-20}"
LONG_AUDIO_DURATION="${LONG_AUDIO_DURATION:-180}"  # 3 minutos en segundos

# Archivos temporales
TEMP_DIR=$(mktemp -d)
TEMP_WAV="$TEMP_DIR/test_perf.wav"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_info()    { echo -e "${BLUE}[i]${NC} $1"; }

cleanup() {
    rm -rf "$TEMP_DIR"
    log_info "Archivos temporales limpiados"
}
trap cleanup EXIT

generate_test_audio() {
    local duration=$1
    log_info "Generando audio de prueba de ${duration}s..."
    
    if command -v sox &>/dev/null; then
        sox -n -r 16000 -c 1 -b 16 "$TEMP_WAV" synth "$duration" sine 440 2>/dev/null || return 1
    elif command -v ffmpeg &>/dev/null; then
        ffmpeg -f lavfi -i "sine=frequency=440:sample_rate=16000:duration=$duration" -c:a pcm_s16le "$TEMP_WAV" -y 2>/dev/null || return 1
    else
        log_error "No se puede generar audio (sox/ffmpeg no instalados)"
        return 1
    fi
    log_success "Audio generado: $TEMP_WAV ($(stat -c%s "$TEMP_WAV") bytes)"
}

check_dependencies() {
    local missing=()
    for cmd in curl bc; do
        if ! command -v "$cmd" &>/dev/null; then
            missing+=("$cmd")
        fi
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Faltan dependencias: ${missing[*]}"
        return 1
    fi
    log_success "Dependencias básicas verificadas"
    return 0
}

test_health_response_time() {
    log_info "Midiendo tiempo de respuesta de health endpoint..."
    local total=0
    local count=5
    local url="$BASE_URL$HEALTH_ENDPOINT"
    
    for ((i=1; i<=count; i++)); do
        local start
        start=$(date +%s.%N)
        curl -k -s -o /dev/null --max-time 10 "$url" 2>/dev/null || true
        local end
        end=$(date +%s.%N)
        local elapsed
        elapsed=$(echo "$end - $start" | bc -l)
        total=$(echo "$total + $elapsed" | bc -l)
        log_info "  Intento $i: ${elapsed}s"
        sleep 0.5
    done
    
    local avg
    avg=$(echo "$total / $count" | bc -l)
    log_success "Tiempo promedio de respuesta health: ${avg}s"
    
    # Umbral de aceptación
    local threshold=1.0
    if (( $(echo "$avg <= $threshold" | bc -l) )); then
        log_success "Latencia dentro del umbral (<= ${threshold}s)"
    else
        log_warning "Latencia superior al umbral (${threshold}s)"
    fi
}

test_transcribe_response_time() {
    local audio_file=$1
    local url="$BASE_URL$TRANSCRIBE_ENDPOINT"
    
    if [[ ! -f "$audio_file" ]]; then
        log_error "Archivo de audio no encontrado"
        return 1
    fi
    
    log_info "Midiendo tiempo de transcripción..."
    local start
    start=$(date +%s.%N)
    
    local status_code
    status_code=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 30 \
        -X POST \
        -H "Content-Type: audio/wav" \
        --data-binary @"$audio_file" \
        "$url" 2>/dev/null || true)
    
    local end
    end=$(date +%s.%N)
    local elapsed
    elapsed=$(echo "$end - $start" | bc -l)
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Transcripción exitosa en ${elapsed}s (HTTP $status_code)"
    else
        log_warning "Transcripción falló en ${elapsed}s (HTTP $status_code)"
    fi
    
    # Umbral según duración del audio (esperado < duración + 2s)
    local audio_duration=3  # asumimos 3s para el audio corto
    local threshold=$(echo "$audio_duration + 2" | bc -l)
    if (( $(echo "$elapsed <= $threshold" | bc -l) )); then
        log_success "Tiempo de transcripción dentro del umbral (<= ${threshold}s)"
    else
        log_warning "Tiempo de transcripción excedido (${threshold}s)"
    fi
}

test_concurrent_load() {
    log_info "Probando carga concurrente ($CONCURRENT_USERS usuarios, $REQUESTS_PER_USER solicitudes cada uno)..."
    
    if ! command -v ab &>/dev/null; then
        log_warning "Apache Bench (ab) no instalado, usando curl secuencial"
        test_concurrent_curl
        return
    fi
    
    local url="$BASE_URL$HEALTH_ENDPOINT"
    local total_requests=$((CONCURRENT_USERS * REQUESTS_PER_USER))
    
    log_info "Ejecutando ab -n $total_requests -c $CONCURRENT_USERS $url"
    ab -n "$total_requests" -c "$CONCURRENT_USERS" -k "$url" 2>/dev/null | tail -20 || true
    
    # Extraer métricas clave
    local summary
    summary=$(ab -n "$total_requests" -c "$CONCURRENT_USERS" -k "$url" 2>/dev/null | grep -E "Requests per second:|Time per request:|Failed requests:" || true)
    echo "$summary"
}

test_concurrent_curl() {
    log_info "Simulación de carga concurrente con curl (limitada)..."
    local url="$BASE_URL$HEALTH_ENDPOINT"
    local pids=()
    local errors=0
    local total=$CONCURRENT_USERS
    
    for ((i=1; i<=total; i++)); do
        (
            curl -k -s -o /dev/null --max-time 10 "$url" 2>/dev/null
            if [[ $? -eq 0 ]]; then
                log_info "  Usuario $i: OK"
            else
                log_warning "  Usuario $i: FAIL"
            fi
        ) &
        pids+=($!)
        sleep 0.1
    done
    
    # Esperar a que todos terminen
    for pid in "${pids[@]}"; do
        wait "$pid" || ((errors++))
    done
    
    log_success "Carga concurrente completada: $((total - errors))/$total exitosos"
    if [[ $errors -gt 0 ]]; then
        log_warning "$errors errores durante carga concurrente"
    fi
}

test_long_audio() {
    log_info "Probando audio largo (${LONG_AUDIO_DURATION}s)..."
    
    generate_test_audio "$LONG_AUDIO_DURATION" || return 1
    
    local url="$BASE_URL$TRANSCRIBE_ENDPOINT"
    local start
    start=$(date +%s.%N)
    
    # Enviar con timeout mayor
    local status_code
    status_code=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time $((LONG_AUDIO_DURATION + 30)) \
        -X POST \
        -H "Content-Type: audio/wav" \
        --data-binary @"$TEMP_WAV" \
        "$url" 2>/dev/null || true)
    
    local end
    end=$(date +%s.%N)
    local elapsed
    elapsed=$(echo "$end - $start" | bc -l)
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Audio largo procesado en ${elapsed}s (HTTP $status_code)"
        # Verificar que no exceda un límite razonable (duración * 2)
        local threshold=$(echo "$LONG_AUDIO_DURATION * 2" | bc -l)
        if (( $(echo "$elapsed <= $threshold" | bc -l) )); then
            log_success "Tiempo de procesamiento dentro del umbral (<= ${threshold}s)"
        else
            log_warning "Tiempo de procesamiento excedido (${threshold}s)"
        fi
    elif [[ "$status_code" == "413" ]]; then
        log_warning "Audio largo rechazado por tamaño (HTTP 413)"
    else
        log_error "Audio largo falló (HTTP $status_code) en ${elapsed}s"
    fi
}

monitor_resources() {
    log_info "Monitoreo de recursos durante pruebas..."
    
    # Si docker está disponible, monitorear contenedores
    if command -v docker &>/dev/null; then
        log_info "Contenedores Docker:"
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "openclaw|voice" || true
        echo ""
        
        # Mostrar stats una vez
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -5
    fi
    
    # Uso de CPU y memoria del sistema
    log_info "Uso de CPU y memoria del host:"
    top -bn1 | head -5
}

# Inicio
echo "=== OpenClaw Voice - Pruebas de Rendimiento ==="
echo "URL: $BASE_URL"
echo "Configuración:"
echo "  - Usuarios concurrentes: $CONCURRENT_USERS"
echo "  - Audio largo: ${LONG_AUDIO_DURATION}s"
echo "Fecha: $(date)"
echo ""

# Verificar dependencias
check_dependencies || exit 1

# Monitoreo inicial
monitor_resources

# 1. Tiempo de respuesta health
test_health_response_time

# 2. Generar audio corto para pruebas
generate_test_audio 3 || exit 1

# 3. Tiempo de transcripción audio corto
test_transcribe_response_time "$TEMP_WAV"

# 4. Carga concurrente
test_concurrent_load

# 5. Audio largo
test_long_audio

# 6. Monitoreo final
log_info "Monitoreo después de pruebas:"
monitor_resources

# Resumen
echo ""
echo "=== Resumen de Rendimiento ==="
echo "Pruebas ejecutadas:"
echo "  1. Latencia health endpoint"
echo "  2. Latencia transcripción audio corto"
echo "  3. Carga concurrente"
echo "  4. Procesamiento audio largo"
echo ""
echo "Recomendaciones:"
echo "  - Si latencia > 2s, optimizar backend/Gateway"
echo "  - Si fallan solicitudes concurrentes, revisar límites de conexión"
echo "  - Si audio largo excede límites, revisar timeout y memoria"
echo "  - Monitorear uso de CPU/memoria en producción"
echo ""
echo "Pruebas de rendimiento completadas."

exit 0