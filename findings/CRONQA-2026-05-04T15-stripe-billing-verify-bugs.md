# CRONQA Finding: Stripe Billing — Bug Verification & Retest

**Date:** 2026-05-04 15:15 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Scenario:** 1/1 — ✅ Executed successfully  
**Account Used:** test9@zonacnc.com (customer 6611, Pro Activa 990€/año)  
**IMAP Verified:** test7@zonacnc.com (26 messages)

---

## Executive Summary

Retest of previously reported stripe-billing bugs. Verified IMAP email templates and billing UI. **All 3 previously reported bugs confirmed still present** — no fixes applied. No new regressions found on billing/subscription/change-plan pages.

---

## 1. Bug Verification Results

### 🔴 BUG-1 (CONFIRMED): Template Placeholders Not Interpolated

**Source:** UID 11 — Mailgun tag `plans-vendor_onboarding`  
**Subject:** "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"

Placeholder variables still appear as literal strings:

| Placeholder | Location in Email |
|---|---|
| `{vendor_dashboard_url}` | Step 1 CTA link |
| `{max_listings}` | Step 2 description ("Tu plan Pro permite hasta {max_listings} anuncios activos") |
| `{new_ad_url}` | Step 2 CTA link |
| `{messaging_url}` | Step 3 CTA link |
| `{boost_quota_monthly}` | Boost section |
| `{boostpacks_url}` | Boost section link |

**Status:** ❌ NOT FIXED — All step links still dead.

---

### ⚠️ BUG-2 (CONFIRMED): "Periodo: monthly" Not Translated

**Source:** UID 12 — Mailgun tag `plans-subscription_started`  
**Subject:** "¡Bienvenido a Pro! Tu suscripción está activa"

| Detail | Expected | Actual |
|--------|----------|--------|
| Periodo | "mensual" | "monthly" |
| Anuncios incluidos | 10 (Pro plan) | 1 |

**Status:** ❌ NOT FIXED — Translation + ad count mismatch persist.

---

### ⚠️ BUG-3 (CONFIRMED): "Business (monthly)" Untranslated in Invoice Email

**Source:** UID 13 — Mailgun tag `plans-invoice_paid`  
**Subject:** "Factura pagada — Tu plan sigue activo"

| Detail | Expected | Actual |
|--------|----------|--------|
| Plan display | "Business (mensual)" | "Business (monthly)" |

**Status:** ❌ NOT FIXED — Period label still in English.

---

## 2. Billing UI Verification (test9 account)

### 2.1 Subscription Page (`/es/module/zonacncplans/subscription`)

| Check | Result |
|-------|--------|
| Plan displayed | ✅ Pro Activa — 990 €/año |
| Next billing | ✅ 03/05/2027 |
| Active ads | ✅ 1 / 10 |
| Invoice history | ✅ 1 completed (03/05/2026, 990.00 EUR) |
| "Cambiar de plan" link | ✅ Present → navigates `/es/module/zonacncplans/change` |
| "Cancelar al final del período" | ✅ Present |
| "Añadir add-on" section | ✅ Shows "Anuncio extra 9.00 €/mes" with quantity spinner |
| "Añadir método de pago" button | ✅ Present |

### 2.2 Billing Page (`/es/module/zonacncplans/billing`)

| Check | Result |
|-------|--------|
| Invoice count badge | ✅ "1" in sidebar |
| Invoice row | ✅ "03/05/2026 \| Suscripción Pro \| 990,00 EUR \| completado" |
| PDF download link | ✅ Available |
| Stripe invoice link | ✅ Opens stripe.com |
| Page title | ✅ "Facturas y pagos · ZonaCNC" |

### 2.3 Change Plan Page (`/es/module/zonacncplans/change`)

| Check | Result |
|-------|--------|
| Current plan shown | ✅ Pro (ACTUAL badge), up to 10 ads |
| 5 plans displayed | ✅ Free, Starter, Pro, Business, Enterprise |
| "Confirmar cambio" button | ✅ Present |
| Upgrade/downgrade rules | ✅ Clearly displayed |
| Refund policy (7-day) | ✅ Displayed with conditions |
| Add-ons behavior | ✅ Explained during plan change |
| Session persists | ✅ (No unexpected redirect to login) |

### 2.4 Pricing Page (`/es/pricing`)

| Check | Result |
|-------|--------|
| 5 plans displayed | ✅ Free / Starter / Pro / Business / Enterprise |
| Pro badge | ✅ "Más popular" + "Tu plan actual" |
| Boost 24h section | ✅ Present with "Ver packs de Boost 24h →" link |
| Free plan button | ✅ "No disponible" (disabled) |
| Plan prices | ✅ Free 0€, Starter 39€/mes, Pro 99€/mes, Business 199€/mes, Enterprise 299€/mes |

---

## 3. IMAP Verification

### 3.1 Mailbox Status

- **test7@zonacnc.com**: ✅ 26 messages, authentication working (password: 77G7YmLXuOae)
- **test9@zonacnc.com**: ❌ IMAP credentials from `.env.qa.email` still invalid (login fails)

### 3.2 Email Template Inventory (UID-based)

| UID | Template Tag | Subject | Status |
|-----|-------------|---------|--------|
| 11 | plans-vendor_onboarding | Empieza con buen pie… | 🔴 Placeholders broken |
| 12 | plans-subscription_started | ¡Bienvenido a Pro! | ⚠️ Ad count + translation |
| 13 | plans-invoice_paid | Factura pagada | ⚠️ "monthly" not translated |
| 23 | passwordless-confirmation | Confirmación de contraseña | ✅ Clean |
| 24 | passwordless-new-password | Su nueva contraseña | ✅ Clean |
| 25 | passwordless-confirmation | Confirmación de contraseña | ✅ Clean |
| 26 | passwordless-new-password | Su nueva contraseña | ✅ Clean |

---

## 4. Issues Summary

| # | Severity | Component | Description | Status |
|---|----------|-----------|-------------|--------|
| 1 | 🔴 Critical | Email Template | Vendor onboarding: `{vendor_dashboard_url}` etc. not interpolated | ❌ Unfixed |
| 2 | ⚠️ Warning | Email Template | Subscription welcome: "Anuncios incluidos: 1" should be 10 | ❌ Unfixed |
| 3 | ⚠️ Warning | Translation | "Periodo: monthly" in subscription/invoice emails | ❌ Unfixed |
| 4 | ⚠️ Low | Translation | "Business (monthly)" in invoice email | ❌ Unfixed |
| 5 | ⚠️ Low | IMAP | test9 IMAP credentials invalid in .env.qa.email | ❌ Unfixed |

---

## 5. What Works

- ✅ Login with test9@zonacnc.com successful
- ✅ Subscription management page complete and correct
- ✅ Invoice history with Stripe PDF links
- ✅ Change plan page with full upgrade/downgrade rules
- ✅ Pricing page with correct plan display
- ✅ Password reset emails deliver and render correctly
- ✅ Sidebar navigation badge shows correct invoice count
- ✅ Stripe Elements modal for payment method
- ✅ Cross-page navigation maintains session

---

## 6. Recommendations

1. **Fix template interpolation** in `plans-vendor_onboarding` — variables must be resolved before Mailgun send
2. **Fix ad count variable** in `plans-subscription_started` — use `plan.listings` or equivalent
3. **Translate period labels** — replace `monthly`/`yearly` with localized strings in all email templates
4. **Update test9 IMAP credentials** — either reset password or update `.env.qa.email`
