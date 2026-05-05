---
# CRONQA Finding: Stripe Billing BLOCKED — Pool Exhausted Day 6 + Login 500 + /es/pricing ERR_ABORTED

**Date:** 2026-05-03 06:38 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Duration:** ~3 min  
**Escenario:** 1/1 — ❌ BLOCKED (Day 6 consecutivo, 2da verificación del día)

## Current State

| Chequeo | Resultado |
|---------|-----------|
| Home (`/`) | ✅ 200 OK |
| Registration (`/?controller=registration`) | ✅ Form loads correctly, validation works |
| Login (`/es/iniciar-sesion`) | ❌ **HTTP 500** (Día 6+ consecutivo) |
| Pricing (`/module/zonacncplans/pricing`) | ✅ Loads correctly (sin /es/ prefix) |
| Pricing (`/es/pricing`) | ❌ **ERR_ABORTED** (nuevo — la ruta con /es/ falla) |
| Boostpacks (`/es/module/zonacncplans/boostpacks`) | ✅ Loads correctly |
| Checkout (`/es/module/zonacncplans/checkout?plan=starter`) | ❌ **HTTP 500** |
| vendor/register (`/es/module/zonacncvendor/register`) | ❌ **HTTP 500** |
| test7@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |

## Blockers (Sin cambios respecto a 05:57 UTC)

### 1. Login page HTTP 500 (Día 6+)
- URL: `https://new.zonacnc.com/es/iniciar-sesion`
- Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- **Persistente desde al menos 2026-04-30 (6+ días)**

### 2. /es/pricing ERR_ABORTED (Nuevo detalle)
- URL: `https://new.zonacnc.com/es/pricing`
- Error: `net::ERR_ABORTED`
- La ruta sin prefijo de idioma funciona: `/module/zonacncplans/pricing` → ✅ 200 OK
- Sugiere problema en la lógica de enrutamiento con prefijo de idioma para este módulo

### 3. Checkout HTTP 500
- Todas las URLs de checkout fallan: `/es/module/zonacncplans/checkout?plan=*`
- Sin login funcional no se puede acceder, pero el redirect desde pricing falla igualmente

### 4. QA email pool test7-test30 completamente exhausto
- test7@zonacnc.com reconfirmado: **"La dirección de correo electrónico ya está en uso"**
- Sin emails libres del pool `.env.qa.email`
- No se puede registrar nuevas cuentas

## Días consecutivos bloqueado: 6

| Día | Fecha | Estado |
|-----|-------|--------|
| 1 | 2026-04-30 | Login 500 detectado |
| 2 | 2026-05-01 | Login 500 + pool empezando a agotarse |
| 3 | 2026-05-02 | Login 500 + pool casi exhausto |
| 4 | 2026-05-03 02:40 UTC | Login 500 + pool completamente exhausto |
| 5 | 2026-05-03 04:22 UTC | Login 500 + pool exhausto (sin cambios) |
| 6 | 2026-05-03 05:57 UTC | Login 500 + pool exhausto + Checkout 500 + vendor/register 500 |
| 6 (2da) | 2026-05-03 06:38 UTC | Login 500 + pool exhausto + /es/pricing ERR_ABORTED (sin cambios) |

## Conclusión

❌ **BLOCKED Day 6** — Sin mejoría vs verificación anterior (05:57 UTC). Stripe Billing no puede ejecutarse hasta que se reparen los errores HTTP 500 y se refresque el pool de emails QA.
