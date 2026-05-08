# Stripe Billing QA Report — 2026-05-08

**Tester**: test7@zonacnc.com (via cron)  
**Scope**: new.zonacnc.com — Stripe billing flow  
**Result**: ⚠️ 1 LOW finding | 44/45 unit+smoke pass | P0 from 2026-05-07 RESOLVED  

---

## ✅ P0 from 2026-05-07: JS Syntax Error — RESOLVED

The `Uncaught SyntaxError: Unexpected token '&'` in `window.zcncContactI18n` is **no longer present**. 
Console errors are limited to Google OneTap FedCM (expected).

---

## 🟡 FINDING #1 (LOW): Boost pack naming mismatch

**Severity**: Low (cosmetic/naming standard)  
**Test**: `naming_boostpacks_uses_boost_pack_n` FAIL (unit test suite)  
**Error**: `unexpected 'Pack Boost 24h' in haystack`  
**Expected**: "Boost Pack {N}" per PRICING_RULES.md §5  
**Actual**: "Pack Boost 24h" in invoice/checkout line items  
**Impact**: Appears in Stripe metadata and invoice descriptions. Non-blocking.  
**Fix**: Update `getPackLineName()` in `zonacncplans` to return "Boost Pack {N}" format.

---

## ✅ VERIFIED PASSES

| # | Test | Status |
|---|------|--------|
| 1 | Pricing page: 5 plans (Free/Starter/Pro/Business/Enterprise), +IVA, Stripe messaging | ✅ |
| 2 | Checkout auth gate: /es/pagar-plan?plan=pro → /es/iniciar-sesion | ✅ |
| 3 | Boost packs page: 5 packs (5/10/25/50/100), unit prices, Stripe badge | ✅ |
| 4 | Password recovery email: Spanish template, personalization, Mailgun sender | ✅ |
| 5 | Mobile responsive: 375px pricing layout OK | ✅ |
| 6 | TEST MODE banner present | ✅ |
| 7 | Stripe seed endpoint: HTTP 200 | ✅ |
| 8 | Unit+smoke tests: 44/45 PASS | ✅ |
| 9 | P0 JS fix (2026-05-07): No longer present | ✅ |
