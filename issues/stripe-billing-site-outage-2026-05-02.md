---
title: "[CRITICAL] new.zonacnc.com — HTTP 500 Site Outage (toda la página caída)"
labels: ["critical", "stripe-billing", "site-outage", "http-500"]
---

## Resumen
**new.zonacnc.com** está completamente caído — **HTTP 500 Internal Server Error** en todas las rutas públicas. El servidor PHP/nginx responde pero la aplicación PrestaShop lanza un error fatal sin generar contenido. El sitio fue detectado caído a las **14:38 UTC** del 2 de mayo de 2026. La última prueba exitosa fue a las **13:50 UTC** (~48 min antes).

## HTTP Status por ruta

| Ruta | Código |
|------|--------|
| `/` | 301 → `/es/` |
| `/es/` | 500 (cuerpo vacío) |
| `/es/pricing` | 500 (cuerpo vacío) |
| `/es/iniciar-sesion` | 500 (cuerpo vacío) |
| `/es/module/zonacncplans/pricing` | 500 (cuerpo vacío) |
| `/en/pricing` | 500 (cuerpo vacío) |
| `/en/login` | 500 (cuerpo vacío) |
| `/api` | 401 (server responde, PHP activo) |

## Headers HTTP (consistentes)
```
HTTP/2 500
server: nginx
date: Sat, 02 May 2026 14:39:xx GMT
x-powered-by: PHP/8.3.30
content-length: 0
cache-control: no-store, no-cache, must-revalidate
pragma: no-cache
```

## Diagnóstico
- **PHP/nginx están activos** (respuesta HTTP presente, sesión PrestaShop generada)
- **Aplicación PrestaShop crashea** antes de generar output (content-length: 0)
- Posible **uncaught PHP exception**, **syntax error tras deploy**, o **clase/módulo faltante**
- API en `/api` responde 401 (funciona pero requiere auth)

## Posibles causas
1. Deploy reciente entre 13:50–14:38 UTC con error
2. Error en algún módulo (posiblemente zonacncplans o zonacnclisting)
3. Problema de base de datos (timeout, tabla corrupta)
4. Configuración de caché corrupta

## Impacto
- ❌ **Bloqueante**: Stripe billing flow imposible de testear
- ❌ **Toda la funcionalidad del site**: sin registro, login, pricing, checkout
- ❌ Usuarios reales afectados (no solo QA)

## Acciones recomendadas
1. Revisar logs de PHP-FPM: `journalctl -u php8.3-fpm` o `/var/log/php8.3-fpm.log`
2. Revisar error log de PrestaShop: `var/logs/` o `app/logs/`
3. Si hubo deploy reciente, hacer **rollback inmediato**
4. Verificar que los módulos críticos (zonacncplans, zonacnclisting) no tengan errores sintácticos

## Entorno
- **URL:** https://new.zonacnc.com
- **Server:** nginx + PHP/8.3.30 (PrestaShop)
- **Hosting:** PleskLin (por header x-powered-by)
- **Detectado por:** CRON QA tester-stripe-billing (2026-05-02 14:38 UTC)
