# CRON QA: Stripe Billing — Starter Subscription Flow (test33)

**Date:** 2026-05-02  
**Tester:** QA Cron Billing  
**Email:** test33@zonacnc.com  
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
| 1 | Register new user (test33@zonacnc.com) via registration form | ✅ PASS |
| 2 | Navigate to pricing page, complete billing address (Madrid) | ✅ PASS |
| 3 | Navigate to checkout page | ✅ PASS |
| 4 | Register as vendor (prerequisite — QA Corp SL, Madrid) | ✅ PASS |
| 5 | Stripe Checkout — expand card accordion with JS click | ✅ PASS |
| 6 | Fill test card (4242 4242 4242 4242) via `page.fill()` | ✅ PASS |
| 7 | Fill expiry (12/34) and CVC (123) via `page.fill()` | ✅ PASS |
| 8 | Check "I am an AI agent" checkbox via JS | ✅ PASS |
| 9 | Submit payment — "Pay and subscribe" | ✅ PASS |
| 10 | Redirect to success page "Suscripción activada" | ✅ PASS |
| 11 | Verify subscription active on subscription page | ✅ PASS — "Starter Activa", €39/mes, próximo cobro 03/06/2026 |

---

## Findings

### F1: Login Page HTTP 500 Persists (Known Issue)
- **Severity:** High
- **Issue:** `/es/iniciar-sesion` still returns HTTP 500 errors. Cannot test login flow via standard authentication.
- **Workaround:** Registration (`/?controller=registration`) works fine and auto-logs in the user, bypassing the login page entirely.
- **References:** See findings `CRONQA-2026-05-02-stripe-billing-login-500-persists-test31.md`, issue #13, PR #14.

### F2: Stripe Card Fields — fill() Needed, type() Corrupts Input
- **Severity:** Medium (automation only)
- Card fields (`#cardNumber`, `#cardExpiry`, `#cardCvc`) are plain `<input>` elements in the main DOM, not iframes.
- `page.type()` / `pressSequentially()` causes corruption: CVC received "112" instead of "123", Expiry received empty string.
- `page.locator('#cardCvc').fill('123')` works correctly via Playwright's Input.fill().
- **Recommendation:** Always use `fill()` for Stripe inputs in this integration.

### F3: Vendor Registration Required for Checkout (Confirmed)
- **Severity:** Low
- Checkout redirects to `/es/module/zonacncvendor/register` if vendor profile is incomplete.
- After vendor registration, returning to checkout (`/es/module/zonacncplans/checkout?plan=starter`) works correctly.

### F4: Stripe Checkout Accordion — Card Form Hidden by Default
- **Severity:** Medium (automation only)
- The card payment form is inside an accordion that starts collapsed.
- Must click the "Pay with card" accordion button (`.AccordionButton`) to reveal card fields.
- Using `document.querySelector('[data-testid="card-accordion-item-button"]').click()` works reliably.

---

## Conclusion

The complete Stripe billing flow for Starter plan (39€/month) is fully functional. All steps completed successfully. Login 500 workaround via registration still required.

**Veredicto:** ✅ PASS — Stripe billing flow end-to-end  
**Email usado:** test33@zonacnc.com (fuera del pool original test7-test30, que ya estaba exhausto)
