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

## Stripe Billing — 2026-05-03 02:40 UTC (Blocked Day 3)

| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| ❌ BLOCKED | QA email pool test7-test30 fully exhausted + login 500 persists (Day 3) | [#26](https://github.com/rmiranda160/qa-tests/issues/26) | [#27](https://github.com/rmiranda160/qa-tests/pull/27) |

**Finding:** `findings/CRONQA-2026-05-03-stripe-billing-pool-exhausted-login-500.md`
**Comment:** Todos 24 emails del .env.qa.email confirmados como TAKEN. Login `/es/iniciar-sesion` sigue en 500.

## Stripe Billing — 2026-05-03 03:27 UTC (Blocked Day 4)

| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| ❌ BLOCKED | QA email pool test7-test30 exhausted + login 500 persists (Day 4) | [#28](https://github.com/rmiranda160/qa-tests/issues/28) | [#30](https://github.com/rmiranda160/qa-tests/pull/30) |

**Finding:** `findings/CRONQA-2026-05-03-stripe-billing-pool-exhausted-day-4.md`
**Comment:** Login sigue en 500 (Día 4). Pool test7-test30 completamente agotado. test7@zonacnc.com reconfirmado TAKEN.

## Known Issues (Stripe Checkout)
1. **Acordeón colapsado**: Card form en Stripe Checkout arranca en modo `--compact`, botón "Pay with card" invisible. Requiere JS click.
2. **page.fill() no funciona**: En campos de Stripe (cardNumber, cardExpiry, cardCvc) hay que usar `page.type()` con delay.
3. **Campos DOM directos**: Los campos de tarjeta son inputs HTML normales, no iframes de Stripe Elements.
4. **Contaminación de campos**: En formulario de dirección de facturación los valores se replican entre campos.
5. **Registro como vendedor requerido**: Antes de suscribir, el sistema fuerza registro de vendedor si no está completado.

## Stripe Billing — 2026-05-02 23:49 UTC (test33 — PASS)

| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| ✅ PASS | `CRONQA-2026-05-02-stripe-billing-starter-subscription-test33.md` | — | #16 |

**Login 500 persists**, bypassed via registration auto-login.

## Tested Emails
- test19@zonacnc.com — Enterprise
- test20@zonacnc.com — Business  
- test23@zonacnc.com — Pro
- test7-test22: ya registrados previamente
- test24@zonacnc.com — ❌ Confirmado "email ya en uso" (2026-05-02 23:01 UTC)
- **test7-test30: TODOS agotados** — Pool de QA emails completamente exhausto
- **test33@zonacnc.com — Starter ✅ PASS** (nuevo fuera del pool)

## Stripe Billing Updated — 2026-05-03 03:27 UTC (Day 4)
**State: ❌ BLOCKED** — Login 500 (Día 4), QA pool exhausted. PR #30 merged. Issue #28.

## Stripe Billing — 2026-05-03 04:22 UTC (Day 5 — BLOCKED)
| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| ❌ BLOCKED | `findings/CRONQA-2026-05-03-stripe-billing-pool-exhausted-day5.md` | #33 (comment) | [#34](https://github.com/rmiranda160/qa-tests/pull/34) |

**State:** Login 500 (Día 5), QA pool test7-test30 exhausted (Día 5). Sin cambios.
