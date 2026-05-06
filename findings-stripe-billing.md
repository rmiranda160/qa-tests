# QA Report — Stripe Billing · new.zonacnc.com
**Date:** 2026-05-06 10:42–11:10 UTC  
**Focus Area:** stripe-billing (email templates, translations, pricing consistency)  
**Scenario:** Multi-account email template review + pricing page verification  
**Accounts reviewed:** test21, test22, test16, test10, test26, test8, test18  
**Site:** https://new.zonacnc.com (logged in as test3@zonacnc.com for UI)

---

## Scope
Review billing email templates, translations, plan data consistency, and password recovery flow across the test7–test30 account pool. Compare pricing page data against email template values.

---

## Findings Summary

| # | Severity | Component | Description | Cross-Account |
|---|----------|-----------|-------------|:---:|
| 1 | **P0** | Email·Template | Starter welcome: "Anuncios incluidos: 1" (pricing shows 3) | ✅ test21, test26 |
| 2 | **P0** | Email·I18N | Cancellation email: English body + "Your tu plan plan" mix | ✅ test22, test26 |
| 3 | **P0** | Email·I18N | Onboarding email: English body + `{myads_url}` unresolved | ✅ test10, test26 |
| 4 | **P0** | Email·Delivery | Password recovery emails NOT delivered to test18, test22 | ✅ test18, test22 |
| 5 | **P0** | Email·I18N | Invoice email: English body for Spanish account | ✅ test10 |
| 6 | **P1** | Email·I18N | Onboarding HTML `<title>` = "Get started on ZonaCNC" (ES subj) | ✅ test10, test26 |
| 7 | **P1** | UI·Pricing | Free plan shows "1 anuncio activo" (previous reports showed 3) | test3 |
| 8 | **P1** | Email·Delivery | Password recovery tokens expire within ~1h | ✅ test21 |
| 9 | — | Info | Pricing page well structured, all 5 plans present, annual toggle works | — |
| 10 | — | Info | Subscription page (mi cuenta) functional, correct sidebar items | test3 |

---

## Detailed Findings

### F1 [P0] — Starter Welcome: Wrong Ad Count (REGRESSION, cross-account)
**Evidence:** test21 #8, test26 #15

```
Subject: ¡Bienvenido a Starter! Tu suscripción está activa
Body:  - Plan: Starter
       - Anuncios incluidos: 1
       - Cuota mensual: 39,00 €
```

Pricing page (`/es/pricing`) clearly states Starter = **3 anuncios activos**. The email template says **1**. This creates customer confusion and potential legal risk (misrepresentation of plan benefits).

**Impact:** Customers believe they paid for only 1 ad; may complain or cancel.
**Root cause:** Email template `{active_products}` variable mapped to wrong value or hardcoded.

---

### F2 [P0] — Cancellation Email: English Body + ES/EN Language Mix (REGRESSION, cross-account)
**Evidence:** test22 #11, test26 #10

```
Subject: Tu suscripción se ha cancelado  (SPANISH ✓)
Body:  Hello QA Tester,                  (ENGLISH ✗)
       Your tu plan plan has been canceled.  (BROKEN MIX ✗)
```

- Subject is correct Spanish, but body is entirely English
- "Your tu plan plan" = nonsensical mix: English "your" + Spanish "tu" + duplicate "plan"
- Full body in English: "If you would like to re-subscribe...", "If you have any questions..."
- Both test22 (QA Tester) and test26 (QA Tester DE) are Spanish-language accounts

**Impact:** Unprofessional, confusing; non-English speakers cannot understand cancellation details.
**Previously reported:** Yes (2026-05-06 v2 F3). Still present.

---

### F3 [P0] — Onboarding Email: English Body + Unresolved Placeholder (REGRESSION, cross-account)
**Evidence:** test10 #14, test26 #8

```
Subject: Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos  (SPANISH ✓)
HTML <title>: Get started on ZonaCNC                              (ENGLISH ✗)
Body:  Hello Test,                                                (ENGLISH ✗)
       Welcome as a seller on ZonaCNC!
       Start selling:
       {myads_url}                                                (BROKEN ✗)
```

