# Issue: Login HTTP 500 persists + QA email pool exhausted — Responsive test blocked

**Date:** 2026-05-02  
**Source:** CRON_QA responsive testing (anonymous, pool exhausted)  
**Priority:** Critical

## Description

Two blocking issues prevent authenticated responsive testing on `new.zonacnc.com`:

### 1. Login page HTTP 500 (REOPENED)
`https://new.zonacnc.com/es/iniciar-sesion` continues to return HTTP 500 error (`net::ERR_HTTP_RESPONSE_CODE_FAILURE`). This has been reported in previous CRON runs and remains unfixed.

### 2. QA email pool exhausted
All 24 emails in the `.env.qa.email` pool (test7–test30@zonacnc.com) are already registered. New test accounts cannot be created without adding more emails to the pool or recycling unused accounts.

## Impact
- No authenticated responsive testing possible
- Cannot verify login flow responsive behavior
- Cannot test post-login user dashboard responsiveness
- QA email pool depleted for future tests

## Responsive Findings (anonymous)

| Page | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Homepage | ✅ Layout OK | ✅ Layout OK | ✅ Layout OK |
| Search | ✅ Clean | ✅ Clean | ✅ Clean |
| Category | ✅ Clean | ✅ Clean | ✅ Clean |
| Pricing | ✅ Clean | ✅ Clean | ✅ Clean |
| Vendors | ✅ Clean | ✅ Clean | ✅ Clean |
| Registration | ✅ Clean | ✅ Clean | ✅ Clean |

Minor overflow in `.zcnc-hero` (homepage) on all viewports persists.

## Evidence
- Finding: `findings/CRONQA-RESPONSIVE-2026-05-02-login-500-pool-exhausted.md`
- Screenshots in `screenshots/` directory

## Suggested Actions
1. Fix the `/es/iniciar-sesion` route 500 error
2. Add new QA email accounts (test31–test40) to `.env.qa.email`
3. Verify responsive behavior of login flow after fix
4. Fix `.zcnc-hero` CSS overflow on homepage
