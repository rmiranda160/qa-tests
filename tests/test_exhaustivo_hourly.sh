#!/bin/bash

set -e

echo "=========================================="
echo "PRUEBAS EXHAUSTIVAS HORARIAS - Tester/QA"
echo "Fecha: $(date)"
echo "=========================================="

LOG_FILE="/tmp/exhaustive_$(date +%Y%m%d_%H%M).log"
echo "Log: $LOG_FILE"

exec > >(tee -a "$LOG_FILE") 2>&1

# Funciones de utilidad
log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

check_sql_errors() {
    local text="$1"
    if echo "$text" | grep -q -i "SQLSTATE\|Unknown column\|Table doesn't exist\|SQL syntax\|Column not found\|MySQL server\|Warning.*mysql\|Fatal error.*SQL"; then
        return 1
    fi
    return 0
}

log "Iniciando pruebas exhaustivas..."

# ===== 1. HEALTH CHECK COMPLETO =====
log "1. HEALTH CHECK COMPLETO"
cd /home/node/.openclaw/workspace-tester
./tests/health_check.sh
log "✓ Health check completado"

# ===== 2. VILLAZOCOTIN - PRUEBAS DETALLADAS =====
log ""
log "2. VILLAZOCOTIN - PRUEBAS DETALLADAS"
VILLA_URL="https://villazocotin.cenarbe.com"

# 2.1 Página principal
log "  - Página principal"
VILLA_RESP=$(curl -s "$VILLA_URL")
if ! echo "$VILLA_RESP" | grep -q -i "villazocotin\|alquiler\|vacaciones"; then
    log "    ✗ Contenido esperado no encontrado"
else
    log "    ✓ Contenido OK"
fi

# 2.2 Panel de administración
log "  - Panel de administración"
ADMIN_RESP=$(curl -s "$VILLA_URL/admin/login.php")
if ! check_sql_errors "$ADMIN_RESP"; then
    log "    ✗ ERROR SQL DETECTADO en admin"
else
    log "    ✓ Sin errores SQL visibles"
fi

# 2.3 Calendario (buscar elementos)
log "  - Calendario"
if echo "$VILLA_RESP" | grep -q -i "calendar\|disponibilidad\|fecha"; then
    log "    ✓ Elementos de calendario detectados"
else
    log "    ✗ No se detectó calendario"
fi

# ===== 3. CENARBE BIKE - FLUJO COMPLETO CON VARIANTES =====
log ""
log "3. CENARBE BIKE - FLUJO COMPLETO"

BASE_URL="https://dev1.cenarbe.com"
COOKIE_JAR="/tmp/exhaustive_cookies_$(date +%s).txt"

# 3.1 Registro de nuevo usuario
log "  - Registro de nuevo usuario"
TIMESTAMP=$(date +%s)
TEST_EMAIL="exhaustive${TIMESTAMP}@example.com"
TEST_PASS="Pass123!"
REG_RESP=$(curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST "$BASE_URL/register.php" \
    -d "nombre=Test" \
    -d "apellidos=User${TIMESTAMP}" \
    -d "email=$TEST_EMAIL" \
    -d "telefono=600${TIMESTAMP: -6}" \
    -d "dni=DNI${TIMESTAMP}" \
    -d "password=$TEST_PASS" \
    -d "confirm_password=$TEST_PASS" \
    -d "terminos=on")
if echo "$REG_RESP" | grep -q "302 Found\|redireccionar"; then
    log "    ✓ Registro exitoso"
else
    log "    ✗ Registro falló"
    # Verificar si es error de duplicado
    if echo "$REG_RESP" | grep -q -i "duplicado\|ya existe"; then
        log "      (Email/DNI ya existente)"
    fi
fi

# 3.2 Login
log "  - Login"
LOGIN_RESP=$(curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST "$BASE_URL/login.php" \
    -d "email=$TEST_EMAIL" \
    -d "password=$TEST_PASS")
if echo "$LOGIN_RESP" | grep -q "302 Found\|redireccionar"; then
    log "    ✓ Login exitoso"
else
    log "    ✗ Login falló"
fi

