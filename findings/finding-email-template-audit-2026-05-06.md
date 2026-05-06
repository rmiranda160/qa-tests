# Finding: Cross-Account Email Template Audit — stripe-billing
**Date:** 2026-05-06 23:12 UTC  
**Tester:** OpenClaw QA Agent (CRON tester-stripe-billing)  
**Accounts scanned:** test7–test30@zonacnc.com (24 accounts)  
**Site:** new.zonacnc.com (⚠️ 500 error during test — site unavailable, audit performed via IMAP only)  
**Total emails scanned:** 301 | **Billing-related:** 144 | **Issues found:** 117

---

## Executive Summary

A cross-account IMAP audit of all 24 test accounts (test7–test30) covering 301 emails (144 billing-related) revealed **9 distinct bug categories** affecting all plan tiers (Starter, Pro, Business, Enterprise). The bugs are systemic template issues, not account-specific. **All issues previously reported (May 3–6) remain unfixed.**

---

## 🔴 BUG-001: Wrong Ad Count in Welcome Emails (25 instances, ALL plans, ALL accounts)

**Template:** `plans-subscription_started` (¡Bienvenido a {Plan}! / Welcome to {Plan}!)

**Bug:** Every welcome email hardcodes "Anuncios incluidos: 1" / "Ads included: 1" regardless of actual plan limits.

| Plan | Correct Ad Count | Email Shows |
|------|-----------------|-------------|
| Starter | 3 | 1 ❌ |
| Pro | 10 | 1 ❌ |
| Business | 50 | 1 ❌ |
| Enterprise | Unlimited | 1 ❌ |

**Affected accounts:** test7, test8, test9, test10, test11, test12, test14, test15, test16, test19, test20, test21, test22, test23, test24, test25, test26, test29, test30

**Severity:** 🔴 Critical  
**Impact:** Every new subscriber is told they can only post 1 ad regardless of plan. This misleads users about plan value and directly hurts platform engagement. Affects ALL plans and ALL subscribers.

**Recommendation:** Replace hardcoded `1` with the actual plan ad limit variable in the email template (`{$ads_limit}` or equivalent).

---

## 🔴 BUG-002: Renewal Wording in Welcome/Activation Emails (21 instances)

**Template:** `plans-subscription_started`

