# QA Report: Stripe Billing — new.zonacnc.com
**Date:** 2026-05-08 14:31 UTC  
**Tester:** cron:f88c723f-9d7c-485a-b506-55f4e41efab3 (tester-stripe-billing)  
**Scope:** Stripe billing flows — HTTP-level validation (MCP node unavailable, no browser automation)  
**Module version:** zonacncplans v1.7.19

---

## ✅ Passed Tests

| # | Test | Result | Detail |
|---|------|--------|--------|
| 1 | Pricing page renders 5 tiers | ✅ | Free(0€), Starter(39€), Pro(99€), Business(199€), Enterprise(299€) |
| 2 | All 9 languages load pricing | ✅ | es, en, ca, gl, eu, fr, de, pt, it — all HTTP 200 |
| 3 | CTA buttons link correctly | ✅ | Free→alta-vendedor, Starter/Pro/Business/Enterprise→pagar-plan?plan=X |
| 4 | Auth gating on checkout | ✅ | `/es/pagar-plan?plan=pro` redirects to `/es/iniciar-sesion` |
| 5 | Seed Stripe Prices — plans | ✅ | 8 prices (4 monthly + 4 yearly) for Starter/Pro/Business/Enterprise |
| 6 | Seed Stripe Prices — add-ons | ✅ | 8 prices (4 monthly + 4 yearly) — listing add-ons 12/9/6/3€ |
| 7 | Seed Stripe Prices — packs | ✅ | 5 boost pack prices (25€/45€/100€/179€/200€) |
| 8 | Boost ledger balanced | ✅ | 29 vendors, diff=0, monthly=147, permanent=74, proper source breakdown |
| 9 | Test suite: 45/45 PASS | ✅ | Unit + smoke tests all green |
| 10 | Webhook signature validation | ✅ | Rejects invalid signatures with `{"error":"Invalid signature"}` |
| 11 | IMAP email delivery | ✅ | test7@zonacnc.com receives emails via Mailgun (mg.zonacnc-sales.es) |
| 12 | Password reset email template | ✅ | HTML + plain text, personalized greeting, proper Spanish, correct links |
| 13 | Mobile responsiveness (HTTP) | ✅ | Pricing page returns 200 with iPhone UA, 241KB (CSS-based responsive) |
| 14 | Packs-boost page loads | ✅ | `/es/packs-boost` HTTP 200, all 10 languages available |
| 15 | Add-on listing prices per tier | ✅ | Starter:12€, Pro:9€, Business:6€, Enterprise:3€ — consistent with spec |
| 16 | Yearly billing endpoint | ✅ | `/es/pagar-plan?plan=pro&billing=yearly` → redirects to login (correct) |

---

## 🔴 Findings

### F7: data-addon-featured-price="0" on All Plans (Medium)
**Pages:** `/es/pricing` (all paid plans)

All 4 paid plans show `data-addon-featured-price="0"` in their data attributes. The featured/destacado add-on appears to be either disabled or not configured with a Stripe price.

```html
data-addon-featured-price="0"  <!-- Starter -->
data-addon-featured-price="0"  <!-- Pro -->
data-addon-featured-price="0"  <!-- Business -->
data-addon-featured-price="0"  <!-- Enterprise -->
```

**Impact:** If the "Add-on Destacado Extra" feature is intended to be sold, customers cannot purchase it. If intentionally disabled, the UI should not show the add-on selector or should mark it as "coming soon".

**Contrast:** The listing add-on is properly priced (12/9/6/3€ per tier) and has corresponding Stripe prices in the seed endpoint.

---

### F8: Vault-Module Version Drift (Info)
| Source | Version |
|--------|---------|
| Vault (zonacnc-pricing-v17.md) | v1.7.13 |
| Actual deployed module | v1.7.19 |

**Impact:** The vault documentation is 6 patch versions behind. Testing documentation references features from 1.7.11-1.7.13 that may have changed.

---

## 📊 Previous Findings Follow-up

| ID | Finding | Status | Notes |
|----|---------|--------|-------|
| F1 | Boost Count Mismatch in Stripe Checkout | ⚠️ Unverified | Cannot access Stripe Checkout without browser |
| F2 | Proration Amount Placeholder in Emails | ⚠️ Unverified | No add-on emails observed in today's test window |
| F3 | Plan Name Translation Inconsistency | ⚠️ Unverified | No renewal invoices received today |
| F4 | "Boosts 24h" vs "Destacados" | 🟡 Partial | Pricing page now uses "Boost Packs" consistently (0 "destacado" occurrences). Plan change page not verified. |
| F5 | Console JS Error `Unexpected token '&'` | ⚠️ Unverified | No browser automation available |
| F6 | Email Sender Domain Variation | ⚠️ Unverified | Only password-reset email observed today (mg.zonacnc-sales.es) |

---

## 📧 Email Verification

| Account | Emails | Latest |
|---------|--------|--------|
| test7@zonacnc.com | 75 | Password reset confirmation (2026-05-08T16:36 CEST) — from no-reply@mg.zonacnc-sales.es |

Email template review (password reset):
- ✅ Both text/plain and text/html parts present
- ✅ HTML uses responsive email template with proper structure
- ✅ Personalized greeting: "Hola Test Seven"
- ✅ Clear subject: "[zonacnc.com] Confirmación de contraseña"
- ✅ From: "zonacnc.com" <no-reply@mg.zonacnc-sales.es>
- ✅ Reset link with proper token format
- ✅ Footer with shop link and PrestaShop attribution
- ⚠️ Minor: `&nbsp;` at the start of the plain text body (whitespace artifact)

---

## 🎯 Recommendations

1. **Investigate (F7):** Confirm if "Add-on Destacado Extra" is intentionally priced at 0€ or needs a Stripe price configured. If disabled, update UI to hide or mark as "Próximamente".
2. **Update vault:** Bump zonacnc-pricing-v17.md module version reference to v1.7.19.
3. **Re-test with browser:** F1, F2, F3, F5 need browser-based verification (MCP node pwmcp-zonacnc was unreachable at 51.254.244.216:3000).
