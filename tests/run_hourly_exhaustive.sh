#!/bin/bash

set -e

echo "=========================================="
echo "EJECUCIÓN HORARIA EXHAUSTIVA - Tester/QA"
echo "Fecha: $(date)"
echo "=========================================="

BASE_DIR="/home/node/.openclaw/workspace-tester"
LOG_DIR="/tmp/hourly_exhaustive_logs"
mkdir -p "$LOG_DIR"

# Ejecutar cada hora aproximadamente
while true; do
    START_TIME=$(date +%s)
    LOG_FILE="$LOG_DIR/exhaustive_$(date +%Y%m%d_%H%M%S).log"
    echo ""
    echo "--- Ejecución horaria: $(date) ---"
    echo "Log: $LOG_FILE"
    
    # Ejecutar pruebas exhaustivas
    cd "$BASE_DIR"
    ./tests/test_exhaustivo_hourly.sh > "$LOG_FILE" 2>&1
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo "Pruebas exhaustivas completadas en ${DURATION}s"
    
    # Calcular tiempo hasta próxima ejecución (cada hora)
    SLEEP_TIME=$((3600 - DURATION))
    if [ $SLEEP_TIME -lt 300 ]; then
        SLEEP_TIME=300  # Mínimo 5 minutos entre ejecuciones
    fi
    
    echo "Durmiendo ${SLEEP_TIME}s hasta próxima ejecución..."
    sleep $SLEEP_TIME
done