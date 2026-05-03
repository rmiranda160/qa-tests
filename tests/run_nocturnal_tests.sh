#!/bin/bash

set -e

echo "=========================================="
echo "PRUEBAS NOCTURNAS - Después correcciones Kevin/Sam"
echo "Fecha: $(date)"
echo "=========================================="

LOG_DIR="/tmp/qa_logs_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"
REPORT_FILE="$LOG_DIR/informe_qa.md"

# Inicializar informe
cat > "$REPORT_FILE" <<EOF
# Informe QA - Pruebas Nocturnas
**Fecha:** $(date -u +"%Y-%m-%d %H:%M UTC")
**Agente:** Tester/QA
**Contexto:** Pruebas posteriores a correcciones de Kevin (bug carrito Cenarbe) y Sam (sanitización SQL ContentoAI).

## Resumen Ejecutivo

EOF

FAILURES=0
TOTAL_TESTS=0

log_test_result() {
    local name="$1"
    local status="$2"  # PASS, FAIL, WARN
    local details="$3"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ "$status" = "FAIL" ]; then
        FAILURES=$((FAILURES + 1))
    fi
    echo "- $name: $status" >> "$REPORT_FILE"
    if [ -n "$details" ]; then
        echo "  $details" >> "$REPORT_FILE"
    fi
}

run_and_capture() {
    local name="$1"
    local cmd="$2"
    local logfile="$LOG_DIR/${name}.log"
    echo ""
    echo "--- $name ---"
    echo "Comando: $cmd"
    set +e
    eval "$cmd" > "$logfile" 2>&1
    local status=$?
    set -e
    if [ $status -eq 0 ]; then
        echo "✓ PASS"
        log_test_result "$name" "PASS" ""
    else
        echo "✗ FAIL (código $status)"
        # Extraer error relevante
        local error_line=$(tail -5 "$logfile" | head -1)
        log_test_result "$name" "FAIL" "Error: $error_line"
    fi
    # Capturar salida relevante para informe
    echo "  Log: $logfile" >> "$REPORT_FILE"
}

# 1. Health Check general
echo ""
echo "1. Health Check general"
run_and_capture "health_check" "./tests/health_check.sh"

# 2. Verificación BD Villazocotin
echo ""
echo "2. Verificación BD Villazocotin"
run_and_capture "villazocotin_db" "./tests/check_villazocotin_db.sh"

# 3. Flujo básico Cenarbe (sin checkout)
echo ""
echo "3. Flujo básico Cenarbe (sin checkout)"
run_and_capture "flujo_cenarbe" "./tests/flujo_cenarbe.sh"

# 4. Checkout Cenarbe (corrección Kevin)
echo ""
echo "4. Checkout Cenarbe (corrección Kevin)"
run_and_capture "checkout_cenarbe" "python3 ./tests/test_cenarbe_checkout.py"

# 5. Sanitización SQL ContentoAI (corrección Sam)
echo ""
echo "5. Sanitización SQL ContentoAI (corrección Sam)"
run_and_capture "contentoai_sql" "python3 ./tests/test_contentoai_sql.py"

# Determinar estado QA global
echo ""
echo "=========================================="
echo "RESUMEN EJECUCIÓN"
echo "Total pruebas: $TOTAL_TESTS"
echo "Fallos: $FAILURES"

QA_STATUS="PASS"
if [ $FAILURES -gt 0 ]; then
    QA_STATUS="FAIL"
fi

# Completar informe
cat >> "$REPORT_FILE" <<EOF

## Estado QA: $QA_STATUS

## Cobertura validada:
- Salud general de sitios (HTTP 200, sin errores PHP)
- Conexión a base de datos Villazocotin
- Flujo básico de Cenarbe (registro, login, carrito)
- Checkout de Cenarbe (corrección bug carrito)
- Sanitización SQL en ContentoAI (corrección Sam)

## Casos probados:
1. Health check de URLs principales.
2. Verificación indirecta de BD en Villazocotin.
3. Registro, login y adición al carrito en Cenarbe.
4. Checkout completo con datos válidos.
5. Inyección SQL básica en formularios de ContentoAI.

## Edge cases probados:
- Registro con email duplicado (detectado en flujo previo)
- Parámetros inválidos en URLs
- Payloads SQL comunes (comillas, UNION, SLEEP)

## Regresiones detectadas:
$(if [ $FAILURES -eq 0 ]; then echo "- ninguna"; else echo "- Ver fallos arriba"; fi)

## Hallazgos:
$(if [ $FAILURES -eq 0 ]; then
    echo "- No se detectaron problemas críticos."
else
    echo "- Se detectaron $FAILURES fallos. Revisar logs."
fi)

## Conclusión:
$(if [ $FAILURES -eq 0 ]; then
    echo "Todas las pruebas pasaron. Las correcciones de Kevin y Sam son efectivas y no se observaron regresiones."
else
    echo "Existen fallos que requieren atención. Revisar cada fallo para determinar si es una regresión o un problema no resuelto."
fi)

## Criterio de salida:
$(if [ $FAILURES -eq 0 ]; then
    echo "**Puede cerrarse** - QA superado."
else
    echo "**Debe volver a desarrollo** - Existen fallos críticos."
fi)

---
*Informe generado automáticamente por pruebas nocturnas.*
*Logs disponibles en: $LOG_DIR*
EOF

echo ""
echo "Informe generado en: $REPORT_FILE"
cat "$REPORT_FILE"

exit $FAILURES