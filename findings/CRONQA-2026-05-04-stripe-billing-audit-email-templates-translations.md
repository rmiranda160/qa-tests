# CRONQA Finding: Stripe Billing Audit — Email Templates, Translations & UI Review

**Date:** 2026-05-04 14:00 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Escenario:** 1/1 — ✅ Executed successfully  
**Account Used:** test9@zonacnc.com (customer 6611, Pro plan)  
**IMAP Verified:** test7@zonacnc.com (24 messages, templates reviewed)

---

## Executive Summary

Full billing flow audit completed. Logged in as test9 (Pro Activa 990€/año), verified billing pages, Stripe Elements modal, plan change UI, IMAP email templates, and English translations. Found **1 critical bug** (email template placeholders not interpolated), **2 warnings** (incorrect ad count in subscription email, mixed-language footer), and **1 account issue** (test9 IMAP credentials invalid).

---

## 1. Billing UI Verification

### 1.1 Subscription Page (`/es/module/zonacncplans/subscription`) ✅

| Check | Result |
|-------|--------|
| Plan displayed | ✅ Pro Activa — 990 €/año |
| Next billing | ✅ 03/05/2027 |
| Active ads | ✅ 1/10 |
| Invoice history | ✅ 1 completed invoice (03/05/2026, 990.00 EUR) |
| Stripe invoice link | ✅ Opens stripe.com hosted invoice |
| "Añadir método de pago" button | ✅ Present, functional |

### 1.2 Stripe Elements Modal ✅

Triggered via "Añadir método de pago" on subscription page.

| Check | Result |
|-------|--------|
| Modal title | ✅ "Actualizar método de pago" |
| Card number field | ✅ Renders (placeholder: "Credit or debit card number") |
| MM/YY field | ✅ Present |
| CVC field | ✅ Present |
| Link autofill | ✅ Available |
| Buttons | ✅ "Guardar tarjeta" / "Cancelar" |
| Stripe iframe | ✅ Properly loaded |

### 1.3 Billing/Invoice Page (`/es/module/zonacncplans/billing`) ✅

| Check | Result |
|-------|--------|
| Invoice listing | ✅ 1 invoice shown |
| Invoice details | ✅ Date: 03/05/2026, Amount: 990.00€ |
| Status | ✅ "completed" |
| PDF link | ✅ Available |
| Stripe-hosted link | ✅ Available, opens external |

### 1.4 Change Plan Page (`/es/module/zonacncplans/change`) ✅

Shows 5 plans with "Confirmar cambio" button:

| Plan | Price | Status |
|------|-------|--------|
| Free | 0€ | Available |
| Starter | 39€/mes | Available |
| Pro | 99€/mes | **ACTUAL** (current) |
| Business | 199€/mes | Available |
| Enterprise | 299€/mes | Available |

- Upgrade/downgrade rules clearly displayed
- ✅ "Confirmar cambio" submit button present
- ✅ Plan labels: "Básico"/"Profesional"/"Business"/"Enterprise"

### 1.5 English Pricing Page (`/en/pricing`) ✅ (with issues)

| Check | Result |
|-------|--------|
| Page title | ✅ "Seller Plans for Industrial Machinery \| ZonaCNC" |
| Plan names | ✅ "Free", "Starter", "Pro", "Business", "Enterprise" |
| Plan features | ✅ Properly translated (e.g., "Forever free", "active ads") |
| Pro badge | ✅ "Most popular" + "Your current plan" |
| Boost 24h section | ✅ Translated: "Boost 24h: on-demand visibility" |
| Language switcher | ✅ Shows "English" selected |
| Language suggestion banner | ✅ "Detected your country: ES. Switch to Español (Spanish)?" |

---

## 2. Email Template Review (via test7@zonacnc.com IMAP)

### 2.1 🔴 CRITICAL: Vendor Onboarding Template — Placeholder Interpolation Failure

**UID 11** | Mailgun tag: `plans-vendor_onboarding`  
**Subject:** "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"

The following template variables are sent as **literal strings** — NOT replaced with actual values:

```
{vendor_dashboard_url}
{max_listings}
{new_ad_url}
{boost_quota_monthly}
{boostpacks_url}
{messaging_url}
```

**Impact:** All 3 "pasos" (steps) in the onboarding email have broken links. The CTA buttons point to literal `{vendor_dashboard_url}` etc. instead of actual URLs. This means new subscribers get an onboarding email where every link is broken.

**Affected:** Both `text/plain` and `text/html` MIME parts  
**Severity:** 🔴 Critical — All onboarding step links are dead

### 2.2 ⚠️ WARNING: Subscription Welcome — Ad Count Mismatch

**UID 12** | Mailgun tag: `plans-subscription_started`  
**Subject:** "¡Bienvenido a Pro! Tu suscripción está activa"

| Detail | Value |
|--------|-------|
| Plan | Pro |
| Period | monthly |
| Monthly fee | 99,00 € |
| **Ads included** | **1** ⚠️ |
| Next renewal | 03/06/2026 |

