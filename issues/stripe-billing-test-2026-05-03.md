# Stripe Billing QA Test - 2026-05-03

## Summary

**Test**: Stripe Billing flow - complete subscription purchase on new.zonacnc.com
**Status**: ✅ PASSED
**Plan Purchased**: Starter (€39.00/month)
**Test Card**: 4242 4242 4242 4242 (Stripe test mode)
**Email Used**: qa.stripe.billing.20260503@zonacnc.com
**Invoice**: AZHLKTSF-0066

## Test Flow

### 1. Registration ✅
- Registered a new account (all test7-test30@zonacnc.com emails were already taken)
- Completed vendor registration (company, address, contact info)
- Billing address successfully saved

### 2. Plan Selection ✅
- Navigated to pricing page: `/es/module/zonacncplans/pricing`
- Selected **Starter** plan (€39.00/month)
- Checkout page showed correct pricing details

### 3. Stripe Checkout ✅
- Redirected to `checkout.stripe.com` hosted payment page
- Card radio button selected as payment method
- Filled card fields:
  - Card number: 4242 4242 4242 4242
  - Expiry: 12/30
  - CVC: 123
  - Cardholder name: QA Tester ZonaCNC
- Submit button changed from `SubmitButton--incomplete` to `SubmitButton--complete`
- Payment processed successfully
- No 3D Secure challenge triggered (test mode)

### 4. Post-Payment Verification ✅
- Redirected to success page: `/es/module/zonacncplans/success?session_id=cs_test_...`
- Success message: "¡Tu plan se ha activado correctamente!"
- Email confirmation promised: "Recibirás un email de confirmacion con los detalles del pago"

### 5. Subscription Dashboard ✅
- **URL**: `/es/module/zonacncplans/subscription`
- **Plan**: Starter - **ACTIVA**
- **Next billing**: 03/06/2026
- **Price**: 39€/month
- **Active listings**: 0 / 3

### 6. Billing History ✅
- **URL**: `/es/module/zonacncplans/billing`
- Entry found:
  - Date: 03/05/2026
  - Concept: Suscripción (1 × Plan Starter at €39.00/month)
  - Amount: €39.00 EUR
  - Status: completado
  - Invoice PDF download available
  - Stripe invoice link working

### 7. Stripe Invoice Verification ✅
- Invoice page accessible at `invoice.stripe.com`
- Invoice #: **AZHLKTSF-0066**
- Status: **Paid**
- Amount: **€39.00**
- Payment date: May 3, 2026
- Payment method: Visa •••• 4242
- Download invoice PDF available
- Download receipt available

## Issues Found

### 1. All test emails from .env.qa.email range are taken
- All emails test7-test30@zonacnc.com are already registered
- Workaround: Used unique email `qa.stripe.billing.20260503@zonacnc.com`
- Suggestion: Periodically clean up test accounts or implement a rotation strategy

### 2. Vendor registration required before plan purchase
- When attempting to purchase a plan without being a registered vendor, the system redirects to vendor registration
- The checkout flow should clearly indicate this requirement earlier
- After vendor registration, the checkout flow works correctly

### 3. Card accordion needs explicit click to expand
- The Stripe Checkout card fields are collapsed by default
- Must click the accordion header to reveal card number, expiry, CVC fields
- This could be a UX friction point for users

## Console Warnings
- Minor non-critical warnings observed (FedCM/identity provider related)

## Conclusion

The Stripe billing flow on new.zonacnc.com is working correctly. The full lifecycle test passed:
1. Account registration ✅
2. Vendor registration ✅
3. Billing address setup ✅
4. Plan selection and checkout ✅
5. Stripe payment processing (test card) ✅
6. Subscription activation ✅
7. Billing history display ✅
8. Invoice generation and retrieval ✅
