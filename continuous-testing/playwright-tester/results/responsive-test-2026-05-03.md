# Informe de Prueba Responsive - new.zonacnc.com

**Fecha:** 2026-05-03  
**Modo:** Responsive  
**Alcance:** new.zonacnc.com  
**MCP:** pwmcp-zonacnc (remoto)  
**CRON ID:** 53983183-66c6-4b72-9b21-404aac116c60  

---

## Resumen: ❌ CRÍTICO - Fallos en autenticación

---

## 1. Prueba Responsive - Viewports

### ✅ Mobile (390×844)
- Header adaptado con top bar simplificada (selector idioma + login)
- Buscador colapsado a botón icono
- Menú categorías modo hamburguesa
- Secciones de footer colapsables ("Mostrar/ocultar")
- Contenido principal visible y accesible

### ✅ Tablet (768×1024)
- Top bar completa con enlace "Contacte con nosotros"
- Buscador inline visible (no colapsado)
- Footer expandido sin toggles
- Grid de categorías correcto

### ✅ Desktop (1440×900)
- Layout completo con navegación horizontal
- Buscador inline, categorías en navbar
- Footer completo con columnas

**Conclusión responsive:** Sin incidencias responsive detectadas.

---

## 2. Fallos Críticos de Servidor (HTTP 500)

| Endpoint | Estado HTTP | Descripción |
|---|---|---|
| `/es/iniciar-sesion` | **500** | Página de login rota |
| `/es/mi-cuenta` | **500** | Página de cuenta rota |
| `/es/module/zonacncalerts/myalerts` | **500** | Alertas rotas |
| `/es/registro` | **404** | URL de registro no existe |
| `/es/register` | **404** | URL de registro no existe |
| `/es/crear-cuenta` | **404** | URL de registro no existe |

La ruta de registro funcional es `/?controller=registration`.

### 2.1 Registro de usuario
- El formulario de registro en `/?controller=registration` funciona.
- Todos los emails QA (test7@zonacnc.com a test30@zonacnc.com) ya están registrados.
- No se puede iniciar sesión porque `/es/iniciar-sesion` da **500 Internal Server Error**.

### 2.2 Errores en consola del navegador
- `[ERROR] Not signed in with the identity provider.`
- `[ERROR] [GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token.`

---

## 3. Endpoints Funcionales ✅

| Endpoint | Estado | 
|---|---|
| `/es/` (Home) | ✅ 200 |
| `/es/buscar` (Búsqueda) | ✅ 200 |
| `/es/module/zonacncproductadd/ads` (Vender) | ✅ 200 |
| `/es/contactenos` (Contacto) | ✅ 200 |
| `/es/vendedores` (Vendedores) | ✅ 200 |
| `/es/pricing` (Tarifas) | ✅ 200 |
| `/es/?controller=registration` (Registro) | ✅ 200 |

---

## 4. Resumen de Incidencias

1. **[CRÍTICO] Login page 500** — Impide iniciar sesión a cualquier usuario. Sin login no se puede acceder a cuenta, alertas ni vender.
2. **[ALTO] Mi cuenta 500** — `/es/mi-cuenta` inaccesible.
3. **[ALTO] Alertas 500** — Módulo de alertas roto.
4. **[MEDIO] Registro alternativo 404** — URLs amigables de registro no existen (`/es/registro`, `/es/register`).

---

## 5. Screenshots Capturados
- `responsive-mobile-390.png`
- `responsive-tablet-768.png`
- `responsive-desktop-1440.png`
- `registration-page.png`
- `vender-maquina-page.png`