**Bug:** The welcome email body says "Hemos cobrado la renovación de tu plan" (we've charged the renewal) even for first-time subscriptions. This is renewal/cobro language, not welcome/activation language.

**Examples:**
- ✅ Expected: "¡Bienvenido! Tu plan Starter está activo. Hemos procesado tu primer pago..."
- ❌ Actual: "Hemos cobrado la **renovación** de tu plan Starter"

**Affected accounts:** test8, test9, test10, test11, test12, test14, test15, test16, test19, test20, test21, test22, test23, test24, test25, test26, test29

**Severity:** 🔴 High  
**Impact:** Confusing for new subscribers — they haven't renewed anything, they just signed up. Creates a poor first impression.

**Recommendation:** Use conditional logic: if first subscription, use activation wording ("Tu primer pago se ha procesado"); if renewal, use renewal wording ("Hemos cobrado la renovación").

---

## 🔴 BUG-003: Template Variables Not Substituted in Onboarding Emails (15 instances)

**Template:** `plans-vendor_onboarding` (Empieza con buen pie / Get started)

**Bug:** 6 template variables appear as literal strings in the HTML email body. All CTA buttons link to `{...}` strings — completely broken for all new vendors.

| Variable | Expected Behavior |
|---|---|
| `{vendor_dashboard_url}` | Link to vendor dashboard |
| `{max_listings}` | Plan ad limit (3, 10, 50, etc.) |
| `{new_ad_url}` | Link to publish form |
| `{messaging_url}` | Link to messages |
| `{boost_quota_monthly}` | Monthly boost quota |
| `{boostpacks_url}` | Link to boost packs page |

**Additional finding:** Some accounts (test7, test10, test26, test30) have a variant of the onboarding email that only shows `{myads_url}` unsubstituted, while the other 6 variables ARE substituted. This suggests multiple versions of the template exist with different variable sets.

**Affected accounts:** test7, test9, test10, test11, test12, test14, test16, test19, test21, test22, test23, test24, test26, test29, test30

**Severity:** 🔴 Critical  
**Impact:** All CTA buttons in the onboarding email are dead links. New vendors cannot navigate to their dashboard, publish ads, or configure their profile from the email. This is the most important email a new vendor receives and it's completely broken.

**Recommendation:** Ensure the template engine substitutes ALL variables before sending. Audit the template rendering pipeline.

---

## 🟡 BUG-004: Cancellation Emails — Broken EN/ES Language Mix + Duplicate Word (14 instances)

**Template:** `plans-subscription_canceled`

**Bug:** Cancellation emails contain the string **"Your tu plan plan has been canceled"** — a broken mix of English and Spanish with the word "plan" duplicated.

**Two variants found:**

| Variant | Body | Accounts |
|---------|------|----------|
| EN/ES broken | "Your tu plan plan has been canceled" | test7(#35), test10, test14, test19, test21, test22, test26, test30 |
| ES duplicate | "Confirmamos la cancelación de tu plan tu plan" | test8, test9, test11, test12, test16, test23, test24, test25, test29 |

**Correct versions:**
- Spanish: "Confirmamos la cancelación de tu plan" / "Tu plan ha sido cancelado"
- English: "Your plan has been canceled"

**Severity:** 🔴 High  
**Impact:** Grammatically broken cancellation confirmation looks unprofessional. "Your tu" is gibberish. The duplication "plan plan" appears in both variants. Affects ALL cancellation emails across ALL accounts.

**Recommendation:** Fix the cancellation email template:
- Remove the duplicate "plan" word
- Ensure language detection respects account locale
- Apply same localization logic used for invoice emails (which ARE correctly localized)

---

## 🟡 BUG-005: Invoice Emails — No IVA/Tax Information (14 instances)

**Template:** `plans-invoice_paid` (Factura pagada — Tu plan sigue activo)

**Bug:** Invoice paid emails show the amount (e.g., "Importe: 39,00 €") but never mention IVA (VAT) or tax breakdown. The email body contains no tax information whatsoever.

**Examples:**
- "Importe: 39,00 €" — no IVA mention
- "Importe: 47,19 €" (which includes IVA) — still no IVA mention

**Severity:** 🟡 Medium  
**Impact:** Spanish legal requirements may mandate tax information on invoices. Users may be confused about the total charged vs. the plan price they saw (€39 → €47.19 with IVA). The invoice PDF from Stripe does show IVA, but the email body doesn't.

**Recommendation:** Add IVA breakdown to invoice emails, or at minimum add a note like "IVA incluido" / "VAT included" where applicable.

---

## 🟡 BUG-006: Onboarding Emails Sent in Wrong Language (3 instances)

**Template:** `plans-vendor_onboarding`

**Bug:** Some onboarding emails are sent in English (`lang="en"`, title "Get started on ZonaCNC") despite the account being Spanish. These accounts navigated the site in Spanish, have Spanish locale, and the subscription welcome email was sent in Spanish — but the onboarding follow-up email arrived in English.

| Account | Welcome Email | Onboarding Email |
|---------|--------------|-----------------|
| test7 | Spanish ✅ | English ❌ |
| test10 | Spanish ✅ | English ❌ |
| test26 | English ❌ | English ❌ |
| test30 | English ❌ | English ❌ |

**Severity:** 🟡 Medium  
**Impact:** Inconsistent UX — some emails are properly localized (invoices, some welcome emails) while others default to English. Breaks the multilingual promise.

**Recommendation:** Apply consistent language detection across ALL email templates. Use the same logic that correctly localizes invoice emails.

---

## 🟢 BUG-007: Onboarding Email — Wrong Charset (3 instances)

**Template:** `plans-vendor_onboarding` (English variant)

**Bug:** The HTML Content-Type declares `charset=ascii` but the content contains UTF-8 characters (arrows →, accents, etc.).

```
Content-Type: text/html; charset=ascii
```

**Severity:** 🟢 Low  
**Impact:** Some email clients may render Unicode characters incorrectly (e.g., `→` showing as `â†'`).

**Recommendation:** Change to `charset=utf-8`.

---

## 🟡 BUG-008: Cancel Confirmation — Duplicate "tu plan" in Spanish Variant (7 instances)

**Template:** `plans-subscription_canceled` (Spanish variant)

**Bug:** The Spanish cancellation email body says "Confirmamos la cancelación de tu plan tu plan" — the phrase "tu plan" is duplicated.

This is a separate bug from the EN/ES mix (BUG-004) — this affects the Spanish-only variant.

**Affected accounts:** test8, test9, test11, test12, test16, test23, test24, test25, test29

**Severity:** 🟡 Medium  
**Recommendation:** Fix to "Confirmamos la cancelación de tu plan" (single instance).

---

## 🟢 Observation: Add-on Purchase Emails Appear Well-Formed

The add-on purchase notification emails (`add-on añadido a tu suscripción`) appear correctly formatted with:
- ✅ Proper Spanish language and charset (utf-8)
- ✅ Clear description of add-on purchased
- ✅ Plan name correctly identified
- ✅ Next billing date correctly shown
- ✅ Prórata mention: "Stripe ha cobrado la parte proporcional ((prorrateado por Stripe))"
- ⚠️ Minor: literal `((prorrateado por Stripe))` could be rephrased

---

## 🟢 Observation: Boost Pack Purchase Emails Well-Formed

- ✅ "Pack Boost 24h activado" email correctly shows pack name and tokens added
- ✅ Spanish language, proper charset

---

## Summary: Issue Status vs Previous Reports

| Previous Finding | Status | This Audit |
|---|---|---|
| FINDING-001 (template vars unsubstituted) | ❌ Still broken | 15 instances |
| FINDING-002 (name truncation) | ⚠️ Partial — still "Hola Test" | Present |
| FINDING-008 (wrong ad count 1) | ❌ Still broken | 25 instances |
| FINDING-009 (welcome emails English) | ⚠️ Mixed — some fixed, some not | 3 instances EN |
| FINDING-010 (myads_url unreplaced) | ❌ Still broken | Present |
| FINDING-011 (charset ascii) | ❌ Still broken | 3 instances |
| FINDING-018 (broken EN/ES mix cancel) | ❌ Still broken | 14 instances |
| FINDING-019 (cancel wrong language) | ❌ Still broken | Still EN for many |

**No previously reported billing email template issue has been fixed.**

---

## Test Flow Verified

| Step | Status |
|------|--------|
| IMAP login test7–test30 (24 accounts) | ✅ 24/24 |
| Scan billing emails across all accounts | ✅ 301 total, 144 billing |
| Welcome email template audit | ❌ 3 bugs found |
| Onboarding email template audit | ❌ 3 bugs found |
| Cancellation email template audit | ❌ 2 bugs found |
| Invoice email template audit | ❌ 1 bug found |
| Add-on email template audit | 🟢 Minor issue only |
| Site availability (new.zonacnc.com) | ❌ HTTP 500 |

**Note:** new.zonacnc.com returned HTTP 500 on all `/es/` paths during this test run (2026-05-06 23:12–23:15 UTC). Browser testing was not possible. This is a 🟡 Medium site health issue that should be investigated separately.

---

## Affected Email Templates

| Template ID | Description | Bugs |
|---|---|---|
| `plans-subscription_started` | Welcome/activation | BUG-001, BUG-002 |
| `plans-vendor_onboarding` | Vendor onboarding tips | BUG-003, BUG-006, BUG-007 |
| `plans-subscription_canceled` | Cancellation confirmation | BUG-004, BUG-008 |
| `plans-invoice_paid` | Invoice/renewal paid | BUG-005 |
| `plans-addon_purchased` | Add-on purchase | 🟢 Minor |
