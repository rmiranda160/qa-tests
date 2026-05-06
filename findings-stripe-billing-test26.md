# Stripe Billing QA — Test Findings
**Date:** 2026-05-06 | **Tester:** test26@zonacnc.com | **Plan:** Starter (monthly, 39€)

## Summary
Subscription flow completed successfully via Stripe sandbox using test card 4242...4242. Two bugs found, three issues noted.

---

## 🔴 BUG-1: Email listing quota mismatch (HIGH)
**Template:** `subscription_started`
**Email #15** says **"Anuncios incluidos: 1"** but the Starter plan offers **3 listings**.

**Root cause:** In `checkout.php:24`, when no `listings` query parameter is passed:
```php
$listings = (int) Tools::getValue('listings', 0); // defaults to 0
$listings = $this->clampListings($listings, $plan); // clampListings(0, ...) → min_listings = 1
```
`clampListings` floors 0 to `min_listings` (1) instead of using `max_listings` (3). The metadata `listings_quota=1` is sent to Stripe, stored in the subscription, and used in the email template.

**Fix:** When `listings` is 0/not-provided, default to `max_listings` instead of `min_listings`. Change line ~37:
```php
// Before: $listings = $this->clampListings($listings, $plan);
// After:
$listings = $this->clampListings($listings ?: (int)($plan['max_listings'] ?? 3), $plan);
```

**Files:** `modules/zonacncplans/controllers/front/checkout.php` (~line 24, 37)

---

## 🟡 BUG-2: Billing period shown as "monthly" (LOW)
**Email #15** shows **"Periodo: monthly"** instead of "Mensual".
The `{billing_period}` template variable uses the raw DB value without translation.

**Fix:** Add a translation map for billing periods in `buildCommonVars` in `ZonaCNCPlansMailer.php`.

**Files:** `modules/zonacncplans/classes/ZonaCNCPlansMailer.php` (line 268)

---

## 🟡 ISSUE-1: Billing address form redirect bug (MEDIUM)
After submitting the billing address form (`/es/direccion?back=...&zcnc_billing=1`), the redirect was:
```
/?controller=https://new.zonacnc.com/es/pricing
```
Expected: clean redirect to `/es/pricing` or `/es/pagar-plan?plan=starter`.

**Workaround used:** Manually navigated to `/es/pagar-plan?plan=starter`.

---

## 🟢 ISSUE-2: Payment method not shown after successful payment (LOW)
Subscription page shows **"No hay método de pago guardado en este sitio"** immediately after successful Stripe payment. The card brand/last4 should be visible.

---

## 🟡 ISSUE-3: No invoice_paid email received (MEDIUM)
After successful payment, only `subscription_started` and `vendor_onboarding` emails arrived (both at 06:53:30 UTC). No `invoice_paid` email was received. Either the `invoice.paid` Stripe webhook hasn't fired yet or there's a delivery issue.

---

## ✅ Successes
1. Stripe Checkout sandbox integration works correctly
2. Test card `4242 4242 4242 4242` with expiry `12/34` and CVC `123` accepted
3. Redirect to success page with correct session_id
4. Subscription created and visible in seller panel as "Starter – Activo"
5. Invoice #1 generated and marked "pagada" (paid) in billing history
6. Next billing date correctly set to 06/06/2026
7. Both confirmation emails well-formatted in Spanish
8. HTML email templates render correctly with ZonaCNC branding

---

## Test Details
- **Account:** test26@zonacnc.com (customer #6653)
- **Company:** Test CNC Solutions SL (CIF B12345678)
- **Plan:** Starter, monthly (39€/month)
- **Stripe session:** `cs_test_a152wOLlqO67Qoc68CJx3GCmj0Fvljq1UPDGK0APrHYVY6ABinEYTp49UZ`
- **Card:** 4242 4242 4242 4242 / 12/34 / 123
