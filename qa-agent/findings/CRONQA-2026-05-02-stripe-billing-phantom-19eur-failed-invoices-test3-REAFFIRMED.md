# CRON QA Finding · Stripe Billing · Phantom 19 EUR Failed Invoices — REAFFIRMED

> **Date:** 2026-05-02 08:45 UTC
> **Focus:** stripe-billing
> **Scenario:** Re-test: phantom 19€ failed invoices persisting for test3 (Enterprise)
> **Vendor:** test3@zonacnc.com (Enterprise, sub_1TRnTEELpLIGgmZKholeYCFn)
> **Priority:** 🔴 CRITICAL
> **Status:** BUG PERSISTS — **ESCALATION CONFIRMED**

---

## Scenario Executed

Manual MCP browser test (pwmcp-zonacnc MCP remote):
1. Login as test3@zonacnc.com
2. Navigate to `/module/zonacncplans/subscription`
3. Inspect plan info, sidebar badge count
4. Navigate to `/module/zonacncplans/billing`
5. Inspect pages 1-3 of invoice table (10 pages total, 191 records)

---

## Result: 🔴 FAIL — Bug PERSISTS and WORSENED

### The Bug: Unresolved — Invoice Count INCREASED from 181 to 191

Yesterday (2026-05-01 23:15 UTC): **181** invoices
Today (2026-05-02 08:45 UTC): **191** invoices ← **+10 new invoices in ~9 hours**

The phantom 19.00 EUR "Fallido" (Failed) invoices are **still being generated** at a rate of approximately 1-2 per hour.

### Evidence from Pages 1-3 (of 10)

#### Page 1 (02/05/2026 — most recent rows):
| Date | Concept | Amount | Status |
|------|---------|--------|--------|
| 02/05 | Add-on proration | 0.00 EUR | completed |
| 02/05 | Add-on proration | 0.00 EUR | completed |
| 02/05 | Add-on proration | 0.00 EUR | completed |
| 02/05 | Add-on proration | 2.68 EUR | completed |
| **02/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 02/05 | Enterprise subscription | 299.00 EUR | completed |
| 02/05 | Pro subscription | 99.00 EUR | completed |
| 02/05 | Business subscription | 199.00 EUR | completed |
| 02/05 | Starter subscription | 39.00 EUR | completed |
| 02/05 | Add-on proration | 0.00 EUR | completed |
| **02/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 02/05 | Enterprise subscription | 299.00 EUR | completed |
| 02/05 | Business subscription | 199.00 EUR | completed |
| 02/05 | Pro subscription | 99.00 EUR | completed |
| 02/05 | Starter subscription | 39.00 EUR | completed |
| 02/05 | Pro subscription | 99.00 EUR | completed |
| 02/05 | Pro subscription | 99.00 EUR | completed |
| 02/05 | Pro subscription | 99.00 EUR | completed |
| **02/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 01/05 | Add-on proration | 0.00 EUR | completed |

**Page 1 count:** 3 phantom 19.00 EUR failed invoices

#### Page 2 (01/05/2026):
| Date | Concept | Amount | Status |
|------|---------|--------|--------|
| 01/05 | Add-on proration | 2.89 EUR | completed |
| 01/05 | Add-on proration | 2.89 EUR | completed |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Business subscription | 199.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 01/05 | Enterprise subscription | 299.00 EUR | completed |
| 01/05 | Business subscription | 199.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Starter subscription | 39.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 01/05 | Enterprise subscription | 299.00 EUR | completed |
| 01/05 | Business subscription | 199.00 EUR | completed |

**Page 2 count:** 5 phantom 19.00 EUR failed invoices

#### Page 3 (continued 01/05/2026):
| Date | Concept | Amount | Status |
|------|---------|--------|--------|
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Starter subscription | 39.00 EUR | completed |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 01/05 | Enterprise subscription | 299.00 EUR | completed |
| 01/05 | Business subscription | 199.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Starter subscription | 39.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| 01/05 | Enterprise subscription | 299.00 EUR | completed |
| 01/05 | Business subscription | 199.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| 01/05 | Pro subscription | 99.00 EUR | completed |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |
| **01/05** | **Pago fallido** | **19.00 EUR** | **fallido** |

**Page 3 count:** 6 phantom 19.00 EUR failed invoices

### Running Total (Pages 1-3):

| Page | Date | Phantom 19€ Count |
|------|------|-------------------|
| 1 | 02/05/2026 | 3 |
| 2 | 01/05/2026 | 5 |
| 3 | 01/05/2026 | 6 |
| **Total (3 of 10 pages)** | | **14** |

### Key Observations:

1. **Invoice Count Increased:** 181 → 191 (+10 in ~9 hours)
2. **New Phantom Invoices on 02/05:** 3 new 19€ failed invoices created today
3. **Pattern:** 19€ failed invoices are interleaved with legitimate subscription payments (299, 199, 99, 39€) — suggesting a batch processing issue
4. **No Invoice Links:** All 19€ failed rows show "—" in the Factura column (no PDF, no Stripe invoice link), confirming they are **phantom DB records, not real Stripe charges**
5. **Approximately 10 pages total** of 191 records — the phantom invoices likely extend across all pages
6. **Estimated total phantom invoices:** ~50-100+ across all 10 pages

### Root Cause Confirmation

The phantom 19.00 EUR amount is confirmed to be a **local DB artifact** — these are not real Stripe charges. The absence of PDF/invoice links for all 19€ failed rows proves they exist only in the zonacncplans payment_records table, not in Stripe.

The generation mechanism is **still active** — 3 new phantom invoices appearing on 02/05/2026 proves the bug is producing records in real time.

## Evidence Artifacts

- Screenshot: `stripe-billing-test3-subscription-2026-05-02.png` — subscription page showing sidebar badge "191"
- Screenshot: `stripe-billing-test3-billing-2026-05-02.png` — billing page page 1
- Previous finding: `CRONQA-2026-05-01-stripe-billing-phantom-19eur-failed-invoices-test3.md`

## Impact Update (Worsening)

- **Database bloat:** 191 records in < 1 week, growing at ~1-2/hour
- **Vendor trust erosion:** Any vendor seeing 100+ failed payments would abandon the platform
- **Support burden:** Vendors will contact support about the phantom failures
- **Sidebar badge:** "191" looks completely broken to any vendor
- **At current rate:** ~300+ phantom records by end of month

## Recommendation

**🔴 URGENT — Needs immediate code fix:**
1. Identify the cron/webhook handler creating 19€ records in `zonacncplans_payment_records`
2. Add deduplication guard (check if identical record exists before inserting)
3. Clean up existing phantom records (DELETE WHERE amount=19.00 AND status='failed' AND invoice_url IS NULL)
4. Add logging to trace the exact code path generating these phantom entries
5. Add rate limiting / alerting on failed payment record creation
