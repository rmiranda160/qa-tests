---
# CRONQA Finding: Stripe Billing BLOCKED — Pool Exhausted Day 6 + Login 500 + Checkout 500

**Date:** 2026-05-03 05:57 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Duration:** ~4 min  
**Escenario:** 1/1 — ❌ BLOCKED (Day 6 consecutivo)

## Current State

| Chequeo | Resultado |
|---------|-----------|
| Home (`/`) | ✅ 200 OK |
| Registration (`/?controller=registration`) | ✅ Form loads correctly |
| Pricing (`/es/pricing`) | ✅ Loads correctly |
| Boostpacks (`/es/module/zonacncplans/boostpacks`) | ✅ Loads correctly |
| Login (`/es/iniciar-sesion`) | ❌ **HTTP 500** (Día 6 consecutivo) |
| Checkout (`/es/module/zonacncplans/checkout?plan=starter`) | ❌ **HTTP 500** |
| Free plan registration (`/es/module/zonacncvendor/register`) | ❌ **HTTP 500** |
| test30@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |
| test29@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |
| test28@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |
| test27@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |
| test26@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |
| test25@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |

## Blockers

### 1. Login page HTTP 500 (Día 6)
- URL: `https://new.zonacnc.com/es/iniciar-sesion`
- Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- **Persistente desde al menos 2026-04-30 (6+ días)**

### 2. Checkout page HTTP 500 (NUEVO)
- URL: `https://new.zonacnc.com/es/module/zonacncplans/checkout?plan=starter`
- Error: `HTTP ERROR 500`
- También afecta a todos los planes: starter, pro, business, enterprise
- Sin login funcional no se puede acceder, pero incluso el redirect desde pricing falla

### 3. Free plan vendor registration HTTP 500 (NUEVO)
- URL: `https://new.zonacnc.com/es/module/zonacncvendor/register`
- Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE`

### 4. QA email pool test7-test30 completamente exhausto (Día 6)
- `.env.qa.email` contiene 24 emails: test7–test30@zonacnc.com
- Todos confirmados como **"La dirección de correo electrónico ya está en uso"**
- Sin emails libres, no se puede registrar nuevas cuentas

## Impacto
Sin email disponible del pool y sin login funcional:
- ❌ Registrar nueva cuenta → No hay emails libres
- ❌ Iniciar sesión en cuentas existentes → Login 500
- ❌ Navegar a Pricing y contratar plan → Checkout 500
- ❌ Registro free plan → vendor/register 500
- ❌ Probar flujo completo de Stripe Checkout → Bloqueado

## Días consecutivos bloqueado: 6

| Día | Fecha | Bloqueante |
|-----|-------|------------|
| 1 | 2026-04-30 | Login 500 detectado |
| 2 | 2026-05-01 | Login 500 + pool empezando a agotarse |
| 3 | 2026-05-02 | Login 500 + pool casi exhausto |
| 4 | 2026-05-03 02:40 UTC | Login 500 + pool completamente exhausto |
| 5 | 2026-05-03 04:22 UTC | Login 500 + pool exhausto (sin cambios) |
| 6 | 2026-05-03 05:57 UTC | Login 500 + pool exhausto + Checkout 500 + vendor/register 500 |

## Empeoramiento respecto al día anterior
- **Checkout HTTP 500** detectado (no se reportó antes)
- **vendor/register HTTP 500** detectado (no se reportó antes)
- El sitio parece tener problemas generalizados en los módulos de planes/vendedor, no solo login

## Recomendación
1. **Reparar login HTTP 500**: Prioridad crítica, Día 6 sin solución
2. **Reparar checkout HTTP 500**: Impide contratar planes aunque se logre login
3. **Reparar vendor/register HTTP 500**: Impide registro en plan Free
4. **Refrescar pool QA**: Añadir emails test31+@zonacnc.com
5. Considerar: si los módulos de planes (zonacncplans, zonacncvendor) están rotos, podría ser un problema de base de datos, config de módulos, o dependencia con Stripe
