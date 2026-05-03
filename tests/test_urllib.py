#!/usr/bin/env python3
import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
import re
from datetime import datetime, timedelta

BASE_URL = "https://dev1.cenarbe.com"

# Setup cookie jar
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
                     ('Referer', BASE_URL)]

def fetch(url, data=None):
    if data:
        data_encoded = urllib.parse.urlencode(data).encode('utf-8')
        req = urllib.request.Request(url, data=data_encoded, method='POST')
    else:
        req = urllib.request.Request(url)
    try:
        with opener.open(req) as resp:
            return resp.read().decode('utf-8', errors='ignore'), resp.getcode()
    except urllib.error.HTTPError as e:
        return e.read().decode('utf-8', errors='ignore'), e.code

def test_registro():
    print("=== 1. Registro ===")
    timestamp = int(datetime.now().timestamp())
    email = f"testuser{timestamp}@example.com"
    dni = f"TEST{timestamp}"
    data = {
        'nombre': 'Test',
        'apellidos': f'User{timestamp}',
        'email': email,
        'telefono': '600111222',
        'dni': dni,
        'password': 'Test1234',
        'confirm_password': 'Test1234',
        'terminos': 'on'
    }
    html, code = fetch(f"{BASE_URL}/register.php", data)
    print(f"Código HTTP: {code}")
    if code == 302:
        print("✓ Registro exitoso (redirección)")
        # seguir redirección
        html, code = fetch(f"{BASE_URL}/index.php")
        if code == 200:
            print("✓ Index carga correctamente")
            # verificar si hay sesión
            if 'Cerrar sesión' in html or 'Mi cuenta' in html:
                print("✓ Sesión activa")
            else:
                print("✗ No hay indicios de sesión activa")
        else:
            print(f"✗ Index devuelve código {code}")
        return True
    else:
        print("✗ Registro falló")
        # buscar errores
        if 'error' in html.lower():
            print("Contiene error")
        return False

def test_login(email, password):
    print("\n=== 2. Login ===")
    data = {
        'email': email,
        'password': password
    }
    html, code = fetch(f"{BASE_URL}/login.php", data)
    print(f"Código HTTP: {code}")
    if code == 302:
        print("✓ Login redirige")
        html, code = fetch(f"{BASE_URL}/index.php")
        if 'Cerrar sesión' in html:
            print("✓ Login exitoso")
            return True
    else:
        if 'Email o contraseña incorrectos' in html:
            print("✗ Credenciales incorrectas")
        else:
            print("✗ Login falló")
    return False

def test_agregar_carrito():
    print("\n=== 3. Agregar al carrito ===")
    # primero obtener página de bicicletas para extraer ID
    html, code = fetch(f"{BASE_URL}/bicicletas.php")
    if code != 200:
        print(f"✗ No se pudo cargar bicicletas.php (código {code})")
        return False
    matches = re.findall(r'bicicleta\.php\?id=(\d+)', html)
    bike_id = matches[0] if matches else '7'
    print(f"ID bicicleta: {bike_id}")
    # fechas
    start = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
    end = (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d')
    data = {
        'bicicleta_id': bike_id,
        'fecha_inicio': start,
        'fecha_fin': end,
        'agregar': '1'
    }
    html, code = fetch(f"{BASE_URL}/carrito.php", data)
    print(f"Código HTTP: {code}")
    if 'Carrito de alquiler' in html:
        print("✓ Producto agregado al carrito")
        return True
    else:
        print("✗ Error al agregar al carrito")
        return False

def test_checkout():
    print("\n=== 4. Checkout ===")
    html, code = fetch(f"{BASE_URL}/checkout.php")
    if code != 200:
        print(f"✗ No se pudo cargar checkout.php (código {code})")
        return False
    data = {
        'metodo_pago': 'tarjeta',
        'terminos': 'on',
        'confirmar': '1'
    }
    html, code = fetch(f"{BASE_URL}/checkout.php", data)
    print(f"Código HTTP: {code}")
    if 'Reserva confirmada' in html:
        print("✓ Checkout exitoso")
        return True
    elif 'error' in html.lower() or 'SQL' in html:
        print("✗ Error en checkout:")
        # extraer mensaje de error
        error_match = re.search(r'<div class="alert alert-danger">(.*?)</div>', html, re.DOTALL)
        if error_match:
            print(error_match.group(1).strip())
        else:
            print(html[:500])
        return False
    else:
        print("? Respuesta desconocida")
        return False

if __name__ == '__main__':
    print("Iniciando pruebas...")
    # Paso 1: Registro
    if test_registro():
        # Obtener email y password (hardcoded)
        timestamp = int(datetime.now().timestamp())
        email = f"testuser{timestamp}@example.com"
        password = 'Test1234'
        # Paso 2: Login (debería fallar según informe)
        test_login(email, password)
        # Paso 3: Agregar al carrito
        test_agregar_carrito()
        # Paso 4: Checkout
        test_checkout()
    else:
        print("Registro falló, no se puede continuar.")