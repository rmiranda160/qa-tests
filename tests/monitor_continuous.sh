#!/bin/bash

set -e

echo "=========================================="
echo "MONITOR DE MEJORAS CONTINUAS - Tester/QA"
echo "Fecha: $(date)"
echo "=========================================="

# Configuración
INTERVAL_MINUTES=15
MAX_ITERATIONS=$(( 8 * 60 / INTERVAL_MINUTES ))  # 8 horas = toda la noche
BASE_DIR="/home/node/.openclaw/workspace-tester"
LOG_DIR="/tmp/continuous_monitor_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"
SUMMARY_FILE="$LOG_DIR/summary.txt"
ALERT_FILE="$LOG_DIR/alerts.txt"

echo "Intervalo: $INTERVAL_MINUTES minutos"
echo "Máximo de iteraciones: $MAX_ITERATIONS"
echo "Log dir: $LOG_DIR"
echo ""

# Inicializar archivos
echo "# Resumen de Monitoreo Continuo" > "$SUMMARY_FILE"
echo "Inicio: $(date)" >> "$SUMMARY_FILE"
echo "Intervalo: $INTERVAL_MINUTES minutos" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
> "$ALERT_FILE"

iteration=1
while [ $iteration -le $MAX_ITERATIONS ]; do
    ITER_START=$(date +%s)
    ITER_LOG="$LOG_DIR/iter_${iteration}.log"
    ITER_REPORT="$LOG_DIR/iter_${iteration}_report.md"
    
    echo ""
    echo "--- Iteración $iteration ($(date)) ---"
    echo "Log: $ITER_LOG"
    
    # Ejecutar pruebas básicas
    echo "1. Health Check..." | tee -a "$ITER_LOG"
    HEALTH_RESULT=""
    if cd "$BASE_DIR" && ./tests/health_check.sh >> "$ITER_LOG" 2>&1; then
        HEALTH_RESULT="PASS"
        echo "   ✓ Health Check PASS" | tee -a "$ITER_LOG"
    else
        HEALTH_RESULT="FAIL"
        echo "   ✗ Health Check FAIL" | tee -a "$ITER_LOG"
        echo "ALERT: Health Check falló en iteración $iteration" >> "$ALERT_FILE"
    fi
    
    # 2. Prueba específica bug carrito (si se espera corrección de Kevin)
    echo "2. Prueba bug carrito (checkout)..." | tee -a "$ITER_LOG"
    CHECKOUT_RESULT="SKIP"
    # Solo probar checkout si health check pasó
    if [ "$HEALTH_RESULT" = "PASS" ]; then
        if python3 "$BASE_DIR/tests/test_cenarbe_checkout.py" >> "$ITER_LOG" 2>&1; then
            CHECKOUT_RESULT="PASS"
            echo "   ✓ Checkout PASS (bug corregido?)" | tee -a "$ITER_LOG"
        else
            CHECKOUT_RESULT="FAIL"
            echo "   ✗ Checkout FAIL (bug aún presente)" | tee -a "$ITER_LOG"
            # No alertar por ahora, solo registrar
        fi
    else
        echo "   → Skipped (health check falló)" | tee -a "$ITER_LOG"
    fi
    
    # 3. Prueba sanitización SQL ContentoAI
    echo "3. Prueba sanitización SQL..." | tee -a "$ITER_LOG"
    SQL_RESULT="SKIP"
    if [ "$HEALTH_RESULT" = "PASS" ]; then
        if python3 "$BASE_DIR/tests/test_contentoai_sql.py" >> "$ITER_LOG" 2>&1; then
            SQL_RESULT="PASS"
            echo "   ✓ SQL sanitization PASS" | tee -a "$ITER_LOG"
        else
            SQL_RESULT="FAIL"
            echo "   ✗ SQL sanitization FAIL" | tee -a "$ITER_LOG"
            echo "ALERT: Prueba SQL falló en iteración $iteration" >> "$ALERT_FILE"
        fi
    else
        echo "   → Skipped (health check falló)" | tee -a "$ITER_LOG"
    fi
    
    # 4. Prueba de regresión básica (flujo Cenarbe sin checkout)
    echo "4. Prueba regresión básica..." | tee -a "$ITER_LOG"
    REGRESSION_RESULT="SKIP"
    if [ "$HEALTH_RESULT" = "PASS" ]; then
        if cd "$BASE_DIR" && ./tests/flujo_cenarbe.sh >> "$ITER_LOG" 2>&1; then
            REGRESSION_RESULT="PASS"
            echo "   ✓ Regresión básica PASS" | tee -a "$ITER_LOG"
        else
            REGRESSION_RESULT="FAIL"
            echo "   ✗ Regresión básica FAIL" | tee -a "$ITER_LOG"
            echo "ALERT: Regresión detectada en iteración $iteration" >> "$ALERT_FILE"
        fi
    else
        echo "   → Skipped (health check falló)" | tee -a "$ITER_LOG"
    fi
    
    # Generar mini-informe de iteración
    cat > "$ITER_REPORT" <<EOF
