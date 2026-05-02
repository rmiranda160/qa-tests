#!/bin/bash
set -e

# Obtener página de login
curl -s -c cookies.txt https://dev1.cenarbe.com/login.php -o login.html

# Extraer token CSRF si existe (buscar input hidden)
grep -o '<input type="hidden" name="[^"]*" value="[^"]*"' login.html | head -5

# Intentar login con credenciales (asumiendo campos email y password)
curl -s -b cookies.txt -c cookies.txt -d "email=test@cenarbe.com&password=Test123!" -X POST https://dev1.cenarbe.com/login.php -o response.html

echo "Response length: $(wc -c response.html)"
head -c 500 response.html