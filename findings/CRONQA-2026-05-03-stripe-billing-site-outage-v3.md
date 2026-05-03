# CRON QA: Stripe Billing — Site Outage HTTP 500, Day 3 (Tercer Outage)

**Date:** 2026-05-03 17:20 UTC  
**Focus:** stripe-billing  
**Site:** new.zonacnc.com  
**Tester:** CRON QA tester-stripe-billing  
**Duration:** 5 min (aborted — full site outage day 3)

---

## Test Scenario (Aborted)

**Intended test:** Log in with available QA email → test Stripe billing flow (subscription or boost pack purchase) → verify invoices + emails via IMAP.

## Result: ❌ BLOCKED — Full Site Outage HTTP 500 (Día 3 Continuación)

### Description

**new.zonacnc.com** permanece completamente caído. Todas las rutas de PrestaShop devuelven **HTTP 500 Internal Server Error** con cuerpo vacío. Este es el **tercer outage documentado** en 3 días, con el mismo patrón.

### Timeline

| Outage | Fecha | Detectado | Duración |
|--------|-------|-----------|----------|
| #1 | 2026-05-02 | ~14:38 UTC | Varias horas |
| #2 | 2026-05-03 | ~15:19 UTC → **16:54 UTC** (recaída) | Activo ~35 min al detectarse |
| **#3 (actual)** | **2026-05-03** | **16:54–17:20 UTC (continuación)** | **Activo ~26+ min** |

**Nota:** El reporte de las 10:34 UTC mostraba la web operativa (login 200 ✅). La caída ocurrió después de esa verificación. El outage de 16:54 UTC no se ha recuperado hasta el momento.

### HTTP Status por ruta (17:20 UTC)

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
| `https://new.zonacnc.com/es/module/zonacncplans/boostpacks` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/change` | 500 | vacío |
| `https://new.zonacnc.com/es/module/zonacncplans/addons` | 500 | vacío |
| `https://new.zonacnc.com/en/iniciar-sesion` | 500 | vacío |
| `https://new.zonacnc.com/es/contactenos` | 500 | vacío |
| `https://new.zonacnc.com/robots.txt` | **200** ✅ | estático nginx |
| `https://new.zonacnc.com/api` | **401** | PHP funcional (sin auth) |
| `https://new.zonacnc.com/upload` | **301** | nginx redirect |

### Server Headers (consistentes con outage #2)

```
HTTP/2 500
server: nginx
date: Sun, 03 May 2026 17:20:22 GMT
content-type: text/html; charset=utf-8
content-length: 0
x-powered-by: PHP/8.3.30
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(self), microphone=(), camera=(), payment=(self)
strict-transport-security: max-age=31536000; includeSubDomains
```

### Diagnóstico Recurrente

- **nginx** funcional (robots.txt 200, API 401, redirects funcionan)
- **PHP-FPM** activo (genera cookie de sesión PrestaShop + headers)
- **Aplicación PrestaShop crashea** antes de generar body (content-length: 0)
- **Patrón idéntico** a ambos outages anteriores → **bug recurrente no resuelto**
- Probable causa: PHP fatal error (excepción no capturada, módulo corrupto, o deploy con error)

### Pool QA Emails

| Rango | Estado |
|-------|--------|
| test7 | TAKEN (password reset needed) |
| test8 | TAKEN (Pro activa) |
| test9–test30 | TAKEN (pool exhausto desde 2026-05-02) |

**Stripe billing no puede probarse** hasta que la web esté operativa y haya al menos un email disponible.

### Impacto

- ❌ **Bloqueante total** — Stripe billing completamente intesteable
- ❌ Usuarios reales afectados (página caída)
- ❌ Tercer outage en 3 días con patrón idéntico
- 📉 **24h de cobertura QA interrumpida**

### Acciones Recomendadas

1. **Urgente**: Rollback del último deploy
2. **Urgente**: Revisar logs PHP-FPM
3. Investigar causa raíz del patrón recurrente
4. Implementar monitorización de uptime (healthcheck)
5. Una vez recuperado, refrescar pool de emails QA

---

## Labels

`qa-stripe-billing`, `site-outage`, `critical`, `http-500`, `regression`, `recurring`, `blocked-day3`
