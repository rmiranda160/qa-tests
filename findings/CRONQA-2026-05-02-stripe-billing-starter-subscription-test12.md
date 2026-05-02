# CRON QA Report: Stripe Billing - Starter Subscription

**Date:** 2026-05-02  
**Environment:** https://new.zonacnc.com (QA)  
**Email used:** test12@zonacnc.com  
**Plan:** Starter (€39/month)  
**Result:** ✅ PASS - Subscription active

---

## Summary

Successfully tested the complete Stripe billing flow on new.zonacnc.com:
1. User registration
2. Vendor registration (professional seller)
3. Billing address setup
4. Stripe Checkout payment for Starter plan
5. Subscription activation verification

---

## Step-by-step Execution

### 1. User Registration
- **Email:** test12@zonacnc.com
- **Password:** TestZonaCnc2026!
- **Display name:** QA Test Stripe Billing
- **Company:** QA Stripe Billing S.L.
- **SIRET:** B12345678
- **Birthday:** 01/01/1990
- GDPR/privacy checkboxes accepted
- ✅ Registration successful, redirected to homepage

### 2. Vendor Registration
- Navigated to `/es/pricing` → clicked "Activar" (Free plan trigger)
- Filled vendor form:
  - Company name: QA Stripe Billing S.L.
  - CIF/NIF: B12345678
  - Sector: Mecanizado CNC
  - City: Madrid
  - Province: Madrid
  - Postal code: 28001
  - Phone: +34600000000
  - Description: Company description
- ✅ Vendor registration successful (`/module/zonacncvendor/dashboard?registered=1`)

### 3. Billing Address Setup
- Warning banner prompted: "Completa tu dirección de facturación antes de contratar un plan"
- Clicked "Completar dirección" → `/es/direccion`
- Filled address form:
  - Company: QA Stripe Billing S.L.
  - VAT Number: B12345678
  - Address: Calle Mayor 123
  - Postcode: 28001
  - City: Madrid
  - Country: España
  - Phone: +34600000000
  - DNI/NIF: B12345678
- ✅ Address saved successfully
- Note: Back URL redirect was broken (`/?controller=...`), navigated directly to `/es/pricing`

### 4. Stripe Checkout Payment
- Navigated to `/es/pricing` → clicked "Contratar Starter"
- Checkout page: Starter plan, monthly (€39/month)
- Clicked "Proceder al pago" → redirected to Stripe Checkout
- **Stripe Session ID:** `cs_test_a1wQBxbocnSLlSGBosqF16sTPj7GIYV2PxzWHMSw12RCFBqkwY6yg740g0`
- Selected "Card" payment method
- Filled payment details:
  - Card number: `4242 4242 4242 4242` (Stripe test card)
  - Expiry: `12/30`
  - CVC: `123`
  - Cardholder name: QA Test Stripe Billing
- Checked "I am an AI agent acting on behalf of someone else"
- Clicked "Pay and subscribe"
- ✅ Payment successful → redirected to `/module/zonacncplans/success?session_id=...`

### 5. Subscription Verification
- Navigated to `/es/module/zonacncplans/subscription`
- **Status: Starter Activa** ✅
- Next charge: **02/06/2026**
- Price: **39 €/month**
- 0/3 active listings
- ✅ Subscription is ACTIVE

---

## Key Observations

| Aspect | Status | Notes |
|--------|--------|-------|
| Registration flow | ✅ | Complete PrestaShop registration with gender, company, SIRET fields |
| GDPR/Privacy consent | ✅ | Two checkboxes required and present |
| Vendor registration | ✅ | Multi-field form with sector, province, description |
| Billing address required | ✅ | Warning banner shown before plan purchase |
| DNI field | ✅ | Required `dni` field present in address form (separate from `vat_number`) |
| Stripe Checkout integration | ✅ | Redirects to Stripe hosted checkout page |
| Card fields in main frame | ✅ | `name` attribute-based fields: `cardNumber`, `cardExpiry`, `cardCvc`, `billingName` |
| AI agent checkbox | ✅ | "I am an AI agent acting on behalf of someone else" present and clickable |
| Test card payment | ✅ | `4242 4242 4242 4242` accepted without 3D Secure |
| Subscription activation | ✅ | Immediate activation after payment |
| Back URL redirect | ⚠️ | Address save redirect was broken (double-encoded `controller` param) |

---

## Attachments
- `stripe-billing-test12-address-form.png` - Billing address form filled
- `stripe-billing-test12-vendor-form.png` - Vendor registration form
- `stripe-billing-test12-payment-form.png` - Stripe Checkout with card details
- `stripe-billing-test12-subscription-active.png` - Subscription active confirmation

---

## Conclusion

**TEST PASSED.** The Stripe billing flow for the Starter plan works correctly on new.zonacnc.com. The user test12@zonacnc.com has an active Starter subscription with next charge on 02/06/2026.
