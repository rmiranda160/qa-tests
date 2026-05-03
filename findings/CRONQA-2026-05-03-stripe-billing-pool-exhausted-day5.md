# CRONQA Finding: Stripe Billing BLOCKED — Pool Exhausted Day 5 + Login 500 Persists

**Date:** 2026-05-03 04:22 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Duration:** ~5 min  
**Escenario:** 1/1 — ❌ BLOCKED (Day 5 consecutivo)

## Current State

| Chequeo | Resultado |
|---------|-----------|
| Home (`/`) | ✅ 200 OK |
| Registration (`/?controller=registration`) | ✅ Form loads correctly |
| Login (`/es/iniciar-sesion`) | ❌ **HTTP 500** (Día 5 consecutivo) |
| test7@zonacnc.com | ❌ "La dirección de correo electrónico ya está en uso" |

## Blockers

### 1. Login page HTTP 500 (Día 5)
- URL: `https://new.zonacnc.com/es/iniciar-sesion`
- Error: `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- Persistente desde al menos 2026-04-30
- Sin login no se puede autenticar cuentas existentes para probar Stripe Billing
- Sin login funcional, no hay bypass posible (incluso si hubiera emails disponibles)

### 2. QA email pool test7-test30 completamente exhausto (Día 5)
- `.env.qa.email` contiene 24 emails: test7–test30@zonacnc.com
- test7@zonacnc.com reconfirmado: **"La dirección de correo electrónico ya está en uso"**
- Todos los 24 emails confirmados como TAKEN en ejecuciones QA previas

## Impacto
Sin email disponible del pool y sin login funcional:
- ❌ Registrar nueva cuenta → No hay emails libres
- ❌ Iniciar sesión en cuentas existentes → Login 500
- ❌ Navegar a Pricing y seleccionar plan → Login requerido
- ❌ Probar flujo completo de Stripe Checkout → Bloqueado

## Días consecutivos bloqueado: 5

| Día | Fecha | Bloqueante |
|-----|-------|------------|
| 1 | 2026-04-30 | Login 500 detectado |
| 2 | 2026-05-01 | Login 500 + pool empezando a agotarse |
| 3 | 2026-05-02 | Login 500 + pool casi exhausto |
| 4 | 2026-05-03 02:40 UTC | Login 500 + pool completamente exhausto |
| 5 | 2026-05-03 04:22 UTC | Login 500 + pool exhausto (sin cambios) |

## Recomendación
1. **Refrescar pool QA**: Añadir nuevos emails test31+@zonacnc.com al `.env.qa.email`
2. **Reparar login**: Arreglar HTTP 500 en `/es/iniciar-sesion` (prioridad crítica, Día 5)
3. Alternativamente: considerar modo bypass que permita test con emails fuera del pool
