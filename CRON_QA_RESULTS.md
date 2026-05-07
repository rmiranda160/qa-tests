# CRON_QA Results — stripe-billing (Latest)
**Run:** 2026-05-07 00:50 UTC | **Duration:** ~8 min  
**Scenario:** IMAP audit across 24 accounts (test7–test30) — template/translation verification  
**Accounts:** test7–test30@zonacnc.com (24 accounts)  
**Mode:** IMAP-only (site new.zonacnc.com returns HTTP 500 — browser testing not possible)  
**PR:** #234 | **Issue:** #235

## Site Status: ❌ HTTP 500 (18h+ outage)

```
curl -s -o /dev/null -w "%{http_code}" -L https://new.zonacnc.com/
500
```

## Findings (10 bugs — 9 persist, 1 partial fix)

### 🔴 PERSISTS: BUG-001 — Wrong Ad Count in Welcome Emails (25 instances)
All welcome emails show "Anuncios incluidos: 1" regardless of plan. Starter=3, Business=50, Pro=10, Enterprise=unlimited actual.

### 🔴 PERSISTS: BUG-002 — "Renovación" Wording for First Subscription (21 instances)
Welcome emails say "Próxima renovación" even for brand-new subscriptions.

### 🟡 PARTIAL FIX ⚡: BUG-003 — Template Variables in Onboarding
- **15 OLD emails (May 2-4):** Variables appear as literals: `{new_ad_url}`, `{max_listings}`, etc.
- **4 NEW emails (May 5-6):** Variables properly resolved — clean onboarding emails
- Fix deployed between May 4-5, but old broken emails never re-sent

### 🔴 PERSISTS: BUG-004 — EN/ES Mix + Duplicate Words (14 instances)
"Your tu plan plan" (EN) / "tu plan tu plan" (ES) in cancellation emails across 7 accounts.

### 🟡 PERSISTS: BUG-005 — Invoice Emails: No IVA/Tax Info (14 instances)
Prices shown without IVA breakdown. Stripe charges €47.19 (€39 + 21% IVA).

### 🟡 PERSISTS: BUG-006 — Wrong Language: EN for ES Accounts (3 instances)
test26, test30 receive English onboarding/welcome despite ES locale.

### 🟢 PERSISTS: BUG-007 — Wrong Charset: ascii with UTF-8 (3 instances)
HTML emails declare charset=ascii with UTF-8 content.

### 🟡 PERSISTS: BUG-009 — Add-on Email Anglicism + Missing Amount (2 instances)
"Add-on añadido" instead of "Complemento añadido". Prorated amount shows placeholder.

### 🟢 PERSISTS: BUG-010 — Welcome Subject Truncated (23 instances)
Subject ends at "activ" — final "a" in "activa" cut off by encoding length limit.

### ⚠️ SITE-500-001 — Site Outage (BLOCKING)
new.zonacnc.com returns HTTP 500. 8+ consecutive CRON QA runs blocked. No E2E billing testing possible.

## Summary
| Metric | Value |
|---|---|
| Total emails scanned | 301 |
| Billing-related | 144 |
| Bugs found | 10 (9 persist + 1 partial fix) |
| New billing activity | 0 (site 500) |
| Site status | ❌ HTTP 500 |

---

## Previous Run (2026-05-06 23:38 UTC)

**Run:** 2026-05-06 23:38 UTC | **Duration:** ~25 min  
**Scenario:** Add-on email audit + cross-plan welcome/invoice/cancellation template comparison  
**Accounts:** test7, test8, test14, test20, test25, test26, test30@zonacnc.com (7 accounts)  
**Mode:** IMAP-only (site new.zonacnc.com returns HTTP 500 — browser testing not possible)  
**PR:** #230 | **Issue:** #231

### Findings (9 — 4 reconfirmed, 3 new, 1 correction, 1 low)
🔴 NEW: A5 — Cancellation email language inconsistency (ES account gets EN email)  
🔴 RECONFIRMED: A2 — Welcome ad count still "1" for ALL plans  
🔴 RECONFIRMED: A3 — "Renovación" language for first subscription  
🔴 RECONFIRMED: A4 — "tu plan tu plan" / "Your tu plan plan" duplication  
🟡 NEW: A1 — Add-on email anglicism + missing prorated amount  
🟡 NEW: A7 — Welcome subject truncated: "está activ" → "activa"  
🟡 RECONFIRMED: A6 — Invoice email: IVA included but not disclosed  
🟢 CORRECTION: A8 — Add-on emails ARE being sent (prior Finding 17 invalidated)  
🟢 LOW: A9 — No `lang` attribute on HTML email templates

---

## Previous Run (19:12 UTC)

🟡 FINDING 1: Price Discrepancy — IVA Not Shown Before Stripe  
🟡 FINDING 2: Stripe Checkout Not Localized to Spanish  
🟡 FINDING 3: Payment Method Names Partially Localized  
🟢 FINDING 4: Payment Flow Works Correctly
