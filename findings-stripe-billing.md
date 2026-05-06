# Findings: Stripe Billing QA — 2026-05-06

**Test account:** test25@zonacnc.com (Customer ID 6652, "Test TwentyFive", Plan Starter mensual)
**Previous report:** test9@zonacnc.com (2026-05-05)

---

## Finding 1 — HIGH: Missing space in password reset email subject (CONFIRMED REGRESSION)

**Location:** Email template for password recovery confirmation  
**Evidence:** Subject line of emails #14, #8, #6 read:

```
[zonacnc.com] Confirmación decontraseña
```

Missing space between "de" and "contraseña". The correct subject should be:

```
[zonacnc.com] Confirmación de contraseña
```

**Expected:** "Confirmación de contraseña"  
**Actual:** "Confirmación decontraseña"  
**Impact:** Unprofessional appearance in password recovery emails. Users may perceive reduced credibility.  
**Previously reported:** Yes (finding #5 from 2026-05-04 on test8, 2026-05-05 on test9)  
**Confirmed on:** test25@zonacnc.com, all password reset emails since account creation

---

## Finding 2 — MEDIUM: Misleading announcement count in Starter welcome email

**Location:** Email template `¡Bienvenido a Starter! Tu suscripción está activa` (email #11)
**Evidence:** The welcome email body states:

```
Detalles:
- Plan: Starter
- Periodo: monthly
- Cuota mensual: 39,00 €
- Anuncios incluidos: 1
- Próxima renovación: 05/06/2026
```

However, the Starter plan on the site clearly shows **3 anuncios** included (0 / 3 on the subscription dashboard). The plan change page also confirms Starter = 3 anuncios.

**Expected:** "Anuncios incluidos: 3"  
**Actual:** "Anuncios incluidos: 1"  
**Impact:** Users may believe they only have 1 listing slot instead of 3, reducing their use of the platform or triggering unnecessary support contacts.  
**Previously reported:** No (new finding)

---

## Finding 3 — LOW: Subscription page missing proper page title

**Location:** /es/suscripcion page  
**Evidence:** The page `<title>` tag renders as just:

```
zonacnc.com
```

While other account pages have descriptive titles:
- /es/facturacion → "Facturas y pagos · ZonaCNC"
- /es/cambiar-plan → "Cambiar plan — ZonaCNC"

**Expected:** "Mi suscripción · ZonaCNC" or similar descriptive title  
**Actual:** "zonacnc.com"  
**Impact:** SEO and accessibility degradation. Users with many open tabs cannot identify this page.  
**Previously reported:** No (new finding)

---

## Finding 4 — LOW: Missing accents in footer legal links (ES translation)

**Location:** Footer navigation on all pages (ES locale)  
**Evidence:** Two legal links lack proper accent marks:

```
Politica de privacidad   → should be "Política de privacidad"
Politica de cookies       → should be "Política de cookies"
```

**Expected:** "Política de privacidad" and "Política de cookies"  
**Actual:** "Politica de privacidad" and "Politica de cookies"  
**Impact:** Minor translation quality issue affecting professional appearance across all pages.  
**Previously reported:** No (new finding)

---

## Finding 5 — INFO: Console JavaScript errors on all account pages

**Location:** All account pages (/es/suscripcion, /es/facturacion, /es/cambiar-plan)  
**Evidence:** Each page generates 1 JavaScript console error:

```
Unexpected token '&'
```

This appears to be a JavaScript parsing error, likely from inline script blocks containing unescaped HTML entities.

**Impact:** Minor — no visible user-facing breakage observed, but may indicate fragile JS handling.  
**Previously reported:** No (new finding)

---

## Items Verified — No Issues Found

The following were checked and found to be working correctly:

| Component | Result |
|-----------|--------|
| Password recovery flow (ES) | ✅ Link generated and functional |
| Password reset confirmation email | ✅ "Su nueva contraseña" email sent correctly |
| Password reset form | ✅ Both password fields, show/hide toggle working |
| Login after password reset | ✅ Redirect to Mi Cuenta, success alert shown |
| Subscription dashboard | ✅ Plan info, next charge date, active listing count displayed |
| Invoice/billing history | ✅ Date, concept, amount, status, PDF download, Stripe invoice link all functional |
| Plan change page | ✅ All 5 plans (Free/Starter/Pro/Business/Enterprise) displayed with correct pricing and features |
| Plan change upgrade/downgrade info | ✅ Clear explanation of prorated charges |
| 7-day refund policy | ✅ Detailed conditions displayed |
| Breadcrumb navigation | ✅ Consistent across account pages |
| Language switcher | ✅ All 10 languages available in header |
| Sidebar navigation | ✅ All links present and functional |

---

## Summary

| ID | Severity | Description | Previously Reported |
|----|----------|-------------|---------------------|
| 1  | HIGH | Missing space in password reset email subject: "decontraseña" | Yes (confirmed regression) |
| 2  | MEDIUM | Starter welcome email says "1 anuncio" but plan has 3 | **New** |
| 3  | LOW | /es/suscripcion page title is just "zonacnc.com" | **New** |
| 4  | LOW | Footer links "Politica" missing accent (→ "Política") | **New** |
| 5  | INFO | Console JS errors "Unexpected token '&'" on account pages | **New** |

**New findings this run:** #2, #3, #4, #5
**Regressions confirmed:** #1
**Previously reported findings NOT tested this run:** add-on variable substitution (Finding #1 from 2026-05-05), invoice "renovación" label (Finding #2 from 2026-05-05) — test25 has no add-ons to verify these.
