#!/usr/bin/env python3
import requests
import re
import sys
from datetime import datetime, timedelta
import random

BASE_URL = "https://dev1.cenarbe.com"
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
})

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")
    sys.stdout.flush()

def test_registro():
    """Paso 1: Registro de nuevo usuario"""
    log("=== 1. REGISTRO ===")
    # Datos únicos
    timestamp = int(datetime.now().timestamp())
    email = f"testuser{timestamp}@example.com"
    dni = f"TEST{timestamp}"
    nombre = "Test"
    apellidos = f"User{timestamp}"
    telefono = f"600{random.randint(100000, 999999)}"
    password = "Test1234"
    
    log(f"Email: {email}, DNI: {dni}")
    
    # Obtener página de registro para cookies
    resp = SESSION.get(f"{BASE_URL}/register.php")
    if resp.status_code != 200:
        log(f"ERROR: GET register.php status {resp.status_code}")
        return False
    
    # Enviar registro
    data = {
        "nombre": nombre,
        "apellidos": apellidos,
        "email": email,
        "telefono": telefono,
        "dni": dni,
        "password": password,
        "confirm_password": password,
        "terminos": "on"
    }
    resp = SESSION.post(f"{BASE_URL}/register.php", data=data, allow_redirects=False)
    if resp.status_code == 302:
        log("✓ Registro exitoso (redirección 302)")
        # Seguir redirección
        SESSION.get(f"{BASE_URL}/index.php")
        return True
    else:
        log(f"✗ Registro falló: status {resp.status_code}")
        log(resp.text[:500])
        return False

def test_login():
    """Paso 2: Login (por si acaso)"""
    log("=== 2. LOGIN ===")
    # Reutilizar credenciales del registro anterior (deberían estar en sesión)
    # Simplemente verificamos que la sesión esté activa accediendo a una página protegida
    resp = SESSION.get(f"{BASE_URL}/reservas.php")
    if "Mis Reservas" in resp.text or "Reservas" in resp.text:
        log("✓ Sesión activa (página de reservas accesible)")
        return True
    else:
        log("✗ No hay sesión activa, intentando login con credenciales conocidas")
        # Intentar login con último usuario (no implementado por ahora)
        return False

def test_agregar_carrito():
    """Paso 3: Agregar bicicleta al carrito"""
    log("=== 3. AGREGAR AL CARRITO ===")
    # Obtener página de bicicletas para extraer un ID
    resp = SESSION.get(f"{BASE_URL}/bicicletas.php")
    if resp.status_code != 200:
        log(f"ERROR: GET bicicletas.php status {resp.status_code}")
        return False
    
    # Buscar enlaces a bicicleta.php?id=...
    matches = re.findall(r'bicicleta\.php\?id=(\d+)', resp.text)
    if not matches:
        log("No se encontraron IDs de bicicletas, usando ID por defecto 7")
        bike_id = 7
    else:
        bike_id = matches[0]
        log(f"ID bicicleta seleccionada: {bike_id}")
    
    # Fechas futuras
    start_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    log(f"Fechas: {start_date} a {end_date}")
    
    data = {
        "bicicleta_id": bike_id,
        "fecha_inicio": start_date,
        "fecha_fin": end_date,
        "agregar": "1"
    }
    resp = SESSION.post(f"{BASE_URL}/carrito.php", data=data)
    if "Carrito de alquiler" in resp.text:
        log("✓ Producto agregado al carrito")
        return True
    else:
        log("✗ Error al agregar al carrito")
        log(resp.text[:500])
        return False

def test_checkout():
    """Paso 4: Checkout (procesar pago)"""
    log("=== 4. CHECKOUT ===")
    # Obtener página de checkout
    resp = SESSION.get(f"{BASE_URL}/checkout.php")
    if resp.status_code != 200:
        log(f"ERROR: GET checkout.php status {resp.status_code}")
        return False
    
    # Buscar posibles tokens CSRF (no esperados)
    # Enviar datos de pago
    data = {
        "metodo_pago": "tarjeta",
        "terminos": "on",
        "confirmar": "1"
    }
    resp = SESSION.post(f"{BASE_URL}/checkout.php", data=data)
    if "Reserva confirmada" in resp.text:
        log("✓ Checkout exitoso")
        return True
    elif "error" in resp.text.lower() or "SQL" in resp.text:
        log("✗ Error en checkout:")
        # Extraer mensaje de error
        error_match = re.search(r'<div class="alert alert-danger">(.*?)</div>', resp.text, re.DOTALL)
        if error_match:
            log(error_match.group(1).strip())
        else:
            log(resp.text[:800])
        return False
    else:
        log("? Respuesta desconocida")
        log(resp.text[:800])
        return False

def test_confirmacion():
    """Paso 5: Verificar reserva confirmada"""
    log("=== 5. CONFIRMACIÓN ===")
    resp = SESSION.get(f"{BASE_URL}/reservas.php")
    if "Reserva #" in resp.text:
        log("✓ Reserva confirmada en listado")
        return True
    else:
        log("✗ No se encontró reserva en listado")
        return False

def main():
    log("Iniciando pruebas exhaustivas del flujo de reserva Cenarbe Bike")
    
    # Ejecutar pasos
    paso1 = test_registro()
    if not paso1:
        log("Fallo en registro, abortando.")
        return
    
    paso2 = test_login()
    if not paso2:
        log("Advertencia: login no verificado")
    
    paso3 = test_agregar_carrito()
    if not paso3:
        log("Fallo al agregar al carrito, continuando igual.")
    
    paso4 = test_checkout()
    if not paso4:
        log("Fallo en checkout.")
    
    paso5 = test_confirmacion()
    
    log("=== RESUMEN ===")
    log(f"Registro: {'✓' if paso1 else '✗'}")
    log(f"Login: {'✓' if paso2 else '✗'}")
    log(f"Carrito: {'✓' if paso3 else '✗'}")
    log(f"Checkout: {'✓' if paso4 else '✗'}")
    log(f"Confirmación: {'✓' if paso5 else '✗'}")
    
    if paso1 and paso2 and paso3 and paso4 and paso5:
        log("✅ FLUJO COMPLETO EXITOSO")
    else:
        log("❌ FLUJO CON FALLOS")

if __name__ == "__main__":
    main()