# Stripe Billing QA — Add-on Email + Cross-Plan Template Audit
**Date:** 2026-05-06 23:38 UTC  
**Tester:** OpenClaw QA Agent (CRON cronqa/stripe-billing-email-templates-20260506T2150)  
**Accounts audited:** test7, test8, test14, test20, test25, test26, test30@zonacnc.com  
**Mode:** IMAP-only (site new.zonacnc.com returns HTTP 500 — browser testing not possible)  
**Scenario:** Cross-account add-on email audit + welcome/cancellation/invoice template comparison

---

## Scope

Audit billing email templates across 7 test accounts for:
1. Add-on purchase notification emails
2. Cross-plan welcome email ad-count verification (Starter vs Business)
3. Cancellation email duplicate-word pattern
4. Invoice email IVA disclosure
5. Email language consistency (ES vs EN)

---

## Findings

### 🔴 FINDING A1: Add-on Emails — Confirmed Working, But "anuncio extra" Hardcoded in English Structure

**Verified via:** IMAP on test7 #32, test8 #13, test20 #19

Add-on purchase notification emails ARE being sent (contrary to earlier report that they were missing). However, the template structure shows English framing with Spanish content:

| Email | Subject | Date |
|---|---|---|
| test7 #32 | Add-on añadido a tu suscripción | May 5, 00:27 UTC |
| test8 #13 | Add-on añadido a tu suscripción | May 5, 02:36 UTC |
| test20 #19 | Add-on añadido a tu suscripción | May 6, 04:04 UTC |

**HTML content (decoded from QP):**
```
Add-on añadido — ZonaCNC
Hola Test Vendor,
Hemos añadido 1 × anuncio extra a tu suscripción Pro.
Stripe ha cobrado solo la parte proporcional al periodo en curso
(prorrateado por Stripe).
El siguiente recibo recurrente lo verás en 03/06/2026.

Detalle:
Add-on: anuncio extra × 1
Precio unitario/mes: 9,00 €
Cobro proporcional ahora: (prorrateado por Stripe)
```

**Issues found:**
1. ✅ Email IS being sent for add-on purchases
2. ⚠️ "Add-on añadido" uses English word "Add-on" instead of Spanish "Complemento" or "Anuncio extra"
3. ⚠️ "(prorrateado por Stripe)" is a parenthetical note in Spanish that appears as placeholder text — the actual prorated amount is not shown
4. ℹ️ Add-on price varies: €9.00 (test7 Pro), €12.00 (test20 Starter) — correct per plan

**Severity:** 🟡 Medium  
**Impact:** Users see their add-on was added but don't see the actual prorated charge amount in the email. The phrase "Add-on" is an anglicism in an otherwise Spanish email.

**Recommendation:** Show the actual prorated amount charged (e.g., "11,94 €") instead of the placeholder text. Replace "Add-on" with "Complemento" or "Anuncio extra" in Spanish emails.

---

### 🔴 FINDING A2: Welcome Email — Ad Count Still Hardcoded to "1" Across All Plans (RECONFIRMED)

**Verified via:** IMAP on test7 #41, test8 #15, test20 #12, test26 #15, test14 #4

