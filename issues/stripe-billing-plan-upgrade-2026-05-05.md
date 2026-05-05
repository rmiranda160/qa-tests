# Issue #152: stripe-billing — 5 Plan Upgrade Issues

**Date:** 2026-05-05  
**PR:** #151  
**GitHub:** https://github.com/rmiranda160/qa-tests/issues/152

## Summary

Two plan upgrades tested (Pro→Business and Business→Enterprise) on new.zonacnc.com. Both successful, but 5 issues found related to Stripe i18n, missing emails, rounding discrepancies, and template bugs.

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | 🔴 CRITICAL | Stripe invoice line items in English on ES locale |
| 2 | 🟠 HIGH | Stripe invoice UI entirely in English |
| 3 | 🟡 MEDIUM | No email notification for plan upgrades |
| 4 | 🟡 MEDIUM | Prorated amount mismatch (3 different values) |
| 5 | 🟡 MEDIUM | Add-on email references wrong plan name |

## Environment

- URL: https://new.zonacnc.com/es/
- Mode: TEST
- Account: test7@zonacnc.com
- Payment: Visa •••• 4242 (saved card)
