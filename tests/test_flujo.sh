#!/bin/bash

BASE_URL="http://dev1.cenarbe.com"
COOKIE_JAR="/home/node/.openclaw/workspace-tester/tests/cookies.txt"
LOG_FILE="/home/node/.openclaw/workspace-tester/tests/test_log.txt"

# Inicializar
rm -f "$COOKIE_JAR"
touch "$LOG_FILE"
echo "=== Prueba de flujo completo Cenarbe Bike Rental ===" >> "$LOG_FILE"
echo "Fecha: $(date)" >> "$LOG_FILE"

# Generar datos únicos
TIMESTAMP=$(date +%s)
EMAIL="testuser${TIMESTAMP}@example.com"
DNI="TEST${TIMESTAMP}"
NOMBRE="Test"
APELLIDOS="User${TIMESTAMP}"
TELEFONO="600000000"
PASSWORD="Test1234"

echo "Datos generados:" >> "$LOG_FILE"
echo "  Email: $EMAIL" >> "$LOG_FILE"
echo "  DNI: $DNI" >> "$LOG_FILE"

# 1) Registro
echo -e "\n--- 1. Registro ---" >> "$LOG_FILE"
REGISTER_RESPONSE=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -X POST "$BASE_URL/register.php" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "nombre=$NOMBRE" \
    --data-urlencode "apellidos=$APELLIDOS" \
    --data-urlencode "email=$EMAIL" \
    --data-urlencode "telefono=$TELEFONO" \
    --data-urlencode "dni=$DNI" \
    --data-urlencode "password=$PASSWORD" \
    --data-urlencode "confirm_password=$PASSWORD" \
    --data-urlencode "terminos=on")
    
# Verificar si hay redirección (éxito) o mensaje de error
if echo "$REGISTER_RESPONSE" | grep -q "Registro completado correctamente"; then
    echo "  ✓ Registro exitoso" >> "$LOG_FILE"
elif echo "$REGISTER_RESPONSE" | grep -q "error"; then
    echo "  ✗ Error en registro:" >> "$LOG_FILE"
    echo "$REGISTER_RESPONSE" | grep -i "error" | head -5 >> "$LOG_FILE"
else
    echo "  ? Respuesta desconocida" >> "$LOG_FILE"
fi

# Verificar código de estado de la última petición (curl no lo muestra). Usaremos curl -w
REGISTER_HTTP_CODE=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -w "%{http_code}" -o /tmp/register.out \
    -X POST "$BASE_URL/register.php" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "nombre=$NOMBRE" \
    --data-urlencode "apellidos=$APELLIDOS" \
    --data-urlencode "email=$EMAIL" \
    --data-urlencode "telefono=$TELEFONO" \
    --data-urlencode "dni=$DNI" \
    --data-urlencode "password=$PASSWORD" \
    --data-urlencode "confirm_password=$PASSWORD" \
    --data-urlencode "terminos=on")
echo "  Código HTTP: $REGISTER_HTTP_CODE" >> "$LOG_FILE"

# 2) Login (por si acaso no se autologin después del registro)
echo -e "\n--- 2. Login ---" >> "$LOG_FILE"
LOGIN_RESPONSE=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -X POST "$BASE_URL/login.php" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "email=$EMAIL" \
    --data-urlencode "password=$PASSWORD")
    
if echo "$LOGIN_RESPONSE" | grep -q "Bienvenido"; then
    echo "  ✓ Login exitoso" >> "$LOG_FILE"
else
    echo "  ✗ Posible fallo en login" >> "$LOG_FILE"
fi

# 3) Agregar al carrito (necesitamos un ID de bicicleta válido)
echo -e "\n--- 3. Agregar al carrito ---" >> "$LOG_FILE"
# Primero obtener página de bicicletas para extraer un ID
BICIS_HTML=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE_URL/bicicletas.php")
# Buscar un enlace a bicicleta.php?id=...
BICI_ID=$(echo "$BICIS_HTML" | grep -o 'bicicleta\.php?id=[0-9]*' | head -1 | cut -d= -f2)
if [ -z "$BICI_ID" ]; then
    BICI_ID=7  # fallback según informe anterior
fi
echo "  ID bicicleta seleccionada: $BICI_ID" >> "$LOG_FILE"

# Agregar al carrito con fechas futuras
START_DATE=$(date -d "+2 days" +%Y-%m-%d)
END_DATE=$(date -d "+3 days" +%Y-%m-%d)
echo "  Fecha inicio: $START_DATE, fin: $END_DATE" >> "$LOG_FILE"

ADD_CART_RESPONSE=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -X POST "$BASE_URL/carrito.php" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "bicicleta_id=$BICI_ID" \
    --data-urlencode "fecha_inicio=$START_DATE" \
    --data-urlencode "fecha_fin=$END_DATE" \
    --data-urlencode "agregar=1")
    
if echo "$ADD_CART_RESPONSE" | grep -q "Carrito de alquiler"; then
    echo "  ✓ Producto agregado al carrito" >> "$LOG_FILE"
else
    echo "  ✗ Error al agregar al carrito" >> "$LOG_FILE"
    echo "$ADD_CART_RESPONSE" | grep -i "error" | head -5 >> "$LOG_FILE"
fi

# 4) Checkout (procesar pago)
echo -e "\n--- 4. Checkout ---" >> "$LOG_FILE"
# Primero obtener página de checkout para extraer token CSRF si existe
CHECKOUT_HTML=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE_URL/checkout.php")
# Asumimos que no hay token CSRF
CHECKOUT_RESPONSE=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -X POST "$BASE_URL/checkout.php" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "metodo_pago=tarjeta" \
    --data-urlencode "terminos=on" \
    --data-urlencode "confirmar=1")
    
if echo "$CHECKOUT_RESPONSE" | grep -q "Reserva confirmada"; then
    echo "  ✓ Checkout exitoso" >> "$LOG_FILE"
elif echo "$CHECKOUT_RESPONSE" | grep -q "error\|SQL"; then
    echo "  ✗ Error en checkout:" >> "$LOG_FILE"
    echo "$CHECKOUT_RESPONSE" | grep -i "error\|SQL" | head -5 >> "$LOG_FILE"
else
    echo "  ? Respuesta desconocida" >> "$LOG_FILE"
fi

# 5) Confirmación (verificar reserva)
echo -e "\n--- 5. Confirmación ---" >> "$LOG_FILE"
CONFIRM_HTML=$(curl -s -L -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE_URL/reservas.php")
if echo "$CONFIRM_HTML" | grep -q "Reserva #"; then
    echo "  ✓ Reserva confirmada en listado" >> "$LOG_FILE"
else
    echo "  ✗ No se encontró reserva en listado" >> "$LOG_FILE"
fi

echo -e "\n=== Fin de prueba ===" >> "$LOG_FILE"
cat "$LOG_FILE"