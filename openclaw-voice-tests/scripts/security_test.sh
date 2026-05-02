#!/bin/bash

# OpenClaw Voice - Security Test Script
# Verifica HTTPS, headers de seguridad, validación, exposición de puertos

set -euo pipefail

IP="${OPENCLAW_IP:-217.182.244.180}"
HTTP_PORT="${HTTP_PORT:-3002}"
HTTPS_PORT="${HTTPS_PORT:-3443}"
GATEWAY_PORT="${GATEWAY_PORT:-18789}"
BASE_HTTP="http://$IP:$HTTP_PORT"
BASE_HTTPS="https://$IP:$HTTPS_PORT"
GATEWAY_URL="http://$IP:$GATEWAY_PORT"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_info()    { echo -e "${BLUE}[i]${NC} $1"; }

check_https_certificate() {
    log_info "Verificando certificado HTTPS..."
    local cert_info
    cert_info=$(openssl s_client -connect "$IP:$HTTPS_PORT" -servername "$IP" -showcerts 2>/dev/null | openssl x509 -noout -text 2>/dev/null || true)
    
    if [[ -n "$cert_info" ]]; then
        log_success "Certificado TLS obtenido"
        # Verificar validez
        local issuer
        issuer=$(echo "$cert_info" | grep "Issuer:" | head -1)
        local subject
        subject=$(echo "$cert_info" | grep "Subject:" | head -1)
        echo "  $issuer"
        echo "  $subject"
        
        # Verificar si es self-signed
        if echo "$issuer" | grep -q "CN=$IP"; then
            log_warning "Certificado self-signed (aceptable para desarrollo)"
        else
            log_success "Certificado emitido por CA"
        fi
    else
        log_error "No se pudo obtener certificado"
    fi
}

