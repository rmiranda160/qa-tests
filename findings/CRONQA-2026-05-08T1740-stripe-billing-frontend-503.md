# QA Finding — Stripe Billing Frontend 503 + DB Reset · new.zonacnc.com
**Date:** 2026-05-08 17:40–17:55 UTC  
**Tester:** tester (OpenClaw CRON f88c723f)  
**Site:** https://new.zonacnc.com  
**Focus:** Stripe billing frontend health, webhook, backend diagnostics  
**Method:** Tokenized endpoints + curl + IMAP (test7, test25)  

---

## Executive Summary

**CRITICAL: Frontend returns 503 on ALL pages. Webhook now responds (IMPROVED from last session). Database appears reset (0 active subscriptions, was 29). Backend tests still 45/45 PASS. Stripe price configuration intact.**

---

## Scope & Methodology

| Step | Action | Result |
|------|--------|--------|
| 1 | `GET /` (follow redirect) | ❌ 503 (1322B) 0.21s |
| 2 | `GET /es/pricing` | ❌ 503 (1322B) 0.14s |
| 3 | `GET /module/zonacncplans/tarifas` | ❌ 503 (1322B) 0.10s |
| 4 | `POST /module/zonacncplans/webhook` | ✅ 400 "Invalid signature" (0.10s) |
| 5 | `/zonacnc-run-tests.php?full=1` | ✅ 45/45 PASS (3s) |
| 6 | `/zonacnc-boost-ledger-diag.php` | ✅ 0 vendors, diff=0 |
| 7 | `/zonacnc-seed-stripe-prices.php?action=preview` | ✅ All 5 plans + 5 packs configured |
| 8 | `/zonacnc-check-pro-boost.php?summary=1` | ✅ 0 active subs, 3426 products |
| 9 | `/zonacnc-config-status.php` | ✅ Config read OK, Mailgun domain EMPTY |
| 10 | IMAP: test7@zonacnc.com | ✅ 75 emails, no recent billing |
| 11 | IMAP: test25@zonacnc.com | ✅ 18 emails, no billing |

---

## CRITICAL FINDINGS

### F1 [P0] — Frontend 503 on ALL Pages

**Evidence:**
```
$ curl -o /dev/null -w "HTTP:%{http_code}" https://new.zonacnc.com/
→ HTTP:503 (0.21s)

$ curl -o /dev/null -w "HTTP:%{http_code}" https://new.zonacnc.com/es/pricing
→ HTTP:503 (0.14s)

$ curl -o /dev/null -w "HTTP:%{http_code}" https://new.zonacnc.com/module/zonacncplans/tarifas
→ HTTP:503 (0.10s)
```

**Change from previous session (16:25 UTC):** Previously frontend was TIMING OUT (15-30s, 0 bytes). Now it returns 503 immediately (0.1-0.2s, 1322 bytes). This suggests PS9 maintenance mode or Smarty fatal error rather than cache corruption hang.

**Impact:**
- Site effectively offline for all users
- No new signups or subscription management possible
- Stripe Checkout sessions cannot complete (return URL would 503)
- All pricing/billing pages blocked

**Hypothesis:** `_PS_MODE_DEV_` may be disabled causing fatal errors to 503 instead of displaying. Or maintenance mode was enabled. Backend tokenized scripts bypass Smarty/PrestaShop front controller entirely.

---

### F2 [P1] — Database Reset: 0 Active Subscriptions

**Evidence:**
```
Previous session (16:25 UTC):
- Boost ledger: 29 vendors, monthly=147 permanent=74
- Subscriptions: 28 active, 3 canceled, 7 Pro vendors

Current session (17:40 UTC):
- Boost ledger: 0 vendors, 0 monthly, 0 permanent
- Subscriptions: 0 active
- Verified vendors: 1 (of 771 total)
```

**Impact:** All subscription data lost from local DB. Stripe-side subscriptions may still exist but PS9 cannot reconcile them. If frontend comes back, users will see Free tier instead of their paid plans.

---

## WARNING FINDINGS

### F3 [P2] — ZONACNC_MAILGUN_DOMAIN Still EMPTY

Unchanged from previous session. Config shows `"status": "EMPTY"`. Module hardcodes `mg.zonacnc-sales.es`.

### F4 [P2] — translator_pending: 40

Previous session showed 0 pending. Now 40 translation jobs queued. May indicate translation processor was running but stopped.

---

## POSITIVE CONFIRMATIONS ✅

| Check | Status | Detail |
|-------|--------|--------|
| 45 billing tests | ✅ ALL PASS | unit + smoke, naming, prices, ledger integrity |
| Webhook response | ✅ IMPROVED | Now returns 400 (was timeout 15s). Properly rejects unsigned requests |
| Stripe prices seeded | ✅ Intact | 5 plans × 2 (m/y) + 5 boost packs = all price_ids present |
| Config readable | ✅ OK | stripe_iva_active=true, prelaunch_noindex=false |
| IMAP email delivery | ✅ Working | Both test7 and test25 accounts accessible |
| Products DB | ✅ Intact | 3426 approved products, 771 vendors |

---

## Delta from Previous Session (16:25 UTC)

| Metric | 16:25 UTC | 17:40 UTC (NOW) | Change |
|--------|-----------|-----------------|--------|
| Frontend /es/pricing | Timeout 30s | 503 0.14s | ❌ Different error |
| Webhook POST | Timeout 15s | 400 OK 0.10s | ✅ IMPROVED |
| Boost ledger vendors | 29 | 0 | ❌ RESET |
| Active subscriptions | 28 | 0 | ❌ RESET |
| Backend tests | 45/45 PASS | 45/45 PASS | ✅ Same |
| Mailgun domain | EMPTY | EMPTY | ⚠️ Unfixed |
| Translator pending | 0 | 40 | ❌ Regressed |
| Verified vendors | ? | 1 of 771 | — |

---

## Recommendations

1. **IMMEDIATE**: Check why frontend is serving 503 — SSH into Plesk, check Apache error logs, verify `PS_SHOP_ENABLE=1`
2. **IMMEDIATE**: Investigate DB reset — check if Stripe subscriptions still exist in Stripe dashboard, restore from backup if needed
3. **IMMEDIATE**: Set `ZONACNC_MAILGUN_DOMAIN` = `mg.zonacnc-sales.es` in Configuration
4. **SHORT-TERM**: Investigate translator_pending spike (0→40 in 1 hour)
5. **SHORT-TERM**: Fix "(monthly)" → "(mensual)" in invoice email template (F3 still unfixed)
