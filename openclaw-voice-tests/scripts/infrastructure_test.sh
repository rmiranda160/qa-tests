#!/bin/bash

# OpenClaw Voice - Infrastructure Test Script
# Verifica contenedores Docker, puertos abiertos, conexión con Gateway

set -euo pipefail

# Configuración
IP="${OPENCLAW_IP:-217.182.244.180}"
PORTS=("3002" "3443" "3080" "18789")
INTERNAL_PORTS=("3001" "3000")  # Supuestos puertos internos
GATEWAY_PORT="18789"
GATEWAY_HEALTH_ENDPOINT="/health"
NGINX_HEALTH_ENDPOINT="/health"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones
log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_port() {
    local host=$1
    local port=$2
    local desc=$3
    local timeout=3
    
    if nc -z -w "$timeout" "$host" "$port" 2>/dev/null; then
        log_success "Puerto $port ($desc) acepta conexiones en $host"
        return 0
    else
        log_error "Puerto $port ($desc) no responde en $host"
        return 1
    fi
}

check_http() {
    local url=$1
    local desc=$2
    local expected_status=${3:-200}
    
    local status
    status=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || true)
    
    if [[ "$status" == "$expected_status" ]]; then
        log_success "HTTP $url ($desc) responde $status"
        return 0
    elif [[ -n "$status" ]]; then
        log_warning "HTTP $url ($desc) responde $status (esperado $expected_status)"
        return 1
    else
        log_error "HTTP $url ($desc) sin respuesta"
        return 2
    fi
}

check_https() {
    local url=$1
    local desc=$2
    
    local output
    output=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || true)
    
    if [[ "$output" =~ ^[0-9]+$ ]]; then
        log_success "HTTPS $url ($desc) responde $output"
        return 0
    else
        log_error "HTTPS $url ($desc) error de conexión TLS"
        return 1
    fi
}

check_docker_container() {
    local container=$1
    if command -v docker &>/dev/null; then
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            log_success "Contenedor Docker '$container' está corriendo"
            return 0
        else
            log_warning "Contenedor Docker '$container' no está corriendo (o docker no disponible)"
            return 1
        fi
    else
        log_warning "Docker CLI no disponible, omitiendo verificación de contenedores"
        return 2
    fi
}

# Inicio
echo "=== OpenClaw Voice - Pruebas de Infraestructura ==="
echo "Host: $IP"
echo "Fecha: $(date)"
echo ""

# 1. Verificar puertos expuestos
echo "--- Verificación de Puertos ---"
for port in "${PORTS[@]}"; do
    case $port in
        3002) desc="HTTP Frontend" ;;
        3443) desc="HTTPS Frontend" ;;
        3080) desc="HTTP Redirection" ;;
        18789) desc="Gateway OpenClaw" ;;
        *) desc="Servicio" ;;
    esac
    check_port "$IP" "$port" "$desc"
done

# 2. Verificar HTTP/HTTPS endpoints
echo ""
echo "--- Verificación de Servicios Web ---"

# HTTP frontend
check_http "http://$IP:3002" "Frontend HTTP"
check_https "https://$IP:3443" "Frontend HTTPS"
check_http "http://$IP:3080" "Redirección HTTP→HTTPS" "301"

# Gateway
check_http "http://$IP:18789" "Gateway OpenClaw"

# 3. Verificar contenedores Docker (si docker está disponible)
echo ""
echo "--- Verificación de Contenedores Docker ---"
check_docker_container "openclaw-voice-backend"
check_docker_container "openclaw-voice-nginx"
check_docker_container "openclaw-gateway"

# 4. Verificar conexión backend->gateway (simulado)
echo ""
echo "--- Verificación de Integración Backend-Gateway ---"
if check_port "$IP" "$GATEWAY_PORT" "Gateway"; then
    # Intentar health check del gateway si existe
    gateway_health_url="http://$IP:$GATEWAY_PORT$GATEWAY_HEALTH_ENDPOINT"
    curl -k -s --max-time 5 "$gateway_health_url" | grep -q "ok" && \
        log_success "Gateway health check OK" || \
        log_warning "Gateway health check no disponible (puede ser normal)"
else
    log_error "Gateway no accesible, integración imposible"
fi

# 5. Verificar variables de entorno (solo muestra advertencia)
echo ""
echo "--- Variables de Entorno ---"
if [[ -n "${OPENCLAW_GATEWAY_URL:-}" ]]; then
    log_success "OPENCLAW_GATEWAY_URL está configurada"
else
    log_warning "OPENCLAW_GATEWAY_URL no configurada (puede ser por defecto)"
fi

if [[ -n "${OPENCLAW_GATEWAY_TOKEN:-}" ]]; then
    log_success "OPENCLAW_GATEWAY_TOKEN está configurada"
else
    log_warning "OPENCLAW_GATEWAY_TOKEN no configurada (puede que no se requiera)"
fi

# Resumen
echo ""
echo "=== Resumen de Infraestructura ==="
echo "Puertos verificados: ${#PORTS[@]}"
echo "Servicios web verificados: 4"
echo "Contenedores verificados: 3"
echo ""
echo "Recomendaciones:"
echo "1. Asegurar que todos los contenedores estén corriendo"
echo "2. Verificar que el Gateway tenga el plugin STT habilitado"
echo "3. Configurar certificado TLS válido para producción"
echo ""
echo "Pruebas completadas."

exit 0