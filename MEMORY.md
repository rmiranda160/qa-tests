# MEMORY — ZonaCNC QA Workspace

## Responsive Test — 2026-05-02

| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| ❌ FAIL | Login page HTTP 500, registration paths 404 | [#13](https://github.com/rmiranda160/qa-tests/issues/13) | [#12](https://github.com/rmiranda160/qa-tests/pull/12) |

**Email:** test21@zonacnc.com  
**Branch:** `fix/auth-login-500` → merged  
**Files:**
- `findings/CRONQA-RESPONSIVE-2026-05-02-auth-broken-test21.md`
- `issues/responsive-login-500-auth-broken-2026-05-02.md`
- `responsive-results/responsive-test-auth-broken-2026-05-02.md`

## Stripe Billing Test Coverage

| Plan | Precio | Gateway | Estado | Fecha | Email |
|------|--------|---------|--------|-------|-------|
| Starter | ? | Stripe | ✅ Reportado | ~2026-05-02 | ? |
| Business | 199€/mes | Stripe | ✅ PASS (report-stripe-billing-2026-05-02-1840.md) | 2026-05-02 | test20@zonacnc.com |
| Enterprise | 299€/mes | Stripe | ✅ PASS (report-stripe-billing-2026-05-02-1711.md) | 2026-05-02 | test19@zonacnc.com |
| **Pro** | **99€/mes** | **Stripe** | **✅ PASS (report-stripe-billing-2026-05-02-2119.md)** | **2026-05-02** | **test23@zonacnc.com** |

## Stripe Billing — 2026-05-02 23:01 UTC (Blocked)

| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| ❌ BLOCKED | Login 500 persists + QA email pool exhausted (test7–30) | [#13](https://github.com/rmiranda160/qa-tests/issues/13) | [#14](https://github.com/rmiranda160/qa-tests/pull/14) |

**Finding:** `findings/CRONQA-2026-05-02-stripe-billing-login-500-persists-test31.md`

## Known Issues (Stripe Checkout)
1. **Acordeón colapsado**: Card form en Stripe Checkout arranca en modo `--compact`, botón "Pay with card" invisible. Requiere JS click.
2. **page.fill() no funciona**: En campos de Stripe (cardNumber, cardExpiry, cardCvc) hay que usar `page.type()` con delay.
3. **Campos DOM directos**: Los campos de tarjeta son inputs HTML normales, no iframes de Stripe Elements.
4. **Contaminación de campos**: En formulario de dirección de facturación los valores se replican entre campos.
5. **Registro como vendedor requerido**: Antes de suscribir, el sistema fuerza registro de vendedor si no está completado.

## Tested Emails
- test19@zonacnc.com — Enterprise
- test20@zonacnc.com — Business  
- test23@zonacnc.com — Pro
- test7-test22: ya registrados previamente
- test24@zonacnc.com — ❌ Confirmado "email ya en uso" (2026-05-02 23:01 UTC)
- **test7-test30: TODOS agotados** — Pool de QA emails completamente exhausto
