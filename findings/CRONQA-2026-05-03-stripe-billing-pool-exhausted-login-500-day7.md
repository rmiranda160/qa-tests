---
# CRONQA Finding: Stripe Billing BLOCKED — Pool Exhausted Day 7 + Login 500 + Checkout 500

**Date:** 2026-05-03 07:26 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Duration:** ~4 min  
**Escenario:** 1/1 — ❌ BLOCKED (Day 7 consecutivo)

## Current State

| Chequeo | Resultado |
|---------|-----------|
| Home (`/`) | ✅ 200 OK |
| Registration (`/?controller=registration`) | ✅ Form loads, validation works |
| Pricing (`/es/pricing`) | ✅ 200 OK (carga correctamente) |
| Login (`/es/iniciar-sesion`) | ❌ **HTTP 500** (Día 7 consecutivo) |
| Checkout (`/es/module/zonacncplans/checkout?plan=starter`) | ❌ **HTTP 500** |
| test7@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |

## Blockers (Persisten desde Day 6)

### 1. Login page HTTP 500 (Día 7)
- URL: `https://new.zonacnc.com/es/iniciar-sesion`
- Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- **Persistente desde al menos 2026-04-30 (7+ días)**

### 2. Checkout HTTP 500
- URL: `https://new.zonacnc.com/es/module/zonacncplans/checkout?plan=starter`
- Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- Persiste, bloquea el flujo principal de Stripe Billing

### 3. QA email pool test7-test30 completamente exhausto (Día 7)
- `.env.qa.email` contiene 24 emails: test7–test30@zonacnc.com
- test7@zonacnc.com reconfirmado: **"La dirección de correo electrónico ya está en uso"**
- Sin emails libres del pool para registrar nuevas cuentas

## Notas
- `/es/pricing` ha mejorado: ahora carga (antes daba ERR_ABORTED en la verificación de 06:38 UTC)
- No hay forma de probar Stripe Billing sin login funcional o emails disponibles

## Días consecutivos bloqueado: 7

| Día | Fecha | Estado |
|-----|-------|--------|
| 1 | 2026-04-30 | Login 500 detectado |
| 2 | 2026-05-01 | Login 500 + pool empezando a agotarse |
| 3 | 2026-05-02 | Login 500 + pool casi exhausto |
| 4 | 2026-05-03 02:40 UTC | Login 500 + pool completamente exhausto |
| 5 | 2026-05-03 04:22 UTC | Login 500 + pool exhausto |
| 6 | 2026-05-03 05:57 UTC | Login 500 + pool exhausto + Checkout 500 |
| 6 (2da) | 2026-05-03 06:38 UTC | Login 500 + pool exhausto + /es/pricing ERR_ABORTED |
| 7 | 2026-05-03 07:26 UTC | Login 500 + pool exhausto + Checkout 500 (pricing recovered) |

## Recomendación
1. Reparar login HTTP 500 (Prioridad #1 — Día 7 sin resolver)
2. Reparar checkout HTTP 500 (Prioridad #2)
3. Refrescar pool QA con emails test31+@zonacnc.com (Prioridad #3)
