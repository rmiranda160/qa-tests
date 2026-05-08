# STRIPE-BILLING QA Finding — Data Consistency — 2026-05-08 07:00 UTC

## Summary
- **Focus Area**: stripe-billing (data consistency audit)
- **Result**: ❌ 3 HIGH, 2 MEDIUM findings
- **Account used**: test3@zonacnc.com (Enterprise plan)
- **Method**: Compared PrestaShop pricing page vs Stripe Checkout product descriptions

---

## HIGH #1: Pro plan boost count mismatch
- **Severity**: 🔴 HIGH
- **Location**: Stripe Product `prod_*` for Pro monthly plan
- **Pricing page says**: "⭐ 3 Boosts 24h incluidos/mes"
- **Stripe checkout says**: "8 boosts/mes" (in product description: "ZonaCNC Pro — 10 anuncios, 20 imagenes, stats, soporte prioritario, 8 boosts/mes")
- **Impact**: Customer sees 3 boosts on marketing page but gets charged for 8 in Stripe. Either pricing page is wrong or Stripe product needs updating. Legal/commercial risk.
- **Reproduction**: 
  1. Visit `/es/pricing` → Pro shows "3 Boosts 24h incluidos/mes"
  2. Click "Cambiar a Pro" → `/es/pagar-plan?plan=pro`
  3. Click "Proceder al pago" → Stripe Checkout shows "8 boosts/mes"

## HIGH #2: Business plan ad count mismatch
- **Severity**: 🔴 HIGH
- **Location**: Stripe Product for Business plan
- **Pricing page says**: "📋 25 anuncios activos"
- **Stripe checkout says**: "30 anuncios" (product description: "ZonaCNC Business — 30 anuncios, 30 imagenes, badge verificado, CSV import, 20 boosts/mes")
- **Impact**: 25 vs 30 is a 20% difference. Customers get different limits depending on which source you trust.
- **Reproduction**:
  1. Visit `/es/pricing` → Business shows "25 anuncios activos"
  2. Go to Stripe Checkout for Business → shows "30 anuncios"

## HIGH #3: Business plan boost count mismatch
- **Severity**: 🔴 HIGH
- **Location**: Stripe Product for Business plan
- **Pricing page says**: "⭐ 10 Boosts 24h incluidos/mes"
- **Stripe checkout says**: "20 boosts/mes"
- **Impact**: Double the boosts in Stripe vs pricing page. 10 vs 20 is a 100% discrepancy.
- **Reproduction**: Same as HIGH #2

---

## MEDIUM #1: Starter plan boost attribution
- **Severity**: 🟡 MEDIUM
- **Location**: Starter plan pricing page vs Stripe product
- **Pricing page says**: "⭐ Boosts 24h: comprar en packs" (implies 0 included)
- **Stripe checkout says**: "3 boosts/mes" (product description: "ZonaCNC Starter — 3 anuncios, 10 imagenes, perfil publico, 3 boosts/mes")
- **Impact**: If Starter includes 3 boosts, the pricing page should say so. Otherwise misleading.

## MEDIUM #2: Monthly/Annual toggle has no visual selection state
- **Severity**: 🟡 MEDIUM
- **Location**: `/es/pagar-plan?plan=X` checkout page
- **Issue**: Clicking Mensual/Anual changes billing but shows no visual indicator of which is selected
- **Impact**: User confusion — can't tell if monthly or annual is selected
- **Reproduction**: On any `/es/pagar-plan?plan=X`, click Anual. No visual change happens.

---

## Passes (all verified)
1. ✅ Pricing page renders all 5 plans correctly
2. ✅ Checkout auth gate redirects to login for unauthenticated users
3. ✅ Stripe Checkout redirect works (sandbox mode, `cs_test_*`)
4. ✅ IVA 21% calculation correct across all plans
5. ✅ Balance credit application (€3.47 consistently)
6. ✅ Annual billing sends correct interval to Stripe ("por año", "Se factura cada año")
7. ✅ Stripe Payment Methods: Card, Klarna, Link, Amazon Pay
8. ✅ Boost packs page (5 tiers: 5/10/25/50/100, correct pricing)
9. ✅ IMAP email delivery (test7@zonacnc.com, from no-reply@mg.zonacnc-sales.es)
10. ✅ Mobile responsive (375×667) — pricing, checkout, boost packs
11. ✅ Desktop responsive (1440×900) — all pages
12. ✅ Console clean (no JS errors on any page)

---

## Root Cause Analysis
The 21 Stripe Prices were seeded in zonacncplans v1.7.13. The product descriptions in Stripe's catalog differ from what the PrestaShop pricing page renders. Likely cause: the seed data was generated from an older or different version of PRICING_RULES.md.

## Fix Recommendation
1. Update Stripe Product descriptions to match pricing page (canonical source: `zonacnc-pricing-v17.md` / PRICING_RULES.md §5)
2. Re-seed Stripe products via `zonacncplans` module admin endpoint
3. After fix, re-audit all 5 plans for consistency
