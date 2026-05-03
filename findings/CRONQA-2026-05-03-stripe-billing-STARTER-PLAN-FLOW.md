# CRON QA — Stripe Billing Starter Plan Complete Flow

**Date:** 2026-05-03  
**Tester:** test30@zonacnc.com (Test Accessibility ZA)  
**Plan purchased:** Starter (39€/month) via Stripe Checkout test mode  
**Card used:** 4242 4242 4242 4242 (Visa test card)  
**Status:** ✅ Subscription active (Starter Activa)  
**Ad created:** Haas VF-2 CNC Milling Center (ID: 12966) ✅  
**Session:** cs_test_...

---

## Flow Executed

1. Password reset for test30@zonacnc.com via `/es/password-recovery`
2. Received "Confirmación de contraseña" email in Spanish ✅
3. Set new password (`Test1234567!@#`)
4. Logged in and completed billing address
5. Registered as seller (required before subscribing)
6. Navigated to pricing → selected **Starter plan** (39€/month) — **3 active ads included**
7. Checkout via Stripe Checkout (test mode) — Spanish locale ("Entorno de prueba")
8. Filled card: 4242 4242 4242 4242, expiry 12/34, CVC 123, name "Test Accessibility"
9. Clicked "Pay and subscribe" → payment processed ✅
10. Redirected to success page: `/en/module/zonacncplans/success`
11. **Success message:** "Suscripción activada" / "¡Tu plan se ha activado correctamente!"
12. Email received via IMAP: **"¡Bienvenido a Starter! Tu suscripción está activa"**  
13. Created ad: filled category, brand, model, price, description → published successfully ✅
14. Subscription page shows: **"Anuncios activos: 0 / 3"** (correct)

---

## 🐛 Bugs Found (Confirmed from Previous Findings + New)

### Bug 1: Wrong "Ads included" in welcome email (ALL PLANS AFFECTED)

**Severity:** High  
**File:** Email template (Mailgun `plans-subscription_started`)  
**Description:** The welcome email for the **Starter plan** (39€/month, includes **3 active ads**) shows:

> `- Ads included: 1`

The subscription page correctly shows `0 / 3` (0 active out of 3 included), so the system correctly tracks the limit as **3**. But the email template is rendering the count of **currently active ads (0)** instead of the **included allowance (3)**.

**Previously reported in Pro plan (PR #...):** Same bug — Pro plan showed "Anuncios incluidos: 1" instead of 10.  
**Now confirmed:** This bug affects **all subscription tiers** (both Starter and Pro). The email template always shows `1` regardless of plan.

**Evidence:**
- Email body: `- Ads included: 1` (English template)
- Email plain text: `"Ads included: 1"` 
- Subscription page: `Anuncios activos: 0 / 3`
- Previous Pro test: `Anuncios activos: 1 / 10`

**Expected:** `Ads included: 3` for Starter, `Ads included: 10` for Pro

---

### Bug 2: "Period: monthly" not translated (ALL PLANS)

**Severity:** Medium  
**File:** Email template  
**Description:** The email shows `- Period: monthly` instead of a localized Spanish translation. Subject line is in Spanish ("¡Bienvenido a Starter!...") but the body is in English, including the untranslated "monthly".

**Previously reported in Pro plan test.** Now confirmed for Starter plan as well.

**Expected:** `- Periodo: Mensual` (or similar Spanish translation)

---

### Bug 3: Mixed language — Spanish subject, English body

**Severity:** Low-Medium  
**File:** Email template  
**Description:** The subscription confirmation email has a Spanish subject line:
> `¡Bienvenido a Starter! Tu suscripción está activa`

But the email body starts with:
> `Hello Test`

And uses English throughout for field labels (`Ads included:`, `Period:`, `Next charge:`). This indicates the email template is not fully localized even when the triggering session was in Spanish (Stripe checkout was in Spanish locale, subject is Spanish, but body is English).

---

### Bug 4: Misleading lock message on ad creation page

**Severity:** Low (UI/UX)  
**Description:** When creating an ad (Starter plan), the "Machine status" section shows a lock icon with the message:

> `Your current plan does not allow publishing new machinery.`

And a link `Improve plan →` to the pricing page. **However,** the "Post free ad" button is **NOT disabled**, and the ad was **successfully submitted** after filling all fields. This message is misleading — it either blocks submission incorrectly or should not appear at all.

**Note:** The subscription page confirms `Anuncios activos: 0 / 3` — there are 3 available ad slots. Free plan typically allows 0 ads, so this message might be a Free-plan artifact not refreshed after upgrading to Starter.

---

## ✅ Working Correctly

1. ✅ **Password reset flow** — "Confirmación de contraseña" email correctly in Spanish when triggered from `/es/` pages
2. ✅ **Seller registration** — properly redirects unregistered users
3. ✅ **Stripe Checkout** — payment processes successfully with test card
4. ✅ **Plan activation** — redirects to success page, subscription shows as active
5. ✅ **Subscription page** — correctly shows `Anuncios activos: 0 / 3`
6. ✅ **Ad creation** — ad submitted successfully on Starter plan despite lock message
7. ✅ **Category selection** — hierarchical categories work correctly

---

## Account Status
- **Plan:** Starter Activa (39€/month)
- **Next charge:** 03/06/2026
- **Ads used:** 1 / 3 (one ad published)
- **Seller:** Registered (Test Company SL, B12345678)
