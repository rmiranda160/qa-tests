# Finding: Stripe Billing — Pricing Page & Email Template Audit (2026-05-08)

**QA Session:** `qa/stripe-billing-pricing-email-audit-2026-05-08.md`  
**Cron:** tester-stripe-billing (f88c723f-9d7c-485a-b506-55f4e41efab3)  
**Date:** 2026-05-08 08:09–08:25 UTC  

---

## Findings Summary

| # | Severity | Title | Location |
|---|---|---|---|
| 1 | **HIGH** | Yearly/Annual pricing toggle missing from all pages | Pricing, subscription, change-plan |
| 2 | **HIGH** | Email: "Periodo: monthly" (mixed ES/EN) | Welcome email (UID 29) |
| 3 | MEDIUM | Email: English-only welcome variant for ES users | Welcome email (UID 41) |
| 4 | MEDIUM | Email: Placeholder literal "(prorrateado por Stripe)" | Add-on email (UID 32) |
| 5 | MEDIUM | Ads count mismatch: email "1" vs pricing "3" (Starter) | Welcome emails |
| 6 | LOW | Starter add-on price 12€ doesn't match any plan spec | Pricing page |
| 7 | LOW | "Modo test" banner visible on subscription page | Subscription page |

---

## F1 [HIGH] Yearly Toggle Missing
- PRICING_RULES.md defines monthly + yearly Stripe Prices (21 total)
- Zero yearly references on any subscription-related page
- Users can't discover annual pricing option

## F2 [HIGH] Mixed Language
- Email template shows `lang="es"` but "Periodo: **monthly**"
- Should be "Periodo: **mensual**"

## F4 [MEDIUM] Placeholder Text
- Add-on confirmation email displays literal string "(prorrateado por Stripe)"
- Should show actual prorated amount in €

## F5 [MEDIUM] Ads Count Mismatch
- Pricing page correctly shows "3 anuncios activos" for Starter
- Welcome email shows "1 anuncio incluido" — variable or config mismatch
