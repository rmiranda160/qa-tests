#!/bin/bash
# run-all-tests.sh - Ejecuta toda la suite de testing

set -e

echo "========================================="
echo "  SUITE DE TESTING VOZ↔VOZ - EJECUCIÓN COMPLETA"
echo "========================================="
echo ""

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="results/run_$TIMESTAMP"
LOGS_DIR="logs"

mkdir -p "$RESULTS_DIR"
mkdir -p "$LOGS_DIR"

echo "📅 Fecha: $(date)"
echo "📁 Resultados: $RESULTS_DIR"
echo ""

# Función para registrar resultados
log_result() {
    echo "$1" >> "$RESULTS_DIR/summary.txt"
}

# Iniciar summary
echo "RESUMEN EJECUCIÓN - $(date)" > "$RESULTS_DIR/summary.txt"
echo "==============================" >> "$RESULTS_DIR/summary.txt"

# 1. Pruebas de infraestructura
echo "1. 🏗️  EJECUTANDO PRUEBAS DE INFRAESTRUCTURA..."
echo "   Script: test-tts-infrastructure.sh"
echo ""
INFRA_LOG="$RESULTS_DIR/infrastructure.log"
scripts/bash/test-tts-infrastructure.sh 2>&1 | tee "$INFRA_LOG"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    INFRA_RESULT="✅ PASS"
else
    INFRA_RESULT="❌ FAIL"
fi

log_result "Infraestructura: $INFRA_RESULT"
echo ""

# 2. Pruebas de funcionalidad Node.js
echo "2. 🔄 EJECUTANDO PRUEBAS DE FUNCIONALIDAD..."
echo "   Script: test-conversation-flow.js"
echo ""
FUNC_LOG="$RESULTS_DIR/functionality.log"

cd scripts/node
node test-conversation-flow.js 2>&1 | tee "../../$FUNC_LOG"
FUNC_EXIT=${PIPESTATUS[0]}
cd ../..

if [ $FUNC_EXIT -eq 0 ]; then
    FUNC_RESULT="✅ PASS"
else
    FUNC_RESULT="❌ FAIL"
fi

log_result "Funcionalidad: $FUNC_RESULT"
echo ""

# 3. Resumen
echo "3. 📊 GENERANDO RESUMEN..."
echo ""
echo "========================================="
echo "            RESUMEN DE RESULTADOS"
echo "========================================="
echo ""
cat "$RESULTS_DIR/summary.txt"
echo ""
echo "📁 Logs guardados en: $RESULTS_DIR/"
echo ""

# 4. Verificación checklist
echo "4. 📋 CHECKLIST MANUAL RECOMENDADO"
echo ""
echo "Recuerda completar el checklist manual:"
echo "  checklists/checklist-voice-conversation.md"
echo ""
echo "Y ejecutar escenarios de usuario real:"
echo "  plans/user-testing-scenarios.md"
echo ""

# 5. Estado final
if [ "$INFRA_RESULT" = "✅ PASS" ] && [ "$FUNC_RESULT" = "✅ PASS" ]; then
    echo "🎉 TODAS LAS PRUEBAS AUTOMATIZADAS PASARON"
    echo ""
    echo "Siguiente paso: Realizar pruebas manuales completas."
    FINAL_EXIT=0
else
    echo "⚠️  ALGUNAS PRUEBAS FALLARON"
    echo ""
    echo "Revisa los logs en $RESULTS_DIR/ para detalles."
    echo "Corrige los problemas antes de continuar con pruebas manuales."
    FINAL_EXIT=1
fi

echo ""
echo "📄 Para generar reporte completo, usa:"
echo "   templates/report-template.md"
echo ""

exit $FINAL_EXIT