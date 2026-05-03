#!/bin/bash

# run-all-tests.sh - Orquestación completa testing post-deploy ContentoAI
# Uso: ./run-all-tests.sh [BASE_URL]
# Ejemplo: ./run-all-tests.sh https://cntai.cenarbe.com

set -e

BASE_URL="${1:-https://cntai.cenarbe.com}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="reports/$TIMESTAMP"
SCREENSHOT_DIR="screenshots/$TIMESTAMP"

echo "=== ContentoAI Post-Deploy Testing ==="
echo "Base URL: $BASE_URL"
echo "Timestamp: $TIMESTAMP"
echo "Report dir: $REPORT_DIR"
echo

# Crear directorios
mkdir -p "$REPORT_DIR" "$SCREENSHOT_DIR"

# Exportar variables para scripts
export BASE_URL
export REPORT_DIR
export SCREENSHOT_DIR

# Función para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 1. Verificación básica de conectividad
log "Paso 1: Verificando conectividad a $BASE_URL"
if curl -s --head "$BASE_URL" | grep "HTTP/.* 200" > /dev/null; then
    log "✅ Conectividad OK"
else
    log "❌ No se pudo conectar a $BASE_URL"
    exit 1
fi

# 2. Ejecutar checklist Laravel básico (manual)
log "Paso 2: Ejecutando checklist Laravel básico (ver archivo checklist-laravel-basico.md)"
log "  Nota: Este checklist se debe ejecutar manualmente o mediante Playwright"
log "  Usar script Playwright para verificaciones automatizadas"

# 3. Ejecutar tests Playwright
log "Paso 3: Ejecutando tests Playwright"
if command -v npx &> /dev/null; then
    cd /home/node/.openclaw/workspace-tester
    BASE_URL="$BASE_URL" npx playwright test agents/tester/tests/contentoai-laravel.spec.js \
        --reporter=html,line \
        --output="$REPORT_DIR/playwright"
    log "✅ Tests Playwright completados"
else
    log "⚠️  npx no disponible, omitiendo tests Playwright"
fi

# 4. Verificar optimizaciones Kevin
log "Paso 4: Verificando optimizaciones Kevin"
cd /home/node/.openclaw/workspace-tester/agents/tester
if [ -f scripts/verify-optimizations.js ]; then
    node scripts/verify-optimizations.js 2>&1 | tee "$REPORT_DIR/optimizations.log"
    log "✅ Verificación optimizaciones completada"
else
    log "⚠️  Script verify-optimizations.js no encontrado"
fi

# 5. Verificación Regla Miranda (botones/acciones)
log "Paso 5: Verificación de botones/acciones (Regla Miranda)"
if [ -f scripts/button-action-verifier.js ]; then
    node scripts/button-action-verifier.js 2>&1 | tee "$REPORT_DIR/button-action.log"
    log "✅ Verificación botones completada"
else
    log "ℹ️  Script button-action-verifier.js no encontrado, omitiendo"
fi

# 6. Lighthouse performance test (opcional)
log "Paso 6: Lighthouse performance test"
if command -v lighthouse &> /dev/null; then
    lighthouse "$BASE_URL" \
        --output=json \
        --output-path="$REPORT_DIR/lighthouse-report.json" \
        --chrome-flags="--headless"
    log "✅ Lighthouse completado"
else
    log "ℹ️  Lighthouse CLI no instalado, omitiendo"
fi

# 7. Generar reporte consolidado
log "Paso 7: Generando reporte consolidado"
cat > "$REPORT_DIR/summary.md" << EOF
# ContentoAI Post-Deploy Testing Summary

**Fecha:** $(date)
**Base URL:** $BASE_URL
**Timestamp:** $TIMESTAMP

## Resultados

### 1. Conectividad
- ✅ Conectividad a $BASE_URL OK

### 2. Checklist Laravel Básico
- Ver archivo checklist-laravel-basico.md

### 3. Tests Playwright
- Ejecutados: agents/tester/tests/contentoai-laravel.spec.js
- Reporte HTML: $REPORT_DIR/playwright/index.html

### 4. Optimizaciones Kevin
- Log: $REPORT_DIR/optimizations.log

### 5. Regla Miranda (Botones/Acciones)
- Log: $REPORT_DIR/button-action.log

### 6. Lighthouse Performance
- Reporte JSON: $REPORT_DIR/lighthouse-report.json

## Próximos pasos
Revisar logs y determinar PASS/FAIL según criterios en TESTING_POST_DEPLOY.md
EOF

log "✅ Reporte generado en $REPORT_DIR/summary.md"

# 8. Determinar PASS/FAIL (simplificado)
log "Paso 8: Análisis de resultados"
FAILURES=0
if grep -i "❌\|error\|failed" "$REPORT_DIR/optimizations.log" 2>/dev/null; then
    log "⚠️  Se detectaron errores en optimizaciones"
    FAILURES=$((FAILURES+1))
fi

if [ -f "$REPORT_DIR/playwright/test-results.xml" ]; then
    if grep -q "failure\|error" "$REPORT_DIR/playwright/test-results.xml"; then
        log "⚠️  Tests Playwright fallaron"
        FAILURES=$((FAILURES+1))
    fi
fi

if [ $FAILURES -eq 0 ]; then
    log "✅ Todos los tests PASARON"
    echo "PASS" > "$REPORT_DIR/result.txt"
else
    log "❌ Se detectaron $FAILURES fallos"
    echo "FAIL" > "$REPORT_DIR/result.txt"
fi

log "=== Testing completado ==="
log "Reportes guardados en: $REPORT_DIR"
log "Resultado: $(cat "$REPORT_DIR/result.txt")"
log "Revisar TESTING_POST_DEPLOY.md para criterios de aceptación"

exit $FAILURES