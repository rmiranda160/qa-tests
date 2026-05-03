#!/bin/bash

set -e

echo "=========================================="
echo "MONITOR DE MEJORAS CONTINUAS v2 - Tester/QA"
echo "Fecha: $(date)"
echo "Modo: Mejoras incrementales"
echo "=========================================="

# Configuración
INTERVAL_MINUTES=${1:-15}  # Por defecto 15 minutos
MAX_ITERATIONS=${2:-32}    # 8 horas = 32 iteraciones de 15 min
BASE_DIR="/home/node/.openclaw/workspace-tester"
STATE_FILE="/tmp/qa_monitor_state.txt"
LOG_DIR="/tmp/continuous_monitor_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"
CHANGE_LOG="$LOG_DIR/changes.txt"
ALERT_LOG="$LOG_DIR/alerts.txt"

echo "Intervalo: $INTERVAL_MINUTES minutos"
echo "Máximo de iteraciones: $MAX_ITERATIONS"
echo "Log dir: $LOG_DIR"
echo ""

# Inicializar archivos
> "$CHANGE_LOG"
> "$ALERT_LOG"

# Leer estado anterior o inicializar
declare -A LAST_RESULTS
if [[ -f "$STATE_FILE" ]]; then
    echo "Cargando estado anterior desde $STATE_FILE"
    while IFS='=' read -r key value; do
        [[ $key ]] && LAST_RESULTS["$key"]="$value"
    done < "$STATE_FILE"
else
    echo "No hay estado anterior. Inicializando."
    LAST_RESULTS=(
        ["health"]="UNKNOWN"
        ["checkout"]="UNKNOWN"
        ["sql"]="UNKNOWN"
        ["regression"]="UNKNOWN"
    )
fi

