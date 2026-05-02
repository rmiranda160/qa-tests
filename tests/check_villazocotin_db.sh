#!/bin/bash

set -e

BASE_URL="https://villazocotin.cenarbe.com"
COOKIE_JAR="/tmp/villazocotin_cookies.txt"

echo "=== Verificación de BD Villazocotin ==="
echo "Base URL: $BASE_URL"

# Función para hacer curl con cookies
curl_with_cookies() {
    curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$@"
}

# 1. Página principal
echo ""
echo "--- Página principal ---"
MAIN_RESP=$(curl_with_cookies "$BASE_URL")
if echo "$MAIN_RESP" | grep -i "error connecting to database\|undefined variable.*pdo\|fatal error"; then
    echo "ERROR: Se detectó error de base de datos en página principal."
    exit 1
else
    echo "OK: Sin errores de BD visibles."
fi

# 2. Página de administración login
echo ""
echo "--- Página de administración ---"
ADMIN_RESP=$(curl_with_cookies "$BASE_URL/admin/login.php")
if echo "$ADMIN_RESP" | grep -i "error connecting to database\|undefined variable.*pdo\|fatal error"; then
    echo "ERROR: Se detectó error de base de datos en admin/login.php."
    exit 1
else
    echo "OK: Sin errores de BD visibles en admin."
fi

# 3. Buscar formulario de login en admin
if echo "$ADMIN_RESP" | grep -q "<form"; then
    echo "OK: Formulario de login presente."
else
    echo "WARNING: No se encontró formulario de login."
fi

# 4. Intentar login con credenciales por defecto (solo si se desea)
# Descomentar las siguientes líneas para probar login (riesgo de bloqueo)
# echo ""
# echo "--- Intento de login (admin/admin) ---"
# LOGIN_RESP=$(curl_with_cookies -X POST "$BASE_URL/admin/login.php" \
#     -d "username=admin" \
#     -d "password=admin")
# if echo "$LOGIN_RESP" | grep -q "dashboard\|panel\|logout"; then
#     echo "OK: Login exitoso (credenciales por defecto)."
# elif echo "$LOGIN_RESP" | grep -q "error\|invalid"; then
#     echo "INFO: Login falló (esperado)."
# else
#     echo "INFO: Respuesta desconocida."
# fi

# 5. Verificar calendario en página principal
if echo "$MAIN_RESP" | grep -q "calendar\|calendario\|disponibilidad"; then
    echo "OK: Elementos de calendario encontrados."
else
    echo "WARNING: No se detectaron elementos de calendario."
fi

# 6. Verificar formulario de reserva
if echo "$MAIN_RESP" | grep -q "form.*reserva\|book.*form"; then
    echo "OK: Formulario de reserva encontrado."
    # Extraer action del formulario
    ACTION=$(echo "$MAIN_RESP" | grep -o 'form.*action="[^"]*"' | head -1 | sed 's/.*action="\([^"]*\).*/\1/')
    if [[ -n "$ACTION" ]]; then
        echo "  Action del formulario: $ACTION"
    fi
else
    echo "WARNING: No se encontró formulario de reserva."
fi

echo ""
echo "=== Verificación completada ==="
echo "Nota: Esta verificación no garantiza que la BD esté completamente operativa, solo que no hay errores visibles en el frontend."