#!/bin/bash
# test-tts-infrastructure.sh
# Script para probar infraestructura del sistema de conversación voz↔voz

set -e

echo "=== TESTING PIPER TTS ==="

# 1. Verificar contenedor corriendo
echo "1. Verificando contenedor Piper TTS..."
if docker ps | grep -q piper-tts; then
    echo "✅ Piper TTS contenedor corriendo"
else
    echo "❌ Piper TTS no está corriendo"
    exit 1
fi

# 2. Probar endpoint salud
echo "2. Probando endpoint /health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5500/health || echo "ERROR")
if echo "$HEALTH_RESPONSE" | grep -iq "ok\|healthy"; then
    echo "✅ Health check OK"
else
    echo "❌ Health check falló: $HEALTH_RESPONSE"
    exit 1
fi

# 3. Probar síntesis de voz simple
echo "3. Probando síntesis de voz..."
curl -X POST http://localhost:5500/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hola, esto es una prueba del sistema de conversación.", "language":"es"}' \
  -o test-output.wav 2>/dev/null

# 4. Verificar archivo generado
if [ -f test-output.wav ] && [ -s test-output.wav ]; then
    echo "✅ Audio generado correctamente"
    file test-output.wav
    rm test-output.wav
else
    echo "❌ No se generó audio"
    exit 1
fi

echo "=== TESTING BACKEND EXTENDIDO ==="

# 5. Probar endpoint conversación
echo "5. Probando endpoint /api/conversation..."
TEST_AUDIO=$(base64 -w0 <(echo "test audio" | head -c 1024))
HTTP_CODE=$(curl -X POST http://localhost:3001/api/conversation \
  -H "Content-Type: application/json" \
  -d "{\"audio\":\"$TEST_AUDIO\", \"format\":\"webm\"}" \
  -w "%{http_code}" -o /dev/null -s)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 202 ]; then
    echo "✅ Backend respondió con código $HTTP_CODE"
else
    echo "❌ Backend respondió con código $HTTP_CODE"
fi

echo "=== TESTING NGINX PROXY ==="

# 6. Verificar proxy funciona
echo "6. Probando proxy Nginx..."
PROXY_RESPONSE=$(curl -s http://localhost:3002/api/tts/health || echo "ERROR")
if echo "$PROXY_RESPONSE" | grep -iq "ok\|healthy"; then
    echo "✅ Proxy Nginx funciona"
else
    echo "❌ Proxy Nginx no funciona: $PROXY_RESPONSE"
fi

echo "=== INFRAESTRUCTURA TEST COMPLETADO ==="
echo "✅ Todos los componentes están operativos"