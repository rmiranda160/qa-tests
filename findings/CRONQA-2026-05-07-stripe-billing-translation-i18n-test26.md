# CRON QA Finding: stripe-billing — English Translations Missing on cambia-plan Page

**Date:** 2026-05-07 04:52 UTC  
**Run ID:** f88c723f-9d7c-485a-b506-55f4e41efab3  
**Account:** test26@zonacnc.com  
**Severity:** MEDIUM  

## Summary

The English version of the plan change page (`/en/cambiar-plan`) is almost entirely in Spanish. The page `<title>`, headings, plan descriptions, add-on labels, pricing display, and the entire help/FAQ section are untranslated. Additionally, the English pricing page and all English pages have partially untranslated footer content (legal links, section headers, and newsletter text in Spanish).

## Issues Found

### 1. /en/cambiar-plan — Page content untranslated

| Element | Current (Spanish) | Expected (English) |
|---------|-------------------|-------------------|
| Page `<title>` | Cambiar plan — ZonaCNC | Change plan — ZonaCNC |
| Main `<h1>` | Cambiar plan | Change plan |
| Section heading | Tu plan actual | Your current plan |
| Section heading | 1. Elige el plan | 1. Choose your plan |
| Plan descriptions | Hasta X anuncios incluidos | Up to X ads included |
| Add-on label | Anuncios extra: €X.00/mes | Extra ads: €X.00/month |
| Pricing line | Cuota mensual del plan: €39,00 /mes | Monthly plan fee: €39.00/month |
| Period text | Período actual hasta: 06/06/2026 | Current period until: 06/06/2026 |
| Breadcrumb | Mi cuenta | My account |
| Empty state | Ya tienes este plan activo... | You already have this plan active... |
| Help section | ¿Cómo funciona el cambio de plan? | How does plan switching work? |
| All 4 subsections | Upgrade, downgrade, cancel, add-ons text | All in Spanish |
| 7-day refund section | Devolución 7 días — condiciones | 7-day refund — conditions |
| 3 refund conditions | No has recibido ningún... | All in Spanish |

### 2. English footer — Partial untranslated content (all English pages)

| Element | Current | Expected |
|---------|---------|----------|
| Legal links | Aviso legal, Politica de privacidad, Politica de cookies | Legal notice, Privacy policy, Cookie policy |
| Section header | Nuestra empresa | Our company |
| Navigation links | Cómo funciona, Planes para vendedores, Todos los vendedores, Preguntas frecuentes | How it works, Seller plans, All sellers, FAQ |
| Newsletter text | Puede darse de baja en cualquier momento... | You can unsubscribe at any time... |

### 3. Add-on email: placeholder instead of prorated amount

**Email #20** (test26@zonacnc.com): "Add-on añadido a tu suscripción Starter"  
The email shows `(prorrateado por Stripe)` as literal text instead of the actual charged amount. Affects both text/plain and text/html parts. User doesn't know what they were charged.

## Evidence

- Screenshots and snapshots captured via Playwright MCP
- IMAP verification of email #20 and #21 confirms template content
- All pages tested at: `/es/cambiar-plan`, `/en/cambiar-plan`, `/es/pricing`, `/en/pricing`, `/es/facturacion`, `/es/suscripcion`

## Pages Affected

- `https://new.zonacnc.com/en/cambiar-plan` — almost entirely Spanish
- `https://new.zonacnc.com/en/pricing` — footer partially Spanish
- All English pages — footer partially Spanish
- Billing emails — add-on notification email shows placeholder text
