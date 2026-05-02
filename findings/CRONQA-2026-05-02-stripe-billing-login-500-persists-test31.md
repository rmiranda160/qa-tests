# CRON QA Finding: Stripe Billing — Login 500 Persists + QA Email Pool Exhausted
**Date:** 2026-05-02 23:01 UTC  
**Run:** CRON_QA stripe-billing  
**Tester:** tester (MCP pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Alcance:** Solo new.zonacnc.com  

## Result: ❌ BLOCKED — Cannot execute Stripe Billing flow

---

## Bloqueante 1: Login Page HTTP 500 (PERSISTE)

La página de login `/es/iniciar-sesion` continúa retornando **HTTP 500 Internal Server Error**, mismo estado reportado a las 22:16 UTC.

### Rutas verificadas

| Ruta | Método | Código | Estado |
|------|--------|--------|--------|
| `/es/iniciar-sesion` | GET | 500 | ❌ Fallo |
| `/es/module/zonacncplans/checkout?plan=pro` | GET | 500 | ❌ Fallo |
| `/es/module/zonacncvendor/register` | GET | 500 | ❌ Fallo |
| `/es/mi-cuenta` | GET | 500 | ❌ Fallo |
| `/?controller=registration` | GET | 200 | ✅ Carga (formulario) |
| `/es/pricing` | GET | 200 | ✅ Carga |
| `/` | GET | 200 | ✅ Carga |

### Observaciones
- El formulario de registro (`/?controller=registration`) carga correctamente y permite el envío.
- Sin embargo, el post-registro redirige a `/iniciar-sesion` (500), bloqueando la autenticación posterior.
- El checkout de planes, registro de vendedor y todas las rutas protegidas fallan con 500.
- El error es server-side (500), no un problema de frontend.

---

## Bloqueante 2: Pool de Emails QA Agotado (test7-test30)

Todos los emails del rango `.env.qa.email` (test7@zonacnc.com → test30@zonacnc.com) están registrados. Confirmación directa en esta sesión:

| Email | Estado | Verificado |
|-------|--------|------------|
| test24@zonacnc.com | ❌ "email ya está en uso" | ✅ Verificado en esta sesión |

**Pool completo agotado: 24 cuentas** — No existen emails disponibles del rango `.env.qa.email` para registrar una nueva cuenta.

---

## Severidad

🔴 **CRÍTICO** — El sistema de autenticación caído (500) bloquea completamente el flujo de Stripe Billing:
1. No se puede iniciar sesión con cuentas existentes
2. No se puede completar registro → login post-registro (redirige a login 500)
3. No se puede acceder al checkout de planes (500)
4. Pool de QA emails agotado sin posibilidad de registros nuevos

---

## Referencias
- **Issue existente:** [#13](https://github.com/rmiranda160/qa-tests/issues/13) — Login/Auth Pages HTTP 500
- **PR existente:** `pr/stripe-billing-login-500-20260502` — Blocker documentado
- **Reports previos:**
  - `report-stripe-billing-2026-05-02-2216.md` — 22:16 UTC (mismo bloqueante)
  - `report-stripe-billing-2026-05-02-2119.md` — Pro plan flow (antes de la caída)
- **MEMORY.md** — Stripe Billing section actualizada

---

## Recomendación

1. Reparar `/es/iniciar-sesion` (HTTP 500) — revisar logs del servidor PrestaShop
2. Reponer pool de emails QA: test31+ o mecanismo de limpieza/ciclo de cuentas
3. Una vez solucionado: ejecutar Stripe Billing flow completo (registro → vendor → checkout → Stripe → post-suscripción)
