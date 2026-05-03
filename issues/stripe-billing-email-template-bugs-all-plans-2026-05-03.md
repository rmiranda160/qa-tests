# 🐛 Email Template Bugs — Confirmed on Starter Plan (previously Pro)

**Date:** 2026-05-03  
**Reported from:** CRONQA-2026-05-03-stripe-billing-STARTER-PLAN-FLOW.md  
**Affected plans:** Starter (39€/mo), Pro (99€/mo) — likely all plans  

---

## Bug 1: "Ads included: 1" shows current active ads, not plan allowance

**Severity:** High  
**Template:** `plans-subscription_started` (Mailgun)  

Shows `1` (current active count) instead of the plan's included allowance.  
- **Starter** (3 included): shows "Ads included: 1" → should be 3  
- **Pro** (10 included): shows "Anuncios incluidos: 1" → should be 10  

Bug found in both Spanish and English template variants.

---

## Bug 2: "Period: monthly" untranslated

**Severity:** Medium  
**Description:** Shows "Period: monthly" instead of a localized translation.  Same for all plans.

---

## Bug 3: Mixed language — Spanish subject, English body

**Severity:** Low-Medium  
**Description:** Subject is Spanish (`¡Bienvenido a Starter!...`) but body starts with "Hello" in English. Email template is not fully localized.

---

## Bug 4: Misleading lock message on ad creation page

**Severity:** Low (UI/UX)  
**Description:** Shows "Your current plan does not allow publishing new machinery" and lock icon with "Improve plan →" link, even though ads CAN be submitted. Button is not disabled. Free-plan artifact not refreshed after upgrading to Starter.

---

## Related Test Files
- `findings/CRONQA-2026-05-03-stripe-billing-STARTER-PLAN-FLOW.md` (this run)
- `findings/CRONQA-2026-05-03-stripe-billing-FULL-PAYMENT-FLOW.md` (Pro plan run)
