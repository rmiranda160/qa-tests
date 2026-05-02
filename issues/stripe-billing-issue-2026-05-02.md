# [stripe-billing] Stripe Billing Checkout Flow — Subscription Active But Billing History Empty

**Priority:** Medium  
**Labels:** stripe-billing, bug, e2e-test  
**Milestone:** sprint-X

## Summary

The Stripe Checkout → subscription activation flow works end-to-end, but the billing history page shows "Sin movimientos todavía" after a successful payment of 39€ for the Starter plan.

## Steps to Reproduce

1. Register as a vendor on `new.zonacnc.com`
2. Complete billing address (company + NIF/CIF required)
3. Go to `/es/pricing` and select Starter plan (39€/mo)
4. Click "Contratar Starter" → proceeds to checkout
5. Click "Proceder al pago" → redirected to Stripe Checkout
6. Enter test card `4242...` with future expiry and any CVC
7. Complete 3DS challenge with code `000000`
8. Observe success page: "Suscripción activada"
9. Navigate to `/es/module/zonacncplans/subscription` → Starter plan shows "Activa"
10. Navigate to `/es/module/zonacncplans/billing` → **"Sin movimientos todavía"**

## Expected Behavior

- Billing history should list the first invoice for the Starter plan (39€) after successful Stripe payment.
- The invoice should be downloadable as PDF.

## Actual Behavior

- Subscription is active, payment went through Stripe successfully, but billing history remains empty.
- Likely cause: Stripe webhook handler for `invoice.payment_succeeded` or `checkout.session.completed` is not processing/recording the invoice in the local database.

## Test Details

- **Environment:** `new.zonacnc.com`
- **Account:** test14@zonacnc.com
- **Stripe session:** `cs_test_a16gnvr5Hq4rDvVpqIghTPVWmOViXoLPi3JAvQ1CDxW490p5qrR6lduNcF`
- **Plan:** Starter (39€/mo, monthly billing)
- **Test date:** 2026-05-02

## Related Bugs

- **BUG-1:** Login endpoint HTTP 500 — blocks existing users from accessing account

## Attachments

- Test report: `reports/stripe-billing-test-2026-05-02.md`
- Screenshot: `stripe-billing-subscription-active-2026-05-02.png`
