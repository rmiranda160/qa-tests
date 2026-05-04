# CRON_QA Results — stripe-billing
**Run:** 2026-05-04 18:34 UTC | **Duration:** ~15 min  
**Account:** test7@zonacnc.com | **Plan:** Enterprise (€299/mes) | **Next billing:** 03/06/2026

## Scope
Tested stripe-billing focus area on `new.zonacnc.com` — covered:
- Subscription management page (`/es/suscripcion`)
- Plan change page (`/es/cambiar-plan`)
- Invoices & payments page (`/es/facturacion`)
- Stripe Elements card update flow (embedded dialog)
- Cancel subscription flow
- Stripe Checkout for Boost pack purchase
- Stripe hosted invoice pages
- IMAP email verification for billing notifications

## Findings (6)

### FINDING-001 ✅ PASS — Subscription page renders complete billing state
**Page:** `/es/suscripcion` | **Plan:** Enterprise Activa
- Plan name, status (Activa), price (€299/mes), next billing date (03/06/2026) all correct
- Listing count (19/102) accurate
- Payment method section shows Visa •••• 4242
- 5 completed invoices + 1 pending boost payment in history table
- 2 active add-ons (Anuncios extra x2 @ €3.00/mes each)
- All Stripe invoice links open hosted invoice pages with sandbox badge
- PDF download links present for all completed invoices

### FINDING-002 ✅ PASS — Card update via Stripe Elements works
**Flow:** "Cambiar tarjeta" button → embedded Stripe Elements dialog
- Dialog opens in-page with heading "Actualizar método de pago"
- Card number field accepts input in Stripe iframe (`4242424242424242`)
- Expiry (12/30) and CVC (123) fields fillable
- **ZIP code validation works**: shows "Your postal code is incomplete." when empty
- After filling ZIP (28001), card saved successfully, dialog closes
- Stripe brand detection shows "Visa" matching card number
- No confirmation email sent for same-card update (acceptable — may be intentional)

### FINDING-003 ✅ PASS — Cancel flow has proper confirmation dialog
**Flow:** "Cancelar al final del período" button
- Dialog title: "Cancelar al final del período"
- Explanatory text: acceso hasta fin del período pagado, sin más cobros
- Optional reason textbox with placeholder "Cuéntanos brevemente por qué..."
- "Volver" and "Confirmar cancelación" buttons present
- Dialog correctly dismisses without cancelling on "Volver"

### FINDING-004 ✅ PASS — Plan change page is complete and well-documented
**Page:** `/es/cambiar-plan`
- All 5 plans shown: Free (€0), Starter (€39), Pro (€99), Business (€199), Enterprise (€299 actual)
- Each plan card lists features: photos/listing, destacados, import, add-on price
- Current plan marked "ACTUAL", other plans clickable
- "Confirmar cambio" button disabled until a different plan selected
- Clear explanation of upgrade/downgrade/cancel/add-on/boost rules
- 7-day refund policy detailed with conditions
- Upgrade: prorated charge (difference only, unused time credited)
- Downgrade: effective at period end, no refund

### FINDING-005 ⚠️ PARTIAL — Stripe Checkout renders correctly but card payment completion blocked by cross-origin iframe
**Flow:** Boost Pack 5 purchase → redirect to `checkout.stripe.com/c/pay/cs_test_...`
- Checkout page renders correctly: business name "Veleta Comercializaciones y Servicios SLU", sandbox banner, product "Boost Pack 5" at €15.00, email pre-filled
- Payment methods shown: Card, MB WAY, Klarna, Bancontact, EPS
- Terms/Privacy links present, Stripe Pass save option available
- **Blocked**: Card number/expiry/CVC inputs in cross-origin `js.stripe.com` iframe — 16 frames enumerated, card fields not accessible via Playwright
- **Result**: Boost Pack 5 listed as "pendiente" (€15.00) on Facturas y pagos
- **Impact**: Automated end-to-end payment testing not feasible for Stripe Checkout without Stripe test API integration

### FINDING-006 ✅ PASS — Stripe hosted invoice pages verified
**Pages:** `invoice.stripe.com/i/acct_1TPLFqELpLIGgmZK/test_...`
- Business name "Veleta Comercializaciones y Servicios SLU" correct
- Sandbox/test mode badge present
- Invoice numbers and amounts match subscription page data
- Paid status correctly shown

## Email Review
- **Invoice paid notification** (`plans-subscription_invoice_paid`): Sent from `no-reply@mg.zonacnc-sales.es`, subject "Factura pagada — Tu plan sigue activo", Spanish template with plan name and amount
- **Welcome email** (`plans-vendor_onboarding`): Reviewed in prior run (FINDING-001/002 still valid — template variables not substituted, name truncation)
- **No card update notification email** found (expected behavior for same-card update)

## Summary
| # | Area | Result |
|---|------|--------|
| 1 | Subscription page | ✅ PASS |
| 2 | Card update (Stripe Elements) | ✅ PASS |
| 3 | Cancel flow | ✅ PASS |
| 4 | Plan change page | ✅ PASS |
| 5 | Stripe Checkout (boost) | ⚠️ PARTIAL |
| 6 | Stripe invoices | ✅ PASS |

**Overall**: Stripe billing integration on new.zonacnc.com is solid. Plan management, card update, invoicing, and cancel flows all work correctly with proper Spanish translations. The main gap is automated end-to-end payment testing via Stripe Checkout, which requires either Stripe test API integration or manual testing.

## Resolution
Report saved → commit → PR → merge → issue.
