#!/bin/bash

set -e

echo "=========================================="
echo "SUITE DE REGRESIÓN - Proyectos Existentes"
echo "Fecha: $(date)"
echo "=========================================="

LOG_DIR="/tmp/regression_logs"
mkdir -p "$LOG_DIR"

FAILURES=0

run_test() {
    local name="$1"
    local cmd="$2"
    local logfile="$LOG_DIR/${name}.log"
    echo ""
    echo "--- $name ---"
    echo "Comando: $cmd"
    echo "Log: $logfile"
    set +e
    eval "$cmd" > "$logfile" 2>&1
    local status=$?
    set -e
    if [ $status -eq 0 ]; then
        echo "✓ PASS"
    else
        echo "✗ FAIL (código $status)"
        tail -20 "$logfile"
        FAILURES=$((FAILURES + 1))
    fi
}

echo ""
echo "1. Health Check general"
run_test "health_check" "./tests/health_check.sh"

echo ""
echo "2. Verificación BD Villazocotin"
run_test "villazocotin_db" "./tests/check_villazocotin_db.sh"

echo ""
echo "3. Flujo básico Cenarbe (sin checkout)"
run_test "flujo_cenarbe" "./tests/flujo_cenarbe.sh"

echo ""
echo "4. Checkout Cenarbe (si corrección Kevin aplicada)"
echo "   (Opcional - ejecutar manualmente si se indica)"
# run_test "checkout_cenarbe" "python3 ./tests/test_cenarbe_checkout.py"

echo ""
echo "5. Sanitización SQL ContentoAI"
run_test "contentoai_sql" "python3 ./tests/test_contentoai_sql.py"

echo ""
echo "=========================================="
echo "RESUMEN"
echo "Total pruebas ejecutadas: 4"
echo "Fallos: $FAILURES"
if [ $FAILURES -eq 0 ]; then
    echo "✅ REGRESIÓN SUPERADA"
else
    echo "❌ REGRESIÓN FALLADA - Revisar logs en $LOG_DIR"
fi
echo "=========================================="

exit $FAILURES