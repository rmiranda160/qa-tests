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

## Bug 5: Onboarding email template variables not substituted (REGRESIÓN EN TODOS LOS PLANES)

**Severity:** HIGH  
**Template:** `plans-vendor_onboarding` (Mailgun)  
**Tags:** `plans-vendor_onboarding`  
**Status:** 🔴 CONFIRMED — persists on new.zonacnc.com  

### Description
The onboarding email "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos" is sent after subscribing to any paid plan. Template variables `{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, and `{boostpacks_url}` appear literally instead of being substituted with actual values.

### Verified Plans
| Plan | Date | Result |
|------|------|--------|
| Pro (99€/mo) | 2026-05-03 18:25 UTC | ❌ REGRESSION |
| Starter (39€/mo) | 2026-05-03 22:43 UTC | ❌ REGRESSION |

### Impact
- Users receive emails with broken links (literal `{vendor_dashboard_url}` instead of actual URL)
- Onboarding experience is broken — users can't click through to complete setup
- Affects ALL paid plans (confirmed on Starter and Pro)

### Variables affected (verified via IMAP, both plain text and HTML)
- `{vendor_dashboard_url}` → literal
- `{max_listings}` → literal
- `{new_ad_url}` → literal
- `{messaging_url}` → literal
- `{boost_quota_monthly}` → literal
- `{boostpacks_url}` → literal

### Note
Plan name "Starter" is correctly substituted (not `{plan_name}`), suggesting only certain variables are broken.

---

## Related Test Files
- `findings/CRONQA-2026-05-03-stripe-billing-STARTER-PLAN-FLOW.md` (this run)
- `findings/CRONQA-2026-05-03-stripe-billing-FULL-PAYMENT-FLOW.md` (Pro plan run)
- `findings/CRONQA-2026-05-03-stripe-billing-template-subs-regression.md` (onboarding template regression)
