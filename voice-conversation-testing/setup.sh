#!/bin/bash
# setup.sh - Configuración inicial para suite de testing

echo "=== SETUP SUITE TESTING CONVERSACIÓN VOZ↔VOZ ==="

# Verificar dependencias básicas
echo "1. Verificando dependencias..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker no encontrado"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "❌ curl no encontrado"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js no encontrado"; exit 1; }

echo "✅ Dependencias básicas verificadas"

# Dar permisos de ejecución a scripts bash
echo "2. Configurando permisos..."
chmod +x scripts/bash/*.sh 2>/dev/null
chmod +x scripts/node/*.js 2>/dev/null

echo "✅ Permisos configurados"

# Instalar dependencias Node.js
echo "3. Instalando dependencias Node.js..."
cd scripts/node
if [ -f "package.json" ]; then
    npm install --quiet
    if [ $? -eq 0 ]; then
        echo "✅ Dependencias Node.js instaladas"
    else
        echo "⚠️ Error instalando dependencias Node.js"
    fi
else
    echo "❌ package.json no encontrado"
fi
cd ../..

# Crear directorio para resultados
echo "4. Creando estructura de directorios..."
mkdir -p results logs

echo "✅ Directorios creados"

# Verificar estructura completa
echo "5. Verificando estructura..."
if [ -f "README.md" ] && [ -f "scripts/bash/test-tts-infrastructure.sh" ] && [ -f "scripts/node/test-conversation-flow.js" ]; then
    echo "✅ Estructura completa verificada"
else
    echo "⚠️ Faltan algunos archivos en la estructura"
fi

echo ""
echo "=== SETUP COMPLETADO ==="
echo ""
echo "Para ejecutar pruebas de infraestructura:"
echo "  ./scripts/bash/test-tts-infrastructure.sh"
echo ""
echo "Para ejecutar pruebas de flujo completo:"
echo "  cd scripts/node && node test-conversation-flow.js"
echo ""
echo "Revisa el README.md para más instrucciones."