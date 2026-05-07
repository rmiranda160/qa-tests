# ISSUE: Stripe Billing QA — Translation gaps in zonacncplans module

**Created:** 2026-05-07 15:32 UTC  
**Commit:** 66ca041  
**Session:** f88c723f-9d7c-485a-b506-55f4e41efab3

## Summary
Stripe billing integration tested on new.zonacnc.com with test3@zonacnc.com (Pro). Core payment flows functional. **Major finding: billing module (zonacncplans) lacks English translations** — subscription, plan change, and invoice pages show Spanish content in English mode.

## Key issues to address
1. 🔴 **Add English translations** for `/en/suscripcion`, `/en/cambiar-plan`, `/en/facturacion`
2. 🟡 Fix `40%%` double percent in English pricing page
3. 🟡 Localize Stripe invoice line item descriptions
4. 🔴 Fix plan change page race condition (JS init timing)

Full findings: `findings/stripe-billing-2026-05-07.md`
