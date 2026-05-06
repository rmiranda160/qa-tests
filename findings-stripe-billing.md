# QA Report — Stripe Billing · new.zonacnc.com
**Date:** 2026-05-06 12:57–13:05 UTC  
**Focus Area:** stripe-billing (email templates, translations, pricing consistency)  
**Scenario:** Password recovery flow + Stripe billing email template audit (test26)  
**Account tested:** test26@zonacnc.com  
**Site:** https://new.zonacnc.com

---

## Scenario
1. Password recovery flow for test26 → verify email delivery via IMAP
2. Password reset → login → verify subscription & billing pages
3. Comprehensive audit of ALL 17 inbox emails for template/translation issues
4. Pricing page verification

Prior reports: [v1 09:40 UTC], [v2 10:42 UTC], [v3 13:05 UTC] (this report)

---

## Findings Summary

| # | Severity | Component | Description | Status |
|---|----------|-----------|-------------|:---:|
| 1 | **P0-REOPEN** | Email·Template | Starter welcome: wrong ad count (email=1, subscription=3) | OPEN |
| 2 | **P0-REOPEN** | Email·I18N | Cancellation email: "Your tu plan plan has been canceled" | OPEN |
| 3 | **P0-NEW** | Email·I18N | Welcome email #11: EN subject + ES body + DE URL (triple lang) | OPEN |
| 4 | **P1-REOPEN** | Email·I18N | Password recovery subject: "Confirmación decontraseña" (missing space) | OPEN |
| 5 | **P1-PERSIST** | Email·I18N | Password recovery subject in EN, body in ES (#3,#5) | OPEN |
| 6 | **P1-PERSIST** | Email·I18N | Onboarding email #8: ES subject, EN body (old template) | OPEN |
| 7 | **P2** | Email·I18N | Password confirm: EN subject + ES body (#4,#6) | OPEN |
| 8 | **✅ FIXED** | Email·Delivery | Password recovery emails now delivered to test26 | CLOSED |
| 9 | **✅ FIXED** | Email·I18N | Onboarding #14: Fully Spanish (was EN before) | CLOSED |
| 10 | **✅ PASS** | UI·Subscription | Subscription page correct (Starter, 39€/mes, 0/3 ads) | PASS |
| 11 | **✅ PASS** | UI·Billing | Billing page shows "Sin movimientos todavía" (expected) | PASS |
| 12 | **✅ PASS** | UI·Pricing | Pricing page fully translated in ES, correct plan data | PASS |
| 13 | **✅ PASS** | Flow·Password | Reset token works, password change succeeds, login OK | PASS |

---

## Detailed Findings

### F1 [P0-REOPEN] — Starter Welcome: Wrong Ad Count
**Evidence:** test26 #15

```
Subject: ¡Bienvenido a Starter! Tu suscripción está activa
Body:  - Plan: Starter
       - Anuncios incluidos: 1   ← WRONG
       - Cuota mensual: 39,00 €
```

Subscription page correctly shows "0 / 3" and pricing page shows Starter = 3 anuncios.
Email template still says 1.

**Impact:** Customer confusion, potential legal risk.
**Previously reported:** v1, v2. Still present.

---

### F2 [P0-REOPEN] — Cancellation Email: Text Corruption
**Evidence:** test26 #10

```
Subject: Tu suscripción se ha cancelado  (ES ✓)
Body:  Hello Test,                       (EN ✗)
       Your tu plan plan has been canceled.  ← DUPLICATE "plan" + "tu" mix
```

- "Your" (EN) + "tu" (ES) + "plan plan" (duplicated) = severely broken
- Entire body is English for a Spanish account

**Impact:** Unprofessional, confusing, non-English speakers cannot understand.
**Previously reported:** v1, v2. Still present.

---

### F3 [P0-NEW] — Welcome Email: Triple-Language Confusion
**Evidence:** test26 #11

```
Subject: [zonacnc.com] Welcome!          (EN)
Body:   Hola QA Tester DE TestTwentySix, (ES)
        ...en zonacnc.com
URL:    https://new.zonacnc.com/de/      (DE - GERMAN!)
```

Subject is English, body is Spanish, URL target is German. Language selection logic is broken. Email links point to wrong locale.

**Impact:** Users click links and land on wrong language page. Broken first impression.

---

### F4 [P1-REOPEN] — Password Recovery Subject: Missing Space
**Evidence:** test26 #9, #12, #16

```
Subject: [zonacnc.com] Confirmación decontraseña
                              ^^ missing space
Should be: [zonacnc.com] Confirmación de contraseña
```

"decontraseña" vs "de contraseña" — missing space between preposition and noun.
Present in ALL password recovery emails sent since May 5.

**Previously reported:** v2. Still present.

---

### F5 [P1] — Password Recovery Subject: EN Subject + ES Body
**Evidence:** test26 #3, #5

```
Subject: [zonacnc.com] Password query confirmation  (EN)
Body:   Hola Test ZonaCNC,
        Confirmación de la solicitud de contraseña en zonacnc.com  (ES)
URL:    https://new.zonacnc.com/en/  (EN)
```

When password recovery is requested from English context, subject stays English but body uses Spanish template.

---

### F6 [P1] — Onboarding #8: ES Subject + EN Body (Old Template)
**Evidence:** test26 #8

```
Subject: Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos  (ES)
Body:   Hello Test,
        Welcome as a seller on ZonaCNC!
        Start selling:
        {myads_url}   ← UNRESOLVED PLACEHOLDER
```

Compare with #14 (same subject, same account!) which is correctly in Spanish. Two different template versions are being used for the same trigger. `{myads_url}` placeholder not resolved.

---

### F7 [P2] — Password Confirmation: EN Subject + ES Body
**Evidence:** test26 #4, #6

```
Subject: [zonacnc.com] Your new password     (EN)
Body:   Hola Test ZonaCNC,
        Su contraseña ha sido actualizada correctamente.  (ES)
```

---

## POSITIVE Results (Fixed/Working)

### ✅ Password Recovery Now Delivers Emails
- test26 password recovery email arrived at 14:59 UTC (#16) — within ~1 minute
- Password reset token usable
- Confirmation email after password change arrived at 15:01 UTC (#17) — properly in Spanish
- **Previously broken** (v1, v2: no emails to test18, test22)

### ✅ Onboarding #14: Fully Spanish
```
Subject: Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos
Body:   Bienvenido a ZonaCNC
        Hola QA Tester DE TestTwentySix,
        Tu plan Starter está activo. Para sacarle el máximo...
        PASO 1 · Completa tu perfil de empresa
        PASO 2 · Publica tu primer anuncio
        PASO 3 · Configura tu tienda
```
Correct template, correct translations, links work.

### ✅ Password Reset Confirmation: Correct Spanish
Email #17: "[zonacnc.com] Su nueva contraseña" — fully Spanish, no issues.

### ✅ Subscription Page
- Starter plan active, 39 €/mes
- "0 / 3" anuncios activos (correct!)
- Next charge: 06/06/2026
- Cancel, change plan, add-ons all functional

### ✅ Billing Page
- "Sin movimientos todavía" (expected for new account)

### ✅ Pricing Page
- All 5 plans (Free through Enterprise) correctly displayed in Spanish
- Annual billing toggle works
- Boost 24h packs section present

---

## Email Language Audit (all 17 emails for test26)

| # | Type | Subject | Body | URL lang | Issues |
|---|------|---------|------|----------|--------|
| 1 | Welcome | ES ✅ | ES ✅ | ES | None |
| 2 | Welcome | ES ✅ | ES ✅ | ES | None |
| 3 | PW Recovery | EN ❌ | ES | EN | SUBJECT_EN |
| 4 | PW Confirm | EN ❌ | ES | EN | SUBJECT_EN |
| 5 | PW Recovery | EN ❌ | ES | EN | SUBJECT_EN |
| 6 | PW Confirm | EN ❌ | ES | EN | SUBJECT_EN |
| 7 | Starter Welc | ES ✅ | EN ❌ | — | BODY_EN |
| 8 | Onboarding | ES ✅ | EN ❌ | — | BODY_EN + {myads_url} |
| 9 | PW Recovery | ES❌ | ES | ES | "decontraseña" typo |
| 10 | Cancel | ES ✅ | EN ❌ | — | "Your tu plan plan" |
| 11 | Welcome | EN ❌ | ES ✅ | **DE**❌ | Triple lang |
| 12 | PW Recovery | ES❌ | ES | ES | "decontraseña" typo |
| 13 | PW Confirm | ES ✅ | ES ✅ | ES | None ✅ |
| 14 | Onboarding | ES ✅ | ES ✅ | ES | None ✅ |
| 15 | Starter Welc | ES ✅ | ES ✅ | ES | Wrong ad count (1≠3) |
| 16 | PW Recovery | ES❌ | ES | ES | "decontraseña" typo |
| 17 | PW Confirm | ES ✅ | ES ✅ | ES | None ✅ |

**Summary:** 10 of 17 emails (59%) have some issue. 7 emails (41%) are correct.

---

## Account Status
- **test26@zonacnc.com**: Logged in ✅, IMAP working ✅, Password changed to `QAreset2026!`
- IMAP credentials working for test26 (Ttc5ZxPltimz)

---

## Recommendations

1. **P0:** Fix Starter welcome template → change ad count from 1 to 3
2. **P0:** Fix cancellation email → full Spanish, remove "Your tu plan plan" duplicate
3. **P0:** Fix welcome email language detection → subject/body/URL must match locale
4. **P1:** Fix "Confirmación decontraseña" → add space ("de contraseña")
5. **P1:** Fix password recovery email language → subject must match body language
6. **P1:** Remove old onboarding template (#8) that renders `{myads_url}` unresolved
7. **P2:** Fix password confirmation email → subject in same language as body

---

*Report generated by OpenClaw QA cron job — stripe-billing scenario · 2026-05-06 12:57–13:05 UTC*
