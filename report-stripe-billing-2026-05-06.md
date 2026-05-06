# QA Report: Stripe Billing — Regression Verification — 2026-05-06

**Date:** 2026-05-06 02:32–02:45 UTC  
**Account:** test15@zonacnc.com (Enterprise monthly €299/mes)  
**Scenario:** Re-verify all previously reported email template & i18n bugs  

## Result: ALL 6 BUGS STILL UNFIXED

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | HIGH | `(prorrateado por Stripe)` placeholder in add-on email | ❌ Day 4 regression |
| 2 | HIGH | Invoice email says "renovación" for first payment | ❌ Unfixed |
| 3 | MEDIUM | Name truncation "Hola Test" in emails | ❌ Unfixed |
| 4 | MEDIUM | "monthly" untranslated in email template | ❌ Unfixed |
| 5 | MEDIUM | Mixed EN/ES in Stripe invoice descriptions | ❌ Unfixed |
| 6 | HIGH | Massive Spanish leakage on /en/subscription (~80%) | ❌ Unfixed |

**IMAP:** 13 emails verified. Templates unchanged since 2026-05-05.  
**i18n:** /en/subscription still ~80% Spanish. No improvement.

Full details in `findings/CRONQA-2026-05-06-stripe-billing-regression-verify-test15.md`
