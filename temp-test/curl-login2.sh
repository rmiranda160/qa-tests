#!/bin/bash
set -e

# Obtener página de login y extraer CSRF token
csrf=$(curl -s https://dev1.cenarbe.com/login.php | grep -o '<input type="hidden" name="csrf_token" value="[^"]*"' | sed 's/.*value="//' | sed 's/"//')
echo "CSRF token: $csrf"

# Intentar login con credenciales incluyendo CSRF
curl -s -c cookies.txt -b cookies.txt -d "email=test@cenarbe.com&password=Test123!&csrf_token=$csrf" -X POST https://dev1.cenarbe.com/login.php -o response.html

echo "Response length: $(wc -c response.html)"
# Verificar si hay redirección
grep -i "location:" response.html || true
# Verificar si hay mensaje de error
grep -i "alert" response.html | head -2 || true
# Verificar si hay dashboard
grep -i "dashboard" response.html | head -2 || true

# También seguir redirección con -L
curl -s -L -c cookies.txt -b cookies.txt -d "email=test@cenarbe.com&password=Test123!&csrf_token=$csrf" -X POST https://dev1.cenarbe.com/login.php -o response2.html
echo "Response2 length: $(wc -c response2.html)"
head -c 500 response2.html