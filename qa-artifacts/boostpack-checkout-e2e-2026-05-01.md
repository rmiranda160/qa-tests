# QA Report: Boost Pack 24h — Stripe Checkout E2E (Successful Purchase)

**Date:** 2026-05-01  
**Tester:** test1@zonacnc.com (free user)  
**Environment:** https://new.zonacnc.com (MODO TEST)  
**Focus:** stripe-billing  
**Label:** `qa-stripe-billing`

---

## Pre-conditions

| Check | Result |
|---|---|
| Balance before purchase | **0 Boosts** |
| Billing rows before | **11** (Facturas y pagos 11) |

## Test Flow

### Step 1: Login as test1@zonacnc.com
✅ Login successful (free user, no vendor subscription)

### Step 2: Navigate to Boost Packs page
- URL: `/es/module/zonacncplans/boostpacks`
- ✅ Page renders with 5 pricing tiers: 5, 10, 25 (RECOMENDADO), 50, 100 Boosts
- ✅ Current balance shown as 0 Boosts
- ✅ "Pago seguro con Stripe" indicator visible

### Step 3: Purchase 5 Boosts pack (15€)
- Clicked "Comprar" on **5 Boosts** pack (15 € / ≈ 3.00 € per Boost)
- ✅ Redirected to Stripe Checkout: `checkout.stripe.com/c/pay/...`
- ✅ Checkout displays: "ZonaCNC — Pack Boost 24h x5" for €15.00
- ✅ Sandbox mode indicator visible
- ✅ Email pre-filled: test1@zonacnc.com
- ✅ Card payment method available

### Step 4: Fill card details and complete payment
**Fields filled:**
| Field | Value |
|---|---|
| Card Number | 4242 4242 4242 4242 |
| Expiry | 12/28 |
| CVC | 123 |
| Cardholder name | Test User |
| Country | Spain (ES) |

- ✅ Submit button changed from `SubmitButton--incomplete` → `SubmitButton--complete`
- ✅ Payment processed successfully
- ✅ Redirected to: `/es/module/zonacncplans/boostpacksuccess?session_id=...`

### Step 5: Verify success page
- ✅ **Heading**: "Compra confirmada" with check_circle icon
- ✅ **Message**: "¡Compra confirmada!"
- ✅ **Content**: "★ Has añadido 5 Boosts 24h"
- ✅ **Balance updated**: "Tu balance actual: **5** Boosts"
- ✅ **Actions**: Links to "Ir a Mis anuncios" and "Comprar mas Boosts"

### Step 6: Verify Billing/Invoices page
- URL: `/es/module/zonacncplans/billing`
- ✅ Sidebar badge updated: **Facturas y pagos 12** (was 11)
- ✅ New invoice row:
  - **Date**: 01/05/2026
  - **Concept**: Pack Boost 24h 5 boosts
  - **Amount**: 15,00 EUR
  - **Status**: **completado**
  - **PDF**: — (not yet available — likely needs webhook)

## Results Summary

| Metric | Value |
|---|---|
| Test Result | ✅ **PASS** |
| Boost balance before | 0 |
| Boost balance after | **5** |
| Amount charged | 15,00 EUR |
| Invoice status | completado |
| Billing rows before/after | 11 → 12 |

## Findings

### 🔴 ANOMALY: No PDF invoice for Boost pack purchase
- All subscription rows have `PDF` and `Ver factura` links
- The completed Boost pack row shows `—` for the Factura column
- This may be expected (webhook confirmation pending), but the subscription invoices show PDF links immediately after marking completado

**Severity:** Low (Expected behavior if PDF generation is async)

### ✅ Confirmation: Test-plan.md coverage gap closed
- `Test-plan.md` explicitly marks "Boost 24h checkout completo desde Stripe Checkout" as ❌
- This test confirms the **full E2E flow works** for Stripe Checkout → Boost pack completion → balance update → invoice generation

## Screenshots
- [Success page and billing](/app/.playwright-mcp/page-2026-05-01T20-09-09-410Z.png)
- [Console logs](/app/.playwright-mcp/console-2026-05-01T20-01-55-728Z.log)

## Test card used
- **Card:** 4242 4242 4242 4242 (Visa, success)
- **CVC:** Any 3 digits (123)
- **Expiry:** Any future date (12/28)
- **Country:** Spain (ES)
