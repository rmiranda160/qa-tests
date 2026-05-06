# CRON_QA Results — stripe-billing (Latest)
**Run:** 2026-05-06 23:38 UTC | **Duration:** ~25 min  
**Scenario:** Add-on email audit + cross-plan welcome/invoice/cancellation template comparison  
**Accounts:** test7, test8, test14, test20, test25, test26, test30@zonacnc.com (7 accounts)  
**Mode:** IMAP-only (site new.zonacnc.com returns HTTP 500 — browser testing not possible)  
**PR:** #230 | **Issue:** #231

## Findings (9 — 4 reconfirmed, 3 new, 1 correction, 1 low)

### 🔴 NEW: A5 — Cancellation email language inconsistency (ES account gets EN email)
test26 received English "Subscription Canceled" while test7 received Spanish "Tu suscripción se ha cancelado". Both are ES-locale accounts. Race condition in template selection.

### 🔴 RECONFIRMED: A2 — Welcome ad count still "1" for ALL plans
6 welcome emails across 5 accounts (Starter + Business). All show "Anuncios incluidos: 1". Starter=3, Business=50 actual.

### 🔴 RECONFIRMED: A3 — "Renovación" language for first subscription
All welcome + invoice emails say "renovación" (renewal) even for first-time subscriptions.

### 🔴 RECONFIRMED: A4 — "tu plan tu plan" / "Your tu plan plan" duplication
Confirmed in both HTML and plain text in test7 #35 and test26 #10.

### 🟡 NEW: A1 — Add-on email anglicism + missing prorated amount
"Add-on añadido" uses "Add-on" instead of "Complemento". Prorated charge amount shows placeholder text, not actual amount.

### 🟡 NEW: A7 — Welcome subject truncated: "está activ" → "activa"
All welcome emails: subject ends at "activ" — final "a" cut off by encoding length limit.

### 🟡 RECONFIRMED: A6 — Invoice email: IVA included but not disclosed
47.19€ shown without IVA breakdown (39€ + 8.19€ IVA 21%).

### 🟢 CORRECTION: A8 — Add-on emails ARE being sent (prior Finding 17 invalidated)
Add-on emails found in test7 #32, test8 #13, test20 #19. Previous test missed them.

### 🟢 LOW: A9 — No `lang` attribute on HTML email templates

**Status:** ❌ Site still HTTP 500 — 8 previously reported billing bugs remain unfixed. 3 new bugs found in this audit.

---

## Previous Run (23:12 UTC)

**Run:** 2026-05-06 23:12 UTC | **Duration:** ~10 min  
**Scenario:** Cross-account email template audit (IMAP-only, site HTTP 500)  
**Accounts:** test7–test30@zonacnc.com (24 accounts) | **Emails scanned:** 301 (144 billing)  
**PR:** #227 | **Issue:** #228

### Findings (8 systemic bugs)

🔴 BUG-001: Wrong Ad Count in Welcome Emails (25 instances) — "Anuncios incluidos: 1" regardless of plan  
🔴 BUG-002: Renewal Wording in Welcome Emails (21 instances) — "renovación" for first subscription  
🔴 BUG-003: Template Variables Not Substituted in Onboarding (15 instances) — 6 variables as literals  
🔴 BUG-004: Cancellation EN/ES Mix + Duplicate Word (14 instances) — "Your tu plan plan" / "tu plan tu plan"  
🟡 BUG-005: Invoice Emails — No IVA/Tax Info (14 instances)  
🟡 BUG-006: Onboarding Emails Wrong Language (3 instances) — EN for ES accounts  
🟢 BUG-007: Wrong Charset in Onboarding HTML (3 instances) — charset=ascii with UTF-8  
🟡 BUG-008: Duplicate "tu plan" in Spanish Cancellations (7 instances)

---

## Previous Run (19:12 UTC)

**Run:** 2026-05-06 19:12 UTC | **Duration:** ~10 min  
**Account:** test7@zonacnc.com | **Plan:** Starter (Stripe) | **Session:** cs_test_a1gETId30UAYzz2M14o0n6IetPEcLapqaalQNQ02eLCd6x6ALTLiamKycG

### Findings (4)
- BUG-SB-001 ⚠️ MEDIUM — Renewal wording used for first subscription
- BUG-SB-002 ⚠️ MEDIUM — Missing accent on success page ("esta" → "está")
- BUG-SB-003 ⚠️ LOW — Misleading "+" prefix on invoice line
- BUG-SB-004 ⚠️ LOW — Payment method not saved after Stripe Checkout

### Flow Verified
| Step | Status |
|------|--------|
| Select Starter plan → Stripe Checkout | ✅ |
| Fill test card (4242...) | ✅ |
| Payment success + redirect | ✅ |
| Subscription active (next billing 06/06/2026) | ✅ |
| Invoice in history (47,19€, PDF) | ✅ |
| Email received (< 2s, DKIM/SPF/DMARC pass) | ✅ |