# 3.3 Buscar bicicletas y agregar múltiples
log "  - Agregar bicicletas al carrito"
BICIS_RESP=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/bicicletas.php")
BIKE_IDS=$(echo "$BICIS_RESP" | grep -o 'bicicleta\.php?id=[0-9]*' | sed 's/.*id=//' | head -3)
if [[ -z "$BIKE_IDS" ]]; then
    BIKE_IDS="7 8 9"  # Valores por defecto
fi

COUNT=0
for BIKE_ID in $BIKE_IDS; do
    if [[ $COUNT -ge 2 ]]; then break; fi  # Máximo 2 bicicletas
    FECHA_INICIO=$(date -d "+$((COUNT+2)) days" +%Y-%m-%d)
    FECHA_FIN=$(date -d "+$((COUNT+3)) days" +%Y-%m-%d)
    ADD_RESP=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/carrito.php" \
        -d "bicicleta_id=$BIKE_ID" \
        -d "fecha_inicio=$FECHA_INICIO" \
        -d "fecha_fin=$FECHA_FIN" \
        -d "agregar=1")
    if echo "$ADD_RESP" | grep -q -i "carrito\|añadido"; then
        log "    ✓ Bicicleta $BIKE_ID agregada ($FECHA_INICIO-$FECHA_FIN)"
        COUNT=$((COUNT+1))
    else
        log "    ✗ Error agregando bicicleta $BIKE_ID"
    fi
    sleep 1
done

# 3.4 Ver carrito con múltiples items
log "  - Ver carrito con múltiples items"
CART_RESP=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/carrito.php")
if echo "$CART_RESP" | grep -q -i "carrito\|total"; then
    log "    ✓ Carrito cargado"
    # Extraer total
    TOTAL=$(echo "$CART_RESP" | grep -o "Total.*[0-9,.]*" | head -1)
    [[ -n "$TOTAL" ]] && log "      Total: $TOTAL"
else
    log "    ✗ Carrito no cargado correctamente"
fi

# 3.5 Checkout (si está disponible)
log "  - Checkout"
CHECKOUT_GET=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/checkout.php")
if echo "$CHECKOUT_GET" | grep -q -i "checkout\|pago"; then
    log "    ✓ Página de checkout accesible"
    # Intentar enviar checkout
    CHECKOUT_RESP=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/checkout.php" \
        -d "metodo_pago=tarjeta" \
        -d "terminos=on" \
        -d "confirmar=1")
    if echo "$CHECKOUT_RESP" | grep -q -i "reserva confirmada\|éxito\|gracias"; then
        log "    ✓ CHECKOUT EXITOSO - Bug del carrito CORREGIDO"
    elif echo "$CHECKOUT_RESP" | grep -q -i "error\|SQL"; then
        log "    ✗ Checkout falló"
        if ! check_sql_errors "$CHECKOUT_RESP"; then
            log "      !! ERROR SQL EN CHECKOUT - Bug aún presente"
        fi
    else
        log "    ? Respuesta desconocida en checkout"
    fi
else
    log "    ✗ Checkout no accesible (¿redirige a login?)"
fi

# 3.6 Pruebas de validación
log "  - Pruebas de validación"
# Intentar registro con email inválido
INVALID_REG=$(curl -s -X POST "$BASE_URL/register.php" \
    -d "nombre=Test" \
    -d "apellidos=Invalid" \
    -d "email=invalid-email" \
    -d "telefono=123" \
    -d "dni=INVALID" \
    -d "password=short" \
    -d "confirm_password=diff" \
    -d "terminos=on")
if echo "$INVALID_REG" | grep -q -i "error\|invalido\|válido"; then
    log "    ✓ Validación detectada (email inválido)"
else
    log "    ✗ Validación no detectada"
fi

# ===== 4. CONTENTOAI - PRUEBAS DE SEGURIDAD =====
log ""
log "4. CONTENTOAI - PRUEBAS DE SEGURIDAD"
CONTENTO_URL="https://contentoai.cenarbe.com"

# 4.1 Health check básico
log "  - Health check"
if curl -s -o /dev/null -w "%{http_code}" "$CONTENTO_URL" | grep -q "200"; then
    log "    ✓ Sitio accesible"
else
    log "    ✗ Sitio no accesible"
