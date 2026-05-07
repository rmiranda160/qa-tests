# CRON QA Finding — Stripe Billing i18n Regression Post-PR #237
**Run:** 2026-05-07 05:49 UTC | **Duration:** ~8 min  
**Cron ID:** f88c723f-9d7c-485a-b506-55f4e41efab3  
**Focus:** Post-PR verification — i18n fixes from PR #237 not deployed  
**Account:** test26@zonacnc.com (Starter plan, 4 anuncios, €39/mes)  
**Branch:** `finding/stripe-billing-2026-05-07-plan-upgrade`

---

## Result: ❌ REGRESSION — 3 previous findings NOT FIXED + 1 NEW

---

## Summary

PR #237 ("fix/stripe-billing-i18n-cambiar-plan-2026-05-07") was merged at commit `7720b95`, but the i18n fixes reported in the previous CRON run (2026-05-07 04:52 UTC) are **not deployed** on production. All 3 previous findings persist, plus 1 new issue found on the English subscription page.

---

## Finding #1: English cambiar-plan still entirely in Spanish (REGRESSION — NOT FIXED)

**URL:** https://new.zonacnc.com/en/cambiar-plan  
**Previous finding:** Confirmed in CRON run 2026-05-07 04:52 UTC  
**PR:** #237 (merged) — fix not deployed  

| Element | Current (Spanish) | Expected (English) |
|---------|-------------------|-------------------|
| Page `<title>` | Cambiar plan — ZonaCNC | Change plan — ZonaCNC |
| Main heading `<h1>` | Cambiar plan | Change plan |
| Current plan section | Tu plan actual | Your current plan |
| Plan selection | 1. Elige el plan | 1. Choose your plan |
| Plan features | Hasta X anuncios incluidos | Up to X ads included |
| Add-on pricing | Anuncios extra: €X.00/mes | Extra ads: €X.00/month |
| Monthly fee label | Cuota mensual del plan | Monthly plan fee |
| Period display | Período actual hasta: | Current period until: |
| Breadcrumb link | Mi cuenta | My account |
| Empty state text | Ya tienes este plan activo... | You already have this plan... |
| CTA button | Confirmar cambio | Confirm change |
| Help section title | ¿Cómo funciona el cambio de plan? | How does plan switching work? |
| Upgrade/Downgrade/Cancel help | ALL SPANISH | ALL ENGLISH |
| Refund policy (7 days) | ALL SPANISH | ALL ENGLISH |

**Root cause:** The `ZonaCNCPlans` module does not have English translation strings for the cambiar-plan template. PR #237 may have added the strings to the repo but the module was not reinstalled or translations were not loaded.

---

## Finding #2: English pages have partially untranslated footer (PERSISTS)

**URLs:** `/en/pricing`, `/en/cambiar-plan`, `/en/suscripcion`  

| Element | Current | Expected |
|---------|---------|----------|
| Legal section links | Aviso legal, Politica de privacidad, Politica de cookies | Legal notice, Privacy policy, Cookie policy |
| Marketplace links | Cómo funciona, Planes para vendedores, Todos los vendedores, Preguntas frecuentes | How it works, Seller plans, All sellers, FAQ |
| Section header | Nuestra empresa | Our company |
| Newsletter legal text | Puede darse de baja en cualquier momento... | You can unsubscribe at any time... |
| Category "Tornos" | Tornos | Lathes |

---

## Finding #3: Add-on email shows literal "(prorrateado por Stripe)" placeholder (PERSISTS)

**Email:** #20 — "Add-on añadido a tu suscripción Starter"  
**Recipient:** test26@zonacnc.com  
**Date:** 2026-05-07  

**HTML version:**
```
Precio unitario/mes: 12,00 €
(prorrateado por Stripe)
```

**Text/plain version:**
```
- Precio unitario/mes: 12,00 €
- Cobro proporcional ahora: (prorrateado por Stripe)
```

The text `(prorrateado por Stripe)` is a literal placeholder — the actual prorated charge amount (e.g., "€10.84 for remaining 28 days") is never shown to the user.

---

## Finding #4: English subscription page has mixed i18n (NEW)

**URL:** https://new.zonacnc.com/en/suscripcion  

| Element | Current | Expected |
|---------|---------|----------|
| Page `<title>` | zonacnc.com | My subscription — ZonaCNC |
| Main heading `<h1>` | Mi suscripción | My subscription |

The English subscription page title is the generic site name with no page context, and the H1 is in Spanish.

---

## Passed Checks

| Check | Status |
|-------|--------|
| Site accessible (HTTP 200) | ✅ |
| Login works (test26) | ✅ |
| Spanish cambiar-plan (all correct ES) | ✅ |
| Sidebar navigation translated (EN) | ✅ |
| Plan data/cards correct on cambiar-plan | ✅ |
| Pricing page (EN) plan cards translated | ✅ |
| Test mode banner present (ES + EN) | ✅ |
| IMAP email verification works | ✅ |

---

## Recommendation

1. **Deploy PR #237 translations**: The fix branch was merged but module translations were not loaded. Run `php bin/console prestashop:translations:export` or reinstall the `ZonaCNCPlans` module.
2. **Footer translations**: Add English strings for footer navigation links and legal section in the theme/module translation files.
3. **Add-on email template**: Replace the `(prorrateado por Stripe)` placeholder with the actual prorated amount from the Stripe invoice/upcoming invoice API, or link to Stripe Customer Portal.
4. **English subscription page**: Add proper `<title>` and translate the `<h1>` heading.

---

## Environment

- **Site:** new.zonacnc.com (test mode)
- **Platform:** PrestaShop + ZonaCNCPlans module
- **Browser:** Playwright (MCP remote)
- **IMAP:** test26@zonacnc.com / zonacnc.com:993
- **Previous run:** 2026-05-07 04:52 UTC (CRON_QA_RESULTS.md)
