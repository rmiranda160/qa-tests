import requests
import random
import string
import sys
import time

BASE_URL = "https://dev1.cenarbe.com"
SESSION = requests.Session()
SESSION.verify = False  # ignore SSL warnings
headers = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def random_email():
    return f"test_{random_string(6)}@example.com"

def random_dni():
    return f"{random.randint(10000000, 99999999)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"

print("=== Registro de usuario nuevo ===")
email = random_email()
dni = random_dni()
password = "Password123"  # >=8 chars, uppercase, lowercase, digit

# First, get register page to see if there is CSRF token
print("GET register.php")
resp = SESSION.get(f"{BASE_URL}/register.php", headers=headers)
if resp.status_code != 200:
    print(f"Error: GET register.php returned {resp.status_code}")
    sys.exit(1)

# Simple parsing for CSRF token (if any)
# Assume no CSRF for now

data = {
    "nombre": "Test",
    "apellidos": "User",
    "email": email,
    "dni": dni,
    "direccion": "Test Street 123",
    "telefono": "612345678",
    "password": password,
    "confirm_password": password,
    "submit": "Registrarse"
}

print(f"Email: {email}, DNI: {dni}")
print("POST register.php")
resp = SESSION.post(f"{BASE_URL}/register.php", data=data, headers=headers, allow_redirects=False)
print(f"Status: {resp.status_code}, Location: {resp.headers.get('Location', 'None')}")
if resp.status_code == 302:
    print("Registro exitoso (redirección)")
    # Follow redirect to index.php
    SESSION.get(f"{BASE_URL}{resp.headers['Location']}", headers=headers)
else:
    print("Registro puede haber fallado, inspeccionar respuesta")
    # Maybe already logged in? continue

print("\n=== Verificar sesión ===")
resp = SESSION.get(f"{BASE_URL}/index.php", headers=headers)
if "Bienvenido" in resp.text or "Usuario" in resp.text:
    print("Sesión activa detectada")
else:
    print("No se detectó sesión activa, puede haber fallado registro")

print("\n=== Agregar bicicleta al carrito ===")
# Need a valid bicicleta ID. Use 7 as in previous tests.
bicicleta_id = 7
fecha_inicio = "2026-03-20"
fecha_fin = "2026-03-21"
horas = 4

data_carrito = {
    "bicicleta_id": bicicleta_id,
    "fecha_inicio": fecha_inicio,
    "fecha_fin": fecha_fin,
    "horas": horas,
    "submit": "Añadir al carrito"
}

print(f"Añadiendo bicicleta {bicicleta_id} al carrito")
resp = SESSION.post(f"{BASE_URL}/carrito.php", data=data_carrito, headers=headers, allow_redirects=False)
print(f"Status: {resp.status_code}, Location: {resp.headers.get('Location', 'None')}")
if resp.status_code == 302:
    print("Redirección después de añadir al carrito")
    # Follow redirect to carrito.php
    SESSION.get(f"{BASE_URL}{resp.headers['Location']}", headers=headers)

# Verify carrito items
print("\n=== Verificar carrito ===")
resp = SESSION.get(f"{BASE_URL}/carrito.php", headers=headers)
if "Carrito de alquiler" in resp.text:
    print("Carrito cargado")
else:
    print("Carrito posiblemente vacío")

print("\n=== Probar GET checkout.php (con carrito) ===")
resp = SESSION.get(f"{BASE_URL}/checkout.php", headers=headers, timeout=10)
print(f"Status: {resp.status_code}, Tiempo: {resp.elapsed.total_seconds():.2f}s")
if resp.status_code == 200:
    print("Checkout cargado (200)")
elif resp.status_code == 302:
    print(f"Redirección a: {resp.headers.get('Location', 'None')}")
else:
    print(f"Status inesperado: {resp.status_code}")

print("\n=== Probar POST checkout.php (procesar reserva) ===")
# Prepare minimal checkout data
checkout_data = {
    "metodo_pago": "tarjeta",
    "terminos": "on"
}
resp = SESSION.post(f"{BASE_URL}/checkout.php", data=checkout_data, headers=headers, timeout=10)
print(f"Status: {resp.status_code}, Tiempo: {resp.elapsed.total_seconds():.2f}s")
if resp.status_code == 302:
    print(f"Redirección a: {resp.headers.get('Location', 'None')}")
elif resp.status_code == 200:
    print("POST devolvió 200 (posible error o formulario)")
else:
    print(f"Status inesperado: {resp.status_code}")

# Save cookies for later inspection
import http.cookiejar as cookielib
SESSION.cookies.save("cookies_test.txt", ignore_discard=True, ignore_expires=True)
print("\nCookies guardadas en cookies_test.txt")