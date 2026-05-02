import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
import random
import string
import ssl
import sys
import time

BASE_URL = "https://dev1.cenarbe.com"
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Cookie jar
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPSHandler(context=ssl_context),
    urllib.request.HTTPCookieProcessor(cookie_jar)
)
opener.addheaders = [
    ("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
]

def open_url(url, data=None, method=None):
    if data is not None:
        data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=data, method=method)
    try:
        resp = opener.open(req, timeout=10)
        return resp
    except urllib.error.HTTPError as e:
        return e
    except Exception as e:
        print(f"Error opening {url}: {e}")
        return None

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def random_email():
    return f"test_{random_string(6)}@example.com"

def random_dni():
    return f"{random.randint(10000000, 99999999)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"

print("=== Registro de usuario nuevo ===")
email = random_email()
dni = random_dni()
password = "Password123"

# Get register page (optional)
print("GET register.php")
resp = open_url(f"{BASE_URL}/register.php")
if resp and resp.code == 200:
    print("Register page loaded")

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
resp = open_url(f"{BASE_URL}/register.php", data=data, method="POST")
if resp:
    print(f"Status: {resp.code}")
    if resp.code == 302:
        location = resp.headers.get('Location')
        print(f"Location: {location}")
        # Follow redirect
        if location:
            open_url(f"{BASE_URL}{location}")
    else:
        print("No redirection")

print("\n=== Verificar sesión ===")
resp = open_url(f"{BASE_URL}/index.php")
if resp and resp.code == 200:
    content = resp.read().decode('utf-8', errors='ignore')
    if "Bienvenido" in content or "Usuario" in content:
        print("Sesión activa detectada")
    else:
        print("No se detectó sesión activa")

print("\n=== Agregar bicicleta al carrito ===")
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
resp = open_url(f"{BASE_URL}/carrito.php", data=data_carrito, method="POST")
if resp:
    print(f"Status: {resp.code}")
    if resp.code == 302:
        location = resp.headers.get('Location')
        print(f"Location: {location}")
        if location:
            open_url(f"{BASE_URL}{location}")

print("\n=== Verificar carrito ===")
resp = open_url(f"{BASE_URL}/carrito.php")
if resp and resp.code == 200:
    content = resp.read().decode('utf-8', errors='ignore')
    if "Carrito de alquiler" in content:
        print("Carrito cargado")
    else:
        print("Carrito posiblemente vacío")

print("\n=== Probar GET checkout.php (con carrito) ===")
start = time.time()
resp = open_url(f"{BASE_URL}/checkout.php")
elapsed = time.time() - start
if resp:
    print(f"Status: {resp.code}, Tiempo: {elapsed:.2f}s")
    if resp.code == 200:
        print("Checkout cargado (200)")
    elif resp.code == 302:
        location = resp.headers.get('Location')
        print(f"Redirección a: {location}")
    else:
        print(f"Status inesperado: {resp.code}")
else:
    print("Timeout o error")

print("\n=== Probar POST checkout.php (procesar reserva) ===")
checkout_data = {
    "metodo_pago": "tarjeta",
    "terminos": "on"
}
start = time.time()
resp = open_url(f"{BASE_URL}/checkout.php", data=checkout_data, method="POST")
elapsed = time.time() - start
if resp:
    print(f"Status: {resp.code}, Tiempo: {elapsed:.2f}s")
    if resp.code == 302:
        location = resp.headers.get('Location')
        print(f"Redirección a: {location}")
    elif resp.code == 200:
        print("POST devolvió 200 (posible error o formulario)")
    else:
        print(f"Status inesperado: {resp.code}")
else:
    print("Timeout o error")

# Save cookies
import http.cookiejar as cookielib
cookielib.MozillaCookieJar('cookies_test.txt').save()
print("\nCookies guardadas en cookies_test.txt")