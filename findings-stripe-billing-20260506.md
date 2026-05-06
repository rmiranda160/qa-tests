# Stripe Billing QA Test — new.zonacnc.com
**Date:** 2026-05-06  
**Tester:** OpenClaw QA Agent  
**Account used:** test3@zonacnc.com (site login + Stripe checkout)  
**Email verified via IMAP:** test7@zonacnc.com (billing emails received)  
**Plan tested:** Starter (€39/mes)  
**Session:** `cs_test_a1pHYbJ72j5YZzryZf56pBlqWObNMteJsvIlEtcRop39GCEAGrpcrjpuni`

---

## Scenarios Tested

### Scenario A: Subscribe to Starter Plan and Verify Billing Flow
**Flow:** Login → Pricing → Contratar Starter → Pagar Plan → Stripe Checkout → Pay → Success → Subscription Panel

### Scenario B: Review Email Templates & Translations (IMAP)
**Flow:** IMAP login to test7@zonacnc.com → Review billing emails → Check email content, language, variables, charset

---

## 🔴 FINDING 1: Price Discrepancy — IVA Not Shown Before Stripe

| Location | Price Shown |
|---|---|
| Pricing page (`/es/pricing`) | €39/mes |
| Payment summary (`/es/pagar-plan?plan=starter`) | €39.00/mes (Mensual) or €390.00/año (Anual) |
| Stripe Checkout | **€47.19** (Subtotal €39.00 + IVA 21% €8.19) |