**Issue:** Email says "Anuncios incluidos: 1" but the Pro plan includes **10** active ads. This is a data mismatch — the template is using a wrong or outdated variable for the ad count.

**Template rendering:** ✅ Otherwise properly formatted with clean HTML, CTA button links to subscription page.

### 2.3 ✅ Invoice Paid — Template Works Correctly

**UID 13** | Mailgun tag: `plans-invoice_paid`  
**Subject:** "Factura pagada — Tu plan sigue activo"

| Detail | Value |
|--------|-------|
| Amount | 99,73 € |
| Plan | Business (monthly) |
| Next charge | 03/06/2026 |
| Invoice PDF link | ✅ Stripe-hosted PDF URL |

**Note:** This email is for test7's historical Business plan (not current Pro). Template is properly formatted with clear invoice details, Stripe PDF download link, and professional HTML design.

**Template rendering:** ✅ Clean, well-structured HTML. CTA button "Descargar factura" links to Stripe PDF.

### 2.4 Email Template Summary

| Template | Tag | Status | Issues |
|----------|-----|--------|--------|
| Password Reset Confirm | `passwordless-confirmation` | ✅ | Clean, works |
| New Password | `passwordless-new-password` | ✅ | Clean, works |
| Vendor Onboarding | `plans-vendor_onboarding` | 🔴 | Placeholders not interpolated |
| Subscription Started | `plans-subscription_started` | ⚠️ | Ad count says 1, should be 10 |
| Invoice Paid | `plans-invoice_paid` | ✅ | Works correctly |

---

## 3. Translation Issues

### ⚠️ Mixed Language Footer on English Pages

On `/en/pricing`, the **main content** is correctly translated to English, but the **footer** contains Spanish-only links:

| Footer Section | Language |
|----------------|----------|
| "Marketplace" nav | Spanish: "Cómo funciona", "Planes para vendedores", "Preguntas frecuentes" |
| "Legal" nav | Spanish: "Aviso legal", "Politica de privacidad", "Politica de cookies" |
| "Nuestra empresa" nav | Spanish (section title is Spanish) |
| Newsletter unsub text | Spanish: "Puede darse de baja en cualquier momento..." |
| Store info | Spanish: "España" |

### ⚠️ Language Switcher on Billing Pages

On `/es/module/zonacncplans/change`, selecting "English" from the language combobox **does not redirect/refresh** to the English version of the page. The URL remains at `/es/` and content stays in Spanish. This may be a broader issue affecting module/controller pages that don't support language switching via the dropdown.

---

## 4. IMAP Access Issues

| Account | IMAP Credentials (from .env.qa.email) | Status |
|---------|--------------------------------------|--------|
| test7@zonacnc.com | 77G7YmLXuOae | ✅ Working |
| test8@zonacnc.com | FCtyMNYkhoCh | ✅ Working |
| test9@zonacnc.com | bqitk0jljx72 | ❌ AUTHENTICATIONFAILED (LOGIN + PLAIN) |

**Note:** test9's IMAP credentials from `.env.qa.email` fail authentication. This may indicate the email account was set up with different credentials than recorded, or the password was changed.

---

## 5. Account Credentials (for future CRON_QA runs)

| Account | Web Password | IMAP Password | Plan | Customer ID |
|---------|-------------|---------------|------|-------------|
| test7@zonacnc.com | ❓ Unknown | 77G7YmLXuOae | Was Business (now expired?) | ~6608 |
| test8@zonacnc.com | ❓ Unknown | FCtyMNYkhoCh | Pro (active) | 6608 |
| test9@zonacnc.com | Z0naCNC_Test9_2024!secure | ❌ bqitk0jljx72 (fails) | Pro Activa (990€/año) | 6611 |

---

## 6. Issues Summary

| # | Severity | Component | Description |
|---|----------|-----------|-------------|
| 1 | 🔴 Critical | Email Template | Vendor onboarding: `{vendor_dashboard_url}` etc. not interpolated — all step links broken |
| 2 | ⚠️ Warning | Email Template | Subscription welcome: "Anuncios incluidos: 1" should be 10 for Pro plan |
| 3 | ⚠️ Warning | Translation | Footer on `/en/pricing` has Spanish-only links and text |
| 4 | ⚠️ Low | Translation | Language switcher doesn't work on `/module/zonacncplans/change` |
| 5 | ⚠️ Low | IMAP | test9 IMAP credentials in .env.qa.email invalid |

---

## 7. What Works Well

- ✅ Stripe Elements payment method modal (iframe renders cleanly)
- ✅ Subscription management page with all details
- ✅ Invoice history with Stripe-hosted PDF links
- ✅ Change plan page with clear upgrade/downgrade rules
- ✅ Password reset flow (email delivery, reset link, confirmation)
- ✅ Invoice paid email template (clean HTML, proper Stripe invoice link)
- ✅ Subscription welcome email template (except ad count)
- ✅ SPF/DKIM/DMARC all passing for Mailgun-sent emails
- ✅ Email deliverability (IMAP confirms receipt within seconds)
