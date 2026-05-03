#!/bin/bash

set -e

echo "=== Health Check para Villazocotin y Cenarbe Bike ==="
echo "Fecha: $(date)"

check_url() {
    local url=$1
    local name=$2
    echo -n "Probando $name ($url)... "
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [[ "$http_code" -eq 200 ]]; then
        echo "OK ($http_code)"
        # Opcional: verificar que no contiene errores PHP
        curl -s "$url" | grep -i "error\|fatal\|warning\|undefined" | head -2 > /tmp/errors.txt
        if [[ -s /tmp/errors.txt ]]; then
            echo "  WARNING: Posibles errores en la página:"
            cat /tmp/errors.txt | sed 's/^/    /'
        else
            echo "  No se detectaron errores PHP visibles."
        fi
    else
        echo "FAIL ($http_code)"
        return 1
    fi
}

echo ""
echo "--- Villazocotin ---"
check_url "https://villazocotin.cenarbe.com" "Villazocotin Home"
check_url "https://villazocotin.cenarbe.com/admin/login.php" "Admin Login"

echo ""
echo "--- Cenarbe Bike ---"
check_url "https://dev1.cenarbe.com" "Cenarbe Home"
check_url "https://dev1.cenarbe.com/register.php" "Registro"
check_url "https://dev1.cenarbe.com/login.php" "Login"
check_url "https://dev1.cenarbe.com/bicicletas.php" "Bicicletas"
check_url "https://dev1.cenarbe.com/carrito.php" "Carrito"
# checkout.php puede no existir; intentamos pero permitimos 404
echo -n "Probando Checkout (puede no existir)... "
http_code=$(curl -s -o /dev/null -w "%{http_code}" "https://dev1.cenarbe.com/checkout.php")
if [[ "$http_code" -eq 200 ]]; then
    echo "OK ($http_code)"
elif [[ "$http_code" -eq 404 ]]; then
    echo "No encontrado (404)"
else
    echo "Código $http_code"
fi

echo ""
echo "=== Health check completado ==="