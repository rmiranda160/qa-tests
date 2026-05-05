# Findings — Stripe Billing (test11 flow)
**Date:** 2026-05-05 17:00–17:15 UTC  
**Account:** test11@zonacnc.com (freshly registered)  
**Plan:** Starter (€39/mo)  
**Browser:** MCP remote pwmcp-zonacnc  

## New Findings

### BUG 1 (NEW — HIGH): Boost quota shows 0 instead of 3 in onboarding email
- **Email:** `plans-vendor_onboarding` (#11), subject "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"
- **Actual:** "Tu plan incluye **0 Boosts 24h al mes**"
- **Expected:** "Tu plan incluye **3 Boosts 24h al mes**" (Starter = 3 boosts/mes per pricing page)
- **Template variable:** `{boost_quota_monthly}` returning 0 instead of plan's actual boost count

### BUG 2 (NEW — HIGH): test7–test10 login regression
- **Accounts:** test7@zonacnc.com, test8@zonacnc.com, test9@zonacnc.com, test10@zonacnc.com
- **Password:** `Test1234%segura` (confirmed working on test8 in prior report dated 2026-05-05 06:42 UTC)
- **Result:** All 4 accounts fail with "Error de autenticación"
- **Workaround:** Registered new account test11@zonacnc.com via `/es/?controller=registration`
- **Impact:** Blocks QA testing on those accounts. Could also affect real users if password rotation occurred.

## Confirmed Issues (also in prior report #2026-05-05 06:42)

### F2.1 (CONFIRMED): English term "monthly" in Spanish email
- Email #12 `subscription_started`: "Periodo: monthly" → should be "Periodo: mensual"
- Also in email #13 `invoice_paid`: "Plan: Starter (monthly)" → should be "(mensual)"

### F2.2 (CONFIRMED): Wrong ad count in subscription email  
- Email #12: "Anuncios incluidos: 1" → should be "3" (Starter = 3 anuncios)
- Template variable `{max_listings}` or similar returning incorrect value

### F2.3 (CONFIRMED): Truncated greeting
- Email #12: "Hola Test" → should be "Hola Test Usuario SEO" (full firstname+lastname)

### F2.5 (CONFIRMED): Mixed EN/ES in billing description
- Subscription page billing history: "1 × Plan Starter (at €39.00 / month) (+39,00 €)"
- Should be fully Spanish: "1 × Plan Starter (39,00 €/mes) (+39,00 €)"

### F4 (CONFIRMED): Missing accent marks on success page
- "Tu suscripción esta activa" → "Tu suscripción está activa"
- "un email de confirmacion" → "un email de confirmación"

### F8 (CONFIRMED): JS parse error persists
- `Unexpected token '&'` on billing-related pages

## Fixed / Improved since May 3–4

### ✅ Onboarding email template variables now resolve
- Prior report showed literal `{vendor_dashboard_url}`, `{max_listings}`, etc.
- Current onboarding email (#11) has all URLs and variables properly resolved
- Greeting uses full name "Test Usuario SEO" correctly
- Step 2 correctly states "3 anuncios activos" for Starter

### ✅ Welcome email subject has proper accents
- "¡Bienvenido a Starter! Tu suscripción está activa" — properly accented

## Flow Summary

```
Registration (/es/?controller=registration)
  → Address form (/es/direccion) — required DNI + Empresa fields
  → Vendor registration (/es/alta-vendedor)
  → Plan checkout (/es/pagar-plan?plan=starter)
  → Stripe Checkout sandbox (cs_test_ prefix)
  → Success page (/es/module/zonacncplans/success)
  → 3 emails received: welcome, onboarding, invoice
```

## Email Audit

| # | Subject | Tag | Status |
|---|---------|-----|--------|
| 13 | Factura pagada — Tu plan sigue activo | plans-invoice_paid | ⚠️ "monthly" in ES, truncated greeting |
| 12 | ¡Bienvenido a Starter! Tu suscripción está activa | plans-subscription_started | ⚠️ Wrong ad count (1→3), monthly→mensual, Hola Test |
| 11 | Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos | plans-vendor_onboarding | ⚠️ Boost count 0→3 |

## Priority

1. **CRITICAL** — BUG 1: Boost quota 0 (user may think boosts unavailable)
2. **HIGH** — BUG 2: Login regression for existing test accounts
3. **HIGH** — F2.2: Wrong ad count (1 vs 3) in confirmation email
4. **MEDIUM** — F2.1: Untranslated "monthly" in all plan-related emails
5. **LOW** — F2.3/F2.5/F4: Cosmetic/minor i18n issues
