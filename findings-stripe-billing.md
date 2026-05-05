# Findings: Stripe Billing QA — 2026-05-05

**Test account:** test9@zonacnc.com (Customer ID 6611, "Test User", Plan Pro anual)
**Previous report:** test8@zonacnc.com (2026-05-04)

---

## Finding 1 — HIGH: Variable substitution failure in add-on confirmation email (REGRESSION)

**Location:** Email template `Add-on añadido a tu suscripción`
**Evidence:** Both plain-text and HTML body contain literal placeholder `(prorrateado por Stripe)` instead of the actual prorated charge amount (€89.69).

```
Stripe ha cobrado la parte proporcional ((prorrateado por Stripe)). La siguiente
factura recurrente la verás en 03/05/2027.
```

Also in the details table:
```
Cobro proporcional ahora: (prorrateado por Stripe)
```

**Expected:** Show actual amount charged (e.g., "89,69 €")  
**Actual:** Placeholder text `(prorrateado por Stripe)`  
**Impact:** Users cannot see how much they were charged in the confirmation email — the most critical piece of information.  
**Confirmed on:** Annual Pro plan (€990/yr) with 1 extra ad add-on  
**Previously reported:** Yes (finding #1 from 2026-05-04 on test8 monthly plan)

---

## Finding 2 — HIGH: Invoice email falsely claims plan renewal instead of add-on charge (REGRESSION)

**Location:** Email template `Factura pagada — Tu plan sigue activo`
**Evidence:** Email body says:

```
Hemos cobrado la renovación de tu plan Pro. Tu suscripción sigue
activa hasta 03/05/2027.
```

But this invoice was generated for an add-on purchase (€89.69 prorated), **not** a plan renewal. The plan was already prepaid through 2027.

**Expected:** Email should say "Hemos cobrado un add-on de anuncio extra" or similar  
**Actual:** Falsely claims it's a plan "renovación"  
**Impact:** Confuses users into thinking their annual plan was charged again. Could trigger unnecessary support tickets.  
**Previously reported:** Yes (finding #2 from 2026-05-04 on test8)

---

## Finding 3 — MEDIUM: Mixed language in invoice line item description

**Location:** Billing history table on `/es/suscripcion`
**Evidence:** Invoice description reads:

```
Remaining time on ZonaCNC — Add-on: anuncio extra after 05 May 2026 (+89,69 €)
```

The string mixes English ("Remaining time", "after") with Spanish ("anuncio extra"). The invoice description comes from Stripe metadata and is not properly localized.

**Expected:** Fully localized description, e.g., "Tiempo restante en ZonaCNC — Add-on: anuncio extra desde 05 May 2026"  
**Actual:** Mixed English/Spanish  
**Impact:** Unprofessional appearance in billing records. Shows lack of i18n attention to Stripe metadata strings.

---

## Finding 4 — LOW: Add-on period label mismatch (annual plan)

**Location:** Add-ons table on `/es/suscripcion`
**Evidence:** The "Añadir add-on" section advertises:

```
Anuncio extra: 9.00 € /mes
```

But after purchase, the Add-ons table shows:

```
Anuncios extra x1  9.00 €  9.00 € /año  Activo
```

**Expected:** The period label should match the billing period. On annual plans, add-ons are billed annually (prorated), so both should show `€/año` or `€/mes` consistently.  
**Actual:** Monthly label in selector vs annual label in summary table  
**Impact:** Minor confusion — users may expect €9/month but are actually charged differently on annual plans.

---

## Finding 5 — LOW: Password reset email subject missing space (REGRESSION)

**Location:** Email for password recovery  
**Evidence:** Subject line reads:

```
Confirmación decontraseña
```

Missing space between "de" and "contraseña".  
**Previously reported:** Yes (finding #5 from 2026-05-04 on test8)  
**Impact:** Unprofessional appearance.

---

## Finding 6 — INFO: No payment method required for add-on purchase

**Location:** Add-on purchase flow  
**Evidence:** Before adding a payment method, the add-on "Añadir" button was shown and clickable. The confirmation dialog mentions "tarjeta guardada" even when no payment method exists.  
**Note:** This may work because Stripe saves the card from the original plan purchase and reuses it. Low impact since the add-on requires a prior plan with payment method.

---

## Summary

| ID | Severity | Description | Previously Reported |
|----|----------|-------------|---------------------|
| 1  | HIGH | Variable substitution `(prorrateado por Stripe)` in add-on email | Yes |
| 2  | HIGH | Invoice email says "renovación" for add-on charge | Yes |
| 3  | MEDIUM | Mixed EN/ES in invoice description | **No** |
| 4  | LOW | Add-on period label mismatch (€/mes vs €/año) | **No** |
| 5  | LOW | Missing space in password reset subject | Yes |
| 6  | INFO | No payment method required for add-on | **No** |

**New findings this run:** #3, #4, #6
**Regressions confirmed:** #1, #2, #5
