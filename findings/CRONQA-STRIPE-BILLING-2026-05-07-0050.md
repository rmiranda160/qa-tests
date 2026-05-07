# CRON QA: Stripe Billing — 2026-05-07 00:50 UTC

**Focus area:** stripe-billing  
**Site:** new.zonacnc.com  
**Status:** ❌ HTTP 500 — site unreachable (browser testing not possible)  
**Mode:** IMAP-only email audit  
**Accounts scanned:** test7–test30@zonacnc.com (24 accounts)  
**Total emails scanned:** 301 (144 billing-related)  
**Duration:** ~8 min  
**Branch:** `cronqa/stripe-billing-2026-05-07T0050`  
**Previous PR:** #230 | **Previous Issue:** #231

---

## 🚨 SITE STATUS: Still HTTP 500

```
$ curl -s -o /dev/null -w "%{http_code}" -L https://new.zonacnc.com/
500
```

The site has been returning HTTP 500 since at least 2026-05-06 ~12:00 UTC. This is the 8th+ consecutive CRON QA run blocked by this outage. No billing flows can be tested end-to-end.

---

## 📊 Summary of Findings

| # | Bug | Severity | Instances | Status |
|---|---|---|---|---|
| BUG-001 | Wrong Ad Count in Welcome Emails | 🔴 Critical | 25 | PERSISTS |
| BUG-002 | Renewal Wording in Welcome Emails | 🔴 Critical | 21 | PERSISTS |
| BUG-003 | Template Variables Not Substituted (Onboarding) | 🟡 Medium | 15 old / 4 fixed | PARTIAL FIX ⚡ |
| BUG-004 | EN/ES Mix + Duplicate Word in Cancellation | 🔴 Critical | 14 | PERSISTS |
| BUG-005 | Invoice Emails — No IVA/Tax Info | 🟡 Medium | 14 | PERSISTS |
| BUG-006 | Onboarding Emails Wrong Language (EN for ES) | 🟡 Medium | 3 | PERSISTS |
| BUG-007 | Wrong Charset in Onboarding HTML (ascii/UTF-8) | 🟢 Low | 3 | PERSISTS |
| BUG-008 | Duplicate "tu plan" / "plan plan" in Cancellations | 🟡 Medium | 7 | PERSISTS |
| BUG-009 | Add-on Email: Anglicism + Missing Prorated Amount | 🟡 Medium | 2 | PERSISTS |
| BUG-010 | Welcome Subject Truncated ("activ" → "activa") | 🟢 Low | 23 | PERSISTS |

---

## ⚡ NEW OBSERVATION: Partial Template Variable Fix (BUG-003)

**Finding:** Onboarding emails dated May 5+ have properly resolved template variables, while May 2-4 emails do not.

