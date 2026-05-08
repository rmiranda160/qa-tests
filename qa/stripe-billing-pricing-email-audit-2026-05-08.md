# QA Report: Stripe Billing — Pricing Page & Email Template Audit

**Date:** 2026-05-08 08:09–08:25 UTC  
**Tester:** subagent:tester (cron: tester-stripe-billing)  
**Focus Area:** stripe-billing  
**Test Users:** test3@zonacnc.com (subscription page), test7@zonacnc.com (email audit), test10@zonacnc.com (registration attempt)  
**Pages Audited:** Pricing (`/es/module/zonacncplans/pricing`), Subscription (`/es/module/zonacncplans/subscription`), Change Plan (`/es/cambiar-plan`)  
**Emails Reviewed:** IMAP test7 (UID 29, 32, 41, 48)  
**Spec Reference:** PRICING_RULES.md §5 (Naming Standard), v1.7.13 (21 Stripe Prices)  
**MCP Status:** ❌ `pwmcp-zonacnc` — HTTP 401 (authentication failed), fallback to curl + web_fetch + IMAP  

---

## Summary

⚠️ **ISSUES FOUND** — 7 findings (2 HIGH, 3 MEDIUM, 2 LOW) across pricing UI, email templates, and data consistency.

---

## Findings

### Finding 1 [HIGH] — Yearly/Annual Pricing Toggle Missing from All Subscription Pages

**Location:** Pricing page, subscription page, change-plan page  
**Expected:** Users should see both monthly and annual plan options (PRICING_RULES.md defines "Plan X Mensual" and "Plan X Anual" Stripe Prices — 21 total)  
**Actual:** Only monthly pricing shown. Zero references to "anual", "annual", "yearly", or yearly pricing across all three pages.

**Evidence:**
- `grep -ci 'anual\|Anual\|yearly\|Yearly\|annual'` on pricing page HTML (240KB): **0 matches**
- `grep -ci 'anual\|Anual\|yearly\|Yearly\|annual'` on subscription page HTML (242KB): **0 matches**
- `grep -ci 'anual\|Anual\|yearly\|Yearly\|annual'` on change-plan page HTML (254KB): **0 matches**
- Stripe infrastructure has both monthly and yearly Prices seeded (v1.7.13 deployed 2026-05-04)

**Impact:** Users can't discover or select annual plans, missing potential 10-20% discount incentive. Revenue impact.

**Severity:** HIGH  
**Reproducibility:** Always

---

### Finding 2 [HIGH] — Email Template: Mixed Language "Periodo: monthly"

**Location:** Welcome email (test7 IMAP UID 29), sent 2026-05-04  
**Expected:** "Periodo: mensual" (consistent Spanish)  
**Actual:** "Periodo: monthly" — Spanish label with untranslated English value

**Evidence (from decoded email):**
```html
<p style="margin:0 0 6px;"><strong>Periodo:</strong> monthly</p>
```
The HTML template has `lang="es"` and all other content is Spanish, but the billing period value "monthly" is hardcoded in English.

**Impact:** Unprofessional appearance for Spanish users. Inconsistent translation.

**Severity:** HIGH  
**Reproducibility:** Always for monthly plan welcome emails

---

### Finding 3 [MEDIUM] — Email Template: English-Only Welcome Variant for Spanish Users

**Location:** Welcome email (test7 IMAP UID 41), sent 2026-05-06  
**Expected:** Full Spanish email when user's language is Spanish  
**Actual:** Subject is Spanish ("¡Bienvenido a Starter! Tu suscripción está activa") but the HTML body is entirely in English with `lang="en"`:

```html
<html lang="en">
...
<h1>Welcome to ZonaCNC</h1>
<p>Hello Test,</p>
<p>Welcome to ZonaCNC! Your <strong>Starter</strong> plan is now active.</p>
...
<a href="...">Manage Subscription</a>
```

Compare with UID 29 (Spanish variant) which correctly uses `lang="es"` and "Hola Test Vendor" / "Ir a Mi suscripción".

**Impact:** Poor UX for non-English users receiving an English email with a Spanish subject line.

**Severity:** MEDIUM  
**Reproducibility:** Appears when certain language-detection path is hit

---

### Finding 4 [MEDIUM] — Email Template: Placeholder Literal in Add-on Email

**Location:** Add-on confirmation email (test7 IMAP UID 32), sent 2026-05-05  
**Expected:** Actual prorated amount in euros (e.g., "4,50 €")  
**Actual:** Literal string "(prorrateado por Stripe)" displayed as the amount:

```html
<p style="margin:0;"><strong>Cobro proporcional ahora:</strong> (prorrateado por Stripe)</p>
```

And in plain-text body:
```
- Cobro proporcional ahora: (prorrateado por Stripe)
```

**Impact:** User can't see how much they were charged for the prorated add-on. Confusion and potential support tickets.

**Severity:** MEDIUM  
**Reproducibility:** Always for add-on purchase emails

---

### Finding 5 [MEDIUM] — Ads Count Mismatch: Email vs Pricing Page

