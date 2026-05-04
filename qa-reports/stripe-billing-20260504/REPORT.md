# QA Report: Stripe Billing — Starter Plan Purchase
**Date:** 2026-05-04 22:40–22:50 UTC  
**Tester:** test7@zonacnc.com (Test Vendor Seven QA)  
**Environment:** new.zonacnc.com (TEST mode)  
**Plan:** Starter (€39.00/month)  
**Verdict:** ✅ PASS — 2 findings (1 minor)

---

## Scenario: Subscribe to Starter plan via Stripe Checkout

### Steps Executed

| Step | Action | Result |
|------|--------|--------|
| 1 | Navigate to `/es/pricing` | ✅ Plans displayed: Free, Starter €39, Pro €99, Business €199, Enterprise €299 |
| 2 | Login as test7@zonacnc.com | ✅ Logged in as "Test Vendor Seven QA" |
| 3 | Navigate to `/es/pagar-plan?plan=starter` | ✅ Checkout page shows plan details with "Proceder al pago" |
| 4 | Click "Proceder al pago" | ✅ Redirected to Stripe Checkout test mode |
| 5 | Verify Stripe Checkout page | ✅ Shows "Entorno de prueba de Veletacomercializaciones y Servicios SLU", Plan Starter, €30.07 due (€39.00 - €8.93 credit) |
| 6 | Fill card details (4242...4242, 12/34, 123) | ✅ Card fields accepted, "Pay and subscribe" enabled |
| 7 | Click "Pay and subscribe" | ✅ Payment processed |
| 8 | Verify success page | ✅ Redirected to `/es/module/zonacncplans/success`, shows "Suscripción activada" with success message |
| 9 | Verify subscription page | ✅ `/es/suscripcion` shows Starter Active, €39/mes, next charge 05/06/2026 |
| 10 | Verify email #1 (welcome/activation) | ✅ "¡Bienvenido a Starter! Tu suscripción está activa" received at 22:47 UTC |
| 11 | Verify email #2 (invoice) | ✅ "Factura pagada — Tu plan sigue activo" with invoice PDF link, received at 22:47 UTC |
| 12 | Verify invoice history | ✅ New invoice dated 05/05/2026 for 30.07 EUR shown as "Completado" |

### Email Template Review

#### Email 1: Subscription Activation
- **Subject:** ¡Bienvenido a Starter! Tu suscripción está activa
- **From:** ZonaCNC <no-reply@mg.zonacnc-sales.es>
- **Format:** multipart/alternative (plain text + HTML)
- **Content verified:**
  - Plan name: Starter ✅
  - Period: monthly ✅
  - Price: €39.00/month ✅
  - Included ads: 1 ✅
  - Next renewal: 05/06/2026 ✅
  - Management link: https://new.zonacnc.com/module/zonacncplans/subscription ✅
- **HTML template:** Dark header (#1a2332), white body, blue-gray accents, rounded corners, CTA button (red #c62828), responsive 600px width
- **Translations:** All Spanish text correct

#### Email 2: Invoice/Receipt
- **Subject:** Factura pagada — Tu plan sigue activo
- **From:** ZonaCNC <no-reply@mg.zonacnc-sales.es>
- **Format:** multipart/alternative (plain text + HTML)
- **Content verified:**
  - Amount: €30.07 (with credit applied from upgrade) ✅
  - Plan: Starter (monthly) ✅
  - Next charge: 05/06/2026 ✅
  - Invoice PDF link (Stripe) ✅
- **HTML template:** Same design system as welcome email
- **Translations:** All Spanish text correct

### Subscription Page Details
- Plan: Starter — Activa (green badge)
- Monthly price: 39 €/mes
- Active ads: 28/5 (over limit — warning shown)
- Payment method: No on-file method (Stripe-managed)
- History: 7 invoices, newest includes this purchase
- Add-ons: 2x extra ads active at €6.00/mes

---

## Findings

### Finding 1: Console Error on Subscription Page ⚠️ LOW
- **Severity:** Minor
- **Description:** Console error "Unexpected token '&'" observed on `/es/suscripcion`
- **Impact:** Low — page renders and functions correctly despite the error
- **Likely cause:** JavaScript parsing issue, possibly a mistranslated `&` entity or template variable

### Finding 2: Ad Limit Exceeded Warning ℹ️ INFO
- **Severity:** Informational
- **Description:** Account shows 28 active ads but Starter plan allows only 5. Warning message displayed correctly.
- **Impact:** Informational — warning correctly shown, upgrade link present

---

## Screenshots
1. `stripe-checkout-starter-plan.png` — Stripe Checkout page
2. `stripe-card-filled.png` — Card form filled with test card
3. `stripe-payment-success.png` — Success page after payment
4. `subscription-page.png` — Subscription management page

## Email Evidence
- Raw IMAP fetch from test7@zonacnc.com inbox (messages 29 and 31)
- Both emails received at 22:47:48 UTC (within 1 second of payment completion)

---

## Conclusion
The Stripe billing flow for the Starter plan works correctly end-to-end:
- Plan selection → Stripe redirect → Payment → Success → Email confirmation → Subscription management
- Both transactional emails are properly formatted with HTML templates and Spanish translations
- Invoice history is correctly updated
- One minor console error found (non-blocking)