**Severity:** 🟡 Medium  
**Impact:** Users expect to pay €39 but are charged €47.19. IVA (21% VAT) is not disclosed on the pricing page or payment summary page. This could cause cart abandonment and potential legal issues under EU consumer protection (prices must include VAT or clearly state it's excluded).

**Recommendation:** Add "IVA no incluido" or show the total price with IVA (€47.19) on the pricing page and payment summary, consistent with Spanish e-commerce norms.

---

## 🔴 FINDING 2: Stripe Checkout Not Localized to Spanish

The entire ZonaCNC site is in Spanish, but the Stripe Checkout page appears entirely in English:

| Element | Current (English) | Expected (Spanish) |
|---|---|---|
| Page title | "Subscribe to Plan Starter" | "Contratar Plan Starter" |
| Price label | "per month" | "al mes" |
| Section header | "Contact information" | "Información de contacto" |
| Payment label | "Payment method" | "Método de pago" |
| Card label | "Card" | "Tarjeta" |
| Save info checkbox | "Save my information for faster checkout" | "Guardar mi información para pagos más rápidos" |
| Submit button | "Pay and subscribe" | "Pagar y suscribirse" |
| Processing text | "Processing" | "Procesando" |
| Terms text | "By subscribing, you authorize..." | "Al suscribirse, autoriza a..." |
| Footer | "Powered by Stripe" | OK (brand) |

**Severity:** 🟡 Medium  
**Impact:** Breaks the Spanish-only UX expected by site visitors. Inconsistent with the rest of the site.

**Recommendation:** Configure Stripe Checkout locale to `es` (Spanish). This can be done when creating the Checkout Session by setting `locale: 'es'` or `'auto'` in the Stripe API call.

---

## 🟡 FINDING 3: Payment Method Names Partially Localized

- "Klarna" and "Amazon Pay" appear in English — these are brand names and acceptable
- "Pay with Link" appears in English
- Card brand names (Visa, Mastercard, etc.) are brand names — acceptable

**Recommendation:** Verify that Stripe's `locale` setting affects these labels. Some may be Stripe-controlled and change with locale.

---

## 🟢 FINDING 4: Payment Flow Works Correctly

- ✅ Login → Pricing → Plan selection → Payment summary → Stripe redirect → Card entry → Payment → Success → Subscription panel
- ✅ Stripe sandbox mode correctly identified with "Sandbox" badge
- ✅ Test card 4242...4242 processed successfully
- ✅ Redirect to success page (`/es/module/zonacncplans/success`) works
- ✅ Success message: "¡Tu plan se ha activado correctamente!"
- ✅ Subscription panel shows "Starter Activa"
- ✅ Next charge date: 06/06/2026 (correct monthly billing)
- ✅ Invoice history shows one entry: €47.19 EUR, Completado
- ✅ Stripe Invoice page accessible, shows Invoice #QLS0NX5B-0036
- ✅ Invoice shows correct payment method: Visa •••• 4242
- ✅ Invoice has Download invoice and Download receipt options
- ✅ Subscription management: Cambiar de plan, Cancelar al final del período
- ✅ Add-on purchase available: Anuncio extra at €12.00/mes
- ✅ Payment acceptance: Visa, Mastercard, AMEX, Apple Pay, Google Pay displayed
- ✅ SSL/TLS 256-bit, RGPD compliance, PCI-DSS Nivel 1 badges shown

---

## 🟡 FINDING 5: Typography/Accent Issues on Success Page

The success page (`/es/module/zonacncplans/success`) contains:
- "Recibirás un email de **confirmacion** con los detalles del pago"
- **Missing accent:** should be "confirmación" (with ó)

**Severity:** 🟢 Low  
**Recommendation:** Fix the missing accent in the template string.

---

## 🟡 FINDING 6: Annual Plan Discount Calculation

| Plan | Monthly | Annual | Savings | % Saved |
|---|---|---|---|---|
| Starter | €39.00/mes | €390.00/año | €78 | ~16.7% |

- Annual plan saves 2 months (€78 = 2 × €39)
- Discount seems reasonable and well-labeled ("Ahorras 78 €")

✅ No issue found.

---

## 🟡 FINDING 7: Test Account Access Limitation

**Problem:** The task required using test7-30@zonacnc.com accounts, but:
1. All test7-30 accounts have IMAP credentials in `.env.qa.email`
2. None have known site passwords (only test3's site password is in `.env.qa`)
3. Password recovery tokens expire very quickly (minutes)
4. test7 was rate-limited (360 min cooldown on password recovery)
5. IMAP passwords are different from site passwords
6. Registration fails because accounts already exist

**Severity:** 🟡 Process  
**Recommendation:** Add site passwords for test7-30 accounts to the credential files, or set all test accounts to use the same password for both site and IMAP. Consider documenting test accounts and their passwords in a single location.

---

## 🔴 FINDING 8: Subscription Welcome Email — Wrong Ad Count (BUG)

**Verified via:** IMAP on test7@zonacnc.com (Email #41, 2026-05-06)

Email says **"Ads included: 1"** but the Starter plan actually includes **3 active ads** (confirmed on `/es/pricing` and in the onboarding email #42 itself which correctly states "3 active ads").

| Source | Ad Count Shown |
|---|---|
| Welcome email (#41) | **1** ❌ |
| Onboarding email (#42) | 3 ✅ |
| Pricing page (`/es/pricing`) | 3 ✅ |
| Actual plan config | 3 ✅ |

**Severity:** 🔴 High  
**Impact:** User is told they can only post 1 ad when they actually have 3. This misleads the user about plan limits and may reduce platform engagement.

**Recommendation:** Fix the welcome email template to use the correct ad count from plan configuration, not a hardcoded value.

---

## 🔴 FINDING 9: Subscription Welcome + Onboarding Emails — Missing Spanish Translation

**Verified via:** IMAP on test7@zonacnc.com (Emails #41, #42, both 2026-05-06)

Both the subscription welcome email and the onboarding email are sent **entirely in English** despite the user's account language being Spanish (the site was navigated in Spanish, `/es/` paths).

| Email | Language Sent | Expected |
|---|---|---|
| Welcome email (#41) | English (`lang="en"`) | Spanish (`lang="es"`) |
| Onboarding email (#42) | English (`lang="en"`) | Spanish (`lang="es"`) |
| Invoice email (#13) | Spanish (`lang="es"`) | ✅ OK |
| Invoice email (#31) | Spanish (`lang="es"`) | ✅ OK |

**Severity:** 🔴 High  
**Impact:** Inconsistent UX — invoice emails are properly localized but welcome/onboarding emails are not. Non-English users receive emails they may not understand.

**Recommendation:** Apply the same localization logic used for invoice emails to welcome and onboarding email templates.

---

## 🟡 FINDING 10: Onboarding Email — Unreplaced Template Variable

**Verified via:** IMAP on test7@zonacnc.com (Email #42, plain text part)

The plain text version of the onboarding email contains the literal string `{myads_url}` instead of the actual URL to the user's ads page.

```
Start selling:
{myads_url}
```

**Severity:** 🟡 Medium  
**Impact:** Plain-text email clients show a broken, unreplaced variable instead of a clickable link. Users cannot access their ads from plain-text emails.

**Recommendation:** Ensure all template variables are resolved in both HTML and plain text parts before sending.

---

## 🟡 FINDING 11: Onboarding Email — Wrong charset in HTML Content-Type

**Verified via:** IMAP on test7@zonacnc.com (Email #42)

The HTML part of the onboarding email declares `charset=ascii` in the Content-Type header, but the actual content contains Unicode/UTF-8 characters:

```
Content-Type: text/html; charset=ascii
```

**Severity:** 🟢 Low  
**Impact:** Some email clients may render Unicode characters incorrectly (e.g., `→` showing as `â†'`).

**Recommendation:** Change to `charset=utf-8` to match the actual content encoding.

---

## 📊 Stripe Checkout Technical Details

- **Checkout URL pattern:** `https://checkout.stripe.com/c/pay/cs_test_...`
- **Mode:** Sandbox (test mode)
- **Stripe Account:** `acct_1TTkeRPzDPgjo8Yc`
- **Invoice base URL:** `https://invoice.stripe.com/i/acct_1TTkeRPzDPgjo8Yc/test_...`
- **Payment methods offered:** Card (Visa/MC/AMEX/UnionPay/JCB/Discover/Diners), Klarna, Amazon Pay, Link
- **Card form:** Accordion-style UI within main page (not separate page)
- **Recurring:** Monthly subscription (billed monthly)
- **Tax:** IVA 21% applied at Stripe level

---

## Summary of Issues Found

| # | Finding | Severity |
|---|---|---|
| 1 | IVA (21%) not shown on pricing/payment pages before Stripe | 🟡 Medium |
| 2 | Stripe Checkout not localized to Spanish | 🟡 Medium |
| 3 | Payment method names partially in English | 🟢 Low |
| 4 | Payment flow works end-to-end | ✅ OK |
| 5 | Missing accent on "confirmación" in success message | 🟢 Low |
| 6 | Annual plan discount calculation correct | ✅ OK |
| 7 | Test account management needs improvement | 🟡 Process |
| 8 | Welcome email shows wrong ad count (1 instead of 3) | 🔴 High |
| 9 | Welcome + onboarding emails not translated (English only) | 🔴 High |
| 10 | Onboarding email has unreplaced `{myads_url}` variable | 🟡 Medium |
| 11 | Onboarding email HTML charset=ascii instead of utf-8 | 🟢 Low |
