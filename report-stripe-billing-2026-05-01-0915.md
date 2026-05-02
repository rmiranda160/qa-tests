# QA Report: Stripe Billing UI Coherence Audit (test3 Enterprise)
**Date:** 2026-05-01 09:15 UTC  
**Focus:** stripe-billing  
**Agent:** tester (subagent)  
**User:** test3 (real Stripe customer, cus_UQemDegiZOYYqx, 30 payments, Enterprise activa)  
**Method:** MCP browser → login → subscription page → billing page → invoice PDF verification  

---

## Summary

| Section | Status |
|---|---|
| Login (test3@zonacnc.com) | ✅ PASS |
| Subscription page UI | ✅ PASS |
| Billing history display | ✅ PASS |
| Invoice PDF accessibility | ⚠️ PARTIAL FAIL |
| Pricing page plan cards | ✅ PASS |
| Add-ons UI | ✅ PASS |
| Cancel / Payment method buttons | ✅ PASS |

**Overall: PASS_WITH_NOTES** (1 new issue found — see Medium below)

---

## Detailed Findings

### 1. Subscription Page — Enterprise Activa
- **PASS**: Heading displays "Enterprise Activa" ✅
- **PASS**: Price shows "299 € /mes" ✅
- **PASS**: Quota shows "Anuncios activos: 4 / 100" ✅
- **PASS**: "Cambiar de plan" link → `/es/pricing` ✅
- **PASS**: "Método de pago: No tienes ningun metodo de pago guardado" + "Añadir método de pago" button ✅
- **PASS**: "Cancelar al final del período" button present ✅
- **PASS**: Invoice history table renders with 2 recent entries ✅
- **PASS**: Add-ons table shows 3 canceled extra ad add-ons ✅
- **PASS**: "Añadir add-on a tu plan" section available ✅

### 2. Billing Page (Facturas y pagos)
- **PASS**: Page title "Facturas y pagos · ZonaCNC" ✅
- **PASS**: Table header: Fecha, Concepto, Importe, Estado, Factura ✅
- **PASS**: 171 invoice records in sidebar badge ✅
- **PASS**: Mixed states visible: completado, pendiente, fallido ✅
- **PASS**: Pack Boost 24h entries visible (3 rows, pendiente) ✅

### 3. Invoice PDF Links
- **PASS**: "PDF Ver factura" links present for 2 recent proration entries ✅
- **PASS**: Clicking the link opens correct Stripe invoice page in new tab ✅
- **PASS**: Stripe invoice page shows company name "Veleta Comercializaciones y Servicios SLU" ✅

### 4. Plan Pricing Page
- **PASS**: All 5 plan cards visible (Básico → Enterprise, 3 mes, 6 mes, 12 mes) ✅
- **PASS**: Checkout CTAs present on all plan cards ✅
- **PASS**: Google FedCM console errors are unrelated (2 errors, same as prior runs) ✅

---

## ⚠️ Issues Found

### [MEDIUM] Invoice PDF links missing for most historical payments
**File:** `/es/module/zonacncplans/billing`  
**Evidence:** MCP snapshot of billing table — out of ~70+ completed payment rows, only the 2 most recent proration entries have "PDF Ver factura" links. All other completed payments show "—" in the Factura column. Failed payments correctly have no PDF, but the majority of successful historical charges (plan payments at 39€, 99€, 199€, 299€) show no downloadable invoice.

**Impact:** Users cannot download or access invoice PDFs for their historical subscription payments. This affects accounting/reconciliation — a core feature of a billing system.

**Reproduction steps:**
1. Login as test3@zonacnc.com / ZonacncTest2026!
2. Navigate to `/es/module/zonacncplans/billing`
3. Scroll through the invoice table
4. Observe that only 2 rows have "PDF Ver factura" links
5. All other completed payments show "—" in the Factura column

### [KNOWN - #928] Duplicate Enterprise subscription hidden in UI
Already reported in #928. DB shows 2 active Enterprise subscriptions (IDs 1784, 1491), UI only shows one. Not re-opening.

### [KNOWN - #950] Badge count mismatch
Already reported in #950. Sidebar shows "171" but table rows differ.

---

## Test Data Used
- **Email:** test3@zonacnc.com
- **Stripe customer:** cus_UQemDegiZOYYqx
- **Real sub:** sub_1TRnTEELpLIGgmZKholeYCFn
- **Plan:** Enterprise (299€/mes)
- **State:** 2 active Enterprise subscriptions (known duplicate), 30+ successful payments, mix of completed/failed/pending invoices

## Console Errors
- 2 Google FedCM errors (unrelated to billing — same as all previous runs) ✅
- No new console errors from billing module pages ✅
