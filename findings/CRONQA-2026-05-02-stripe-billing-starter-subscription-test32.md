# CRON QA: Stripe Billing — Starter Subscription Flow (test32)

**Date:** 2026-05-02  
**Tester:** QA Cron Billing  
**Email:** test32@zonacnc.com  
**Scope:** new.zonacnc.com  
**Session:** stripe-billing  
**Priority:** P1 — Payment flow  

---

## Objective

Verify the complete Stripe Checkout payment flow for the **Starter** plan (39€/month) on `new.zonacnc.com`:
1. Fresh user registration → billing address → vendor registration → checkout → Stripe payment → subscription activation
2. Verify subscription status post-payment

---

## Test Summary

| Step | Action | Result |
|------|--------|--------|
| 1 | Register new user (test32@zonacnc.com) | ✅ PASS |
| 2 | Navigate to pricing page | ✅ PASS |
| 3 | Complete billing address | ✅ PASS |
| 4 | Navigate to checkout page | ✅ PASS |
| 5 | Register as vendor (prerequisite) | ✅ PASS |
| 6 | Stripe Checkout — card fields directly in DOM | ✅ PASS |
| 7 | Fill test card (4242 4242 4242 4242), expiry (12/34), CVC (123) | ✅ PASS |
| 8 | Submit payment | ✅ PASS |
| 9 | Redirect to success page | ✅ PASS |
| 10 | Verify subscription active | ✅ PASS — "Starter Activa, €39,00/mes" |

---

## Findings

### F1: Stripe Card Fields in Main DOM vs Iframes (Inconsistency)
- **Severity:** Info / Observation
- **Previous tests** (test27, test29) reported card fields inside Stripe-protected iframes requiring JS dispatch to expand.
- **This test**: Card fields were plain `<input>` elements in the main page DOM: `#cardNumber`, `#cardExpiry`, `#cardCvc`, `#billingName`.
- **Impact**: No automation issue this time. Possible A/B testing or session-dependent Stripe rendering.

### F2: Full Stripe Payment Flow Verified
- **Severity:** N/A (positive confirmation)
- The entire flow from registration → address → vendor → checkout → Stripe → subscription success works without errors.
- Stripe test mode correctly processes `4242 4242 4242 4242` test card.
- No 500 errors observed (vendor registration stable with atomic `fill()`).

### F3: Vendor Registration Still Required for Checkout
- **Severity:** Low
- A buyer cannot proceed to Stripe checkout without first registering as a vendor. This adds friction to the purchase flow.
- **Consideration:** If the platform allows non-vendor users, checkout should proceed without vendor registration.

---

## Conclusion

The Stripe billing flow is fully functional. All steps completed successfully in ~19 minutes. The subscription was activated with correct plan details.

**Veredicto:** ✅ PASS — Stripe billing flow end-to-end
