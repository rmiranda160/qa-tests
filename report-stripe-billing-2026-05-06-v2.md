# QA Report — Stripe Billing · new.zonacnc.com
**Date:** 2026-05-06 09:40–10:05 UTC  
**Focus Area:** stripe-billing  
**Tester:** test3@zonacnc.com (login) + test26/test27/test28 (IMAP email review)  
**Site:** https://new.zonacnc.com (MODO TEST banner visible)

---

## Scope
Review pricing plans, checkout flow, Stripe integration, subscription management, facturacion page, and billing email templates. Verify translations and template correctness for test7–test30 pool.

---

## Findings Summary

| # | Severity | Component | Description |
|---|----------|-----------|-------------|
| 1 | **P0** | Stripe | Payment session creation fails — Stripe not configured on test server |
| 2 | **P0** | Email | Password recovery emails not delivered for test27/test28 |
| 3 | **P0** | Email·Template | Cancellation email: "Hello Test, Your tu plan plan has been canceled" (ES/EN mix) |
| 4 | **P0** | Email·Template | Starter welcome: "Anuncios incluidos: 1" but pricing shows 3 |
| 5 | **P1** | Email·Template | "Confirmación decontraseña" subject — missing space |
| 6 | **P1** | Email·Template | Email `<title>` tags: extra spaces "  Contraseña ", "  Cuenta " |
| 7 | **P1** | Email·I18N | Cancellation email entirely in English for Spanish account |
| 8 | **P1** | Email·I18N | English onboarding sent to Spanish account, `{myads_url}` not replaced |
| 9 | **P1** | Auth | Password recovery tokens expire within ~1h |
| 10 | **P2** | UI | Breadcrumb shows only "Inicio" on pricing/checkout pages |
| 11 | **P2** | UI | Back-redirect bug: `/es/?controller=https://...` after saving billing address |
| 12 | — | Info | Pricing page complete, checkout UI well structured, all 5 plans present |
| 13 | — | Info | Mi Cuenta sidebar fully functional after vendor registration |

---

## Detailed Findings

### F1 [P0] — Stripe Payment Session Error
**Page:** `/es/pagar-plan`  
Clicking "Proceder al pago" shows alert:  
> **Error al crear la sesión de pago. Inténtalo de nuevo.**
Stripe checkout session cannot be created — likely missing API key configuration. No redirect to Stripe hosted checkout occurs.

### F2 [P0] — Password Recovery Emails Not Delivered
- Requested reset for test27@zonacnc.com: form submitted, success alert shown, **no email arrived** (checked at 09:45, 09:50 UTC).
- Requested reset for test28@zonacnc.com: same result — old inbox unchanged (6 emails, last from May 3).
- Only test26 had a fresh reset token from earlier this morning (08:35 CEST).
- **Impact:** Cannot log into test7–test30 pool accounts for billing testing.

### F3 [P0] — Cancellation Email: Broken ES/EN Mix (test26, ID=10)
```
Subject: Tu suscripción se ha cancelado
Title: Subscription Canceled
Body:  Hello Test,
       Your tu plan plan has been canceled.
       If you would like to re-subscribe, you can do so from your account dashboard.
```
- "Your tu plan plan" = nonsensical mixing of English "your" + Spanish "tu" + duplicate "plan"
- Entire body in English despite Spanish customer profile
- Title "Subscription Canceled" should be "Suscripción cancelada"

### F4 [P0] — Starter Welcome: Wrong Ad Count (test26, ID=15)
```
Subject: ¡Bienvenido a Starter! Tu suscripción está activa
Body:  - Plan: Starter
       - Anuncios incluidos: 1
```
Pricing page states Starter = **3 anuncios activos**. The email says **1**. This misleading information could cause customer confusion.

### F5 [P1] — Missing Space: "Confirmación decontraseña"
Found in inboxes of **test26** (IDs 9, 12), **test27** (ID=3), **test28** (IDs 3, 5).  
Subject reads: `[zonacnc.com] Confirmación decontraseña`  
Should be: `[zonacnc.com] Confirmación de contraseña`  
**Recurring PrestaShop template bug.** Previously reported.

### F6 [P1] — Email Title Tags: Extra Spaces
All PrestaShop transactional emails have malformed `<title>` tags:
- `<title>  Contraseña </title>` (new password email)
- `<title>  Solicitud de Contraseña </title>` (password reset confirm)
- `<title>  Cuenta </title>` (welcome email)
Leading extra spaces → unprofessional browser tab titles.

### F7 [P1] — Cancellation Email in English (test26, ID=10)
Full email content is English despite test26 having Spanish profile (`Hola QA Tester DE` in other emails). The subject is correctly Spanish, but body is fully English. Language detection logic seems inconsistent.

