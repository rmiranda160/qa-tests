# CRON_QA Results
**Focus Area:** stripe-billing  
**Date:** 2026-05-03 22:32 UTC  
**Duration:** ~15 min (within 30 min cap)  
**Target:** new.zonacnc.com  
**Account:** test16@zonacnc.com  

## Summary
✅ **Subscription flow for Starter plan completed successfully**
- Added billing address with company name
- Stripe checkout completed (test card 4242 4242 4242 4242)
- Subscription activated, redirected to `/es/module/zonacncplans/success`

✅ **Email verification via IMAP completed**
- Email 7: Subscription confirmation "¡Bienvenido a Starter!" — OK (correct variables)
- Email 8: Onboarding "Empieza con buen pie en ZonaCNC" — ❌ REGRESSION (template variables literal)

## Finding: Template Variable Regression CONFIRMED on Starter plan
The onboarding email (`plans-vendor_onboarding`) shows literal template variables:
- `{vendor_dashboard_url}` instead of actual URL
- `{max_listings}` instead of "3"
- `{new_ad_url}` instead of URL
- `{messaging_url}` instead of URL
- `{boost_quota_monthly}` instead of number
- `{boostpacks_url}` instead of URL

## Files Updated
- `issues/stripe-billing-email-template-bugs-all-plans-2026-05-03.md` — Added Bug 5
- `findings/CRONQA-2026-05-03-stripe-billing-template-subs-regression.md` — Added Starter verification
