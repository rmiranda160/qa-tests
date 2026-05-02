# QA Report: Stripe Billing — Login System Failure (BLOCKER)
**Date:** 2026-05-02 22:16 UTC  
**Tester:** tester (MCP browser pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Duration:** ~15 min  
**Result:** ❌ BLOCKED — No se pudo completar el flujo de Stripe Billing

---

## Summary

No se pudo ejecutar el escenario de Stripe Billing debido a dos bloqueantes acumulados:

1. **Login page HTTP 500**: `/es/iniciar-sesion` (GET y POST) retorna **500 Internal Server Error** — impide acceder a cuentas existentes.
2. **Todos los emails test7-test30 están registrados** — No hay emails disponibles del `.env.qa.email` para crear una cuenta nueva.

---

## Bloqueante 1: Login Page HTTP 500

### Rutas verificadas (todas fallan con 500)

| Ruta | Método | Resultado |
|------|--------|-----------|
| `/es/iniciar-sesion` | GET | `ERR_HTTP_RESPONSE_CODE_FAILURE` (500) |
| `/es/iniciar-sesion` | POST (credenciales válidas test3) | 500 error |
| `/es/mi-cuenta` | GET | 500 error |
| `/es/?controller=my-account` | GET | 500 error |
| `/es/?controller=authentication` | GET | 500 error |
| `/es/module/zonacncvendor/register` | GET | 500 error |
| `/es/module/zonacncplans/checkout?plan=starter` | GET | 500 error |
| `/es/authentication` | GET | 404 (no es 500, pero igualmente no funcional) |

### Evidencia
- Todas las rutas de autenticación fallan con HTTP 500.
- La página de registro funcional (`/?controller=registration`) no tiene CSRF token — solo un campo hidden `submitCreate=1`.
- El error es server-side (500), no un problema de red ni de frontend.

---

## Bloqueante 2: Pool de Emails QA Agotado

Todos los emails del `.env.qa.email` (test7 - test30, 24 cuentas) han sido utilizados en ejecuciones QA previas:

| Rango | Estado | Último uso conocido |
|-------|--------|---------------------|
| test3 | Real/Enterprise | Cuenta activa (no disponible para QA billing flow) |
| test7–test18 | Ya registrados | Previo a 2026-05-02 |
| test19 | Usado (Enterprise) | report-stripe-billing-2026-05-02-1711 |
| test20 | Usado (Business) | report-stripe-billing-2026-05-02-1840 |
| test21–test22 | Ya registrados | Previo a 2026-05-02 |
| test23 | Usado (Pro) | report-stripe-billing-2026-05-02-2119 |
| test24–test26 | Ya registrados | Confirmado en esta sesión |
| test27 | Usado (Starter) | report-stripe-billing-2026-05-02-1350 |
| test28–test30 | Ya registrados | Confirmado en esta sesión |

**Intento de registro con test26, test28, test29** → Todos retornan "email ya está en uso".

---

## Severidad

**CRÍTICO** — El sistema de login caído (500) bloquea cualquier flujo de Stripe Billing:
- No se puede acceder a cuentas existentes para verificar suscripciones activas
- No se puede completar el registro → login post-registro (redirige a /iniciar-sesion que da 500)
- No se puede acceder al checkout de planes
- No se puede acceder al registro de vendedor (prerrequisito para Stripe Checkout)

---

## Recomendación

1. **Reparar urgencia**: Login page (`/es/iniciar-sesion`) retorna 500 — revisar logs del servidor PrestaShop.
2. **Reponer pool de QA**: Solicitar más emails test (test31+) o habilitar un mecanismo de limpieza/ciclo de cuentas QA entre runs.
3. **Una vez solucionado**: Ejecutar Stripe Billing flow completo (registro → dirección → vendor → checkout → Stripe → post-suscripción).

---

## Files Changed
- `report-stripe-billing-2026-05-02-2216.md` (this report)
