# CRON QA: Stripe Billing — Site Outage HTTP 500 (Regresión)

**Date:** 2026-05-03 16:54 UTC  
**Focus:** stripe-billing  
**Site:** new.zonacnc.com  
**Tester:** CRON QA tester-stripe-billing  
**Duration:** 5 min (aborted — full site outage)

---

## Test Scenario (Aborted)

**Intended test:** Log in with existing Pro account → test boost pack purchase (Stripe payment for non-subscription) → verify invoice + email.

## Result: ❌ BLOCKED — Full Site Outage (HTTP 500)

### Description
**new.zonacnc.com** está completamente caído. Todas las rutas públicas devuelven **HTTP 500 Internal Server Error** con cuerpo vacío. El servidor nginx/PHP responde (PHP/8.3.30) pero la aplicación PrestaShop lanza un error fatal sin generar contenido.

### Timeline
| Evento | Hora UTC |
|--------|----------|
| Última prueba exitosa (plan upgrade test7) | 15:19 UTC ✅ |
| **Outage detectado** | **16:54 UTC ❌** |
| Diferencia | ~1h 35min |

### HTTP Status por ruta (16:54 UTC)

| Ruta | Código | Body |
|------|--------|------|
| `https://new.zonacnc.com/` | 500 | vacío (0 bytes) |
| `https://new.zonacnc.com/es/` | 500 | vacío |
| `https://new.zonacnc.com/es/pricing` | 500 | vacío |
| `https://new.zonacnc.com/es/iniciar-sesion` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/pricing` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/checkout` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/subscription` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/billing` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/change` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/boostpacks` | 500 | vacío |
| `https://new.zonacnc.com/es/mi-cuenta` | 302 → login → 500 | vacío |
| `https://new.zonacnc.com/robots.txt` | **200** ✅ | estático nginx |
| `https://new.zonacnc.com/api` | **401** | PHP funcional (sin auth) |

### Server Headers (consistentes)
```
HTTP/2 500
server: nginx
content-type: text/html; charset=utf-8
content-length: 0
x-powered-by: PHP/8.3.30
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(self), microphone=(), camera=(), payment=(self)
strict-transport-security: max-age=31536000; includeSubDomains
```

### Diagnóstico
- **nginx** operativo (robots.txt 200)
- **PHP-FPM** activo (respuesta presente, sesión PrestaShop generada)
- **Aplicación PrestaShop crashea** antes de generar output (content-length: 0)
- **Patrón idéntico** al outage del 2026-05-02 (~14:38 UTC)
- Probable: **PHP fatal error** (uncaught exception, error sintáctico tras deploy, o módulo corrupto)

### Relación con outage anterior
| Outage | Fecha | Hora | Duración estimada |
|--------|-------|------|-------------------|
| #1 | 2026-05-02 | 14:38 UTC | ~varias horas (finalizó antes del 2026-05-03 10:34) |
| **#2 (actual)** | **2026-05-03** | **~16:54 UTC** | **Activa** |

El patrón de error (500 cuerpo vacío, PHP funcional, app crash) es **idéntico** en ambos outages.

### Impacto
- ❌ **Bloqueante total** — Ningún flujo de stripe-billing es testeable
- ❌ Usuarios reales afectados (página completamente caída)
- ❌ Sin acceso a login, registro, pricing, checkout, suscripciones
- 🔄 **Segundo outage en 48h** con el mismo patrón → indica problema recurrente

### Acciones recomendadas
1. **Urgente**: Revisar logs PHP-FPM (`/var/log/php8.3-fpm.log`)
2. **Urgente**: Revisar error log de PrestaShop
3. Verificar si hubo deploy entre 15:19–16:54 UTC
4. Si deploy reciente → rollback inmediato
5. Investigar causa raíz del patrón recurrente de outage (misma sintomatología que May 2)

---

## Labels
`qa-stripe-billing`, `site-outage`, `critical`, `http-500`, `regression`, `recurring`