iteration=1
while [ $iteration -le $MAX_ITERATIONS ]; do
    ITER_START=$(date +%s)
    ITER_LOG="$LOG_DIR/iter_${iteration}.log"
    ITER_REPORT="$LOG_DIR/iter_${iteration}_report.md"
    
    echo ""
    echo "--- Iteración $iteration ($(date)) ---"
    echo "Log: $ITER_LOG"
    
    # Inicializar resultados de esta iteración
    declare -A CURRENT_RESULTS
    
    # 1. Health Check
    echo "1. Health Check..." | tee -a "$ITER_LOG"
    if cd "$BASE_DIR" && ./tests/health_check.sh >> "$ITER_LOG" 2>&1; then
        CURRENT_RESULTS["health"]="PASS"
        echo "   ✓ Health Check PASS" | tee -a "$ITER_LOG"
    else
        CURRENT_RESULTS["health"]="FAIL"
        echo "   ✗ Health Check FAIL" | tee -a "$ITER_LOG"
    fi
    
    # 2. Prueba bug carrito (checkout) - solo si health PASS
    echo "2. Prueba bug carrito (checkout)..." | tee -a "$ITER_LOG"
    if [[ "${CURRENT_RESULTS[health]}" = "PASS" ]]; then
        if ./tests/test_checkout_bash.sh >> "$ITER_LOG" 2>&1; then
            CURRENT_RESULTS["checkout"]="PASS"
            echo "   ✓ Checkout PASS" | tee -a "$ITER_LOG"
        else
            CURRENT_RESULTS["checkout"]="FAIL"
            echo "   ✗ Checkout FAIL" | tee -a "$ITER_LOG"
        fi
    else
        CURRENT_RESULTS["checkout"]="SKIP"
        echo "   → Skipped (health check falló)" | tee -a "$ITER_LOG"
    fi
    
    # 3. Prueba sanitización SQL ContentoAI
    echo "3. Prueba sanitización SQL..." | tee -a "$ITER_LOG"
    if [[ "${CURRENT_RESULTS[health]}" = "PASS" ]]; then
        if ./tests/test_sql_contentoai_bash.sh >> "$ITER_LOG" 2>&1; then
            CURRENT_RESULTS["sql"]="PASS"
            echo "   ✓ SQL sanitization PASS" | tee -a "$ITER_LOG"
        else
            CURRENT_RESULTS["sql"]="FAIL"
            echo "   ✗ SQL sanitization FAIL (vulnerabilidad detectada)" | tee -a "$ITER_LOG"
        fi
    else
        CURRENT_RESULTS["sql"]="SKIP"
        echo "   → Skipped (health check falló)" | tee -a "$ITER_LOG"
    fi
    
    # 4. Prueba de regresión básica (flujo Cenarbe sin checkout)
    echo "4. Prueba regresión básica..." | tee -a "$ITER_LOG"
    if [[ "${CURRENT_RESULTS[health]}" = "PASS" ]]; then
        if cd "$BASE_DIR" && ./tests/flujo_cenarbe.sh >> "$ITER_LOG" 2>&1; then
            CURRENT_RESULTS["regression"]="PASS"
            echo "   ✓ Regresión básica PASS" | tee -a "$ITER_LOG"
        else
            CURRENT_RESULTS["regression"]="FAIL"
            echo "   ✗ Regresión básica FAIL" | tee -a "$ITER_LOG"
        fi
    else
        CURRENT_RESULTS["regression"]="SKIP"
        echo "   → Skipped (health check falló)" | tee -a "$ITER_LOG"
    fi
    
    # Detectar cambios y generar alertas
    echo ""
    echo "5. Analizando cambios..." | tee -a "$ITER_LOG"
    for test_name in "${!CURRENT_RESULTS[@]}"; do
        current="${CURRENT_RESULTS[$test_name]}"
        last="${LAST_RESULTS[$test_name]}"
        
        if [[ "$last" != "$current" ]]; then
            if [[ "$last" != "UNKNOWN" ]]; then  # Ignorar primera iteración
                change_msg="CAMBIÓ $test_name: $last → $current (iteración $iteration)"
                echo "   !! $change_msg" | tee -a "$ITER_LOG"
                echo "$change_msg" >> "$CHANGE_LOG"
                
                # Alertas críticas
                case "$test_name" in
                    "health")
                        if [[ "$current" = "FAIL" ]]; then
                            echo "ALERTA CRÍTICA: Health Check falló en iteración $iteration" >> "$ALERT_LOG"
                        fi
                        ;;
                    "checkout")
                        if [[ "$current" = "PASS" ]] && [[ "$last" = "FAIL" ]]; then
                            echo "MEJORA DETECTADA: Bug del carrito POSIBLEMENTE CORREGIDO por Kevin" >> "$ALERT_LOG"
                            echo "   ¡Checkout pasó después de haber fallado!" >> "$ALERT_LOG"
                        elif [[ "$current" = "FAIL" ]] && [[ "$last" = "PASS" ]]; then
                            echo "REGRESIÓN: Checkout falló después de haber pasado" >> "$ALERT_LOG"
                        fi
                        ;;
                    "sql")
                        if [[ "$current" = "PASS" ]] && [[ "$last" = "FAIL" ]]; then
                            echo "MEJORA DETECTADA: Sanitización SQL POSIBLEMENTE CORREGIDA por Sam" >> "$ALERT_LOG"
                            echo "   Pruebas SQL pasaron después de haber fallado!" >> "$ALERT_LOG"
                        elif [[ "$current" = "FAIL" ]] && [[ "$last" = "PASS" ]]; then
                            echo "REGRESIÓN: Vulnerabilidad SQL detectada después de estar corregida" >> "$ALERT_LOG"
                        fi
                        ;;
                    "regression")
                        if [[ "$current" = "FAIL" ]] && [[ "$last" = "PASS" ]]; then
                            echo "REGRESIÓN CRÍTICA: Flujo básico falló" >> "$ALERT_LOG"
                        fi
                        ;;
                esac
            fi
            # Actualizar estado
            LAST_RESULTS["$test_name"]="$current"
        fi
    done
    
    # Guardar estado actualizado
    > "$STATE_FILE"
    for key in "${!LAST_RESULTS[@]}"; do
        echo "$key=${LAST_RESULTS[$key]}" >> "$STATE_FILE"
    done
    
    # Generar mini-informe de iteración
    cat > "$ITER_REPORT" <<EOF