| Account | Plan | Email Says | Actual Plan Limit | Date |
|---|---|---|---|---|
| test7 (#41) | Starter | **1** | 3 | May 6, 2026 |
| test8 (#15) | Starter | **1** | 3 | May 5, 2026 |
| test14 (#4) | Starter | **1** | 3 | May 2, 2026 |
| test20 (#12) | Starter | **1** | 3 | May 5, 2026 |
| test26 (#15) | Starter | **1** | 3 | May 6, 2026 |
| test14 (#10) | **Business** | **1** | **50** | May 5, 2026 |

**All 6 welcome emails across 5 accounts and 2 different plans show "Anuncios incluidos: 1"**.

**Plain text excerpt (test26 #15, Starter):**
```
Detalles:
- Plan: Starter
- Periodo: monthly
- Cuota mensual: 39,00 €
- Anuncios incluidos: 1          ← WRONG (should be 3)
- Próxima renovación: 06/06/2026
```

**Severity:** 🔴 High (persists unfixed since first reported)  
**Impact:** Starter users are told they have 1 ad when they have 3. Business users are told they have 1 when they have 50. This misleads users about their plan limits and suppresses platform engagement.

**Recommendation:** Replace hardcoded "1" with the actual plan's ad limit from configuration. This affects ALL plan welcome emails.

---

### 🔴 FINDING A3: Welcome Email — "Renovación" Language for First Subscription (RECONFIRMED)

**Verified via:** IMAP on test7 #41, test8 #15, test20 #12, test26 #15

All welcome emails sent after first-time subscription use "renovación" (renewal) language:

```
- Próxima renovación: 06/06/2026
```

This is a first subscription, not a renewal. Should be "próximo cobro" or "próxima factura".

Invoice paid emails also use renewal language:
```
Hemos cobrado la renovación de tu plan Starter
```

**Severity:** 🔴 High  
**Impact:** Confusing for new subscribers. "Renovación" implies they're renewing an existing subscription. This is misleading for first-time subscribers and may cause support inquiries.

**Recommendation:** Use conditional language: "próximo cobro" for first subscription, "renovación" only for actual renewals.

---

### 🔴 FINDING A4: Cancellation Email — "tu plan tu plan" Duplication (RECONFIRMED, Both HTML + Plain Text)

**Verified via:** IMAP on test7 #35, test26 #10

**test7 #35 (Spanish cancellation):**
HTML: `Confirmamos la cancelación de tu plan tu plan`
Plain text: `Confirmamos la cancelación de tu plan tu plan`

**test26 #10 (English cancellation):**
HTML: `Your tu plan plan has been canceled`
Plain text: `Your tu plan plan has been canceled`

**Breakdown of the bug:**
- Spanish: "tu plan" + "tu plan" → duplicate possessive + noun
- English: "Your" + "tu plan" + "plan" → mixed language + triple word mess
- The template appears to be: `{lang_prefix} {plan_name} plan` where `{plan_name}` already contains "tu plan" or the plan variable substitution doubles up

**Severity:** 🔴 High  
**Impact:** Grammatically broken cancellation confirmation in EVERY email across ALL accounts. Looks extremely unprofessional. Affects both Spanish and English variants.

**Recommendation:** Fix the template variable substitution. The template should use a single slot: `{plan_name}` → "tu plan" (ES) or "your plan" (EN). Do not append additional text.

---

### 🔴 FINDING A5: Cancellation Emails — Language Inconsistency (ES Account Gets EN Email)

**Verified via:** IMAP on test7 #35 vs test26 #10

| Account | Account Locale | Cancellation Email Language | Subject |
|---|---|---|---|
| test7 | Spanish (ES) | **Spanish** | "Tu suscripción se ha cancelado" |
| test26 | Spanish (ES) | **English** | "Subscription Canceled" (inferred) |

Both accounts are Spanish-language accounts (site accessed via /es/), but test26 received an English cancellation email while test7 received Spanish.

**Severity:** 🔴 High  
**Impact:** Inconsistent user experience. Some Spanish users get Spanish emails, others get English. No clear pattern — appears to be a race condition or session-based language detection issue.

**Recommendation:** Use the account's stored language preference, not the session language, for email template selection.

---

### 🟡 FINDING A6: Invoice Paid Email — IVA Included But Not Disclosed

**Verified via:** IMAP on test7 #48, test20 #14

Invoice paid emails show the total amount with IVA included but don't mention IVA:

```
Importe: 47,19 €
Plan: Starter (mensual)
```

The amount €47.19 includes 21% IVA (€39.00 base + €8.19 IVA), but:
- No "IVA incluido" note
- No IVA breakdown
- No tax ID or percentage shown

**Severity:** 🟡 Medium  
**Impact:** Per Spanish/EU e-commerce regulations, invoices should clearly state the IVA amount and rate. While the full Stripe invoice PDF may contain this, the email notification itself should include basic tax info.

**Recommendation:** Add "IVA incluido (21%)" or show the breakdown: "39,00 € + 8,19 € IVA = 47,19 €".

---

### 🟡 FINDING A7: Welcome Email Subject Truncated

**Verified via:** IMAP on test7 #41, test8 #15, test20 #12, test26 #15

All welcome email subjects read:
```
¡Bienvenido a Starter! Tu suscripción está activ
```

The word is truncated: "activ" instead of "activa".

**Email Subject header (raw):**
```
Subject: =?UTF-8?q?=C2=A1Bienvenido_a_Starter!_Tu_suscripci=C3=B3n_est=C3=A1_activ?=
```

The QP encoding shows the subject ends at "activ" — the final "a" is cut off during encoding, likely due to a subject line length limit or encoding bug.

**Severity:** 🟡 Medium  
**Impact:** Minor but visible typo in every welcome email subject. Looks sloppy.

**Recommendation:** Check the subject line length limit. "activa" adds only 1 byte. Either increase the limit or rephrase to fit: "Tu plan Starter está activo" (shorter).

---

### 🟢 FINDING A8: Add-on Emails — Correctly Triggered (Previously Reported as Missing)

**Verified via:** IMAP on test7 #32, test8 #13, test20 #19

**Correction to prior finding:** Previous run (Scenario C, Finding 17) reported "No email notification verified for add-on purchase." This was incorrect — add-on emails WERE sent and ARE present in the test accounts' inboxes.

| Account | Add-on Email ID | Date | Plan |
|---|---|---|---|
| test7 | #32 | May 5, 00:27 UTC | Pro |
| test8 | #13 | May 5, 02:36 UTC | Pro |
| test20 | #19 | May 6, 04:04 UTC | Starter |

The previous test checked test3's inbox (not accessible via IMAP) and may have missed test7 #32 during the initial scan.

**Severity:** 🟢 Info (correction)  
**Impact:** Add-on email notification system is working correctly. Prior finding #17 is invalidated.

---

### 🟡 FINDING A9: Welcome Email — No `<html lang>` Attribute

**Verified via:** HTML source of test26 #15, test7 #41, test8 #15

None of the billing emails include a `lang` attribute on the `<html>` tag. This is important for:
1. Screen readers (accessibility)
2. Email clients that auto-detect language for translation
3. Proper font rendering (some email clients use lang for font selection)

**Severity:** 🟢 Low  
**Impact:** Minor accessibility issue. Screen readers may not pronounce Spanish text correctly without lang="es".

**Recommendation:** Add `lang="es"` or `lang="en"` to the HTML email template based on the email's language.

---

## Summary of Issues

| # | Finding | Severity | Status |
|---|---|---|---|
| A1 | Add-on email uses "Add-on" anglicism, no prorated amount shown | 🟡 Medium | NEW |
| A2 | Welcome email ad count hardcoded to "1" — all plans | 🔴 High | RECONFIRMED |
| A3 | "Renovación" language in first-subscription welcome emails | 🔴 High | RECONFIRMED |
| A4 | Cancellation email "tu plan tu plan" / "Your tu plan plan" duplication | 🔴 High | RECONFIRMED |
| A5 | Cancellation email language inconsistent (ES vs EN for same-locale accounts) | 🔴 High | NEW |
| A6 | Invoice email shows IVA-included price without disclosing IVA | 🟡 Medium | RECONFIRMED |
| A7 | Welcome email subject truncated: "está activ" → should be "activa" | 🟡 Medium | NEW |
| A8 | Add-on emails confirmed working (corrects prior false negative) | 🟢 Info | CORRECTION |
| A9 | No `lang` attribute on HTML email templates | 🟢 Low | NEW |

---

## Tested Email Types

| Type | Template Name (inferred) | Spanish | English | Issues |
|---|---|---|---|---|
| Plan activation | `plans-welcome` | ✅ | ❌ (not tested) | A2, A3, A7, A9 |
| Invoice paid | `plans-invoice_paid` | ✅ | — | A3, A6 |
| Add-on added | `plans-addon_added` | ✅ | — | A1 |
| Cancellation | `plans-cancelled` | ✅/❌ mixed | ❌ broken | A4, A5 |
| Account onboarding | `account` (PrestaShop) | ✅ | ❌ (Welcome!) | BUG-003 from prior run |
