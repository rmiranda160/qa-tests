# CRON QA Finding · Stripe Billing · Phantom 19 EUR Failed Invoices

> **Date:** 2026-05-01 23:15 UTC
> **Focus:** stripe-billing
> **Scenario:** Verificación de página de Suscripción y Facturación para vendor con Stripe real
> **Vendor:** test3@zonacnc.com (Enterprise, sub_1TRnTEELpLIGgmZKholeYCFn)
> **Priority:** 🔴 CRITICAL

---

## Scenario Executed

Manual MCP browser test:
1. Login as test3@zonacnc.com
2. Navigate to `/module/zonacncplans/subscription`
3. Inspect plan info, payment method, invoice history, add-ons
4. Navigate to `/module/zonacncplans/billing`
5. Validate full invoice table

---

## Result: 🔴 FAIL — Critical Billing Bug Found

### The Bug: Massive Duplicate Phantom Invoices

The billing page shows **180+ invoice rows**, the vast majority being **duplicate 19.00 EUR "Fallido" (Failed) invoices**, with the first occurrence dating back to 29/04/2026.

#### Evidence from Billing Page

The sidebar badge shows **"Facturas y pagos 181"** — 181 invoices for a 6-day-old subscription.

**Breakdown of invoices by status and amount:**
- **19.00 EUR — Fallido (Failed):** ~120+ duplicate entries (DATES: 29/04 through 02/05)
- **299.00 EUR — Completado:** Legitimate Enterprise monthly charges
- **199.00 EUR — Completado:** Mix of legitimate and potentially phantom
- **99.00 EUR — Completado:** Likely proration/addon charges
- **39.00 EUR — Completado:** Likely proration
- **0.00-2.89 EUR — Completado:** Add-on proration (correct)

#### Pattern Analysis

| Date | Failed 19€ Count | Failed Pattern |
|------|-----------------|----------------|
| 02/05/2026 | 2 | Pago fallido |
| 01/05/2026 | 12+ | Pago fallido |
| 30/04/2026 | 10+ | Mixed: some completed 19€, some failed 19€ |
| 29/04/2026 | 18 | All failed 19€ |

The **19.00 EUR amount does not correspond to any known plan price**:
- Enterprise: 299€/month
- Pro: 99€/month
- Business: 199€/month
- Starter: 39€/month
- Free: 0€/month
- Add-ons: 3€/qty/mes

### What Works Correctly ✅

| Feature | Status |
|---------|--------|
| Plan info card (Enterprise, Active) | ✅ Correct |
| Next billing date (30/05/2026) | ✅ Correct |
| Price display (299€/mes) | ✅ Correct |
| Active ads count (4/100) | ✅ Correct |
| Payment method (Visa *4242) | ✅ Visible |
| "Cambiar de plan" button | ✅ Functional, links to /change |
| "Cambiar tarjeta" button | ✅ Present, opens modal |
| "Cancelar al final del período" button | ✅ Present, opens confirmation modal |
| Invoice PDF download links | ✅ Present for all rows |
| Legitimate subscription invoices (299€) | ✅ Completado |
| Add-on proration invoices | ✅ Completado with correct descriptions |
| Add-ons table (all canceled) | ✅ Correct display |
| "Añadir add-on" form | ✅ Present |
| Breadcrumb navigation | ✅ Correct |

### Regla Miranda — Button/Action Verification ✅

All buttons/actions on the subscription page are functional:
1. ✅ "Volver a su cuenta" — links to /mi-cuenta
2. ✅ "Cambiar de plan" — links to /module/zonacncplans/change
3. ✅ "Cambiar tarjeta" — opens modal with Stripe card form ("Guardar tarjeta")
4. ✅ "Cancelar al final del período" — opens confirmation modal ("Confirmar cancelación")
5. ✅ "Añadir" (add-on) — present in add-on section
6. ✅ PDF download buttons — present for all invoices
7. ✅ "Ver factura" links — present for proration invoices

---

## Root Cause Hypothesis

The **19.00 EUR** amount is likely a **proration calculation artifact** — possibly:
- An add-on cancellation creating a recurring dunning webhook event that keeps generating failed invoices
- A Stripe webhook `invoice.payment_failed` being processed multiple times (idempotency bug)
- A cron job or webhook handler creating duplicate invoice records in the local DB

Given the earlier findings today about:
- "stripe-billing-proration-invoices-real-main-charge-mock" (15:22)
- "stripe-billing-subscription-172-vs-bd-30-phantom-records" (17:55)

This appears to be an **escalation of the phantom records issue** — the system is now generating ~20-30 phantom invoices per day.

## Impact

- **Vendor confusion:** A vendor seeing 100+ failed payments would lose trust
- **PDF generation spam:** Each phantom invoice generates a PDF
- **DB bloat:** 180+ phantom records in a few days
- **Payment confusion:** System may attempt dunning on phantom failed invoices
- **Sidebar badge inflation:** "181" makes the UI look broken

## Steps to Reproduce

1. Login as test3@zonacnc.com with `ZonacncTest2026!`
2. Navigate to `https://new.zonacnc.com/es/module/zonacncplans/subscription`
3. Scroll to "Historial de facturas" table
4. Observe multiple 19.00 EUR "Fallido" entries
5. Navigate to `https://new.zonacnc.com/es/module/zonacncplans/billing`
6. Observe 180+ invoice rows, mostly 19.00 EUR failed

## Evidence Artifacts

- Screenshot: Full page subscription screenshot captured via MCP browser
- Screenshot: Full page billing page screenshot captured via MCP browser
- Diagnostic API confirms: test3 has active Enterprise sub (sub_1TRnTEELpLIGgmZKholeYCFn)
- Diagnostic API confirms: 2 subscriptions (1 active, 1 canceled), 4 canceled add-ons

## Related Findings (Today)

- `stripe-billing-subscription-172-vs-bd-30-phantom-records` (17:55) — similar phantom records issue but different scope
- `stripe-billing-proration-invoices-real-main-charge-mock` (15:22)
