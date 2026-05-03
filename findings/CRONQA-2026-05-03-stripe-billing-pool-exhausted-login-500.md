# CRON QA: Stripe Billing — QA Email Pool Exhausted + Login 500 (Day 3)

**Date:** 2026-05-03 02:40 UTC  
**Focus Area:** stripe-billing  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Duration:** ~5 min  
**Escenario:** 1/1  
**Result:** ❌ BLOCKED — No hay emails disponibles del pool QA para registro

---

## Objective

Ejecutar el flujo completo de Stripe Billing (registro → dirección → vendor → checkout → Stripe → post-suscripción) usando un email exacto del `.env.qa.email` (test7–test30@zonacnc.com) para verificar el buzón IMAP post-registro.

## Verifications

| Ruta | Estado |
|------|--------|
| Homepage (`/`) | ✅ 200 OK |
| Pricing (`/es/pricing`) | ✅ 200 OK |
| Registration form (`/?controller=registration`) | ✅ 200 OK — formulario carga correctamente |
| Login (`/es/iniciar-sesion`) | ❌ HTTP 500 (ERR_HTTP_RESPONSE_CODE_FAILURE) |
| QA email pool (test7–test30) | ❌ 24/24 emails **ya registrados** |

## QA Email Pool Status

Todos los 24 emails del `.env.qa.email` han sido verificados uno por uno:

| Email | Estado | Último uso |
|-------|--------|------------|
| test7@zonacnc.com | ❌ TAKEN | Starter flow (2026-05-02) |
| test8@zonacnc.com | ❌ TAKEN | Free-to-Pro flow (2026-05-02) |
| test9@zonacnc.com | ❌ TAKEN | Previo |
| test10@zonacnc.com | ❌ TAKEN | Previo |
| test11@zonacnc.com | ❌ TAKEN | Confirmado esta sesión |
| test12@zonacnc.com | ❌ TAKEN | Starter subscription (2026-05-02) |
| test13@zonacnc.com | ❌ TAKEN | Confirmado esta sesión |
| test14@zonacnc.com | ❌ TAKEN | Confirmado esta sesión |
| test15@zonacnc.com | ❌ TAKEN | Confirmado esta sesión |
| test16@zonacnc.com | ❌ TAKEN | Confirmado esta sesión |
| test17@zonacnc.com | ❌ TAKEN | Previo |
| test18@zonacnc.com | ❌ TAKEN | Previo |
| test19@zonacnc.com | ❌ TAKEN | Enterprise (2026-05-02) |
| test20@zonacnc.com | ❌ TAKEN | Business (2026-05-02) |
| test21@zonacnc.com | ❌ TAKEN | Responsive test (2026-05-02) |
| test22@zonacnc.com | ❌ TAKEN | Previo |
| test23@zonacnc.com | ❌ TAKEN | Pro plan (2026-05-02) |
| test24@zonacnc.com | ❌ TAKEN | Confirmado (2026-05-02) |
| test25@zonacnc.com | ❌ TAKEN | Previo |
| test26@zonacnc.com | ❌ TAKEN | Previo |
| test27@zonacnc.com | ❌ TAKEN | Starter (2026-05-02) |
| test28@zonacnc.com | ❌ TAKEN | Site outage test (2026-05-02) |
| test29@zonacnc.com | ❌ TAKEN | Starter (2026-05-02) |
| test30@zonacnc.com | ❌ TAKEN | Confirmado esta sesión |

## Bloqueantes

### B1: QA Email Pool Completamente Exhausto
- **Severidad:** High
- Los 24 emails del `.env.qa.email` (test7–test30) ya están registrados.
- No es posible registrar un nuevo usuario con ninguno de ellos.
- Sin registro, no se puede ejecutar el flujo de Stripe Billing con verificación IMAP.
- **Recomendación:** 
  - Opción A: Solicitar nuevo rango de emails QA (test31+ o nuevo dominio).
  - Opción B: Implementar limpieza automática de cuentas de prueba post-ejecución.
  - Opción C: Usar emails temporales fuera del pool (test31+@zonacnc.com) como workaround, pero perderían verificación IMAP.

### B2: Login Page HTTP 500 Persiste (Día 3)
- **Severidad:** Critical
- `/es/iniciar-sesion` sigue retornando 500.
- No se puede acceder a cuentas existentes ni verificar sesiones.
- **Issue relacionado:** [#26](https://github.com/rmiranda160/qa-tests/issues/26)

## Workaround (usado en ejecuciones previas)
- Registro con emails fuera del pool (test31+@zonacnc.com, test35@zonacnc.com).
- El auto-login post-registro bypassea la página de login 500.
- Stripe Checkout funciona correctamente (verificado último con test35@zonacnc.com para plan Pro).

## Conclusión

❌ **BLOCKED** — No se puede ejecutar el escenario de Stripe Billing con un email del `.env.qa.email` porque los 24 emails están registrados. La página de login además sigue caída (500). Para ejecutar el test con email del pool, se necesita:
1. Refrescar el pool de emails QA (nuevas cuentas)
2. Reparar el login 500
