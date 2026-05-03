# CRON QA: Responsive — Site Outage HTTP 500 Bloquea Testing

**Date:** 2026-05-03 16:57 UTC  
**Focus:** responsive  
**Site:** new.zonacnc.com  
**Agent:** tester (cron: tester-responsive)  
**Label:** qa-responsive  

---

## Estado: ❌ BLOQUEADO — Site Outage HTTP 500 (todas las rutas)

### Descripción
El sitio **new.zonacnc.com** está completamente caído. Todas las rutas públicas (home, categorías, pricing, login, contact, etc.) devuelven **HTTP 500 Internal Server Error** con cuerpo vacío (`content-length: 0`). El responsive test para este ciclo **no puede ejecutarse**.

### Timeline del día

| Evento | Hora UTC | Estado |
|--------|----------|--------|
| Responsive full verification (6 páginas, 3 viewports, emails) | 16:19 UTC | ✅ PASS |
| Outage detectado (stripe-billing agent) | 16:54 UTC | ❌ OUTAGE |
| Confirmación responsive (current cron) | 16:57 UTC | ❌ OUTAGE CONFIRMADO |

### Rutas verificadas (16:57 UTC)

| Ruta | Código | Body |
|------|--------|------|
| `https://new.zonacnc.com/` | 500 | vacío |
| `https://new.zonacnc.com/es/` | 500 | vacío |
| `https://new.zonacnc.com/en/` | 500 | vacío |
| `https://new.zonacnc.com/es/25-prensas` (categoría) | 500 | vacío |
| `https://new.zonacnc.com/es/contactenos` | 500 | vacío |
| `https://new.zonacnc.com/es/content/1-about-us` | 500 | vacío |
| `https://new.zonacnc.com/es/content/2-legal-notice` | 500 | vacío |
| `https://new.zonacnc.com/es/module/ps_accounts/onboarding` | 500 | vacío |
| `https://new.zonacnc.com/es/pricing` | 500 | vacío |
| `https://new.zonacnc.com/robots.txt` | **200** ✅ | estático nginx |

### Diagnóstico técnico

```
Server: nginx
PHP: 8.3.30
Content-Length: 0 (todas las rutas)
Patrón: idéntico al outage del 2026-05-02 (~14:38 UTC)
```

- **nginx** operativo (robots.txt 200)
- **PHP-FPM** activo (genera sesión PrestaShop)
- **Aplicación PrestaShop crashea** sin generar output → probable PHP fatal error
- **Segundo outage recurrente** en 48h con mismo patrón

### Impacto en Responsive Testing
- ❌ No se puede probar layout responsive en ninguna página
- ❌ No se pueden verificar viewports, overflow, touch targets
- ❌ No se pueden verificar plantillas de email
- ❌ MCP browser y Playwright remote fallan (sitio caído + browser unreachable)
- 🔄 Responsive test bloqueado hasta resolución del outage

### Diferencia con última prueba exitosa
La última prueba responsive exitosa fue a las **16:19 UTC** (hace ~38 min). En ese momento:
- Homepage, Tornos, Pricing, Vendedores, Login, Registration funcionaban correctamente
- 3 viewports sin overflow ni errores
- Emails verificados vía IMAP (test30@zonacnc.com)
- Welcome, password reset, password updated templates OK en español

### Referencias
- PR #67 (merged): Site outage HTTP 500 (stripe-billing)
- Issue #68: [CRITICAL] new.zonacnc.com — HTTP 500 Site Outage (3 May 2026)
- Finding stripe-billing: `CRONQA-2026-05-03-stripe-billing-site-outage-v2.md`
- Responsive full verification (pre-outage): `CRONQA-RESPONSIVE-2026-05-03-full-verification.md`
- Mismo patrón que outage May 2: `responsive-500-outage-2026-05-02.md`
