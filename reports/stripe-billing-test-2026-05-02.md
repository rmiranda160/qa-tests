# Stripe Billing QA Test Report — 2026-05-02

**Scope:** `new.zonacnc.com` only  
**Account:** test14@zonacnc.com (registered fresh due to broken login)  
**Plan tested:** Starter (39€/mo, monthly billing)  
**Payment method:** Stripe Checkout (test card 4242...)  
**Test card:** `4242 4242 4242 4242` | Exp: `12/28` | CVC: `123`  
**3DS auth:** Code `000000`

---

## Test Flow & Results

### 1. Registration (workaround)
- **Observation:** Login endpoint `/es/iniciar-sesion` and `/es/?controller=authentication` return HTTP 500.
- **Workaround:** Registered fresh account `test14@zonacnc.com` with password `ZonacncTest2026!` via `/es/?controller=authentication&create_account=1`.
- **Result:** ✅ Account created. Redirected to homepage as logged-in user.

### 2. Vendor Registration
- Navigating to `/module/zonacncplans/subscription` redirects to `/module/zonacncvendor/register`.
- **Result:** ✅ Vendor profile created. Redirected to dashboard with `?registered=1`.

### 3. Billing Address Setup
- Pricing page shows warning: "Completa tu dirección de facturación... Faltan: empresa"
- Filled company field (`QA Billing Corp`) and saved.
- **Result:** ✅ Address complete, warning disappeared.

### 4. Plan Selection → Stripe Checkout
- Selected Starter plan (39€/mo) from `/es/pricing`.
- Clicked "Contratar Starter" → `/module/zonacncplans/checkout?plan=starter`
- Clicked "Proceder al pago" → redirected to `checkout.stripe.com` (sandbox).
- **Result:** ✅ Stripe Checkout loaded correctly with plan details: "Subscribe to Plan Starter" at €39.00/month.

### 5. Card Payment
- Selected "Card" payment method.
- Filled card number `4242 4242 4242 4242`, expiry `12/28`, CVC `123`, name `QA Tester Stripe Billing`.
- Clicked "Pay and subscribe".
- **3D Secure challenge appeared:** "Enter the code: 000000".
- Entered `000000` and submitted.
- **Result:** ✅ Redirected to `/es/module/zonacncplans/success?session_id=cs_test_...`

### 6. Subscription Activation Verification
- Success page shows: **"Suscripción activada"** / **"¡Tu plan se ha activado correctamente!"**
- Navigated to subscription page (`/module/zonacncplans/subscription`):
  - **Plan:** Starter
  - **Status:** Activa (Active)
  - **Next billing:** 02/06/2026
  - **Price:** 39 €/mes
  - **Ads used:** 0 / 3
  - **Cancel button present:** "Cancelar al final del período"
  - **Add-ons available:** Anuncio extra at 12.00€/mo
- **Result:** ✅ Subscription fully active.

### 7. Billing History
- Navigated to `/module/zonacncplans/billing`
- Shows: **"Sin movimientos todavía"** — No invoices/payments listed.
- **Result:** ⚠️ Billing history empty (expected: invoice should appear after webhook sync; may need time or webhook is not processed in test mode).

---

## Summary

| Step | Status | Notes |
|------|--------|-------|
| 1. Registration | ✅ | Worked with fresh account. Login HTTP 500 bug. |
| 2. Vendor registration | ✅ | Automatic redirect. |
| 3. Billing address | ✅ | Company field required. |
| 4. Stripe Checkout redirect | ✅ | Correct plan loaded (Starter 39€). |
| 5. Card payment (4242...) | ✅ | 3DS challenge handled with code 000000. |
| 6. Subscription active | ✅ | Starter Activa, next billing 02/06/2026. |
| 7. Billing history | ⚠️ | Empty — invoice may appear after webhook. |

## BUGS found

### BUG-1: Login HTTP 500
- **URL:** `/es/iniciar-sesion` and `/es/?controller=authentication`
- **Issue:** Returns HTTP 500 on both GET and POST
- **Impact:** Existing users cannot log in. Blocks access to account, billing, and subscription management.
- **Workaround:** Register a fresh account (registration works).

### BUG-2 (Minor): Billing history not populated after successful Stripe payment
- **URL:** `/es/module/zonacncplans/billing`
- **Issue:** Shows "Sin movimientos todavía" even though Stripe successfully charged 39€ and subscription is active.
- **Likely cause:** Stripe webhook for `invoice.payment_succeeded` may not be processed or reachable from test environment (`new.zonacnc.com`). Could also be a timing issue.
- **Recommended:** Check Stripe webhook logs and verify the `zonacncplans` module correctly processes the webhook event.

---

## Files
- Report: `/home/node/.openclaw/workspace-tester/reports/stripe-billing-test-2026-05-02.md`
- Screenshot: `stripe-billing-subscription-active-2026-05-02.png`
