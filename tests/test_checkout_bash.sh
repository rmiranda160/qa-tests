#!/bin/bash

set -e

echo "=== Prueba de Checkout Cenarbe Bike Rental (Bash) ==="
echo "Fecha: $(date)"

BASE_URL="https://dev1.cenarbe.com"
COOKIE_JAR="/tmp/checkout_cookies_$(date +%s).txt"

# Función para hacer curl con cookies y detectar errores SQL
curl_with_check() {
    local output
    output=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$@" 2>&1)
    echo "$output"
    # Detectar errores SQL en output
    if echo "$output" | grep -q -i "SQLSTATE\|Unknown column\|Table doesn't exist\|SQL syntax\|Column not found\|MySQL server\|Warning.*mysql\|Fatal error.*SQL"; then
        echo "   !! ERROR SQL DETECTADO EN RESPUESTA"
        return 2
    fi
    return 0
}

# Generar datos de prueba únicos
TIMESTAMP=$(date +%s)
TEST_EMAIL="checkout${TIMESTAMP}@example.com"
TEST_PASS="Password123!"
TEST_NOMBRE="Checkout"
TEST_APELLIDOS="Test${TIMESTAMP}"
TEST_TELEFONO="600${TIMESTAMP: -6}"
TEST_DNI="DNI${TIMESTAMP}"

echo "Email: $TEST_EMAIL"
echo "DNI: $TEST_DNI"
echo "Cookie jar: $COOKIE_JAR"
echo ""

# 1. Registro
echo "--- Paso 1: Registro ---"
REGISTER_RESP=$(curl_with_check -X POST "$BASE_URL/register.php" \
    -d "nombre=$TEST_NOMBRE" \
    -d "apellidos=$TEST_APELLIDOS" \
    -d "email=$TEST_EMAIL" \
    -d "telefono=$TEST_TELEFONO" \
    -d "dni=$TEST_DNI" \
    -d "password=$TEST_PASS" \
    -d "confirm_password=$TEST_PASS" \
    -d "terminos=on")
if echo "$REGISTER_RESP" | grep -q "302 Found\|redireccionar\|registro exitoso"; then
    echo "✓ Registro exitoso (redirección detectada)"
else
    echo "✗ Posible fallo en registro"
    if echo "$REGISTER_RESP" | grep -q -i "error\|alert\|duplicado"; then
        echo "   Mensaje: $(echo "$REGISTER_RESP" | grep -i "error\|alert" | head -1)"
    fi
    exit 1
fi

# 2. Login (por si acaso)
echo ""
echo "--- Paso 2: Login ---"
LOGIN_RESP=$(curl_with_check -X POST "$BASE_URL/login.php" \
    -d "email=$TEST_EMAIL" \
    -d "password=$TEST_PASS")
if echo "$LOGIN_RESP" | grep -q "302 Found\|redireccionar\|Bienvenido"; then
    echo "✓ Login exitoso"
else
    echo "✗ Posible fallo en login"
    exit 1
fi

# 3. Buscar bicicleta para agregar
echo ""
echo "--- Paso 3: Buscar bicicleta ---"
BICIS_RESP=$(curl_with_check "$BASE_URL/bicicletas.php")
PRODUCT_ID=$(echo "$BICIS_RESP" | grep -o 'bicicleta\.php?id=[0-9]*' | head -1 | sed 's/.*id=//')
if [[ -z "$PRODUCT_ID" ]]; then
    # Intentar extraer de formulario
    PRODUCT_ID=$(echo "$BICIS_RESP" | grep -o 'name="id_bicicleta" value="[0-9]*"' | head -1 | sed 's/.*value="//;s/"//')
fi
if [[ -z "$PRODUCT_ID" ]]; then
    echo "Usando ID por defecto 7"
    PRODUCT_ID=7
else
    echo "ID bicicleta: $PRODUCT_ID"
fi

# 4. Agregar al carrito
echo ""
echo "--- Paso 4: Agregar al carrito ---"
# Fechas futuras
FECHA_INICIO=$(date -d "+2 days" +%Y-%m-%d)
FECHA_FIN=$(date -d "+3 days" +%Y-%m-%d)
echo "Fechas: $FECHA_INICIO a $FECHA_FIN"
ADD_RESP=$(curl_with_check -X POST "$BASE_URL/carrito.php" \
    -d "bicicleta_id=$PRODUCT_ID" \
    -d "fecha_inicio=$FECHA_INICIO" \
    -d "fecha_fin=$FECHA_FIN" \
    -d "agregar=1")
if echo "$ADD_RESP" | grep -q -i "carrito\|añadido\|success"; then
    echo "✓ Producto agregado al carrito"
else
    echo "✗ Error al agregar al carrito"
    exit 1
fi

# 5. Ver carrito
echo ""
echo "--- Paso 5: Ver carrito ---"
CART_RESP=$(curl_with_check "$BASE_URL/carrito.php")
if echo "$CART_RESP" | grep -q -i "carrito\|total\|precio"; then
    echo "✓ Carrito cargado"
    # Extraer resumen
    echo "$CART_RESP" | grep -E "Total|Subtotal|Precio" | head -3
else
    echo "✗ Carrito podría estar vacío"
fi

# 6. Checkout - obtener página
echo ""
echo "--- Paso 6: Checkout (obtener formulario) ---"
CHECKOUT_GET=$(curl_with_check "$BASE_URL/checkout.php")
if echo "$CHECKOUT_GET" | grep -q -i "checkout\|pago\|finalizar"; then
    echo "✓ Página de checkout cargada"
else
    echo "✗ No parece página de checkout"
    echo "   (Podría redirigir a login si no hay sesión)"
    exit 1
fi

# 7. Enviar checkout
echo ""
echo "--- Paso 7: Enviar checkout ---"
CHECKOUT_RESP=$(curl_with_check -X POST "$BASE_URL/checkout.php" \
    -d "metodo_pago=tarjeta" \
    -d "terminos=on" \
    -d "confirmar=1")
if echo "$CHECKOUT_RESP" | grep -q -i "reserva confirmada\|éxito\|gracias por su reserva"; then
    echo "✓ CHECKOUT EXITOSO - Reserva confirmada"
    echo "   !! BUG DEL CARRITO PARECE CORREGIDO !!"
    exit 0
elif echo "$CHECKOUT_RESP" | grep -q -i "error\|fallo\|intente nuevamente"; then
    echo "✗ Checkout falló - mensaje de error"
    # Extraer error si existe
    ERROR_MSG=$(echo "$CHECKOUT_RESP" | grep -i "alert alert-danger" -A 1 | head -2)
    if [[ -n "$ERROR_MSG" ]]; then
        echo "   Error: $ERROR_MSG"
    fi
    exit 1
else
    echo "? Respuesta desconocida"
    echo "   (Podría ser redirección o página genérica)"
    # Verificar si hay redirección
    if echo "$CHECKOUT_RESP" | grep -q "302 Found"; then
        echo "   Redirección detectada - posible éxito"
        exit 0
    fi
    exit 1
fi