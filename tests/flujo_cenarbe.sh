#!/bin/bash

set -e

BASE_URL="https://dev1.cenarbe.com"
COOKIE_JAR="/tmp/cenarbe_cookies.txt"

echo "=== Prueba de flujo Cenarbe Bike Rental ==="
echo "Base URL: $BASE_URL"
echo "Cookie jar: $COOKIE_JAR"

# Generar datos de prueba únicos
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_PASS="Password123!"
TEST_NOMBRE="Test"
TEST_APELLIDOS="User"
TEST_TELEFONO="123456789"

echo "Email de prueba: $TEST_EMAIL"
echo ""

# Función para hacer curl con cookies
curl_with_cookies() {
    curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$@"
}

# 1. Registro
echo "--- Paso 1: Registro ---"
REGISTER_RESP=$(curl_with_cookies -X POST "$BASE_URL/register.php" \
    -d "nombre=$TEST_NOMBRE" \
    -d "apellidos=$TEST_APELLIDOS" \
    -d "email=$TEST_EMAIL" \
    -d "telefono=$TEST_TELEFONO" \
    -d "password=$TEST_PASS" \
    -d "confirm_password=$TEST_PASS")
if echo "$REGISTER_RESP" | grep -q "registro exitoso\|cuenta creada\|redireccionar"; then
    echo "Registro aparentemente exitoso."
else
    echo "Posible fallo en registro. Respuesta:"
    echo "$REGISTER_RESP" | grep -i "error\|alert\|warning" | head -5
fi

# 2. Login
echo ""
echo "--- Paso 2: Login ---"
LOGIN_RESP=$(curl_with_cookies -X POST "$BASE_URL/login.php" \
    -d "email=$TEST_EMAIL" \
    -d "password=$TEST_PASS")
if echo "$LOGIN_RESP" | grep -q "Bienvenido\|redireccionar\|logout"; then
    echo "Login aparentemente exitoso."
else
    echo "Posible fallo en login. Respuesta:"
    echo "$LOGIN_RESP" | grep -i "error\|alert\|warning" | head -5
fi

# 3. Obtener página de bicicletas para extraer ID de producto
echo ""
echo "--- Paso 3: Buscar producto para añadir al carrito ---"
BICIS_RESP=$(curl_with_cookies "$BASE_URL/bicicletas.php")
# Extraer el primer formulario add-to-cart (asumimos que existe un input hidden 'id_bicicleta')
PRODUCT_ID=$(echo "$BICIS_RESP" | grep -o '<input type="hidden" name="id_bicicleta" value="[0-9]*"' | head -1 | sed 's/.*value="\([0-9]*\)".*/\1/')
if [[ -z "$PRODUCT_ID" ]]; then
    echo "No se pudo extraer ID de bicicleta. Usando valor por defecto 1."
    PRODUCT_ID=1
else
    echo "ID de bicicleta detectado: $PRODUCT_ID"
fi

# 4. Añadir al carrito
echo ""
echo "--- Paso 4: Añadir producto al carrito ---"
ADD_RESP=$(curl_with_cookies -X POST "$BASE_URL/carrito.php" \
    -d "id_bicicleta=$PRODUCT_ID" \
    -d "action=add")
if echo "$ADD_RESP" | grep -q "añadido\|carrito\|success"; then
    echo "Producto añadido al carrito."
else
    echo "Posible fallo al añadir. Respuesta:"
    echo "$ADD_RESP" | grep -i "error\|alert\|warning" | head -5
fi

# 5. Ver carrito
echo ""
echo "--- Paso 5: Ver carrito ---"
CART_RESP=$(curl_with_cookies "$BASE_URL/carrito.php")
if echo "$CART_RESP" | grep -q "carrito\|total\|precio"; then
    echo "Carrito cargado."
    # Extraer resumen
    echo "$CART_RESP" | grep -E "Total|Subtotal|Precio" | head -5
else
    echo "Carrito podría estar vacío o error."
fi

# 6. Checkout (asumiendo que existe checkout.php)
echo ""
echo "--- Paso 6: Checkout ---"
CHECKOUT_RESP=$(curl_with_cookies "$BASE_URL/checkout.php")
if echo "$CHECKOUT_RESP" | grep -q "checkout\|pago\|finalizar"; then
    echo "Página de checkout cargada."
else
    echo "Checkout no encontrado o error."
fi

echo ""
echo "=== Fin del flujo de prueba ==="
echo "Nota: Este script es una simulación básica. Para pruebas reales se requiere verificar respuestas más detalladas y manejo de errores."