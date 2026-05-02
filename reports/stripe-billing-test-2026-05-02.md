# Stripe Billing E2E Test Report · 2026-05-02

> **Date:** 2026-05-02 15:14-15:24 UTC
> **Focus:** stripe-billing
> **Scenario:** 1 — Register, vendor onboard, subscribe, verify invoices
> **Email:** test7-test30@zonacnc.com
> **Environment:** new.zonacnc.com (MODO TEST)

---

## Results Summary

| Step | Status | Details |
|------|--------|---------|
| Registration | ✅ PASS | test7-test30@zonacnc.com registered successfully |
| Address Creation | ✅ PASS | Address saved after fixing NIF and phone validation |
| Vendor Registration | ✅ PASS | Registered as vendor "QA Cron Corp" |
| Stripe Checkout (Starter) | ✅ PASS | 39€/month, card 4242..., subscription active |
| Phantom Invoices (new account) | ✅ PASS | Billing page shows "Sin movimientos todavía" — clean |
| Phantom Invoices (test3 confirm) | ❌ BLOCKED | Login page HTTP 500 — cannot access test3 account |
| Login Page Health | 🔴 BUG | `/es/iniciar-sesion` returns HTTP 500 error |

---

## Detailed Test Log

### 1. Registration (test7-test30@zonacnc.com)
- **URL:** `/es/?controller=registration`
- **Used email:** `test7-test30@zonacnc.com` (the literal value from `.env.qa.email`)
- **Password:** `ZonacncTest2026!`
- **Name:** QA Cron Billing Test
- **Company:** QA Cron Corp
- **Result:** Redirected to homepage after successful registration ✅

### 2. Address Creation
- **URL:** `/es/direccion?id_address=0`
- **Initial attempt failed** — form kept reloading with errors
- **Required fields found:** Phone format invalid, NIF field had validation error
- **Fix:** Set phone to `612345678`, NIF to `12345678Z`, IVA to `ES12345678Z`
- **Result:** Address saved, redirected to `/es/direcciones` ✅

### 3. Vendor Registration
- **URL:** `/es/module/zonacncvendor/register`
- **Fields filled:** Company name, CIF/NIF (B12345678), Sector (Mecanizado CNC), City (Madrid), Province (Madrid), Postal code (28001), Phone (612345678), Description
- **Submit button:** "Registrarme como vendedor"
- **Result:** Redirected to `/es/module/zonacncvendor/dashboard?registered=1` ✅

### 4. Stripe Checkout — Starter Plan (39€/month)
- **URL:** `/es/module/zonacncplans/checkout?plan=starter`
- **Plan selected:** Starter, monthly (39.00 €/month)
- **Redirected to:** `checkout.stripe.com` (test mode — "Entorno de prueba")
- **Card details:**
  - Card number: `4242 4242 4242 4242`
  - Expiration: `12/34`
  - CVC: `123`
  - Cardholder name: QA Cron Billing Test
  - Country: Spain
- **Result:** "Processing..." → Redirected to success page
- **Success URL:** `/es/module/zonacncplans/success?session_id=cs_test_...`
- **Success page text:** "¡Tu plan se ha activado correctamente!" ✅

### 5. Subscription Verification
- **Subscription page:** Starter plan is **Active**
- **Next billing:** 02/06/2026
- **Price:** 39 €/month
- **Ads used:** 0/3

### 6. Billing / Phantom Invoices Check
- **Billing page:** "Sin movimientos todavía" — clean slate, no phantom invoices ✅
- **Note:** The new account was just created so no recurring cycle has fired yet

### 7. Login Page Bug (Re-confirmed)
- **`/es/iniciar-sesion`:** HTTP 500 error — **still broken** 🔴
- **`/es/?controller=authentication`:** HTTP 500 error
- **POST login:** HTTP 500 error
- **Impact:** Cannot log in as test3 to re-verify phantom invoices
- **Cause suspected:** Server-side PHP error on authentication controller

---

## Finding: Login Page HTTP 500 (Blocking All Authentication)

The authentication/login controller is returning a server error (HTTP 500), making it impossible to reach other test accounts. This was also noted in a prior test run and has not been fixed. This blocks:
- Access to test3's billing for phantom invoice re-verification
- Standard login flow for any user
- Cross-account testing
- **Re-access after logout:** Once logged out (e.g., via `/?mylogout=`), the account is **permanently inaccessible through the UI** until the login page is fixed. The test account `test7-test30@zonacnc.com` is now locked out after logout.

---

## Findings: Phantom 19€ Failed Invoices (test3 Enterprise)

**Cannot re-verify today** due to login page being broken.

**Previous reaffirmed finding (2026-05-02 08:45 UTC):**
- 191 phantom 19€ failed invoices on test3 Enterprise account
- Growing at ~1-2/hour
- Not real Stripe charges (no PDF links)
- Interleaved with legitimate subscription payments
- Root cause: Local DB artifact in zonacncplans_payment_records

[Full finding: CRONQA-2026-05-02-stripe-billing-phantom-19eur-failed-invoices-test3-REAFFIRMED.md]

---

## Recommendations

1. **Fix login page (HTTP 500)** — blocks all authentication
2. **Fix phantom 19€ invoice bug** — code path generating fake failed invoices
3. **Add deduplication guard** for payment record insertion
4. **Clean up existing phantom records** (191+ across test3 account)
