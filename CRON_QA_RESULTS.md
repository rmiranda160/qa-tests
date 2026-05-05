# CRON_QA Results
**Focus Area:** stripe-billing  
**Date:** 2026-05-05 17:00 UTC  
**Duration:** ~15 min (within 30 min cap)  
**Target:** new.zonacnc.com  
**Account:** test11@zonacnc.com (freshly registered — test7-test10 login regression)  

## Summary
✅ **Subscription flow for Starter plan completed successfully (test11)**
- Registered new account via `/es/?controller=registration`
- Added billing address (required DNI + Empresa fields)
- Completed vendor registration
- Stripe Checkout sandbox payment succeeded (test card 4242…4242)
- Subscription page verified: Starter Activa, €39/mes, next billing 05/06/2026

✅ **Email verification via IMAP completed (3 emails received)**
- Email 13: "Factura pagada — Tu plan sigue activo" — ⚠️ "monthly" untranslated
- Email 12: "¡Bienvenido a Starter! Tu suscripción está activa" — ❌ Wrong ad count (1→3)
- Email 11: "Empieza con buen pie en ZonaCNC" — ✅ Template variables resolved! ⚠️ Boost count 0→3

## New Findings

### BUG 1 (NEW — HIGH): Boost quota shows 0 instead of 3 in onboarding email
- Email #11 says "0 Boosts 24h al mes" — should be 3 for Starter
- Template variable `{boost_quota_monthly}` returning 0

### BUG 2 (NEW — HIGH): test7–test10 login regression
- test7, test8, test9, test10 all fail with "Error de autenticación"
- Password `Test1234%segura` confirmed working on test8 earlier today (06:42 UTC)
- Workaround: Registered fresh account test11@zonacnc.com

## Confirmed Issues (same as prior report #2026-05-05 06:42)
- F2.1: "monthly" untranslated → should be "mensual" in Spanish emails
- F2.2: Wrong ad count in subscription email (1 instead of 3)
- F2.3: Truncated greeting "Hola Test" instead of full name
- F2.5: Mixed EN/ES in billing description
- F4: Missing accent marks on success page
- F8: JS parse error `Unexpected token '&'` persists

## Fixed
- ✅ Onboarding email template variables now resolve (was literal `{vendor_dashboard_url}` on May 3)
- ✅ Welcome email subject properly accented

## Files Updated
- `findings/CRONQA-2026-05-05T1700-stripe-billing-test11.md` — Full findings