# Iteración $iteration - $(date)

## Resultados
- Health Check: ${CURRENT_RESULTS[health]}
- Bug carrito (checkout): ${CURRENT_RESULTS[checkout]}
- Sanitización SQL: ${CURRENT_RESULTS[sql]}
- Regresión básica: ${CURRENT_RESULTS[regression]}

## Cambios detectados
$(if [[ -s "$CHANGE_LOG" ]]; then
    tail -5 "$CHANGE_LOG" | sed 's/^/- /'
else
    echo "- Ninguno en esta iteración"
fi)

## Alertas
$(if [[ -s "$ALERT_LOG" ]]; then
    tail -3 "$ALERT_LOG" | sed 's/^/- /'
else
    echo "- Ninguna"
fi)

---
EOF
    
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

# Mostrar resumen de cambios
if [[ -s "$CHANGE_LOG" ]]; then
    echo "=== CAMBIOS DETECTADOS DURANTE LA NOCHE ==="
    cat "$CHANGE_LOG"
    echo ""
fi

if [[ -s "$ALERT_LOG" ]]; then
    echo "=== ALERTAS GENERADAS ==="
    cat "$ALERT_LOG"
    echo ""
    echo "¡REVISIÓN INMEDIATA REQUERIDA!"
else
    echo "No se generaron alertas críticas."
fi

# Generar informe final
FINAL_REPORT="$LOG_DIR/final_report.md"
cat > "$FINAL_REPORT" <<EOF
# Informe Final - Monitor de Mejoras Continuas v2

**Fecha:** $(date)  
**Duración:** $(( (iteration - 1) * INTERVAL_MINUTES )) minutos  
**Iteraciones:** $((iteration - 1))

## Estado Final
- Health Check: ${LAST_RESULTS[health]}
- Bug carrito: ${LAST_RESULTS[checkout]}
- Sanitización SQL: ${LAST_RESULTS[sql]}
- Regresión básica: ${LAST_RESULTS[regression]}

## Resumen de Cambios
$(if [[ -s "$CHANGE_LOG" ]]; then
    echo "Se detectaron $(wc -l < "$CHANGE_LOG") cambios:"
    cat "$CHANGE_LOG" | sed 's/^/- /'
else
    echo "No se detectaron cambios significativos."
fi)

## Alertas
$(if [[ -s "$ALERT_LOG" ]; then
    echo "**ALERTAS ACTIVAS:**"
    cat "$ALERT_LOG" | sed 's/^/- /'
else
    echo "Ninguna alerta activa."
fi)

## Análisis
$(if [[ "${LAST_RESULTS[checkout]}" = "PASS" ]]; then
    echo "- ✓ Bug del carrito: APARENTEMENTE CORREGIDO (checkout pasa)"
else
    echo "- ✗ Bug del carrito: AÚN PRESENTE (checkout falla)"
fi)

$(if [[ "${LAST_RESULTS[sql]}" = "PASS" ]]; then
    echo "- ✓ Sanitización SQL: APARENTEMENTE CORREGIDA (pruebas pasan)"
else
    echo "- ✗ Sanitización SQL: VULNERABILIDADES DETECTADAS"
fi)

## Recomendaciones
1. $(if [[ "${LAST_RESULTS[health]}" = "FAIL" ]]; then
    echo "**URGENTE:** Resolver problemas de health check (sitios inaccesibles)."
elif [[ "${LAST_RESULTS[checkout]}" = "FAIL" ]]; then
    echo "Priorizar corrección del bug del carrito (Kevin)."
elif [[ "${LAST_RESULTS[sql]}" = "FAIL" ]]; then
    echo "Priorizar corrección de vulnerabilidades SQL (Sam)."
else
    echo "Continuar con mejoras incrementales. Estado estable."
fi)

2. Revisar logs detallados en $LOG_DIR para análisis técnico.

---
*Informe generado automáticamente por monitor de mejoras continuas v2.*
EOF

echo "Informe final en: $FINAL_REPORT"
echo "=========================================="