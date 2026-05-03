# CRON QA — Stripe Billing Complete Payment Flow

**Date:** 2026-05-03  
**Tester:** test7@zonacnc.com (Test Vendor Seven QA)  
**Plan purchased:** Pro (99€/month) via Stripe Checkout test mode  
**Card used:** 4242 4242 4242 4242 (Visa test card)  
**Status:** ✅ Subscription active  
**Session:** cs_test_a13PHMRdmrblgIiHLgkFicZjsXmkGdK8PAv9AqkjsSMaQ3xOqHDOYhWlKW

---

## Flow Executed

1. Logged in as test7@zonacnc.com (vendor account, was on Free plan)
2. Navigated to pricing → selected Pro plan (99€/month)
3. Checkout via Stripe Checkout (test mode)
4. Filled card: 4242 4242 4242 4242, expiry 12/30, CVC 123, name "Test Vendor Seven", country Spain
5. Clicked "Pay and subscribe" → payment processed ✅
6. Redirected to success page: `/es/module/zonacncplans/success?session_id=cs_test_...`
7. Subscription page shows **"Pro Activa"** with next charge 03/06/2026
8. Billing page shows **"Sin movimientos todavía"** — no invoice/charge visible in UI
9. Email received via IMAP: **"¡Bienvenido a Pro! Tu suscripción está activa"** from ZonaCNC

---

## 🐛 Bugs Found

### Bug 1: Wrong "Anuncios incluidos" in welcome email

**Severity:** High  
**File:** Email template (Mailgun `plans-subscription_started`)  
**Description:** The welcome email for the **Pro plan** (99€/month, includes 10 ads) shows:

> `Anuncios incluidos: 1`

The subscription page correctly shows `1 / 10` (1 active out of 10 included), so the system correctly tracks the limit as 10. But the email template is rendering the count of **currently active ads (1)** instead of the **included allowance (10)**.

**Evidence:**
- Email body (plain text): `Anuncios incluidos: 1`
- Email body (HTML): `<strong>Anuncios incluidos:</strong> 1`
- Subscription page shows: `Anuncios activos: 1 / 10`

**Expected:** `Anuncios incluidos: 10`

---

### Bug 2: "Periodo: monthly" not translated to Spanish

**Severity:** Medium  
**File:** Email template  
**Description:** The subscription period field says "monthly" (English) instead of Spanish.

**Evidence:**
- Email body (plain text): `Periodo: monthly`
- Email body (HTML): `<strong>Periodo:</strong> monthly`

**Expected:** `Periodo: Mensual` or `Ciclo de facturación: Mensual`

---

### Bug 3: Billing history empty after successful payment

**Severity:** High  
**File:** `/es/module/zonacncplans/billing`  
**Description:** After a successful Stripe payment (99€ approved, subscription active), the billing page shows **"Sin movimientos todavía"** — no invoices or payment records are displayed.

**Evidence:**
- Stripe payment successfully processed (redirect to success page)
- Stripe session ID: `cs_test_a13PHMRdmrblgIiHLgkFicZjsXmkGdK8PAv9AqkjsSMaQ3xOqHDOYhWlKW`
- Subscription page shows active Pro plan with next charge
- Email confirmation received
- BUT billing history empty — the Stripe webhook that should create the invoice record is either not firing, not being processed, or there's a delay/error

**Impact:** Users cannot see or download their invoices for payments made.

---

### Bug 4: Success page missing accents (translation error)

**Severity:** Low  
**File:** `/es/module/zonacncplans/success` success page  
**Description:** Two typos in the success message:

> `Tu suscripción esta activa` → should be **`Tu suscripción está activa`**

> `Recibirás un email de confirmacion` → should be **`Recibirás un email de confirmación`**

---

### Bug 5: Subscription page missing multiple accents

**Severity:** Low  
**File:** `/es/module/zonacncplans/subscription`  
**Description:** The payment method section has multiple missing accents:

> `No hay metodo de pago guardado` → **método**
> `Si tu suscripcion esta activa` → **suscripción** / **está**
> `Stripe usara la tarjeta registrada` → **usará**

---

## ✅ Confirmed Working

- ✅ Stripe Checkout integration works (redirect, payment processing)
- ✅ Stripe test card 4242... accepted successfully
- ✅ Pro subscription activated in system (status: "Activa")
- ✅ Next charge date correctly set: 03/06/2026
- ✅ Email sent via Mailgun with tag `plans-subscription_started`
- ✅ Email DKIM-signed, passes SPF/DMARC
- ✅ Email renders both plain text and HTML versions
- ✅ Subject line properly UTF-8 encoded: `¡Bienvenido a Pro! Tu suscripción está activa`

---

## Notes

- QA email pool exhausted (test7–test30 all used)
- test8 had a previously reported Pro subscription (bought May 2)
- The payment flow works end-to-end but the visible billing/invoice history is missing
- Email template renders `anuncios_incluidos` variable incorrectly (shows active count instead of allowance)
