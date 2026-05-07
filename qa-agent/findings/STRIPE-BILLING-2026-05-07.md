# QA Report: Stripe Billing Flow — 2026-05-07

**Scope:** `new.zonacnc.com` — Stripe billing flow (pricing, checkout, emails, templates, translations)
**Tester:** CRON QA (tester agent)
**Date:** 2026-05-07 11:14–11:30 UTC
**Accounts tested:** test7@zonacnc.com, test8@zonacnc.com
**IMAP verified:** ✅ test7@zonacnc.com (58 emails reviewed)

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 HIGH  | 3     | Need fix |
| 🟡 MEDIUM | 2     | Should fix |
| 🟢 LOW   | 2     | Nice to fix |
| ✅ PASS   | 14    | OK |

---

## Findings

### 🔴 HIGH-1: Renewal invoice: plan name doesn't match price
- **Email:** #13 (test7, Stripe acct `acct_1TPLFqELpLIGgmZK`)
- **Subject:** "Factura pagada — Tu plan sigue activo"
- **Issue:** Plan says "Business" but amount is 99,73€, which matches the **Pro** plan (99€ + IVA prorated). The Business plan should be 199€/mes.
- **Impact:** Customer receives an invoice with conflicting information. Could cause billing disputes or confusion about which plan they're on.
- **Possible cause:** Plan name/price mapping out of sync in renewal webhook handler.

### 🔴 HIGH-2: Pro welcome email shows wrong ad count
- **Email:** #12 (test7)
- **Subject:** "¡Bienvenido a Pro! Tu suscripción está activa"
- **Issue:** "Anuncios incluidos: 1" — Pro plan should have **10** active ads, not 1. This is the Free plan ad count.
- **Impact:** New Pro subscribers may think they only get 1 ad, potentially causing them to cancel immediately or not publish.
- **Affected account:** Stripe acct `acct_1TPLFqELpLIGgmZK`

### 🔴 HIGH-3: Pricing pages partially untranslated in all non-ES languages
- **URLs:** `/fr/pricing`, `/de/pricing`, `/en/pricing`
- **Issue:** Only the "active ads" count field and page `<title>` are translated. All other content (feature names, CTAs, section headings, footer promises) remains in Spanish.
  - FR: "annonce active" ✅ but "Elige tu plan de vendedor" ❌, "Más popular" ❌
  - DE: "aktive Anzeige" ✅ but everything else Spanish ❌
  - EN: "active ad" ✅ but heading/features in Spanish ❌
- **Impact:** Broken UX for international users. Non-Spanish speakers cannot understand plan features.
- **Note:** English pricing page has its own template, but French and German reuse the Spanish template.

### 🟡 MEDIUM-1: Cancelation email renders literal placeholder text
- **Email:** #35 (test7)
- **Subject:** "Tu suscripción se ha cancelado"
- **Issue:** "Confirmamos la cancelación de tu plan **tu plan**" — the `{plan_name}` variable is empty, rendering the default placeholder text.
- **Impact:** Unprofessional appearance. Customer can't tell which plan was canceled from the email alone.
- **Expected:** "Confirmamos la cancelación de tu plan Pro"

### 🟡 MEDIUM-2: Add-on email shows uncalculated proration
- **Email:** #14 (test7)
- **Subject:** "Add-on añadido a tu suscripción"
- **Issue:** "Cobro proporcional ahora: (prorrateado por Stripe)" — the proration amount is never calculated or filled; literal placeholder text is displayed.
- **Impact:** Customer doesn't know how much they were charged for the prorated add-on.
- **Expected:** A real amount, e.g., "Cobro proporcional ahora: 2,50 €"

### 🟢 LOW-1: "Periodo: monthly" not translated in Spanish welcome email
- **Email:** #12 (test7)
- **Issue:** "Periodo: monthly" uses English "monthly" instead of Spanish "Mensual"
- **Impact:** Minor inconsistency in otherwise Spanish email.
- **Note:** Fixed in newer Stripe account (`acct_1TTkeRPzDPgjo8Yc`, email #48 shows "mensual" ✅)

### 🟢 LOW-2: Boost packs page has generic title
- **URL:** `/module/zonacncplans/boostpacks`
- **Issue:** `<title>` is just "zonacnc.com" — no descriptive title
- **Impact:** Poor SEO, browser tab shows generic name
- **Expected:** "Comprar Boosts 24h — ZonaCNC" or similar

---

## Passed Checks ✅

| # | Check | Detail |
|---|-------|--------|
| 1 | Pricing page renders | All 5 plans (Free/Starter/Pro/Business/Enterprise) displayed correctly |
| 2 | Plan prices match vault | 0€ / 39€ / 99€ / 199€ / 299€ + IVA (21%) per vault v17 |
| 3 | Boost packs page | 5/10/25/50 packs (25€–179€), per-unit pricing correct |
| 4 | Page titles (ES/EN/FR/DE) | Spanish ✅ "Planes para vendedores", EN/FR/DE titles correct |
| 5 | Email HTML design | Consistent template: dark header (#1a2332), white card, proper typography |
| 6 | Email sender | Always ZonaCNC <no-reply@mg.zonacnc-sales.es> ✅ |
| 7 | Stripe invoice PDF links | Links to `pay.stripe.com/invoice/.../pdf` are valid |
| 8 | Subscription link in emails | All emails include `module/zonacncplans/subscription` link |
| 9 | Webhook endpoint security | Returns 404 (not 500) — doesn't leak info |
| 10 | Seed script security | `/zonacnc-seed-stripe-prices.php` returns 403 (protected) ✅ |
| 11 | Test script security | `/zonacnc-run-tests.php` returns 403 (protected) ✅ |
| 12 | Auth gates | Checkout, subscription pages redirect unauthenticated to login ✅ |
| 13 | MODO TEST banner | Present on all pages ✅ |
| 14 | Multi-Stripe account support | Both `acct_1TPLFqELpLIGgmZK` and `acct_1TTkeRPzDPgjo8Yc` functioning |

---

## Account Comparison

| Feature | acct_1TPLFqELpLIGgmZK (older) | acct_1TTkeRPzDPgjo8Yc (newer) |
|---------|------|------|
| Renewal "mensual" translated | ❌ "monthly" | ✅ "mensual" |
| Welcome ad count correct | ❌ Pro=1 ad | TBD |
| Renewal plan/price match | ❌ Business/99€ | ✅ Starter/47,19€ |
| Cancelation template | ❌ "tu plan" placeholder | Not tested |

**Conclusion:** The newer Stripe account (`acct_1TTkeRPzDPgjo8Yc`) has some fixes not backported to the older account.

---

## Recommendations

1. **Fix plan name/price mapping** in renewal webhook handler — ensure consistency between plan_id, plan name, and amount
2. **Fix ad counts per plan** in welcome email template — Pro=10, Business=25, Enterprise=100, etc.
3. **Complete translations** for all pricing page languages — create proper language files for each locale
4. **Fix variable substitution** in cancelation template — ensure `{plan_name}` is always populated
5. **Calculate proration** in add-on email or remove the display if not available
6. **Add descriptive title** to boost packs page
