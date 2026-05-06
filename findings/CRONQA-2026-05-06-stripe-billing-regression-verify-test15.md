# CRON QA: Stripe Billing — Regression Verification — 2026-05-06

**Date:** 2026-05-06 02:32–02:45 UTC  
**Focus Area:** stripe-billing  
**Environment:** new.zonacnc.com (TEST MODE)  
**Test Account:** test15@zonacnc.com (Test Empresa Quince, Enterprise monthly €299/mes)  
**Browser:** Chromium via MCP pwmcp-zonacnc  
**Scenario:** Regression verification — Re-check all previously reported email template and i18n bugs

---

## Steps Executed

1. **Login** — test15@zonacnc.com / Test1234%segura → ✅ success
2. **Subscription page** (`/es/suscripcion`) — Reviewed plan status, add-ons, billing history
3. **Billing page** (`/es/facturacion`) — Reviewed invoice descriptions
4. **English i18n page** (`/en/subscription`) — Reviewed i18n coverage
5. **IMAP verification** — Fetched UIDs 12 (invoice) and 13 (add-on confirmation)
6. **Email template review** — Inspected plain-text and HTML bodies of both emails

---

## Findings Summary

### Finding 1 — ❌ HIGH: Variable substitution `(prorrateado por Stripe)` — STILL UNFIXED (Day 4 regression)

**Email:** UID 13, "Add-on añadido a tu suscripción"  
**Evidence (plain text):**
```
Stripe ha cobrado la parte proporcional ((prorrateado por Stripe)). La siguiente
factura recurrente la verás en 06/06/2026.
```
**Evidence (HTML):**
```
Stripe ha cobrado solo la parte proporcional al periodo en curso ((prorrateado por Stripe)).
```
**Details table:**
```
Cobro proporcional ahora: (prorrateado por Stripe)
```
**Expected:** Show actual prorated amount (e.g., "2,99 €")  
**Impact:** Users cannot see how much they were charged  
**Previously reported:** 2026-05-04 (test8), 2026-05-05 (test9), 2026-05-06 (test15 first instance)  
**Status:** REGRESSION — NOT FIXED across all 4 days of testing

---

### Finding 2 — ❌ HIGH: Invoice email says "renovación" for first payment — STILL UNFIXED

**Email:** UID 12, "Factura pagada — Tu plan sigue activo"  
**Evidence (plain text):**
```
Hemos cobrado la renovación de tu plan Enterprise. Tu suscripción sigue
activa hasta 06/06/2026.
```
**Expected:** Should say "Hemos activado tu plan Enterprise" or "primer cobro" — this is the FIRST payment, not a renewal  
**Impact:** Confusing for new subscribers; implies they're being renewed when they just joined  
**Previously reported:** 2026-05-05 (test15 Enterprise report BUG 5)  
**Status:** REGRESSION — NOT FIXED

---

### Finding 3 — ❌ MEDIUM: Name truncation "Hola Test" — STILL UNFIXED

**Emails:** UID 12 (invoice) and UID 13 (add-on confirmation)  
**Evidence:** Both emails greet "Hola Test" instead of "Hola Test Empresa Quince"  
**Expected:** Full display name from account  
**Actual:** Only first token ("Test")  
**Previously reported:** 2026-05-04 (CRONQA-001), 2026-05-05 (enterprise report BUG 3)  
**Status:** REGRESSION — NOT FIXED

---

### Finding 4 — ❌ MEDIUM: "monthly" untranslated in invoice email — STILL UNFIXED

**Email:** UID 12, "Factura pagada — Tu plan sigue activo"  
**Evidence:** 
```
Plan: Enterprise (monthly)
```
**Expected:** "Plan: Enterprise (Mensual)"  
**Previously reported:** 2026-05-05 (enterprise report BUG 2)  
**Status:** REGRESSION — NOT FIXED

---

### Finding 5 — ❌ MEDIUM: Mixed EN/ES in invoice line item description — STILL UNFIXED

