# QA Report: Stripe Billing Flow (Starter Plan)
**Date:** 2026-05-02 17:11 UTC  
**Tester:** test32@zonacnc.com  
**Site:** new.zonacnc.com  
**Duration:** ~19 min  

## Test Scenario: Complete Stripe Subscription Flow (Starter Plan - 39€/month)

### Steps Performed

| # | Step | Result | Details |
|---|------|--------|---------|
| 1 | Register new account (test32@zonacnc.com) | ✅ Pass | Form submitted, redirect to homepage, user logged in |
| 2 | Navigate to `/es/pricing` | ✅ Pass | All plans displayed (Free/Starter/Pro/Business/Enterprise) |
| 3 | Check billing address requirement | ✅ Pass | Warning banner shown: "Completa tu dirección de facturación antes de contratar un plan" |
| 4 | Add billing address (company Empresa + NIF + address) | ✅ Pass | Form submitted successfully, redirect to pricing, warning removed |
| 5 | Click "Contratar Starter" | ✅ Pass | Checkout page shows plan summary, 39€/month |
| 6 | Click "Proceder al pago" | ⚠️ Partial | Redirects to vendor registration first (prerequisite) |
| 7 | Register as vendor | ✅ Pass | Vendor "QA Test Stripe Billing S.L." registered successfully |
| 8 | Stripe Checkout page | ✅ Pass | Correct plan "Subscribe to Plan Starter", €39.00/month, sandbox mode |
| 9 | Fill card details (test card 4242...) | ✅ Pass | Card fields found directly in DOM (`#cardNumber`, `#cardExpiry`, `#cardCvc`, `#billingName`) |
| 10 | Submit payment | ✅ Pass | Redirected to `/es/module/zonacncplans/success?session_id=cs_test_...` |
| 11 | Verify subscription | ✅ Pass | Subscription page shows "Starter - €39,00/mes" active |

### Key Observations

#### 1. Stripe Card Fields Now In Main DOM (Change from Previous Tests)
- **Previous reports** (13:50, 14:38 UTC) reported Stripe card inputs inside protected iframes inaccessible to automation.
- **This test**: Card fields were plain `<input>` elements directly in the page DOM with IDs `#cardNumber`, `#cardExpiry`, `#cardCvc`, `#billingName`. This allowed full automation of the payment flow.
- **Possible cause**: Stripe renders different checkout integrations depending on session/merchant config; or the checkout page was updated between test runs.

#### 2. Full End-to-End Flow Verified
- Registration → Billing Address → Vendor Registration → Checkout → Stripe Payment → Subscription Active
- All transitions between ZonaCNC and Stripe Checkout worked without errors
- No 500 errors during vendor registration this time (fields filled via `page.fill` which is atomic)

#### 3. Vendor Registration Note
- Required before checkout even though this is a buyer flow (vendor = seller registration)
- Consider streamlining: buyer should not need vendor registration to purchase a plan

### Conclusions
1. **Stripe billing flow is fully functional end-to-end** — completed subscription successfully.
2. **Stripe test mode** correctly processes test card 4242 4242 4242 4242.
3. **Card input fields** were accessible directly in DOM (not in iframes) in this session — different behavior from prior tests.
4. **No blocking issues found.** Subscription active at Starter (€39/month).
5. Total time: ~19 min (within 30 min cap).
