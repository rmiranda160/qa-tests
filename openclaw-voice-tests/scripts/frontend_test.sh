#!/bin/bash

# OpenClaw Voice - Frontend Test Script (Light)
# Verifica carga de página, elementos HTML, recursos JS/CSS

set -euo pipefail

IP="${OPENCLAW_IP:-217.182.244.180}"
PORT="${HTTP_PORT:-3002}"
URL="http://$IP:$PORT"
TEMP_HTML="/tmp/openclaw_frontend.html"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }

fetch_page() {
    log_warning "Descargando página $URL..."
    curl -s --max-time 10 "$URL" > "$TEMP_HTML" 2>/dev/null
    if [[ $? -eq 0 ]]; then
        log_success "Página descargada ($(stat -c%s "$TEMP_HTML") bytes)"
    else
        log_error "No se pudo descargar la página"
        return 1
    fi
}

check_title() {
    local title
    title=$(grep -i '<title>' "$TEMP_HTML" | sed 's/.*<title>\(.*\)<\/title>.*/\1/' | tr -d '\n')
    if [[ -n "$title" ]]; then
        log_success "Título de página: '$title'"
    else
        log_warning "Título de página no encontrado"
    fi
}

check_elements() {
    local elements=("h1" "button" "div.container" "script")
    for elem in "${elements[@]}"; do
        count=$(grep -c "<$elem" "$TEMP_HTML" 2>/dev/null || true)
        if [[ $count -gt 0 ]]; then
            log_success "Elemento '$elem' encontrado ($count veces)"
        else
            log_error "Elemento '$elem' no encontrado"
        fi
    done
}

check_buttons() {
    # Buscar botones por texto o clase
    if grep -q "Iniciar Voz" "$TEMP_HTML"; then
        log_success "Botón 'Iniciar Voz' encontrado"
    else
        log_error "Botón 'Iniciar Voz' no encontrado"
    fi
    
    if grep -q "Detener" "$TEMP_HTML"; then
        log_success "Botón 'Detener' encontrado"
    else
        log_error "Botón 'Detener' no encontrado"
    fi
}

check_js() {
    # Contar scripts
    local script_count
    script_count=$(grep -c '<script' "$TEMP_HTML")
    log_success "Número de scripts: $script_count"
    
    # Verificar si hay funciones clave
    if grep -q "startVoice" "$TEMP_HTML"; then
        log_success "Función JavaScript 'startVoice' presente"
    else
        log_error "Función 'startVoice' no encontrada"
    fi
    
    if grep -q "stopVoice" "$TEMP_HTML"; then
        log_success "Función JavaScript 'stopVoice' presente"
    else
        log_error "Función 'stopVoice' no encontrada"
    fi
}

check_css() {
    # Verificar estilos inline o enlace a CSS
    if grep -q "<style" "$TEMP_HTML" || grep -q "\.css" "$TEMP_HTML"; then
        log_success "CSS presente (inline o enlace)"
    else
        log_warning "CSS no encontrado (puede ser inline minimalista)"
    fi
}

check_responsive() {
    # Verificar viewport meta tag
    if grep -q "viewport" "$TEMP_HTML"; then
        log_success "Meta viewport presente (responsive design)"
    else
        log_warning "Meta viewport no encontrado (puede afectar mobile)"
    fi
}

check_links() {
    # Verificar enlaces a Gateway
    if grep -q "18789" "$TEMP_HTML"; then
        log_success "Enlace a Gateway (puerto 18789) presente"
    else
        log_warning "Enlace a Gateway no encontrado en página"
    fi
}

check_console_errors() {
    # Esta prueba requeriría un navegador real; solo placeholder
    log_warning "Pruebas de consola JavaScript requieren navegador automatizado"
    log_warning "Ejecute frontend_test.js para pruebas completas con Puppeteer"
}

# Inicio
echo "=== OpenClaw Voice - Pruebas de Frontend (Light) ==="
echo "URL: $URL"
echo "Fecha: $(date)"
echo ""

if ! fetch_page; then
    echo "No se puede continuar sin la página HTML."
    exit 1
fi

echo "--- Análisis de Página ---"
check_title
check_elements
check_buttons
check_js
check_css
check_responsive
check_links

echo ""
echo "--- Recursos Externos ---"
# Extraer URLs de scripts, CSS, imágenes
grep -o 'src="[^"]*"' "$TEMP_HTML" | sed 's/src="//;s/"//' | while read -r src; do
    if [[ $src == http* ]]; then
        log_warning "Recurso externo: $src"
    else
        log_success "Recurso local: $src"
    fi
done

echo ""
echo "--- Pruebas de Funcionalidad Básica ---"
# Simular interacción? Solo podemos verificar que los elementos existen.
log_warning "Nota: Pruebas de interacción real requieren navegador automatizado."

echo ""
echo "=== Resumen de Frontend ==="
echo "Elementos críticos:"
echo "  - Título: $(grep -i '<title>' "$TEMP_HTML" | sed 's/.*<title>\(.*\)<\/title>.*/\1/' | tr -d '\n')"
echo "  - Botones: $(grep -c 'button' "$TEMP_HTML")"
echo "  - Scripts: $(grep -c '<script' "$TEMP_HTML")"
echo ""
echo "Recomendaciones:"
echo "1. Implementar pruebas reales con Puppeteer/Playwright"
echo "2. Verificar compatibilidad cross-browser"
echo "3. Asegurar que el micrófono funcione en diferentes navegadores"
echo ""
echo "Pruebas completadas."

# Limpieza
rm -f "$TEMP_HTML"

exit 0