# Iteración $iteration - $(date)

## Resultados
- Health Check: $HEALTH_RESULT
- Bug carrito (checkout): $CHECKOUT_RESULT
- Sanitización SQL: $SQL_RESULT
- Regresión básica: $REGRESSION_RESULT

## Observaciones
$(tail -10 "$ITER_LOG" | grep -E "(✓|✗|→|ALERT)" | head -5)

---
EOF
    
    # Actualizar resumen
    echo "## Iteración $iteration ($(date))" >> "$SUMMARY_FILE"
    echo "- Health Check: $HEALTH_RESULT" >> "$SUMMARY_FILE"
    echo "- Bug carrito: $CHECKOUT_RESULT" >> "$SUMMARY_FILE"
    echo "- Sanitización SQL: $SQL_RESULT" >> "$SUMMARY_FILE"
    echo "- Regresión: $REGRESSION_RESULT" >> "$SUMMARY_FILE"
    
    # Verificar si hay alertas críticas
    ALERT_COUNT=$(grep -c "ALERT:" "$ITER_LOG" 2>/dev/null || echo 0)
    if [ $ALERT_COUNT -gt 0 ]; then
        echo "   !! Se generaron $ALERT_COUNT alertas" | tee -a "$ITER_LOG"
    fi
    
    # Calcular tiempo hasta próxima iteración
    ITER_END=$(date +%s)
    ITER_DURATION=$((ITER_END - ITER_START))
    SLEEP_SECONDS=$((INTERVAL_MINUTES * 60 - ITER_DURATION))
    
    if [ $SLEEP_SECONDS -gt 0 ]; then
        echo "Iteración completada en ${ITER_DURATION}s. Durmiendo ${SLEEP_SECONDS}s..." | tee -a "$ITER_LOG"
        sleep $SLEEP_SECONDS
    else
        echo "Iteración tardó ${ITER_DURATION}s (más del intervalo). Continuando..." | tee -a "$ITER_LOG"
    fi
    
    iteration=$((iteration + 1))
done

echo ""
echo "=========================================="
echo "MONITOREO COMPLETADO"
echo "Total iteraciones: $((iteration - 1))"
echo "Logs en: $LOG_DIR"
echo ""

# Verificar alertas
if [ -s "$ALERT_FILE" ]; then
    echo "¡ALERTAS GENERADAS DURANTE LA NOCHE!"
    cat "$ALERT_FILE"
    echo ""
    echo "Revisar logs para detalles."
else
    echo "No se generaron alertas críticas."
fi

# Generar informe final
FINAL_REPORT="$LOG_DIR/final_report.md"
cat > "$FINAL_REPORT" <<EOF
# Informe Final - Monitor de Mejoras Continuas

**Fecha:** $(date)  
**Duración:** $(( (iteration - 1) * INTERVAL_MINUTES )) minutos  
**Iteraciones:** $((iteration - 1))

## Resumen Ejecutivo
$(if [ -s "$ALERT_FILE" ]; then
    echo "Se detectaron problemas durante la noche. Ver sección de alertas."
else
    echo "No se detectaron problemas críticos. Mejoras incrementales estables."
fi)

## Alertas Generadas
$(if [ -s "$ALERT_FILE" ]; then
    cat "$ALERT_FILE"
else
    echo "Ninguna."
fi)

## Tendencias Observadas
- Health Check: $(grep -c "Health Check: PASS" "$SUMMARY_FILE") PASS, $(grep -c "Health Check: FAIL" "$SUMMARY_FILE") FAIL
- Bug carrito: $(grep -c "Bug carrito: PASS" "$SUMMARY_FILE") PASS, $(grep -c "Bug carrito: FAIL" "$SUMMARY_FILE") FAIL
- Sanitización SQL: $(grep -c "Sanitización SQL: PASS" "$SUMMARY_FILE") PASS, $(grep -c "Sanitización SQL: FAIL" "$SUMMARY_FILE") FAIL
- Regresión: $(grep -c "Regresión: PASS" "$SUMMARY_FILE") PASS, $(grep -c "Regresión: FAIL" "$SUMMARY_FILE") FAIL

## Recomendaciones
$(if [ -s "$ALERT_FILE" ]; then
    echo "1. Revisar logs de iteraciones con alertas."
    echo "2. Priorizar corrección de issues detectados."
else
    echo "1. Continuar con mejoras incrementales."
    echo "2. Considerar realizar pruebas de flujo completo periódicas."
fi)

---
*Informe generado automáticamente por monitor de mejoras continuas.*
EOF

echo "Informe final en: $FINAL_REPORT"
cat "$FINAL_REPORT"