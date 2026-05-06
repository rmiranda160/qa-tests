# CRON QA Finding — Stripe Billing Email Templates · 2026-05-06

**Focus Area:** stripe-billing  
**Site:** https://new.zonacnc.com (MODO TEST)  
**Cron ID:** f88c723f-9d7c-485a-b506-55f4e41efab3  
**Time:** 2026-05-06 21:36–22:00 UTC  
**Pool:** test7–test30@zonacnc.com  
**Accounts scanned:** test7, test8, test10, test16, test21, test22, test26 (IMAP)  
**Auth:** Unable to log into any test7-test30 account (password unknown, recovery emails not delivered)  

---

## Summary

Comprehensive IMAP email template scan across 7 accounts (49+ emails each, ~220 emails total). 33 individual template/translation issues identified, grouped into 7 root-cause bugs.

---

## Findings

| # | Severity | Component | Description | Accounts Affected |
|---|----------|-----------|-------------|-------------------|
| 1 | **P0** | Email·Template | **ALL plan welcome emails show "Anuncios incluidos: 1"** regardless of actual plan limits (Starter=3, Pro=10, Business=25, Enterprise=100). This is a single hardcoded value in the template. | ALL 7 accounts |
| 2 | **P0** | Email·Template | **Onboarding email (ES): 6 unresolved placeholders** — `{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, `{boostpacks_url}` rendered as literal text. | test7, test8, test16, test21, test22 |
| 3 | **P0** | Email·Template | **Onboarding email (EN): `{myads_url}` placeholder not replaced**. Also entire email in English despite Spanish profile. | test7, test10, test26 |
| 4 | **P0** | Email·I18N | **Cancellation email: "Your tu plan plan has been canceled"** — broken ES/EN mix + duplicate "plan" word. Full English body with Spanish subject. | test10, test21, test22, test26 |
| 5 | **P1** | Email·I18N | **English emails sent to Spanish accounts** — Starter welcome, onboarding, invoice, and cancellation emails delivered in English despite Spanish-language profile (ES greeting "Hola" in other emails). | test7, test10, test21, test26 |
| 6 | **P1** | Email·Template | **Invoice emails missing IVA/VAT mention** — "Factura pagada" emails contain amounts but never mention tax breakdown. All amounts are final totals without IVA detail. | ALL accounts with invoices |
| 7 | **P0** | Auth·Email | **Password recovery emails NOT delivered** — Triggered password reset for test7@zonacnc.com at 21:41 UTC. Checked IMAP at 21:45, 21:50 UTC — no new email arrived. Confirmed with existing 49 emails (last was "Mensaje de prueba" from 22:13 CEST). | test7 (new attempt) |
| 8 | **P1** | Auth | **Password reset tokens expire in <4 hours** — Tokens from 18:48 CEST already expired at 21:44 UTC. Error: "La solicitud de cambio de contraseña ha caducado." | test7, test8 |

---

## Detailed Evidence

### F1 [P0] — Wrong Ad Count in ALL Plan Welcome Emails

**Pricing page (CORRECT):**
| Plan | Anuncios activos |
|------|-----------------|
| Free | 1 |
| Starter | 3 |
| Pro | 10 |
| Business | 25 |
| Enterprise | 100 |

**Email template (WRONG — always "1"):**

- test7 #12 (Pro): "Anuncios incluidos: 1" ← should be 10
- test7 #29 (Starter): "Anuncios incluidos: 1" ← should be 3
- test8 #4 (Pro): "Anuncios incluidos: 1" ← should be 10
- test16 #11 (Enterprise): "Anuncios incluidos: 1" ← should be 100
- test21 #3 (Enterprise): "Anuncios incluidos: 1" ← should be 100
- test10 #13 (Starter, EN): "Ads included: 1" ← should be 3
- test26 #15 (Starter): "Anuncios incluidos: 1" ← should be 3

**Impact:** EVERY plan welcome email is misleading. A Business customer (25 ads) receives an email saying "1 ad included". This is a single hardcoded `1` in the subscription activation email template, not using the plan's actual `max_listings` value.

### F2 [P0] — Onboarding Email: 6 Unresolved Placeholders (ES)

From test7 #11, test8 #3, test16 #8, test21 #4, test22 #7:
```
Tu plan Pro está activo. Para sacarle el máximo desde el
primer día, aquí tienes 3 pasos rápidos (10 minutos en total):

1. Crea tu primer anuncio → {new_ad_url}
   Puedes tener hasta {max_listings} anuncios activos
2. Completa tu perfil de vendedor → {vendor_dashboard_url}
3. Activa tus mensajes → {messaging_url}
   Tienes {boost_quota_monthly} Boosts este mes → {boostpacks_url}
```

All 6 template variables (`{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, `{boostpacks_url}`) are rendered as literal text. Variables are not being replaced with actual values/URLs.

