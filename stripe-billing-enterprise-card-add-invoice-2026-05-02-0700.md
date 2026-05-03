# QA Report: Stripe Billing - Card Addition + Invoice Verification
## Enterprise Annual Subscriber (test1)

**Test ID:** stripe-billing-enterprise-card-add-invoice-2026-05-02-0700  
**Date:** 2026-05-02 07:00 UTC  
**Tester:** subagent (tester)  
**User:** test1@zonacnc.com (Test One QA)  
**Plan:** Enterprise Activa (€2,990/year), Next charge 30/04/2027  
**Focus Area:** stripe-billing  

---

## Scenario: Enterprise Annual Subscriber - First Card Save + Stripe Invoice Validation

**Gap identified:** No prior test covered adding a payment method for an Enterprise *annual* subscriber (all prior tests used monthly Enterprise/Pro users). Also first-time verification of Stripe-hosted invoice page loading + PDF download for this Stripe customer.

### Test Flow

| Step | Action | Expected | Result |
|------|--------|----------|--------|
| 1 | Navigate to subscription page | Show Enterprise Activa, no payment method | ✅ PASS |
| 2 | Click "Añadir método de pago" | Open Stripe Elements modal | ✅ PASS |
| 3 | Fill Visa 4242, Exp 12/30, CVC 123, ZIP 28001 | Fields populate | ✅ PASS |
| 4 | Click "Guardar tarjeta" | Process card, show "Procesando..." then close modal | ✅ PASS |
| 5 | Verify UI update | Show Visa •••• •••• •••• 4242 + "Cambiar tarjeta" button | ✅ PASS |
| 6 | Open Stripe invoice (Ver factura) | Load invoice.stripe.com page | ✅ PASS |
| 7 | Verify invoice content | Show "Invoice paid", amount, date, download buttons | ✅ PASS |
| 8 | Click PDF download link | Initiate PDF download | ✅ PASS |

### Evidence

1. **Card saved successfully:** UI shows `Visa •••• •••• •••• 4242` with `Cambiar tarjeta` button  
   (Screenshot: `test1-card-saved-visa-4242.png`)

2. **Stripe invoice page:**  
   - Page title: "Entorno de prueba de Veleta Comercializaciones y Servicios SLU Invoice #AZHLKTSF-0044"  
   - Status: "Invoice paid"  
   - Amount: €0.00 (credit note for add-on proration)  
   - Payment date: May 1, 2026  
   - Available actions: Download invoice, Download receipt  
   - Sandbox indicator present  
   (Screenshot: `stripe-invoice-azhlktsf-0044.png`)

3. **PDF download:** Successfully initiated (file: `Invoice-AZHLKTSF-0044.pdf`)

### Additional Observations

- test1 has **14 invoices** in the invoice history, all showing as "Completado"
- Annual billing at €2,990/year with 100 ad limit (0/100 active)
- Rich plan change history: Free → Pro → Business → Enterprise (with various proration invoices)
- 2 cancelled add-ons (Anuncios extra x3 annual, x17 monthly)
- No JS console errors during the card addition flow
- ZIP code field was required for Stripe Elements (ZIP 28001 used)

### Result: ✅ PASS

**Verdict:** Card addition flow works correctly for Enterprise annual subscriber.  
Stripe-hosted invoice page loads correctly with download options.  
PDF download functionality works.

**Issues found:** None

---

## Labels
qa-stripe-billing, payment-method, card-save, enterprise-plan, invoice-verification