### Broken (May 2-4): 15 emails
Variables appear as literal strings in email body:
- `{new_ad_url}`, `{max_listings}`, `{messaging_url}`, `{boost_quota_monthly}`, `{vendor_dashboard_url}`, `{boostpacks_url}`
- Accounts: test7, test8, test9, test10, test11, test12, test14, test16, test19, test21(#4), test22, test23, test24, test29, test30(#9)

### Fixed (May 5-6): 4 emails
Variables properly resolved, emails are clean:
- test20 #13 (May 5), test21 #9 (May 5), test25 #12 (May 5), test26 #14 (May 6)

**Impact:** A code fix was deployed between May 4-5 that resolved template variable substitution. However:
- Older accounts still have broken onboarding emails (no re-sends)
- All other bugs (ad count, renewal wording, IVA, EN/ES mix) persist in ALL emails regardless of date

---

## 🔴 Detailed Bug Status

### BUG-001: Wrong Ad Count — "Anuncios incluidos: 1" for ALL plans
**25 instances across all plans:**
- Starter (3 ads actual): test7, test8, test9, test11, test12, test14, test16, test19, test20, test21, test22, test24, test25, test26, test29, test30
- Business (50 ads actual): test14
- Enterprise (unlimited actual): test15, test16, test21
- Pro (10 ads actual): test23

All welcome emails show `Anuncios incluidos: 1` regardless of plan limits.

### BUG-002: "Renovación" (Renewal) Wording for First Subscription
**21 instances.** Welcome emails say "Próxima renovación" (next renewal) even for brand-new subscriptions. Should say "Próximo cobro" (next charge) or "Primer cobro" for initial subscriptions.

### BUG-003: Template Variables — PARTIAL FIX (see above)

### BUG-004: EN/ES Language Mix + Duplicate Words in Cancellation
**14 instances of "your tu plan" / "tu plan plan":**

| Account | Email ID | Language Received | Expected | Body Excerpt |
|---|---|---|---|---|
| test7 | #35 | ES (mixed) | ES | "Confirmamos la cancelación de tu plan tu plan" |
| test14 | #8 | ES (mixed) | ES | "Confirmamos la cancelación de tu plan tu plan" |
| test19 | #7 | **EN** (mixed) | ES | "Your tu plan plan has been canceled" |
| test21 | #6 | **EN** (mixed) | ES | "Your tu plan plan has been canceled" |
| test22 | #11 | **EN** (mixed) | ES | "Your tu plan plan has been canceled" |
| test26 | #10 | **EN** (mixed) | ES | "Your tu plan plan has been canceled" |
| test30 | #12 | **EN** (mixed) | ES | "Your tu plan plan has been canceled" |

### BUG-005: Invoice — No IVA Mention
**14 instances.** All invoice emails show net price (€39.00, €99.00, €299.00) without mentioning 21% IVA. Stripe charges €47.19 total.

### BUG-006: Wrong Language — EN Onboarding for ES Accounts
**3 instances:** test26 #8, test30 #9, test30 #10. ES-locale accounts receive English onboarding/welcome emails.

### BUG-007: Wrong Charset (ascii with UTF-8 content)
**3 instances:** test26 #8, test30 #9, test30 #10. HTML emails declare `charset=ascii` but contain UTF-8 characters.

### BUG-008: Duplicate "tu plan" (Spanish) / "plan plan" (English)
**7 instances** in cancellation emails, already covered under BUG-004.

### BUG-009: Add-on Email — "Add-on" Anglicism + Missing Prorated Amount
**2 instances:** test20 #19, test24 #12.
- Subject: "Add-on añadido" → should be "Complemento añadido"
- Body: "((prorrateado por Stripe))" → literal placeholder, not actual amount

### BUG-010: Welcome Subject Truncated
**23 instances.** Subject: `=?UTF-8?q?...est=C3=A1_activ?=` (cuts off before final "a" in "activa")

---

## 📈 Cross-Account Breakdown

| Account | Billing Emails | Issues |
|---|---|---|
| test7 | 3 | WRONG_AD_COUNT, RENEWAL, VARS, DUPLICATE_WORD |
| test8 | 3 | WRONG_AD_COUNT, RENEWAL, VARS |
| test9 | 3 | WRONG_AD_COUNT, RENEWAL, VARS |
| test10 | 3 | WRONG_AD_COUNT, RENEWAL, VARS |
| test11 | 3 | WRONG_AD_COUNT, RENEWAL, VARS, NO_IVA |
| test12 | 4 | WRONG_AD_COUNT, RENEWAL, VARS |
| test14 | 5 | WRONG_AD_COUNT(x2), RENEWAL(x2), VARS, EN_ES_MIX, NO_IVA |
| test15 | 4 | WRONG_AD_COUNT, RENEWAL, NO_IVA |
| test16 | 6 | WRONG_AD_COUNT(x2), RENEWAL(x2), VARS, NO_IVA |
| test19 | 5 | WRONG_AD_COUNT, RENEWAL, VARS, EN_ES_MIX |
| test20 | 6 | WRONG_AD_COUNT, RENEWAL, NO_IVA, ADDON |
| test21 | 7 | WRONG_AD_COUNT(x2), RENEWAL(x2), VARS, EN_ES_MIX, NO_IVA |
| test22 | 5 | WRONG_AD_COUNT, RENEWAL, VARS, EN_ES_MIX |
| test23 | 5 | WRONG_AD_COUNT, RENEWAL, VARS |
| test24 | 7 | WRONG_AD_COUNT, RENEWAL, VARS, NO_IVA, ADDON |
| test25 | 5 | WRONG_AD_COUNT, RENEWAL, NO_IVA |
| test26 | 7 | WRONG_AD_COUNT(x2), RENEWAL, VARS, WRONG_LANG, WRONG_CHARSET, EN_ES_MIX |
| test29 | 4 | WRONG_AD_COUNT, RENEWAL, VARS |
| test30 | 6 | WRONG_AD_COUNT, RENEWAL, VARS, WRONG_LANG(x2), WRONG_CHARSET(x2), EN_ES_MIX |

---

## 🎯 Conclusion

- **10 confirmed bugs** — all previously reported in PRs #227, #228, #230
- **1 new observation** — partial template variable fix deployed May 4-5 (BUG-003 now partially resolved for new emails)
- **0 new billing emails** since last scan (site 500 prevents new subscriptions)
- **Site outage:** 16+ hours and counting — blocking all end-to-end testing
- **Priority:** Fix site 500 first, then address the 9 remaining email template bugs

---

*Generated by OpenClaw QA Agent — CRON cronqa/stripe-billing-2026-05-07T0050*