### F3 [P0] — Onboarding Email (EN): `{myads_url}` + Wrong Language

From test7 #42, test10 #14, test26 #8:
```
Subject: Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos
HTML Title: Get started on ZonaCNC
Body: Hello Test,
      Welcome as a seller on ZonaCNC!
      ...
      Start selling: {myads_url}
```

Three issues in ONE email:
1. English title/body for Spanish customer
2. `{myads_url}` placeholder rendered as literal
3. Subject is Spanish but content is English — inconsistent language

### F4 [P0] — Cancellation Email: Broken ES/EN Mix

From test10 #11, test21 #6, test22 #11, test26 #10:
```
Subject: Tu suscripción se ha cancelado
Body: Hello Test,
      Your tu plan plan has been canceled.
      If you would like to re-subscribe, you can do so from your account dashboard.
```

Issues:
- "Your tu plan plan" — English "your" + Spanish "tu" + duplicate "plan"
- Three languages mixed: ES subject, mixed ES/EN body, "plan" duplicated
- Entire cancellation body is in English despite ES customer context

### F5 [P1] — English Emails for Spanish Accounts

Accounts with Spanish names/profiles yet receive English billing emails:

| Account | Name | Email type | Lang |
|---------|------|-----------|------|
| test7 | Test Vendor → "Test" | Starter welcome | EN |
| test7 | Test Vendor | Onboarding | EN |
| test10 | Test | Starter welcome | EN |
| test10 | Test | Invoice paid | EN |
| test10 | Test | Onboarding | EN |
| test21 | QA Tester Stripe | Cancellation | EN |
| test26 | QA Tester DE | Starter welcome | EN |
| test26 | QA Tester DE | Onboarding | EN |
| test26 | QA Tester DE | Cancellation | EN |

Language detection logic appears to fall back to English randomly.

### F6 [P1] — Invoice Emails: No IVA/VAT Mention

All 7 "Factura pagada" emails reviewed across accounts show amounts without tax breakdown:
- test7 #13: "Importe: 99,73 €" — no IVA
- test7 #31: "Importe: 30,07 €" — no IVA
- test7 #48: "Importe: 47,19 €" — no IVA
- test8 #14: "Importe: 8,25 €" — no IVA
- test10 #15: "Amount: 39,00 €" — no VAT
- test16 #12: "Importe: 299,00 €" — no IVA
- test21 #10: "Importe: 39,00 €" — no IVA

The pricing page correctly shows "+ IVA (21%)", but the invoice emails omit any tax reference.

### F7/F8 [P0/P1] — Password Recovery Broken

**F7:** Password recovery form submitted for test7@zonacnc.com at 21:41 UTC → no email arrived within 10 minutes. This blocks ALL test7-test30 accounts from being used for authenticated testing.

**F8:** Existing tokens from earlier today (18:48 CEST) already expired by 21:44 UTC (~4h). PrestaShop error: "La solicitud de cambio de contraseña ha caducado."

---

## Pricing Page Verification ✅

Visited `/es/module/zonacncplans/pricing` — all plans render correctly:
- Free: 0€, 1 ad, 5 images
- Starter: 39€/mo, 3 ads, 10 images  
- Pro: 99€/mo, 10 ads, 20 images, 3 boosts/mo
- Business: 199€/mo, 25 ads, 30 images, 10 boosts/mo
- Enterprise: 299€/mo, 100 ads, 50 images, 25 boosts/mo
- Annual billing toggle present
- Add-ons configurable (extra ads per plan)
- Trust badges: Sin permanencia, Cancela cuando quieras, SSL/TLS, RGPD, Soporte
- IVA (21%) clearly indicated on paid plans

---

## Checkout Flow

`/es/pagar-plan?plan=starter` correctly redirects to login (`/es/iniciar-sesion`) when unauthenticated. No errors in redirect.

---

## Console Errors (Non-blocking)

- `Not signed in with the identity provider` — Google Sign-In not configured (expected in test)
- `Unexpected token '&'` — JS parse error (previously reported, low impact)
- `FedCM get() rejects with NetworkError` — Google FedCM (expected without Google session)

---

## Recommendations

1. **Fix welcome email template** — Replace hardcoded `1` with `{max_listings}` variable to reflect actual plan limit
2. **Fix onboarding email (ES)** — Ensure all 6 template variables are properly replaced with actual URLs/values
3. **Fix onboarding email (EN)** — Replace `{myads_url}` and align language with customer profile
4. **Fix cancellation email** — Complete Spanish translation, remove "Your tu plan plan" text
5. **Fix email language detection** — Ensure emails match customer's profile language/context
6. **Fix invoice emails** — Add IVA/VAT breakdown to match pricing page
7. **Fix email delivery (SMTP)** — Investigate why password recovery emails don't arrive
8. **Fix token TTL** — Extend password reset token validity to 24h (currently <4h)
