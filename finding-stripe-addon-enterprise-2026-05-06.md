# Finding: Stripe Billing — Add-on Purchase on Enterprise Plan
**Date:** 2026-05-06 01:20 UTC
**Test account:** test15@zonacnc.com (Test Empresa Quince)
**Plan:** Enterprise monthly (€299/mes)
**Scenario:** Purchase 1× "Anuncio extra" add-on and verify billing emails/templates
**Branch:** tester/finding-stripe-addon-enterprise-2026-05-06

---

## Finding 1 — HIGH: Variable substitution failure in add-on confirmation email (REGRESSION, cross-plan)

**Location:** Email template `Add-on añadido a tu suscripción` (UID 13)
**Evidence:** Both plain-text and HTML body contain literal placeholder `(prorrateado por Stripe)` instead of actual prorated charge (€2,99).

Plain text:
```
Stripe ha cobrado la parte proporcional ((prorrateado por Stripe)). La siguiente
factura recurrente la verás en 06/06/2026.
```

Details table:
```
Cobro proporcional ahora: (prorrateado por Stripe)
```

HTML:
```
Stripe ha cobrado solo la parte proporcional al periodo en curso ((prorrateado por Stripe)).
```

**Expected:** Show actual prorated amount (e.g., "2,99 €")
**Actual:** Placeholder text `(prorrateado por Stripe)` with double parentheses
**Impact:** Users cannot see how much they were charged in the confirmation email.
**Previously reported:** Yes — Finding #1 from 2026-05-04 (test8 Starter monthly), 2026-05-05 (test9 Pro annual)
**Now confirmed on:** Enterprise monthly — this is a cross-plan regression
**Root cause:** Template variable `{prorated_amount}` not being resolved; parentheses from the parenthetical format remain visible

---

## Finding 2 — MEDIUM: Mixed language in Stripe invoice line item description (REGRESSION)

**Location:** Stripe invoice #QLS0NX5B-0016 (add-on prorate) and billing history table on `/es/facturacion`
**Evidence:**
- Stripe invoice line item: "Remaining time on ZonaCNC — Add-on: anuncio extra after 06 May 2026"
- Billing history: "Remaining time on Add-on Anuncio Extra after 06 May 2026 (+2,99 €)"

Mixes English ("Remaining time on", "after") with Spanish ("anuncio extra").

**Expected:** Fully localized Spanish: "Tiempo restante en ZonaCNC — Add-on: anuncio extra desde 06 May 2026"
**Actual:** Mixed English/Spanish
**Impact:** Unprofessional appearance in billing records and Stripe-hosted invoices
**Previously reported:** Yes — Finding #3 from 2026-05-05 (test9 Pro annual)
**Now confirmed on:** Enterprise monthly

---

## Finding 3 — LOW: Double parentheses around unresolved placeholder in add-on email

**Location:** Email template `Add-on añadido a tu suscripción`
**Evidence:** 
- Plain text: `((prorrateado por Stripe))` — double parentheses
- HTML: `((prorrateado por Stripe))` — double parentheses
- Details table: `(prorrateado por Stripe)` — single parentheses

The email template appears to wrap the variable in parentheses (normal Spanish convention for parenthetical amounts), but when the variable resolves to literal text instead of empty string, the parentheses become visible alongside the placeholder text, creating double parentheses in some contexts.

**Expected:** If variable resolves, show "2,99 €". If not, show nothing and strip surrounding parentheses.
**Actual:** Placeholder text retained inside parentheses
**Impact:** Minor visual glitch. The double parentheses draw attention to the broken variable.

---

## Invoice Summary

| Invoice | Concept | Amount | Status |
|---------|---------|--------|--------|
| #QLS0NX5B-0016 | Add-on Anuncio Extra prorate (May 6 - Jun 5, 2026) | €2,99 | Paid |
| (ID 12) | Plan Enterprise monthly renewal | €299,00 | Paid |

## Email Summary

| UID | Date | Subject | Finding |
|-----|------|---------|---------|
| 12 | 2026-05-05 22:11 | Factura pagada — Tu plan sigue activo | OK (correct for plan renewal) |
| 13 | 2026-05-06 01:21 | Add-on añadido a tu suscripción | Finding 1 + Finding 3 |

## Non-reproduced findings

- **Finding 4 (period label mismatch):** NOT reproduced on monthly Enterprise. The add-on shows "3.00 € /mes" consistently in both the purchase selector and the active add-ons table.
- **Finding 2 (invoice falsely claims renewal):** Enterprise plan invoice (UID 12) correctly says "renovación" for the actual plan renewal. No separate add-on invoice email was observed.