**Location:** Welcome emails (UID 29 & 41) vs. Pricing page `/es/module/zonacncplans/pricing`  
**Expected:** Starter plan email shows "3 anuncios incluidos" (matching pricing page)  
**Actual:** Email shows "1 anuncio incluido" / "Ads included: 1" while pricing page shows "3 anuncios activos":

- Pricing page HTML: `<strong>3</strong>&nbsp;anuncios activos` ✅
- Email (UID 29): `<strong>Anuncios incluidos:</strong> 1` ❌
- Email (UID 41): `<td>Ads included:</td><td>1</td>` ❌

Pricing spec v14 confirms: Starter = 3 anuncios activos.

**Impact:** Misleading information to new subscribers. User thinks they only get 1 ad when they paid for 3.

**Severity:** MEDIUM  
**Reproducibility:** Always for Starter welcome emails

---

### Finding 6 [LOW] — Starter Add-on Price Doesn't Match Any Plan Spec

**Location:** Pricing page, Starter plan card  
**Expected:** Add-on pricing per plan (Pro=9€, Business=6€, Enterprise=3€ per v14 spec), or no add-ons for Starter  
**Actual:** `data-addon-listing-price="12"` for Starter — 12€ doesn't match any plan's defined add-on rate:

```html
<div class="zonacnc-pricing__addons" data-zaddons
     data-plan-slug="starter"
     data-plan-monthly="39.00"
     data-addon-listing-price="12"
     data-addon-featured-price="0">
```

Also `data-addon-featured-price="0"` — featured add-ons effectively disabled for Starter.

**Impact:** If Starter supports add-ons, the price should be defined consistently. If not, add-ons should be hidden for Starter.

**Severity:** LOW  
**Reproducibility:** Always

---

### Finding 7 [LOW] — "Modo Test" Banner Visible on Subscription Page

**Location:** Subscription page `/es/module/zonacncplans/subscription`  
**Expected:** Test mode indicator hidden or removed in production  
**Actual:** Banner with "Modo test" / "MODO TEST" text visible to authenticated users:

```
Modo test
MODO TEST
```

**Impact:** Confusing for test users. Could alarm real users if visible.

**Severity:** LOW  
**Reproducibility:** Always

---

## Pages Verified (No Issues)

| Check | Pricing Page | Subscription Page | Change Plan Page |
|---|---|---|---|
| HTML structure (`<html>`/`</html>`) | ✅ Complete | ✅ Complete | ✅ Complete |
| Fatal errors / PHP warnings | ✅ None | ✅ None | ✅ None |
| Undefined index notices | ✅ None | ✅ None | ✅ None |
| Empty `href=""` | 1 (minor) | ✅ None | ✅ None |
| OG meta tags | ✅ 5 present | ✅ Present | ✅ Present |
| IVA display | ✅ 13 mentions | ✅ Present | N/A |
| Add-on pricing section | ✅ Present | ✅ Present | N/A |
| Subscribe CTA buttons | ✅ 11 buttons | N/A | N/A |
| Breadcrumbs | N/A | ✅ Inicio > Mi cuenta > Mi suscripción | ✅ 4-level |
| Multi-language URLs | ✅ 12 languages | ✅ 11 languages | ✅ 11 languages |
| Billing history link | N/A | ✅ `billing-link` + "Facturas y pagos" | N/A |

## Email Templates Verified

| UID | Subject | Language | Issues |
|---|---|---|---|
| 29 | ¡Bienvenido a Starter! Tu suscripción está activa | ES | ❌ "Periodo: monthly" (EN) instead of "mensual" |
| 32 | Add-on añadido a tu suscripción | ES | ❌ Placeholder "(prorrateado por Stripe)" instead of amount |
| 41 | ¡Bienvenido a Starter! Tu suscripción está activa | EN body, ES subject | ❌ Entire body in English for Spanish user |
| 48 | Factura pagada — Tu plan sigue activo | ES | ✅ Clean, proper template |

---

## Verdict

```
+---------------------------------------------------+
| Audit: Pricing Pages + Email Templates             |
| Pages: 3 audited, 0 critical failures              |
| Emails: 4 reviewed, 3 with issues                  |
| HIGH findings: 2                                   |
| MEDIUM findings: 3                                 |
| LOW findings: 2                                    |
| Result: ⚠️ ISSUES FOUND                           |
+---------------------------------------------------+
```

### Priority Order
1. **Fix Finding 1 & 2** (yearly toggle + email "monthly" → "mensual") — immediate
2. **Fix Finding 4** (placeholder text) — should show actual amount
3. **Fix Finding 5** (ads count mismatch) — data integrity
4. **Fix Finding 3** (English email variant) — translation coverage
5. **Address Finding 6 & 7** (add-on pricing, test banner) — cleanup

---

## Labels
- `qa-stripe-billing`
- `2026-05-08`
- `pricing-audit`
- `email-template`
- `findings`

## Metadata
- **Cron ID:** f88c723f-9d7c-485a-b506-55f4e41efab3
- **MCP:** pwmcp-zonacnc (unavailable, HTTP 401)
- **Fallback tools:** curl, web_fetch, IMAP (openssl s_client)
