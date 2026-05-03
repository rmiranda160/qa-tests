# CRON QA: Stripe Billing — Pro Subscription Flow (test35)

**Date:** 2026-05-03  
**Tester:** QA Cron Billing  
**Email:** test35@zonacnc.com  
**Scope:** new.zonacnc.com  
**Session:** stripe-billing  
**Priority:** P1 — Payment flow  

---

## Objective

Verify the complete Stripe Checkout payment flow for the **Pro** plan (99€/month) on `new.zonacnc.com`:
1. Fresh user registration → billing address → vendor registration → checkout → Stripe payment → subscription activation
2. Verify subscription status post-payment

---

## Test Summary

| Step | Action | Result |
|------|--------|--------|
| 1 | Register new user (test35@zonacnc.com) via registration form | ✅ PASS |
| 2 | Navigate to pricing, fill billing address (Madrid, Calle Mayor 123, B87654321) | ✅ PASS |
| 3 | Navigate to checkout page (`/es/module/zonacncplans/checkout?plan=pro`) | ✅ PASS |
| 4 | Register as vendor (QA Stripe Pro S.L., Mecanizado CNC, Madrid) | ✅ PASS |
| 5 | Click "Proceder al pago" → redirected to Stripe Checkout sandbox | ✅ PASS |
| 6 | Expand card accordion — click Card radio / accordion trigger | ✅ PASS |
| 7 | Fill test card (4242 4242 4242 4242) — used JS `fill()` on input fields | ✅ PASS |
| 8 | Fill expiry (12/34) and CVC (567) | ✅ PASS |
| 9 | Fill cardholder name, check AI agent checkbox | ✅ PASS |
| 10 | Click "Pay and subscribe" → redirect to success | ✅ PASS |
| 11 | Verify Pro subscription active on subscription page | ✅ PASS — "Pro Activa", €99/mes, próximo cobro 03/06/2026 |

---

## Findings

### F1: Login Page HTTP 500 Persists (Known Issue)
- **Severity:** High
- **Issue:** `/es/iniciar-sesion` still returns HTTP 500 errors.
- **Workaround:** Registration auto-logs in, bypassing login entirely.

### F2: QA Email Pool test7-test30 Fully Exhausted
- **Severity:** High (test automation)
- All emails from .env.qa.email (test7–test30@zonacnc.com) are taken.
- Used test35@zonacnc.com as a fallback (outside original pool limits).
- Recommendation: Refresh QA email pool or implement IMAP reset for existing accounts.

### F3: Billing Address Redirect Has Malformed URL
- **Severity:** Low
- After submitting billing address form, redirect URL is malformed:
  `?controller=https://new.zonacnc.com/es/module/zonacncplans/checkout?plan=pro`
- Manual navigation to `/es/module/zonacncplans/checkout?plan=pro` works correctly.

### F4: Stripe Checkout Card Fields Accessible in DOM (No iframes)
- **Severity:** Low (automation only)
- Card fields (`placeholder="1234 1234 1234 1234"`, `placeholder="MM / YY"`, `placeholder*="CVC"`) are plain `<input>` elements directly in the main DOM, not inside iframes.
- `fill()` works reliably.

### F5: Vendor Registration Required Before Checkout
- **Severity:** Low
- Checkout redirects to `/es/module/zonacncvendor/register` if vendor profile incomplete.
- After registration, returning to checkout works correctly.

---

## Conclusion

The complete Stripe billing flow for **Pro** plan (99€/month) is fully functional on `new.zonacnc.com`. All steps completed successfully — registration, billing address, vendor registration, Stripe test-mode payment, and subscription activation.

**Veredicto:** ✅ PASS — Stripe Pro billing flow end-to-end  
**Email usado:** test35@zonacnc.com (fuera del pool original test7-test30, que ya estaba exhausto)  
**Plan:** Pro (99€/month)  
**Next billing:** 03/06/2026  
**Stripe session:** `cs_test_a1QZOGGrDmYZhwEQlY5SvrvMg8bV18F14TuXDRGP5MHmSmWmX7RSwdlAqJ`
