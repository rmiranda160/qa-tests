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

---

## Scenario C: Add-on Purchase Flow — Anuncio Extra (NEW)
**Flow:** Login → Mi suscripción → Añadir add-on (Anuncio Extra) → Confirm dialog → Auto-charged to Stripe subscription → Updated subscription panel → Invoice

### 🔴 FINDING 12: Stripe Invoice Item Names Contain Mixed Language

**Verified via:** Stripe Invoice #QLS0NX5B-0040 and facturas page

The Stripe invoice line item for the Anuncio Extra add-on shows mixed English/Spanish:

| Location | Text |
|---|---|
| Stripe Invoice item | "Remaining time on ZonaCNC — Add-on: anuncio extra after 06 May 2026" |
| Facturas page (ES) | "Remaining time on Add-on Anuncio Extra after 06 May 2026 (+11,94 €)" |
| Facturas page (EN) | "Remaining time on ZonaCNC — Add-on: anuncio extra after 06 May 2026 (+11,94 €)" |

**Severity:** 🔴 High  
**Impact:** Stripe invoice items are user-facing billing records. Mixed-language descriptions look unprofessional and may confuse customers. The English facturas page shows Spanish "anuncio extra" while the Spanish facturas page uses English "Add-on". Both should match the page language.

**Recommendation:** Set Stripe invoice item description in the language of the checkout session, or add translation logic to the module that creates the Stripe invoice item. Use "Anuncio extra" for ES and "Extra listing" for EN.

---

### 🔴 FINDING 13: English Subscription Page — Widespread Missing Translations

**Verified via:** Browser navigation to `/en/subscription`

The English subscription page (`/en/subscription`) has severe translation gaps. Most dynamic content remains in Spanish despite the English language being selected:

| Element | Current (ES shown in EN) | Expected (EN) |
|---|---|---|
| Page heading | "Mi suscripción" | "My subscription" |
| Plan status | "Starter Activa" | "Starter Active" |
| Next charge | "Próximo cobro: 06/06/2026" | "Next charge: 06/06/2026" |
| Price unit | "39 € /mes" | "39 € /month" |
| Active ads label | "Anuncios activos" | "Active listings" |
| Change plan link | "Cambiar de plan" | "Change plan" |
| Payment method heading | "Método de pago" | "Payment method" |
| Change card button | "Cambiar tarjeta" | "Change card" |
| Subscription heading | "Suscripción" | "Subscription" |
| Cancel text | "Puedes cancelar tu suscripción..." | "You can cancel your subscription..." |
| Cancel button | "Cancelar al final del período" | "Cancel at end of period" |
| Invoice history heading | "Historial de facturas" | "Invoice history" |
| Table headers | "Fecha / Plan / Importe / Estado / Factura" | "Date / Plan / Amount / Status / Invoice" |
| Status badge | "Completado" | "Completed" |
| PDF/View links | "PDF Ver factura" | "PDF View invoice" |
| Add-on heading | "Añadir add-on a tu plan" | "Add add-on to your plan" |
| Add-on description | "Se añade sobre tu suscripción actual..." | "Added on top of your current subscription..." |
| Quantity label | "Cantidad" | "Quantity" |
| Add button | "Añadir" | "Add" |
| Cancel add-on button | "Cancelar" | "Cancel" |
| Breadcrumb | "Mi cuenta / Mi suscripción" | "My account / My subscription" |

**Severity:** 🔴 High  
**Impact:** The English subscription page is essentially unusable for English-speaking sellers. Only the sidebar navigation and add-on table headers are properly translated. This breaks the multilingual promise of the site.

**Recommendation:** Ensure all subscription module strings have translations registered in the PrestaShop translation system for all supported languages. Run a translation audit across all account pages.

---

### 🟡 FINDING 14: Payment Method Display Changes After Add-on Purchase

**Before add-on purchase** (ES page):
- "No hay método de pago guardado en este sitio. Si tu suscripción está activa, Stripe usará la tarjeta registrada en tu cuenta."
- Button: "Añadir método de pago"

**After add-on purchase** (ES page):
- Shows full card details: "Visa •••• •••• •••• 4242"
- Button: "Cambiar tarjeta"

**Severity:** 🟡 Medium  
**Impact:** The payment method display changed between the first page load and after the add-on was charged. This suggests the module only fetches/syncs the payment method from Stripe after a transaction occurs, not on page load. Users see "no payment method" even though their subscription is active and has a valid payment method on file.

**Recommendation:** Sync payment method info from Stripe on every subscription page load, not only after transactions. A user with an active subscription always has a payment method in Stripe — the UI should reflect that.

---

### 🟢 FINDING 15: Add-on Purchase Flow Works Correctly

- ✅ Confirmation dialog appears with correct text: "¿Añadir 1 anuncio(s) extra? Stripe cobrará la parte proporcional del periodo en curso con la tarjeta guardada."
- ✅ Add-on added to existing Stripe subscription (no separate checkout needed)
- ✅ Active ads limit increased: 1/3 → 1/4
- ✅ New Add-ons section appears with table: "Anuncios extra x1 12.00 € /mes Activo"
- ✅ Cancel button available for active add-ons
- ✅ Prorated billing correct: €11.94 (base) + €2.51 (IVA 21%) = €14.45 total
- ✅ Invoice generated: #QLS0NX5B-0040
- ✅ Facturas badge updated: 1 → 2
- ✅ Stripe invoice shows correct period: May 6 - June 6, 2026
- ✅ Invoice shows correct payment method: Visa •••• 4242
- ✅ Invoice has Download invoice and Download receipt options

---

### 🟡 FINDING 16: Add-on Section Remains Visible After Successful Purchase

The "Añadir add-on a tu plan" section remains fully visible and functional even after successfully purchasing the add-on. A user could accidentally purchase the same add-on multiple times.

**Severity:** 🟡 Medium  
**Impact:** Users could accidentally double-purchase. While the Add-ons table shows existing add-ons with cancel buttons, the "Añadir" section below it shows the same add-on available for purchase again.

**Recommendation:** Either hide the add-on section for already-purchased add-ons, or show a warning that the user already has this add-on active.

---

### 🟡 FINDING 17: No Email Notification Verified for Add-on Purchase

**Attempted:** IMAP check on test7@zonacnc.com and test3@zonacnc.com  
**Result:** 
- test7@zonacnc.com (where previous billing emails were received): No add-on email received
- test3@zonacnc.com (account that made purchase): IMAP authentication failed (password different from site password)

**Severity:** 🟡 Medium (unverified)  
**Impact:** Cannot confirm whether add-on purchases trigger email notifications to the account holder. The invoice is available on the site and Stripe, but email notification for add-on charges should be verified.

**Recommendation:** Add test3@zonacnc.com IMAP credentials to `.env.qa.email` or ensure test accounts share the same password across site and email. Test add-on purchase email notification once the account's inbox is accessible.

---

## Updated Summary of Issues Found

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
| 12 | Stripe invoice items contain mixed language (EN/ES) | 🔴 High |
| 13 | English subscription page — widespread missing translations | 🔴 High |
| 14 | Payment method display inconsistent before/after transaction | 🟡 Medium |
| 15 | Add-on purchase flow works correctly | ✅ OK |
| 16 | Add-on section stays visible after purchase (duplicate risk) | 🟡 Medium |
| 17 | No email notification verified for add-on purchase | 🟡 Medium |
