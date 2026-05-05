# CRONQA Finding: Stripe Billing — Translation & Email Template Bugs

**Date:** 2026-05-05 01:40 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Scenario:** 1/1 — ✅ Executed successfully  
**Account Used:** test10@zonacnc.com (customer 6617, Starter Activa 39€/mes)  
**IMAP Verified:** test10@zonacnc.com (10 messages, UIDs 1-10 inspected)

---

## Executive Summary

Verified subscription, billing, and cambio-plan pages on test10 account. Checked all 9 email UIDs (before today's password reset). **Found 1 new regression** (subscription module untranslated on English view) + **confirmed 2 known bugs** still present (period translation, ad count mismatch).

---

## 1. Bug Findings

### 🔴 BUG-1 (NEW REGRESSION): Subscription Module — Content Stays in Spanish on English View

**Severity:** Medium  
**Pages affected:**
- `/en/module/zonacncplans/subscription`
- `/en/cambiar-plan`
- `/en/facturacion` (likely)

**Observation:** When switching site language to English, the site chrome (header, sidebar, footer) properly translates. However, the subscription module content — including page headings, breadcrumbs, plan details, payment section, cancel section, and add-on section — **all remain in Spanish**.

**Spanish text visible on English page:**

| Element | English page shows (Spanish) | Expected (English) |
|---------|------------------------------|---------------------|
| Page title | "Cambiar plan — ZonaCNC" | "Change plan — ZonaCNC" |
| Breadcrumb | "Mi cuenta / Mi suscripción" | "My Account / My subscription" |
| H1 heading | "Mi suscripción" | "My subscription" |
| Plan status | "Activa" | "Active" |
| Next billing | "Próximo cobro:" | "Next payment:" |
| Listings | "Anuncios activos" | "Active listings" |
| Limit warning | "Has alcanzado el límite..." | "You have reached the limit..." |
| Upgrade link | "Mejora tu plan" | "Upgrade your plan" |
| Change link | "Cambiar de plan" | "Change plan" |
| Payment heading | "Método de pago" | "Payment method" |
| No method saved | "No hay método de pago guardado..." | "No payment method saved..." |
| Cancel section | "Suscripción" + "Puedes cancelar..." | "Subscription" + "You can cancel..." |
| Add-on section | "Añadir add-on a tu plan" | "Add add-on to your plan" |
| Add-on desc | "Se añade sobre tu suscripción..." | "Added on top of your subscription..." |
| Extra listing | "Anuncio extra" | "Extra listing" |

**Root cause:** The `zonacncplans` module appears to use the user's account language preference (stored in DB) rather than the page language when rendering its templates. All module content renders in the user's preferred language (es) regardless of the `id_lang` URL parameter.

**Evidence:** Screenshot `subscription-en-spanish.png` shows English URL with Spanish subscription content.

---

### ⚠️ BUG-2 (CONFIRMED — STILL PRESENT): "Periodo: monthly" Not Translated

**Severity:** Low  
**Source:** test10 IMAP UID 8 — Mailgun tag `plans-subscription_started`  
**Subject:** "¡Bienvenido a Starter! Tu suscripción está activa"  
**Date:** Mon, 04 May 2026 16:37:55 UTC

| Detail | Expected | Actual |
|--------|----------|--------|
| Periodo | "mensual" | "monthly" |

Plain-text and HTML versions both show `Periodo: monthly` in the subscription details block:

```
Plan: Starter
Periodo: monthly          ← UNTRANSLATED
Cuota mensual: 39,00 €
Anuncios incluidos: 1
Próxima renovación: 04/06/2026
```

**Status:** ❌ NOT FIXED — Previously reported in CRONQA-2026-05-03-stripe-billing-template-subs-regression.md and CRONQA-2026-05-04T15-stripe-billing-verify-bugs.md.

---

### ⚠️ BUG-3 (CONFIRMED — STILL PRESENT): "Anuncios incluidos: 1" — Wrong Ad Count

**Severity:** Medium  
**Source:** test10 IMAP UID 8 — same email as BUG-2

| Detail | Expected | Actual |
|--------|----------|--------|
| Anuncios incluidos | 3 (Starter plan) | 1 |

The Starter plan includes **3 active listings** (confirmed on subscription page showing "3 / 3"), but the welcome email reports only **"Anuncios incluidos: 1"**. This miscommunicates plan benefits to customers.

Note: The onboarding email (UID 7, Mailgun tag `plans-vendor_onboarding`) correctly says "Tu plan Starter permite hasta 3 anuncios activos" — so the bug is specific to the `plans-subscription_started` template.

**Status:** ❌ NOT FIXED — Previously reported in CRONQA-2026-05-03-stripe-billing-template-subs-regression.md and CRONQA-2026-05-04T15-stripe-billing-verify-bugs.md.

---

## 2. What Was Verified (No Issues Found)

| Check | Result |
|-------|--------|
| Subscription page load (ES) | ✅ OK |
| Subscription page load (EN) | ❌ Translation issue (BUG-1) |
| Cambiar de plan page (ES) | ✅ OK — plans, pricing, upgrade/downgrade info correct |
| Cambiar de plan page (EN) | ❌ Same translation issue |
| Facturas y pagos (ES) | ✅ OK — "Sin movimientos todavía" message correct |
| IMAP — Onboarding email (UID 7) | ✅ OK — All links functional, correct ad count (3), clean templates |
| IMAP — Subscription welcome (UID 8) | ❌ BUG-2 + BUG-3 |
| IMAP — Password reset flow (UIDs 9-10) | ✅ OK |
| Login flow | ✅ OK — Password reset worked, logged in successfully |
| Plan details — Starter | ✅ OK — 3/3 ads, 39€/mes, next billing 04/06/2026 |
| Payment method section | ✅ OK — "No hay método de pago guardado" displayed correctly |
| Cancel subscription button | ✅ Visible — "Cancelar al final del período" |
| Add-on section | ✅ "Anuncio extra 12€/mes" with quantity spinner |

---

## 3. Comparison with Previous Reports

| Bug | Previous Report | Today Status |
|-----|----------------|--------------|
| "Periodo: monthly" | CRONQA-2026-05-03 template-subs-regression | ❌ Still present |
| "Anuncios incluidos: 1" | CRONQA-2026-05-03 template-subs-regression | ❌ Still present |
| Template placeholders not parsed | CRONQA-2026-05-03 template-subs-regression (UID 11, onboarding email) | ✅ **NOT found in test10 onboarding (UID 7)** — template rendered correctly with all links populated |
| Subscription English i18n | — | 🆕 NEW regression (BUG-1) |

---

## 4. Account State — test10@zonacnc.com

```
Customer ID: 6617
Plan: Starter (Activa)
Monthly: 39,00 €
Active listings: 3/3 (maxed)
Next billing: 04/06/2026
Payment method: Not saved
Emails (UIDs): 1=welcome, 2=welcome, 3-6=password resets, 7=onboarding, 8=subscription, 9-10=password resets
```

---

## 5. Recommendations

1. **BUG-1 (NEW):** Make `zonacncplans` module respect the `id_lang` URL parameter instead of user's account language. Use `$this->context->language->id` instead of `$customer->id_lang` in module controllers.

2. **BUG-2 (KNOWN):** Fix the `plans-subscription_started` Mailgun template to use `{period_label}` translated variable instead of hardcoded `monthly` string.

3. **BUG-3 (KNOWN):** Fix the `plans-subscription_started` Mailgun template to use `{max_listings}` variable instead of hardcoded `1`.
