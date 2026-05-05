---
title: "[CRITICAL] new.zonacnc.com — HTTP 500 Site Outage (regresión #2, 3 May 2026)"
labels: ["critical", "bug", "site-outage", "http-500", "recurring"]
---

## Resumen
**new.zonacnc.com** completamente caído — HTTP 500 en todas las rutas. Segundo outage en 48h con patrón idéntico.

## Timeline
- Última prueba exitosa: 2026-05-03 15:19 UTC (plan upgrade test7@zonacnc.com)
- Outage detectado: 2026-05-03 16:54 UTC
- Diferencia: ~1h 35min

## Diagnóstico
- nginx operativo (robots.txt 200)
- PHP/8.3.30 activo (API 401)
- Aplicación PrestaShop crashea (content-length: 0, 500 vacío)
- Patrón idéntico al outage del 2026-05-02 14:38 UTC

## Referencias
- Finding: `findings/CRONQA-2026-05-03-stripe-billing-site-outage-v2.md`
- PR: [#67](https://github.com/rmiranda160/qa-tests/pull/67) (merged ✅)
- Issue: [#68](https://github.com/rmiranda160/qa-tests/issues/68)
