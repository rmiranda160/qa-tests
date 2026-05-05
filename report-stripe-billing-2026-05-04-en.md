# Stripe Billing QA Report — English Locale Checkout Flow
**Date:** 2026-05-04 21:37–21:48 UTC  
**Target:** new.zonacnc.com (staging)  
**Test account:** test26@zonacnc.com (customer ID 6631, "Test ZonaCNC")  
**Locale tested:** English (`/en/`)  
**Plan:** Starter (€39.00/mo)  
**Result:** ✅ Payment processed successfully via Stripe (test mode)  

---

## Findings Summary

| # | Severity | Category | Description | Status |
|---|----------|----------|-------------|--------|
| F2 | 🔴 HIGH | i18n | Entire English checkout funnel renders in Spanish | Confirmed & Extended |
| F3 | 🔴 HIGH | Email Templates | Template variable `{myads_url}` not substituted | Confirmed |
| F4 | 🔴 HIGH | Email i18n | Mixed-language emails (different subj/body lang) | Confirmed & Extended |
| F5 | 🟠 MEDIUM | Email Data | Wrong plan limit in confirmation email (1 vs 3 ads) | NEW |
| F6 | 🟡 LOW | Stripe Config | Spanish statement descriptor on Stripe Checkout | NEW |
| F7 | 🟠 MEDIUM | Redirect Bug | Address save redirects to malformed URL | NEW |
| F8 | 🟡 LOW | JS Error | `Unexpected token '&'` on checkout/success pages | Confirmed |

---

## Detailed Findings

### F2: English Locale Renders Spanish Everywhere [HIGH — Confirmed & Extended]
Every page in the checkout funnel at `/en/` URL path shows Spanish UI text:

| Page | URL | Example Spanish text |
|------|-----|---------------------|
| Pricing | `/en/pricing` | "€/mes", footer all Spanish |
| Checkout | `/en/pagar-plan?plan=starter` | "Contratar plan", "Resumen del pedido", "Mensual", "Proceder al pago" |
| Success | `/en/module/zonacncplans/success` | "Suscripción activada", "¡Tu plan se ha activado correctamente!", "Publicar un anuncio" |
| Subscription | `/en/suscripcion` | "Mi suscripción", "Anuncios activos", "Método de pago", "Cancelar al final del período" |

Only the header/nav and footer headings remain in English. All functional UI content is Spanish.
**Impact:** English-speaking users see Spanish throughout the payment flow.

---

### F3: Template Variable `{myads_url}` Not Substituted [HIGH — Confirmed]
The "getting started" email (subject: "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos") contains:
```
Start selling:
{myads_url}
```
The URL to the seller panel is not rendered — the raw variable appears instead.
Only confirmed in the English flow; the same template variable failure was previously observed in Spanish emails.

---

### F4: Mixed-Language Emails [HIGH — Confirmed & Extended]
All three post-payment emails have mismatched subject/body languages:

| Email | Subject Language | Body Language |
|-------|-----------------|---------------|
| Password update | English: "Your new password" | Spanish: "Hola Test ZonaCNC, Su contraseña..." |
| Subscription activation | Spanish: "¡Bienvenido a Starter!..." | English: "Hello Test, Welcome to ZonaCNC!" |
| Getting started | Spanish: "Empieza con buen pie..." | English: "Hello Test, Welcome as a seller!" |

**Pattern:** The password email has English subject + Spanish body. The subscription/welcome emails have Spanish subject + English body. This suggests two different email template systems or inconsistent locale resolution logic.

---

### F5: Wrong Ads Count in Subscription Email [MEDIUM — NEW]
The subscription activation email states:
```
Ads included: 1
```
The Starter plan includes **3 active ads**. The subscription page (`/en/suscripcion`) correctly shows `1 / 3` (1 used, 3 allowed). The email template is using the *current usage count* (1) instead of the *plan limit* (3).
**Impact:** Users are misinformed about their plan's ad allowance.

---

### F6: Spanish Stripe Statement Descriptor [LOW — NEW]
On Stripe Checkout, the business name appears as:
```
Entorno de prueba de Veleta Comercializaciones y Servicios SLU
```
And plan details show mixed language:
```
3 listings · 10 fotos · perfil público
```
**Impact:** English users see Spanish business name and mixed-language plan details on Stripe's hosted payment page. This is a Stripe account configuration issue (statement descriptor `name` field and product description fields).

