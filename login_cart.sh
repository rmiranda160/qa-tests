#!/bin/bash
cd /home/node/.openclaw/workspace-tester
EMAIL=$(grep EMAIL /tmp/creds.txt | cut -d= -f2)
PASSWORD=$(grep PASSWORD /tmp/creds.txt | cut -d= -f2)
echo "Login with $EMAIL"
curl -k -c cookies_login2.txt -b cookies_login2.txt -s -L -v \
    -d "email=$EMAIL" \
    -d "password=$PASSWORD" \
    -d "submit=Login" \
    "https://dev1.cenarbe.com/login.php" 2>&1 | grep -E "HTTP|Location" | head -10
# Verify carrito still has items
curl -k -b cookies_login2.txt -s "https://dev1.cenarbe.com/carrito.php" -o /tmp/carrito_after_login.html
grep -o "ID: [0-9]*" /tmp/carrito_after_login.html