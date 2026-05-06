# CRON QA Report: stripe-billing — 2026-05-06

**Session:** CRON QA (tester-stripe-billing)  
**Date:** 2026-05-06 03:56–04:15 UTC  
**Target:** https://new.zonacnc.com  
**Tester account:** test20@zonacnc.com (Starter plan, customer ID 6648)  
**Method:** Browser automation via MCP `pwmcp-zonacnc` + Python `imaplib` for IMAP verification

---

## Scenario: Starter Plan Add-on Purchase & Ad Creation

### Account State (before test)
- Plan: **Starter** (€39/mes) — Activa
- Ads: **3/3** (limit reached)
- Next charge: 05/06/2026
- No previous add-ons active

### Actions Performed

1. **Password reset** via email → email #17 (reset link), #18 (new password confirmation)
   - ✅ Password reset flow works correctly
   - ✅ Greeting in email #18: "Hola Test User" — correctly formatted

2. **Add-on purchase**: "Anuncio extra x1" (€12.00/mes)
   - ✅ Confirmation dialog shown with price
   - ✅ Add-on applied immediately: ad limit changed from 3/3 → 3/4
   - ✅ Subscription page shows add-on as "Activo"
   - ✅ Stripe invoice #QLS0NX5B-0017 generated: €11.87 proration (May 6–June 5, 2026)
   - ✅ Billing page counter incremented from 1 → 2 invoices

3. **Ad creation**: "Torno CNC Haas ST-10Y 2019" (product ID 13057)
   - ✅ Published successfully, pending review
   - ✅ Ad count updated from 3/4 → 4/4
   - ⚠️ "Has alcanzado el límite de anuncios" warning shown
   - ❌ No confirmation email received (19 emails, none related to ad submission)

---

## Findings

### 🔴 NEW — FINDING-2026-05-06-F01: Unsubstituted template variable in add-on email

**Severity:** High  
**Email:** #19 — "Add-on añadido a tu suscripción"  
**Evidence:**

The add-on notification email contains the literal text `(prorrateado por Stripe)` instead of the actual prorated amount:

```
Stripe ha cobrado la parte proporcional ((prorrateado por Stripe)). La siguiente
factura recurrente la verás en 05/06/2026.

- Add-on: anuncio extra x 1
- Precio unitario/mes: 12,00 €
- Cobro proporcional ahora: (prorrateado por Stripe)
```

**Expected behavior:** The actual prorated amount (€11.87) should be displayed. The Stripe invoice correctly shows €11.87, so the data is available — it's simply not being interpolated into the email template variable.

**Template code likely:** `{prorated_amount}` or similar token not being replaced during email generation.

---

### 🟡 RECURRING — FINDING-002: Name truncation in emails

**Severity:** Medium  
**Status:** Previously reported (2026-05-05, 2026-05-06), still unfixed  
**Email:** #19 — "Add-on añadido a tu suscripción"

The greeting shows:
```
Hola Test,
```
Instead of:
```
Hola Test User,
```

The full name "Test User" is displayed correctly in the web UI (header, "Ver mi cuenta") and in some emails (#18 password confirmation has "Hola Test User"), but it is truncated to "Test" in the add-on notification email.

---

### 🟡 RECURRING — Non-SEO-friendly URLs in emails

**Severity:** Low  
**Status:** Previously reported, still unfixed  
**Email:** #19 — add-on notification

The email contains:
```
Ver mi suscripción: https://new.zonacnc.com/module/zonacncplans/subscription
```

Should use the SEO-friendly URL:
```
https://new.zonacnc.com/es/suscripcion
```

---

### 🟡 NEW — FINDING-2026-05-06-F04: No email notification on ad creation

**Severity:** Low-Medium  
**Evidence:**

After publishing ad ID 13057 ("Torno CNC Haas ST-10Y 2019"), no confirmation email was received. IMAP check (5+ minutes after submission) showed only 19 emails in inbox, with none related to ad submission.

**Note:** The publish-success page states the ad is "pendiente de revisión" and that "Te notificaremos por email cuando sea aprobado." If the design intent is to only send email on approval, this is expected behavior, not a bug. However, most marketplaces send at least a receipt/submission confirmation email immediately.

---

### 🟢 OK — Mixed-language item descriptions on billing page

**Severity:** Cosmetic  
**Evidence:**

The billing history on `/es/facturacion` (Spanish) shows:
- "Suscripción Remaining time on Add-on Anuncio Extra after 06 May 2026 (+11,87 €)"
- "Suscripción 1 × Plan Starter (at €39.00 / month) (+39,00 €)"

These descriptions mix Spanish ("Suscripción", "Anuncio Extra") with English ("Remaining time on", "after", "at", "/ month"). The subscription page also shows similar mixed text.

---

## Test Data Summary

| Field | Value |
|-------|-------|
| Account | test20@zonacnc.com |
| Customer ID | 6648 |
| Plan | Starter (€39/mes) |
| Add-on purchased | Anuncio extra x1 (€12.00/mes) |
| Stripe proration | €11.87 (invoice QLS0NX5B-0017) |
| Ads after add-on | 3/4 |
| Ad created | ID 13057 — "Torno CNC Haas ST-10Y 2019" |
| Ads after creation | 4/4 |
| Total invoices | 2 (plan + add-on proration) |
| Total emails in inbox | 19 |
| Emails verified | #17 (reset link), #18 (password confirm), #19 (add-on) |

---

## System Status

| Check | Result |
|-------|--------|
| Password reset flow | ✅ Working |
| Password confirmation email | ✅ Correct greeting |
| Add-on purchase UI | ✅ Working |
| Add-on email notification | ❌ Template variable bug + name truncation |
| Stripe proration calculation | ✅ Correct (€11.87) |
| Stripe invoice generation | ✅ Working |
| Ad creation flow | ✅ Working |
| Ad limit enforcement | ✅ Working (warning shown at 4/4) |
| Ad creation email | ❌ Not sent |
| Billing page | ✅ Working (2 invoices) |
| Subscription page | ✅ Working |

---

## Action Items

1. **P0:** Fix `(prorrateado por Stripe)` template variable so the actual prorated amount is rendered in add-on emails
2. **P1:** Fix name truncation in add-on email templates (likely affects all add-on/plan-change emails)
3. **P2:** Update email links to use SEO-friendly URLs (`/es/suscripcion` instead of `/module/zonacncplans/subscription`)
4. **P3:** Translate billing description strings to Spanish for `/es/facturacion`
5. **P3:** Consider sending immediate ad-submission confirmation email (not just post-approval)
