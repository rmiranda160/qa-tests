#!/bin/bash

# OpenClaw Voice - Generador de Reporte Consolidado
# Ejecuta todas las pruebas y genera un reporte unificado

set -euo pipefail

# Configuración
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="reports/$TIMESTAMP"
LOG_DIR="$REPORT_DIR/logs"
SCREENSHOT_DIR="$REPORT_DIR/screenshots"
SUMMARY_FILE="$REPORT_DIR/summary.md"
ALL_PASSED=true

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_info()    { echo -e "${BLUE}[i]${NC} $1"; }

# Preparar directorios
mkdir -p "$LOG_DIR" "$SCREENSHOT_DIR"

# Inicio
echo "=== Generando Reporte Consolidado de OpenClaw Voice ==="
echo "Fecha: $(date)"
echo "Directorio de reporte: $REPORT_DIR"
echo ""

# Función para ejecutar prueba y capturar salida
run_test() {
    local name=$1
    local script=$2
    local log_file="$LOG_DIR/${name}.log"
    
    echo "--- Ejecutando $name ---" | tee -a "$log_file"
    echo "Comando: $script" >> "$log_file"
    echo ""
    
    local start
    start=$(date +%s.%N)
    
    # Ejecutar script, capturar salida y código de salida
    if bash -c "$script" 2>&1 | tee -a "$log_file"; then
        local exit_code=0
    else
        local exit_code=$?
    fi
    
    local end
    end=$(date +%s.%N)
    local elapsed
    elapsed=$(echo "$end - $start" | bc -l)
    
    # Registrar resultado
    if [[ $exit_code -eq 0 ]]; then
        log_success "$name completado (${elapsed}s)"
        echo "✅ PASS" >> "$log_file"
        return 0
    else
        log_error "$name falló (código $exit_code, ${elapsed}s)"
        echo "❌ FAIL (exit $exit_code)" >> "$log_file"
        ALL_PASSED=false
        return 1
    fi
}

# Lista de pruebas (script, nombre)
declare -A tests
tests["infra"]="./scripts/infrastructure_test.sh"
tests["backend"]="./scripts/backend_test.sh"
tests["security"]="./scripts/security_test.sh"
tests["frontend"]="./scripts/frontend_test.sh"
tests["performance"]="./scripts/performance_test.sh"

# Ejecutar pruebas secuencialmente
for key in "${!tests[@]}"; do
    run_test "$key" "${tests[$key]}" || true
    echo ""
done

# Ejecutar prueba de integración (Python) si está disponible
if command -v python3 &>/dev/null && [[ -f "scripts/integration_test.py" ]]; then
    echo "--- Ejecutando Integración (Python) ---"
    python3 scripts/integration_test.py 2>&1 | tee -a "$LOG_DIR/integration.log"
    if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
        log_success "Integración completada"
    else
        log_error "Integración falló"
        ALL_PASSED=false
    fi
fi

# Ejecutar prueba frontend con Puppeteer si se desea (opcional)
# if [[ -f "scripts/frontend_test.js" ]] && command -v node &>/dev/null; then
#     echo "--- Ejecutando Frontend (Puppeteer) ---"
#     node scripts/frontend_test.js 2>&1 | tee -a "$LOG_DIR/frontend_puppeteer.log"
# fi

# Generar resumen
echo ""
echo "--- Generando Resumen ---"
{
    echo "# Reporte de Testing - OpenClaw Voice"
    echo "**Fecha:** $(date +%Y-%m-%d)  "
    echo "**Hora:** $(date +%H:%M:%S)  "
    echo "**Directorio:** $REPORT_DIR  "
    echo ""
    echo "## Resumen Ejecutivo"
    echo ""
    if $ALL_PASSED; then
        echo "✅ **TODAS LAS PRUEBAS PASARON**"
    else
        echo "❌ **ALGUNAS PRUEBAS FALLARON**"
    fi
    echo ""
    echo "## Resultados por Área"
    echo ""
    echo "| Área | Estado | Log |"
    echo "|------|--------|-----|"
} > "$SUMMARY_FILE"

for key in "${!tests[@]}"; do
    local log_file="$LOG_DIR/${key}.log"
    local status
    if grep -q "❌ FAIL" "$log_file"; then
        status="❌ FAIL"
    elif grep -q "✅ PASS" "$log_file"; then
        status="✅ PASS"
    else
        status="⚠️ UNKNOWN"
    fi
    echo "| $key | $status | [log](${log_file}) |" >> "$SUMMARY_FILE"
done

echo "| integración | $(grep -q "Integración falló" "$LOG_DIR/integration.log" 2>/dev/null && echo "❌ FAIL" || echo "✅ PASS") | [log]($LOG_DIR/integration.log) |" >> "$SUMMARY_FILE"

{
    echo ""
    echo "## Problemas Identificados"
    echo ""
    # Extraer errores de logs
    for log in "$LOG_DIR"/*.log; do
        if grep -q "❌" "$log" || grep -q "FAIL" "$log" || grep -q "Error" "$log"; then
            echo "### $(basename "$log" .log)"
            echo '```'
            grep -A2 -B2 "❌\|FAIL\|Error" "$log" | head -20
            echo '```'
            echo ""
        fi
    done
    echo "## Próximos Pasos"
    echo ""
    if $ALL_PASSED; then
        echo "1. ✅ Sistema listo para revisión de producción"
        echo "2. Realizar prueba de humo final en entorno de staging"
        echo "3. Documentar cualquier observación menor"
    else
        echo "1. ❌ Resolver pruebas fallidas prioritariamente"
        echo "2. Re‑ejecutar pruebas después de correcciones"
        echo "3. Actualizar checklist de verificación"
    fi
    echo ""
    echo "---"
    echo "*Reporte generado automáticamente por OpenClaw Voice Testing Suite*"
} >> "$SUMMARY_FILE"

# Copiar plantilla de reporte completo
cp templates/report_template.md "$REPORT_DIR/report_template.md"

# Mensaje final
echo ""
echo "=== Reporte Generado ==="
echo "Resumen: $SUMMARY_FILE"
echo "Logs: $LOG_DIR/"
echo ""

if $ALL_PASSED; then
    log_success "Todas las pruebas pasaron. ¡Sistema listo!"
    exit 0
else
    log_error "Algunas pruebas fallaron. Revisar logs."
    exit 1
fi