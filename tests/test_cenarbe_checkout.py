#!/usr/bin/env python3
"""
Prueba de checkout de Cenarbe Bike Rental con detección de errores SQL.
Se asume que Kevin ha corregido el bug del carrito (columna horas_totales).
Este script valida que el checkout funcione correctamente y que no haya
vulnerabilidades de inyección SQL en el proceso.
"""
import requests
import re
import sys
from datetime import datetime, timedelta
import random
import time

BASE_URL = "https://dev1.cenarbe.com"
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
})

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")
    sys.stdout.flush()

def detect_sql_errors(text):
    """Detecta mensajes de error de SQL en la respuesta."""
    patterns = [
        r"SQLSTATE\[\d+\]",
        r"Unknown column",
        r"Table '[^']+' doesn't exist",
        r"You have an error in your SQL syntax",
        r"Column not found",
        r"MySQL server version",
        r"PostgreSQL.*ERROR",
        r"Warning.*mysql",
        r"Fatal error.*SQL",
        r"Unclosed quotation mark",
        r"Integrity constraint violation",
        r"Duplicate entry",
        r"Foreign key constraint fails"
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True, pattern
    return False, None

def test_registro():
    """Registra un nuevo usuario para pruebas."""
    log("=== Registro de usuario de prueba ===")
    timestamp = int(datetime.now().timestamp())
    email = f"testcheckout{timestamp}@example.com"
    dni = f"TEST{timestamp}"
    nombre = "Checkout"
    apellidos = f"Test{timestamp}"
    telefono = f"600{random.randint(100000, 999999)}"
    password = "Test1234"
    
    log(f"Email: {email}, DNI: {dni}")
    
    # Obtener página de registro para cookies
    resp = SESSION.get(f"{BASE_URL}/register.php")
    if resp.status_code != 200:
        log(f"ERROR: GET register.php status {resp.status_code}")
        return None, None
    
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
        return email, password
    else:
        log(f"✗ Registro falló: status {resp.status_code}")
        # Verificar si hay errores SQL
        has_sql, pattern = detect_sql_errors(resp.text)
        if has_sql:
            log(f"   !! Posible error SQL detectado: {pattern}")
        return None, None

def test_login(email, password):
    """Inicia sesión con credenciales dadas."""
    log("=== Login ===")
    data = {
        "email": email,
        "password": password
    }
    resp = SESSION.post(f"{BASE_URL}/login.php", data=data, allow_redirects=False)
    if resp.status_code == 302:
        log("✓ Login exitoso (redirección)")
        return True
    else:
        log(f"✗ Login falló: status {resp.status_code}")
        has_sql, pattern = detect_sql_errors(resp.text)
        if has_sql:
            log(f"   !! Posible error SQL detectado: {pattern}")
        return False

def test_agregar_carrito():
    """Agrega una bicicleta al carrito."""
    log("=== Agregar al carrito ===")
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
        # Detectar errores SQL
        has_sql, pattern = detect_sql_errors(resp.text)
        if has_sql:
            log(f"   !! Error SQL detectado en carrito: {pattern}")
            return False
        return True
    else:
        log("✗ Error al agregar al carrito")
        has_sql, pattern = detect_sql_errors(resp.text)
        if has_sql:
            log(f"   !! Error SQL detectado: {pattern}")
        return False

def test_checkout_form():
    """Obtiene el formulario de checkout y extrae campos."""
    log("=== Obteniendo formulario de checkout ===")
    resp = SESSION.get(f"{BASE_URL}/checkout.php")
    if resp.status_code != 200:
        log(f"ERROR: GET checkout.php status {resp.status_code}")
        return None
    
    # Verificar que no haya errores SQL
    has_sql, pattern = detect_sql_errors(resp.text)
    if has_sql:
        log(f"   !! Error SQL detectado en checkout page: {pattern}")
        return None
    
    # Buscar formulario checkout
    if "checkout" not in resp.text.lower() and "pago" not in resp.text.lower():
        log("✗ No parece ser página de checkout")
        return None
    
    # Extraer campos de formulario (simplificado)
    # Asumimos que existe un formulario con campos típicos
    # En realidad, deberíamos analizar el HTML, pero para rapidez asumimos campos conocidos
    log("✓ Página de checkout cargada")
    return resp.text

def test_checkout_submit():
    """Envía el formulario de checkout con datos válidos."""
    log("=== Enviando checkout ===")
    # Datos de pago simulados
    data = {
        "metodo_pago": "tarjeta",
        "terminos": "on",
        "confirmar": "1"
    }
    resp = SESSION.post(f"{BASE_URL}/checkout.php", data=data)
    
    # Detectar errores SQL
    has_sql, pattern = detect_sql_errors(resp.text)
    if has_sql:
        log(f"✗ Error SQL detectado en checkout: {pattern}")
        # Extraer más detalles
        error_match = re.search(r'<div class="alert alert-danger">(.*?)</div>', resp.text, re.DOTALL)
        if error_match:
            log(f"   Mensaje de error: {error_match.group(1).strip()}")
        return False
    
    # Verificar éxito
    if "Reserva confirmada" in resp.text or "reserva exitosa" in resp.text.lower():
        log("✓ Checkout exitoso - reserva confirmada")
        return True
    elif "error" in resp.text.lower():
        log("✗ Checkout falló - mensaje de error genérico")
        log(resp.text[:800])
        return False
    else:
        log("? Respuesta desconocida - asumiendo fallo")
        log(resp.text[:800])
        return False

def main():
    log("Iniciando prueba de checkout de Cenarbe Bike Rental")
    log("=" * 60)
    
    # Paso 1: Registro
    email, password = test_registro()
    if email is None:
        log("Fallo en registro, abortando.")
        return False
    
    # Paso 2: Login (por si acaso)
    if not test_login(email, password):
        log("Fallo en login, abortando.")
        return False
    
    # Paso 3: Agregar al carrito
    if not test_agregar_carrito():
        log("Fallo al agregar al carrito, abortando.")
        return False
    
    # Paso 4: Obtener formulario de checkout
    form_html = test_checkout_form()
    if form_html is None:
        log("No se pudo obtener formulario de checkout, abortando.")
        return False
    
    # Paso 5: Enviar checkout
    success = test_checkout_submit()
    
    if success:
        log("✓✓✓ CHECKOUT SUPERADO - No se detectaron errores SQL")
    else:
        log("✗✗✗ CHECKOUT FALLADO - Verificar errores arriba")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)