check_security_headers() {
    local url=$1
    local desc=$2
    log_info "Verificando headers de seguridad en $desc..."
    
    local headers
    headers=$(curl -k -s -I --max-time 10 "$url" 2>/dev/null || true)
    
    local missing=()
    
    # Headers recomendados
    declare -A expected_headers
    expected_headers["Strict-Transport-Security"]="max-age=31536000"
    expected_headers["X-Content-Type-Options"]="nosniff"
    expected_headers["X-Frame-Options"]="DENY"
    expected_headers["Content-Security-Policy"]="default-src 'self'"
    expected_headers["Referrer-Policy"]="strict-origin-when-cross-origin"
    expected_headers["Permissions-Policy"]="microphone=self"
    
    for header in "${!expected_headers[@]}"; do
        if echo "$headers" | grep -qi "^$header:"; then
            log_success "  $header presente"
        else
            log_warning "  $header faltante"
            missing+=("$header")
        fi
    done
    
    if [[ ${#missing[@]} -eq 0 ]]; then
        log_success "Todos los headers de seguridad presentes"
    else
        log_warning "Headers faltantes: ${missing[*]}"
    fi
}

check_http_redirect() {
    log_info "Verificando redirección HTTP → HTTPS..."
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$IP:$HTTP_PORT" 2>/dev/null || true)
    local location
    location=$(curl -s -I --max-time 10 "http://$IP:$HTTP_PORT" 2>/dev/null | grep -i "^location:" || true)
    
    if [[ "$status" == "301" ]] || [[ "$status" == "302" ]]; then
        log_success "Redirección HTTP → HTTPS funcionando ($status)"
        if [[ -n "$location" ]]; then
            echo "  $location"
        fi
    else
        log_warning "No hay redirección automática a HTTPS (código $status)"
    fi
}

check_tls_versions() {
    log_info "Verificando versiones TLS soportadas..."
    local tls_versions=("tls1" "tls1_1" "tls1_2" "tls1_3")
    local supported=()
    
    for version in "${tls_versions[@]}"; do
        if openssl s_client -connect "$IP:$HTTPS_PORT" -"$version" 2>/dev/null | grep -q "CONNECTED"; then
            supported+=("$version")
        fi
    done
    
    log_success "Versiones TLS soportadas: ${supported[*]}"
    
    # Recomendaciones
    if [[ " ${supported[*]} " =~ " tls1_3 " ]]; then
        log_success "TLS 1.3 soportado (excelente)"
    fi
    if [[ " ${supported[*]} " =~ " tls1 " ]] || [[ " ${supported[*]} " =~ " tls1_1 " ]]; then
        log_warning "TLS 1.0/1.1 soportados (deberían deshabilitarse)"
    fi
}

check_cors() {
    log_info "Verificando configuración CORS..."
    local origin="https://ejemplo.com"
    local headers
    headers=$(curl -k -s -I -X OPTIONS -H "Origin: $origin" --max-time 10 "$BASE_HTTPS" 2>/dev/null || true)
    
    if echo "$headers" | grep -qi "Access-Control-Allow-Origin"; then
        log_warning "CORS habilitado (verificar dominios permitidos)"
        echo "  Headers CORS:"
        echo "$headers" | grep -i "Access-Control"
    else
        log_success "CORS no está habilitado (puede ser intencional para API interna)"
    fi
}

check_exposed_ports() {
    log_info "Escaneando puertos expuestos en $IP..."
    # Usar nmap si está disponible, sino probar puertos comunes
    local common_ports=("22" "80" "443" "3000" "3001" "3002" "3443" "3080" "18789" "5500" "5502" "5503")
    
    for port in "${common_ports[@]}"; do
        if nc -z -w 1 "$IP" "$port" 2>/dev/null; then
            log_warning "Puerto $port abierto"
        fi
    done
}

check_input_validation() {
    log_info "Probando validación de entrada (ataques básicos)..."
    
    # 1. SQL injection (si hay parámetros)
    log_warning "  Pruebas de inyección SQL omitidas (no hay parámetros conocidos)"
    
    # 2. Path traversal
    local response
    response=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_HTTPS/../../../etc/passwd" 2>/dev/null || true)
    if [[ "$response" == "400" ]] || [[ "$response" == "403" ]] || [[ "$response" == "404" ]]; then
        log_success "  Path traversal rechazado ($response)"
    else
        log_warning "  Path traversal recibió código $response"
    fi
}

check_rate_limiting() {
    log_info "Probando rate limiting (10 solicitudes rápidas)..."
    local url="$BASE_HTTPS/health"
    local i=0
    local blocked=0
    
    for ((i=1; i<=10; i++)); do
        local code
        code=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || true)
        if [[ "$code" == "429" ]] || [[ "$code" == "503" ]]; then
            blocked=1
            break
        fi
        sleep 0.1
    done
    
    if [[ $blocked -eq 1 ]]; then
        log_success "Rate limiting detectado (código $code)"
    else
        log_warning "No se detectó rate limiting (puede ser necesario para producción)"
    fi
}

# Inicio
echo "=== OpenClaw Voice - Pruebas de Seguridad ==="
echo "IP: $IP"
echo "Fecha: $(date)"
echo ""

# 1. Certificado HTTPS
check_https_certificate

# 2. Headers de seguridad (frontend HTTPS)
check_security_headers "$BASE_HTTPS" "Frontend HTTPS"

# 3. Redirección HTTP → HTTPS
check_http_redirect

# 4. Versiones TLS
check_tls_versions

# 5. CORS
check_cors

# 6. Puertos expuestos
check_exposed_ports

# 7. Validación de entrada
check_input_validation

# 8. Rate limiting
check_rate_limiting

# 9. Headers de gateway
echo ""
check_security_headers "$GATEWAY_URL" "Gateway OpenClaw"

# Resumen
echo ""
echo "=== Resumen de Seguridad ==="
echo "Aspectos verificados:"
echo "  - Certificado TLS"
echo "  - Headers de seguridad"
echo "  - Redirección HTTPS"
echo "  - Versiones TLS"
echo "  - Configuración CORS"
echo "  - Puertos expuestos"
echo "  - Validación de entrada básica"
echo "  - Rate limiting"
echo ""
echo "Recomendaciones prioritarias:"
echo "1. Agregar headers de seguridad faltantes (CSP, HSTS, etc.)"
echo "2. Deshabilitar TLS 1.0/1.1 si están habilitados"
echo "3. Configurar rate limiting para evitar abuso"
echo "4. Asegurar que solo los puertos necesarios estén abiertos"
echo "5. Usar certificado de CA válido para producción"
echo ""
echo "Pruebas de seguridad completadas."

exit 0