### F8 [P1] — English Onboarding + Broken Placeholder (test26, ID=8)
```
Subject: Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos
Title: Get started on ZonaCNC
Body:  Hello Test,
       Welcome as a seller on ZonaCNC!
       Start selling: {myads_url}
```
- Title and body in English for Spanish customer
- `{myads_url}` placeholder NOT replaced (shows literal `{myads_url}`)
- The newer email (ID=14) correctly uses Spanish template with full links

### F9 [P1] — Password Recovery Token Expiry
- test26 token from 08:35 CEST → expired by 09:55 CEST (~80 min)  
Message: "La solicitud de cambio de contraseña ha caducado. Debe solicitar una nueva."
Tokens should ideally last 24h, not <2h.

### F10 [P2] — Incomplete Breadcrumbs
On `/es/pricing`, `/es/pagar-plan`, the breadcrumb shows only "Inicio" without the full path. The Mi Cuenta sub-pages (e.g., `/es/suscripcion`, `/es/facturacion`) show correct full paths.

### F11 [P2] — Back-Redirect URL Bug
After saving billing address with `back` parameter:
- Expected: redirect to `/es/pagar-plan?plan=starter`  
- Actual: redirect to `/es/?controller=https://new.zonacnc.com/es/pagar-plan?plan=starter`  
The full URL is embedded as a query parameter instead of being decoded.

### F12 [INFO] — Pricing Page Complete
All 5 plans visible:
| Plan | Price/mo | Ads | Boost | Images | Extras |
|------|----------|-----|-------|--------|--------|
| Free | 0 € | 3 | Packs | 5 | Perfil |
| Starter | 39 € | 3 | Packs | 10 | Perfil |
| Pro | 99 € | 10 | 3/mo | 20 | Stats, CSV, Priority |
| Business | 199 € | 25 | 10/mo | 30 | Verified badge, New products |
| Enterprise | 299 € | 100 | 25/mo | 50 | Verified badge, New products |

Annual billing available (save 78 € on Starter). Monthly/annual toggle present.

### F13 [INFO] — Checkout Page Structure
- "Resumen del pedido" with plan details
- Monthly/Annual radio selectors
- "Proceder al pago" button
- Payment methods: Visa, Mastercard, AMEX, Apple Pay, Google Pay
- Stripe compliance badges: PCI-DSS Level 1
- Trust badges: Sin permanencia, Cancela cuando quieras, SSL/TLS, RGPD, Soporte en castellano
- Billing explanation text (clear and well translated)
- All text in correct Spanish

### F14 [INFO] — Subscription Management Page
After vendor registration, `/es/suscripcion` shows:
- "Free Gratuito" plan, 0 €
- Active ads: 0/3
- "Mejorar plan" link
- Mi Cuenta sidebar correctly updated: "Panel de Vendedor" replaces "Hazte Vendedor"

### F15 [INFO] — Facturacion Page
- Accessible at `/es/facturacion`
- Shows "Sin movimientos todavía" for new vendors
- "Aquí encontrarás un histórico de los pagos..." intro text well translated
- Link to subscription management present

---

## Account Status

| Account | IMAP Access | Emails | Notes |
|---------|------------|--------|-------|
| test19 | ❌ Auth failed | — | Password changed |
| test20 | ❌ Auth failed | — | Password changed |
| test23 | ❌ Auth failed | — | Password changed |
| test24 | ❌ Auth failed | — | Password changed |
| test25 | ❌ Auth failed | — | Password changed |
| test26 | ✅ Active | 15 emails | Rich billing history, both ES/EN templates |
| test27 | ✅ Active | 4 emails | Only welcome + reset from May 2–3 |
| test28 | ✅ Active | 6 emails | Old reset tokens, no new delivery |
| test29 | ❌ Auth failed | — | Password changed |
| test30 | ❌ Auth failed | — | Password changed |

---

## Test Account Blockers
Cannot perform full billing test with test7–test30 pool because:
1. Password recovery emails don't arrive (F2)
2. Can't log into any test7–test30 account to test subscription purchase
3. test3 used as workaround for UI review only

---

## Recommendations
1. **P0: Fix Stripe API configuration** — ensure `STRIPE_SECRET_KEY` is valid in test environment
2. **P0: Fix email delivery** — investigate why PrestaShop transactional emails (password recovery) don't arrive; SMTP may be misconfigured
3. **P0: Fix cancellation email template** — complete Spanish translation, remove English content, fix "tu plan plan"
4. **P0: Fix Starter welcome template** — change "Anuncios incluidos: 1" → "3" to match pricing
5. **P1: Fix email title tags** — normalize `<title>` spacing in PrestaShop email templates
6. **P1: Standardize email language detection** — ensure Spanish accounts get Spanish emails consistently
7. **P1: Fix `{myads_url}` placeholder** — ensure onboarding template variables are replaced

---

*Report generated by OpenClaw QA cron job — stripe-billing scenario*