---

### F7: Address Save Redirect Bug [MEDIUM — NEW]
When saving a billing address during checkout, the form POST redirects to:
```
/en/?controller=https://new.zonacnc.com/en/pagar-plan?plan=starter
```
This malformed URL (controller parameter with URL-encoded back-URL) causes the user to land on the homepage instead of returning to checkout. The user must manually re-navigate to the checkout URL.
**Impact:** Disrupted flow during checkout — users who need to add/edit their billing address get lost.

---

### F8: JS Error `Unexpected token '&'` [LOW — Confirmed]
Persistent on both:
- Checkout page `/en/pagar-plan?plan=starter` (1 error)
- Success page `/en/module/zonacncplans/success` (1 error)

Likely caused by a URL parameter containing an unescaped `&` character being parsed as JSON or JavaScript.

---

## Email Verification Log (IMAP)

```
test26@zonacnc.com inbox (8 emails total):

1. [zonacnc.com] Your new password          → FINDING F4 (EN subj / ES body)
2. ¡Bienvenido a Starter!...                → FINDING F4 (ES subj / EN body), F5 (Ads: 1)
3. Empieza con buen pie en ZonaCNC...        → FINDING F3 ({myads_url}), F4 (ES subj / EN body)
```

---

## Flow Timeline

| Step | Time | Action | Result |
|------|------|--------|--------|
| 1 | 21:38 | Navigate to /en/pricing | F2 confirmed (Spanish content) |
| 2 | 21:39 | Click "Subscribe to Starter" | Redirected to login |
| 3 | 21:40 | Login as test26 | Failed (account from previous tests, needed reset) |
| 4 | 21:41 | Password recovery | F4 confirmed (email EN/ES mismatch) |
| 5 | 21:42 | Password reset, login | Success |
| 6 | 21:43 | Navigate to /en/pagar-plan?plan=starter | Address form forced |
| 7 | 21:43 | Fill & save billing address | F7 (redirect bug hit) |
| 8 | 21:44 | Manual re-navigate to checkout | F2 confirmed, F8 JS error |
| 9 | 21:45 | Click checkout → Stripe | Spanish statement descriptor (F6) |
| 10 | 21:45 | First payment attempt | Failed: expiration "1230" = Dec 2004 (past) |
| 11 | 21:46 | Fix expiration to 12/34, submit | Success |
| 12 | 21:47 | Redirect to success page | F2 confirmed (all Spanish), F8 error |
| 13 | 21:47 | Check /en/suscripcion | F2 confirmed, shows 1/3 ads |
| 14 | 21:47 | Verify emails via IMAP | F3, F4, F5 confirmed |

---

## Recommendations

1. **F2 (i18n):** Implement proper locale resolution in the `zonacncplans` module. The PrestaShop context language ID is not being respected for module templates. Check `$this->context->language->id` in controller and module template rendering.

2. **F4 (Email i18n):** Unify email template language selection. Password emails appear to use system default (Spanish body) with translated subject, while subscription emails do the opposite. Use a single locale source (shop language or user language preference).

3. **F3 (Template vars):** Fix `{myads_url}` assignment in the welcome email template. The variable is likely not defined in the template context or has a typo in the variable name.

4. **F5 (Ads count):** Change the email template variable from `active_ads_count` to `plan_ad_limit` or add both values.

5. **F7 (Redirect):** Fix the address form POST handler to correctly decode the back-URL parameter before redirecting.

6. **F6 (Stripe descriptor):** Add English statement descriptors and product names in the Stripe dashboard for test mode.

7. **F8 (JS error):** Escape `&` characters in URL parameters used in inline JavaScript.

---

**Test Account used:** test26@zonacnc.com / Test1234%segura  
**IMAP:** zonacnc.com:993 SSL / Ttc5ZxPltimz  
**Stripe session:** cs_test_a1l0B5IvWyJdswarpxo6tj8jSYjZrCQUhjlzY581epju0uLiUF0UgtwYgR  
**Report generated by:** ZonaCNC QA Tester Agent
