# Stripe Billing QA Report - new.zonacnc.com
**Date**: 2026-05-04 | **Tester**: tester | **Account**: test7@zonacnc.com | **Plan**: Enterprise

## Summary
Stripe billing integration on new.zonacnc.com was tested end-to-end. The core Stripe functionality works correctly — subscription management, pro-rated billing, payment method updates via Stripe Elements, and Stripe-hosted invoice pages. Primary issues are i18n (partial translations on billing pages) and email templates not respecting language context.

---

## VERIFIED ✅ Stripe Integration

### 1. Stripe Elements — Card Management
- **Card update modal** loads 6 Stripe iframes (`__privateStripeFrame*`, `__privateStripeController*`, `__privateStripeMetricsController*`)
- Payment method displayed: Visa ending in 4242 (Stripe test card)
- hCaptcha integrated for fraud prevention
- URL: `/es/module/zonacncplans/subscription` → "Cambiar tarjeta" button

### 2. Stripe-Hosted Invoices
- 5 invoices hosted at `invoice.stripe.com` (test mode)
- Account: `acct_1TPLFqELpLIGgmZK`
- Invoice download links generated per-transaction
- Invoices accessible from `/es/module/zonacncplans/billing`

### 3. Subscription Management
| Feature | Status |
|---------|--------|
| Current plan display | ✅ Enterprise — €299.00/mes |
| Next charge date | ✅ 03/06/2026 |
| Ads usage counter | ✅ 11/102 |
| Change plan (upgrade/downgrade) | ✅ Pro-rated calculation shown |
| Cancel subscription | ✅ "Cancelar al final del período" button |
| Add-on management | ✅ Extra ads × 2, with cancel/reassign options |
| Payment method update | ✅ Stripe Elements modal |

### 4. Pro-Rated Billing
Billing history shows correct pro-ration for plan changes:
- Business → Enterprise: €99.20 (unused time credit + new plan charge)
- Pro → Business: €99.73 (unused time credit + new plan charge)
- Add-on changes: €0.00, €5.95, €5.98
- All calculations visible with line items in Spanish

### 5. Plan Change Preview
- **Upgrade**: Shows immediate application with pro-rated difference → "Cobro hoy: €X.XX"
- **Downgrade**: Scheduled at period end → "Cobro hoy: €0,00" — "El cambio se aplicará el DD/MM/YYYY"
- Extra ad reassignment options shown during plan change
- FAQ section explains upgrade/downgrade/cancellation/add-on rules

### 6. Pricing Page (Public)
- All 5 plans visible: Free (€0), Starter (€39), Pro (€99), Business (€199), Enterprise (€299)
- "Switch to..." buttons link to /change (logged-in) or registration flow
- Add-on customization toggles available per plan
- Boost 24h packs listed separately

### 7. Ad Creation Flow
- `/es/module/zonacncproductadd/ads` — Form accessible with plan limits
- Logged-in view shows product-only fields (no account creation needed)
- Plan ad quota (102 for Enterprise) enforced

---

## ISSUES ❌

### CRITICAL
- None found — Stripe payment processing works correctly

### HIGH
1. **Billing page names not translated on `/en/` URLs**
   - "Cambiar plan" (should be "Change plan")
   - "Tu plan actual" (should be "Your current plan")
   - "Período actual hasta" (should be "Current period until")
   - "Elige el plan" (should be "Choose your plan")
   - Plan feature descriptions in Spanish on English pages

2. **Billing email templates in Spanish**
   - Password reset email (#23): Subject "Confirmación de contraseña", body in Spanish
   - Password confirmation email (#24): "Su nueva contraseña" — body "Su contraseña ha sido actualizada correctamente" (Spanish)
   - All billing-related emails likely affected by same i18n gap

### MEDIUM
3. **Page title mismatch on `/en/` URLs**
   - `/en/module/zonacncplans/change` → page title still "Cambiar plan — ZonaCNC" (Spanish)
   - Billing route translation inconsistent with public pricing page translation

4. **Invoice line items in Spanish**
   - Pro-ration descriptions use Spanish: "Unused time on...", "Remaining time on..."
   - These are Stripe-generated descriptions, may need custom invoice metadata

### LOW
5. **"mes" abbreviation on English pricing page**
   - "€39 /mes" appearing instead of "€39 /mo" in some contexts

---

## RECOMMENDATIONS
1. **Complete billing page translations** for `/en/` routes — titles, plan descriptions, labels
2. **Translate email templates** for billing events (password changes, subscription changes)
3. **Add Stripe invoice metadata** in English for English-context accounts
4. **Fix page `<title>` tags** for English billing URLs
5. **Standardize "mes" → "mo"** abbreviation on English pricing display

## Stripe Account Info
- Stripe Account: `acct_1TPLFqELpLIGgmZK`
- Mode: Test
- Test Card: 4242 4242 4242 4242 (Visa)
- Invoice Host: `invoice.stripe.com`