- Title and body are fully English despite Spanish account
- `{myads_url}` placeholder is NOT replaced — shows literal text `{myads_url}`
- Newer emails (test26 #14) correctly use Spanish template → template selection is inconsistent

**Impact:** Broken UX for new sellers; broken link means they can't start selling.
**Previously reported:** Yes (2026-05-06 v2 F8). Still present.

---

### F4 [P0] — Password Recovery Emails Not Delivered (REGRESSION)
**Evidence:** 
- Requested password reset for test18@zonacnc.com at 10:50 UTC → no email arrived (inbox still 4 emails, oldest from May 3)
- Requested password reset for test22@zonacnc.com at 10:53 UTC → no email arrived (inbox still 11 emails, last from May 5)
- test21 received reset confirmation at 10:45 UTC but the reset token expired within minutes
- test3 used as workaround for UI review only

**Impact:** Cannot log into test7–test30 pool accounts for billing testing; customers locked out.
**Previously reported:** Yes (2026-05-06 v2 F2). Still present, worsening.

---

### F5 [P0] — Invoice Email: English Body for Spanish Account (REGRESSION)
**Evidence:** test10 #15

```
Subject: Factura pagada — Tu plan sigue activo     (SPANISH ✓)
Body:  Hello Test,                                  (ENGLISH ✗)
       We have charged the renewal of your Starter plan. Your subscription remains
       active until 06/06/2026.
       - Amount: 39,00 €
       - Plan: Starter (monthly)
       - Next charge: 06/06/2026
       ...
       Thank you
```

- Subject correctly Spanish, but entire body is English
- Compare with test21 #10: same subject, but body IS Spanish → **template selection is inconsistent**

**Impact:** Non-English-speaking customers cannot understand their billing details.

---

### F6 [P1] — Onboarding HTML `<title>` Tag: English for Spanish Email
**Evidence:** test10 #14, test26 #8
- `<title>Get started on ZonaCNC</title>` 
- Should be: `<title>Empieza con buen pie en ZonaCNC</title>`
- The email subject and most UI text is Spanish, but the browser tab title is English

**Impact:** Minor but unprofessional; visible when viewing email in browser tab.

---

### F7 [P1] — Free Plan: "1 anuncio activo" vs Previous Reports Showing 3
**Evidence:** Pricing page `/es/pricing` and subscription page `/es/suscripcion`

Current pricing page shows:
- Free: **1 anuncio activo**, 5 imágenes/anuncio
- Starter: **3 anuncios activos**, 10 imágenes/anuncio

Previous QA report (2026-05-06 v2 F12) listed Free = 3 anuncios. This could be:
1. A deliberate plan change (Free was reduced from 3→1)
2. A UI regression/bug

Either way, this needs clarification.

**Impact:** If deliberate, needs changelog. If bug, customers see wrong limits.

---

### F8 [P1] — Password Recovery Token Expiry <1h
**Evidence:** test21 reset token from 10:45 UTC expired by 10:50 UTC (~5 min)
Message: "La solicitud de cambio de contraseña ha caducado."
**Previously reported:** Yes (2026-05-06 v2 F9). Still present.

---

## Email Template Language Summary

| Account | # | Type | Subject Lang | Body Lang | Issues |
|---------|---|------|-------------|-----------|--------|
| test21 | 8 | Starter welcome | ES ✅ | ES ✅ | Wrong ad count: 1≠3 |
| test21 | 9 | Onboarding | ES ✅ | ES ✅ | None |
| test21 | 10 | Invoice paid | ES ✅ | ES ✅ | None |
| test22 | 11 | Cancellation | ES ✅ | EN ✗ | "Your tu plan plan" |
| test10 | 14 | Onboarding | ES ✅ | EN ✗ | `{myads_url}` unresolved |
| test10 | 15 | Invoice paid | ES ✅ | EN ✗ | Full EN body |
| test26 | 8 | Onboarding | ES ✅ | EN ✗ | `{myads_url}` unresolved |
| test26 | 10 | Cancellation | ES ✅ | EN ✗ | "Your tu plan plan" |
| test26 | 15 | Starter welcome | ES ✅ | ES ✅ | Wrong ad count: 1≠3 |

**Pattern:** 4 of 9 billing emails (44%) have wrong language for Spanish accounts. Onboarding and cancellation templates are consistently affected.

---

## Pricing Page Verification

| Plan | Price/mo | Ads | Images | Verified |
|------|----------|-----|--------|:---:|
| Free | 0 € | 1 | 5 | ✅ |
| Starter | 39 € | 3 | 10 | ✅ |
| Pro | 99 € | 10 | 20 | ✅ |
| Business | 199 € | 25 | 30 | ✅ |
| Enterprise | 299 € | 100 | 50 | ✅ |

Annual billing toggle available (save 78 € on Starter).

---

## Account Status (IMAP)

All test7–test30 accounts have working IMAP access (24/24 verified ✅). Unlike previous report where 9 accounts failed auth, all passwords are now functional.

**Critical blocker:** Password recovery emails NOT delivered → cannot log into any test7–test30 account to test actual billing/checkout flow.

---

## Recommendations

1. **P0:** Fix Starter welcome email template → change "Anuncios incluidos: 1" → "3"
2. **P0:** Fix cancellation email → full Spanish translation, remove "Your tu plan plan" mix
3. **P0:** Fix onboarding email → render `{myads_url}` variable, use Spanish template
4. **P0:** Fix password recovery email delivery (SMTP/Mailgun misconfiguration)
5. **P0:** Fix invoice email language detection → Spanish accounts must get Spanish emails
6. **P1:** Fix onboarding HTML `<title>` → use Spanish "Empieza con buen pie en ZonaCNC"
7. **P1:** Clarify Free plan ad count (1 vs 3) — if deliberate change, document; if bug, fix
8. **P1:** Increase password reset token lifespan from <1h to 24h

---

*Report generated by OpenClaw QA cron job — stripe-billing scenario · 2026-05-06 10:42–11:10 UTC*