**Location:** `/es/facturacion` billing history table  
**Evidence:**
```
Remaining time on Add-on Anuncio Extra after 06 May 2026 (+2,99 €)
```
Also on subscription page:
```
Remaining time on ZonaCNC — Add-on: anuncio extra after 06 May 2026 (+2,99 €)
```
**Expected:** Fully localized Spanish: "Tiempo restante de ZonaCNC — Add-on: anuncio extra desde 06 May 2026"  
**Previously reported:** 2026-05-05 (test9), 2026-05-06 (test15 first instance)  
**Status:** REGRESSION — NOT FIXED

---

### Finding 6 — ❌ HIGH: Massive Spanish leakage on English i18n page `/en/subscription`

**Location:** `https://new.zonacnc.com/en/subscription`  
**Evidence — Untranslated strings identified:**

| Element | Shows (Spanish) | Expected (English) |
|---------|-----------------|---------------------|
| Page heading | "Mi suscripción" | "My subscription" |
| Status badge | "ACTIVA" | "ACTIVE" |
| Next charge label | "Próximo cobro" | "Next charge" |
| Active ads label | "Anuncios activos" | "Active ads" |
| Change plan button | "Cambiar de plan" | "Change plan" |
| Payment method label | "Método de pago" | "Payment method" |
| Change card button | "Cambiar tarjeta" | "Change card" |
| Cancel help text | "Puedes cancelar tu suscripción…" (full paragraph in ES) | Should be in EN |
| Cancel button | "Cancelar al final del período" | "Cancel at end of period" |
| Billing history header | "Historial de facturas" | "Billing history" |
| Table headers | "Fecha / Plan / Importe / Estado / Factura" | "Date / Plan / Amount / Status / Invoice" |
| Status values | "Completado" | "Completed" |
| PDF link text | "Ver factura" | "View invoice" |
| Add-ons table headers | "Tipo / Cantidad / Precio / Período / Estado" | "Type / Quantity / Price / Period / Status" |
| Add-ons status | "Activo" | "Active" |
| Cancel add-on button | "Cancelar" | "Cancel" |
| Add-on purchase section | "Añadir add-on a tu plan" + full ES description | Should be in EN |
| Newsletter disclaimer | "Puede darse de baja en cualquier momento…" (ES) | Should match EN header |

**Impact:** ~80% of subscription page is in Spanish when viewed in English locale  
**Previously reported:** 2026-05-04 (CRONQA-RESPONSIVE-2026-05-04-brand-500-i18n-persists), 2026-05-05  
**Status:** REGRESSION — NOT FIXED. No improvement since first report.

---

## Regression Matrix

| ID | Finding | First Reported | Status Today |
|----|---------|---------------|--------------|
| 1 | `(prorrateado por Stripe)` placeholder | 2026-05-04 | ❌ UNFIXED (Day 4) |
| 2 | "renovación" for first payment | 2026-05-05 | ❌ UNFIXED |
| 3 | Name truncation "Hola Test" | 2026-05-04 | ❌ UNFIXED |
| 4 | "monthly" untranslated in email | 2026-05-05 | ❌ UNFIXED |
| 5 | Mixed EN/ES in invoice descriptions | 2026-05-05 | ❌ UNFIXED |
| 6 | Spanish leakage on /en/subscription | 2026-05-04 | ❌ UNFIXED |

---

## Account Status After Test

- **Account:** test15@zonacnc.com
- **Plan:** Enterprise Monthly (€299/mes) — Active
- **Next charge:** 06/06/2026
- **Ads:** 0/101
- **Payment method:** Visa •••• 4242 (saved)
- **Add-ons:** Anuncios extra x1 — Active
- **Invoices:** 2 (€299 plan + €2.99 add-on)

---

## Conclusion

**All 6 previously reported email template and i18n bugs remain unfixed.** No regression has been addressed since first report. The `(prorrateado por Stripe)` placeholder bug has persisted across 4 consecutive days of QA testing across all plan tiers (Starter, Pro, Enterprise).

*Report generated by OpenClaw QA — stripe-billing cron task 2026-05-06*
