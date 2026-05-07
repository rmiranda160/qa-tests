# CRON QA Results Summary

## Latest Run: 2026-05-07 11:30 UTC (stripe-billing deep audit)

### stripe-billing — Full Email & Template Audit (test7, test8)
- **Account:** test7@zonacnc.com (58 emails audited), test8@zonacnc.com (register attempt)
- **Focus:** Email templates, translations, plan/price consistency, webhook security
- **Status:** ✅ Completed (no new checkout — all test accounts already exist)
- **Commit:** `a3bfdb5` — pushed to main
- **Findings file:** `qa-agent/findings/STRIPE-BILLING-2026-05-07.md`

### Findings Summary
| Severity | Count | Key Issues |
|----------|-------|------------|
| 🔴 HIGH  | 3     | Plan name/price mismatch in renewal, wrong ad count in welcome, partial translations |
| 🟡 MEDIUM | 2     | Cancelation placeholder "tu plan", uncalculated proration literal |
| 🟢 LOW   | 2     | Untranslated "monthly", generic boost page title |
| ✅ PASS   | 14    | Pricing pages, email design, auth gates, API security all OK |

### Bugs Found (3 new HIGH)
1. 🔴 Renewal invoice (#13): Plan says "Business" but charges 99,73€ (Pro price)
2. 🔴 Pro welcome (#12): "Anuncios incluidos: 1" — should be 10
3. 🔴 Pricing pages in FR/DE/EN: only "ads" count translated, rest in Spanish
4. 🟡 Cancelation (#35): "de tu plan tu plan" — plan_name variable empty
5. 🟡 Add-on (#14): "(prorrateado por Stripe)" literal placeholder instead of amount
6. 🟢 Welcome (#12): "Periodo: monthly" untranslated
7. 🟢 Boost packs: `<title>` is just "zonacnc.com"

### Two Stripe Accounts Compared
- `acct_1TPLFqELpLIGgmZK` (older): has translation bugs, plan mismatch
- `acct_1TTkeRPzDPgjo8Yc` (newer): translations fixed, pricing correct ✅

---

## Previous Run: 2026-05-07 09:04 UTC

### stripe-billing — Starter Subscription (test9)
- **Account:** test9@zonacnc.com (Test Eight)
- **Plan:** Starter (39€/mes + IVA = 47.19€)
- **Flow:** Login → Seller registration → Billing address → Stripe Checkout → Payment → Redirect → Verification
- **Status:** ✅ Completed
- **Emails:** 3 received (welcome, invoice, onboarding) — IMAP verified
- **PR:** #251 (merged)
- **Findings file:** `findings/CRONQA-2026-05-07-stripe-billing-starter-test9.md`

### Bugs Found
1. 🐛 Welcome email shows "Anuncios incluidos: 1" instead of 3 (Starter plan allows 3)
2. 🐛 Pricing page contradiction: Starter card says "Boosts comprar en packs" but footer says "Starter y superiores ya incluyen Boosts"

### Email Template Quality
- All 3 emails have plain-text alternatives ✅
- Consistent dark header styling across templates ✅
- Onboarding email personalized with account name ✅
- CTA buttons present and functional ✅
- All content in Spanish as expected ✅
