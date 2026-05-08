# Issue: Stripe Billing — Pricing/Email Template Bugs (2026-05-08)

**Source:** QA finding `CRONQA-2026-05-08-stripe-billing-pricing-email-audit.md`  
**Full report:** `qa/stripe-billing-pricing-email-audit-2026-05-08.md`  
**Date:** 2026-05-08 08:25 UTC  
**Labels:** `qa-stripe-billing`, `bug`, `pricing`, `email-template`

---

## Bugs Requiring Fixes

### 🔴 HIGH-1: Yearly/Annual Pricing Toggle Missing
**All subscription pages** (pricing, subscription, change-plan) only show monthly plans. The Stripe catalog has yearly Prices but they're inaccessible from the UI. Missing toggle/switch component.

### 🔴 HIGH-2: Email Translation — "Periodo: monthly"
`zonacncplans` welcome email template: billing period label is in Spanish ("Periodo:") but the value is hardcoded in English ("monthly" instead of "mensual"). Affects all monthly plan welcome emails (UID 29 style).

### 🟡 MED-1: English-Only Welcome Email Variant
A second welcome email template path sends an entirely English HTML body (with `lang="en"`) even when the subject is Spanish. Affects UID 41 style emails.

### 🟡 MED-2: Placeholder Literal in Add-on Email
Add-on confirmation email shows literal string "(prorrateado por Stripe)" instead of the actual prorated charge amount. Affects all add-on purchase confirmation emails.

### 🟡 MED-3: Ads Count Mismatch (1 vs 3)
Starter welcome email shows "1 anuncio incluido" but pricing page and spec show "3 anuncios activos". Email template variable likely points to wrong field.

---

## Action Items
1. Add yearly/monthly toggle to pricing page UI
2. Fix "Periodo: monthly" → "Periodo: mensual" in email template
3. Ensure ES locale consistently gets Spanish email templates
4. Pass actual prorated amount to add-on email instead of placeholder string
5. Fix ads count variable in welcome email template (or update pricing if intentional)