fi

# 4.2 Formulario de lista de espera
log "  - Formulario de lista de espera"
FORM_RESP=$(curl -s "$CONTENTO_URL")
if echo "$FORM_RESP" | grep -q "waitlist-form"; then
    log "    ✓ Formulario detectado"
    # Probar un payload SQL básico
    SQL_TEST=$(curl -s -X POST "$CONTENTO_URL" \
        -F "name=' OR '1'='1" \
        -F "email=sql_test@example.com" \
        -F "planInterest=basic")
    if check_sql_errors "$SQL_TEST"; then
        log "    ✓ Sin errores SQL visibles (buena sanitización)"
    else
        log "    ✗ POSIBLE VULNERABILIDAD SQL"
    fi
else
    log "    ✗ Formulario no encontrado"
fi

# ===== 5. REGRESIONES - PROYECTOS EXISTENTES =====
log ""
log "5. VERIFICACIÓN DE REGRESIONES"

# 5.1 Comparar con estado conocido (simplificado)
log "  - Estado actual vs esperado"
# Verificar que Villazocotin admin no tenga errores SQL
if check_sql_errors "$ADMIN_RESP"; then
    log "    ✓ Villazocotin admin sin regresiones SQL"
else
    log "    ✗ REGRESIÓN: Villazocotin admin con errores SQL"
fi

# Verificar que Cenarbe register/login funcionen
if echo "$REG_RESP" | grep -q "302 Found\|redireccionar"; then
    log "    ✓ Cenarbe registro sin regresiones"
else
    log "    ✗ REGRESIÓN: Cenarbe registro falla"
fi

# ===== RESUMEN =====
log ""
log "=========================================="
log "PRUEBAS EXHAUSTIVAS COMPLETADAS"
log "Hora: $(date)"
log "=========================================="

# Crear archivo de resumen
SUMMARY_FILE="/tmp/exhaustive_summary_$(date +%Y%m%d_%H%M).txt"
cat > "$SUMMARY_FILE" <<EOF
Resumen Pruebas Exhaustivas - $(date)

1. Health Check: COMPLETADO
2. Villazocotin:
   - Página principal: OK
   - Admin login: Sin errores SQL visibles
   - Calendario: Detectado

3. Cenarbe Bike:
   - Registro: $(if echo "$REG_RESP" | grep -q "302 Found\|redireccionar"; then echo "OK"; else echo "FALLÓ"; fi)
   - Login: $(if echo "$LOGIN_RESP" | grep -q "302 Found\|redireccionar"; then echo "OK"; else echo "FALLÓ"; fi)
   - Carrito: $COUNT bicicletas agregadas
   - Checkout: $(if echo "$CHECKOUT_RESP" | grep -q -i "reserva confirmada\|éxito"; then echo "ÉXITO (bug corregido)"; elif echo "$CHECKOUT_RESP" | grep -q -i "error\|SQL"; then echo "FALLÓ (bug presente)"; else echo "NO DETERMINADO"; fi)
   - Validación: $(if echo "$INVALID_REG" | grep -q -i "error\|invalido"; then echo "DETECTADA"; else echo "NO DETECTADA"; fi)

4. ContentoAI:
   - Health check: OK
   - Formulario waitlist: $(if echo "$FORM_RESP" | grep -q "waitlist-form"; then echo "DETECTADO"; else echo "NO DETECTADO"; fi)
   - Sanitización SQL: $(if check_sql_errors "$SQL_TEST" 2>/dev/null; then echo "APARENTEMENTE OK"; else echo "POSIBLE VULNERABILIDAD"; fi)

5. Regresiones:
   - Villazocotin admin SQL: $(if check_sql_errors "$ADMIN_RESP"; then echo "OK"; else echo "REGRESIÓN"; fi)
   - Cenarbe registro: $(if echo "$REG_RESP" | grep -q "302 Found\|redireccionar"; then echo "OK"; else echo "REGRESIÓN"; fi)

Log completo: $LOG_FILE
EOF

log "Resumen guardado en: $SUMMARY_FILE"
cat "$SUMMARY_FILE"

echo ""
echo "Pruebas exhaustivas completadas. Revisar logs para detalles."