# CRONQA Finding: Stripe Billing — Checkout Flow Verification (test20, new seller)

**Date:** 2026-05-05 05:40–05:55 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing (subscription + boost pack checkout flows)  
**Escenarios:** 1/1 — ✅ SUCCESS (checkout flow verified, 1 new bug found)  
**Account Used:** test20@zonacnc.com (customer 6609, Vendor ID 818, Free plan)

---

## Executive Summary

Verified the end-to-end Stripe billing checkout flow with a newly registered seller account (test20). Tested subscription plan checkout (Starter 39€/mes) and Boost pack checkout (5 Boosts 15€), both successfully redirect to Stripe Checkout in test/sandbox mode. **Found 1 new bug** (billing address redirect malformed) + **1 edge case UX issue** (mixed language in Stripe Checkout).

---

## Scenario: Fresh Seller → Subscription Checkout Test

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Login as test20@zonacnc.com | ✅ Password reset (Z0naCNC2025*Test), seller registered |
| 2 | Navigate to `/es/suscripcion` | ✅ Free plan, 1/3 anuncios, "Mejorar plan" visible |
| 3 | Click "Mejorar plan" → `/es/pricing` | ✅ All 5 plans displayed with correct prices |
| 4 | Complete billing address via warning banner | ✅ Address saved (see BUG-1 below) |
| 5 | Return to pricing → click "Contratar Starter" | ✅ Redirected to `/es/pagar-plan?plan=starter` |
| 6 | Checkout summary page | ✅ Plan: Starter, €39/mes or €390/año, "Proceder al pago" |
| 7 | Click "Proceder al pago" | ✅ Redirected to `checkout.stripe.com/c/pay/cs_test_*` |
| 8 | Verify Stripe Checkout page | ✅ Test mode, correct price (€39.00/mes), email pre-filled |
| 9 | Navigate to `/es/packs-boost` | ✅ 5 boost packs displayed (5-100 Boosts, 15€-200€) |
| 10 | Click "Comprar" on 5 Boost pack | ✅ Redirected to Stripe Checkout for €15.00 |
| 11 | Verify `/es/facturacion` | ✅ Empty state: "Sin movimientos todavía" |
| 12 | Verify IMAP (test20@zonacnc.com) | ✅ 10 messages; no billing emails (no payment completed) |
| 13 | Verify console errors | ✅ No JavaScript errors |

### Stripe Checkout Details

| Field | Value |
|-------|-------|
| Mode | Test/Sandbox ("Entorno de prueba") |
| Business entity | Veleta Comercializaciones y Servicios SLU |
| Plan name (subscription) | "Subscribe to Plan Starter" |
| Price (subscription) | €39.00 per month |
| Plan description | "3 listings · 10 fotos · perfil público" |
| Price (Boost pack) | €15.00 (one-time) |
| Payment methods | Card (Visa, MC, Amex, etc.), Klarna, Link, Amazon Pay |
| Email pre-fill | test20@zonacnc.com (correct) |

---

## 🔴 BUG-1 (NEW): Billing Address Save — Malformed Redirect URL

**Severity:** Low (address saved correctly, redirect just goes to wrong page)  
**Page:** `/es/direccion?back=...&zcnc_billing=1`

**Steps to reproduce:**
1. Go to `/es/pricing` as a seller without a billing address
2. Click "Completar dirección" in the warning banner
3. Fill all required fields and click "Guardar"

**Expected:** Redirect back to `/es/pricing`  
**Actual:** Redirected to `https://new.zonacnc.com/es/?controller=https://new.zonacnc.com/es/pricing` (homepage)

**Root cause analysis:** The `back` parameter value (`https://new.zonacnc.com/es/pricing&zcnc_billing=1`) appears to be misinterpreted — the URL-encoded `back` value is being treated as a `controller` parameter instead of a redirect target.

**Impact:** Minor UX annoyance — user lands on homepage instead of pricing after completing billing address. Address itself is saved correctly (confirmation alert shown: "Dirección añadida correctamente.").

---

## ⚠️ UX-1 (EDGE CASE): Mixed Language in Stripe Checkout

**Severity:** Low (cosmetic only)  
**Page:** Stripe Checkout (`checkout.stripe.com`)

**Observation:** When checkout is initiated from the Spanish site (`/es/pagar-plan`), the Stripe Checkout page renders mostly in English:
- "Subscribe to Plan Starter" (English)
- "per month" (English)
- "Contact information" (English)
- "Payment method" (English)
- "Pay and subscribe" (English)

But the product description is in Spanish:
- "3 listings · 10 fotos · perfil público"

**Expected:** Either all English (based on Stripe locale detection) or all Spanish. The mix of languages looks inconsistent.

**Possible cause:** Stripe Checkout auto-detects locale from browser settings (English), but the product description is passed from PrestaShop as a fixed string in Spanish.

---

## ✅ Confirmed Working

| Feature | Status | Details |
|---------|--------|---------|
| Pricing page | ✅ OK | 5 plans: Free, Starter(39€), Pro(99€), Business(199€), Enterprise(299€) |
| Annual toggle | ✅ OK | 390€/año with "Ahorras 78 €" badge |
| Billing address check | ✅ OK | Warning banner shown when address missing, hidden when saved |
| Subscription checkout | ✅ OK | Correct redirect to Stripe test mode with correct plan name & price |
| Boost pack checkout | ✅ OK | Correct redirect to Stripe test mode with correct product & price |
| Subscription management | ✅ OK | Plan name, active ads count, upgrade link |
| Invoices page | ✅ OK | Empty state for new accounts, descriptive message |
| Console errors | ✅ OK | 0 errors across all billing pages |
| IMAP emails | ✅ OK | No phantom billing emails for incomplete payments |

---

## No Regressions Detected

- No HTTP 500 errors (previously observed on login)
- No password reset failures
- No Stripe integration failures
- All billing-related pages load without JavaScript errors

---

## Known Bugs — Still Present (Not Re-tested in Detail)

Refer to previous findings:
- **BUG-v3 #1:** Unrendered template variables `{vendor_dashboard_url}`, etc. in vendor onboarding emails
- **BUG-v3 #2:** Translation missing — subscription module stays Spanish on English view
- **BUG-v3 #3:** "period" parameter in Stripe checkout URLs

---

## Screenshots

- `stripe-checkout-starter-39eur-test20.png` — Stripe Checkout for Starter plan (€39.00/month)
- `stripe-checkout-boost5-15eur-test20.png` — Stripe Checkout for 5 Boost pack (€15.00)

---

## Test Credentials

| Field | Value |
|-------|-------|
| Account | test20@zonacnc.com |
| Customer ID | 6609 |
| Vendor ID | 818 |
| Password | Z0naCNC2025*Test |
| Current Plan | Free (Gratuito) |
| Active Ads | 1/3 |
| Seller Name | QA Test Machines S.L. |
| CIF | B99123456 |
