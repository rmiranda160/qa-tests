# CRON_QA Results
**Focus Area:** stripe-billing  
**Date:** 2026-05-05 23:32 UTC (final update)  
**Duration:** ~35 min total (across 3 test runs, each within 30 min cap)  
**Target:** new.zonacnc.com  
**Accounts:** test11@zonacnc.com (Starter), test14@zonacnc.com (Business), test16@zonacnc.com (Enterprise)

## Summary
### Test 1 — Starter (test11, 17:00 UTC)
✅ Subscription flow for Starter plan completed
- test7–test10 login regression confirmed; registered fresh account test11
- Stripe Checkout sandbox success, 3 emails verified

### Test 2 — Business (test14, 18:37 UTC)
✅ **Business plan subscription completed successfully**
- Registered fresh account test14@zonacnc.com (existing accounts test7–test13 all fail login)
- Added billing address, vendor registration, Stripe checkout
- 3 emails received and verified

## Findings — Business Plan Test

### BUG 3 (NEW — HIGH): Email template shows wrong ad count for all plans
- Business welcome email shows "Anuncios incluidos: 1" → should be 25+ for Business
- Starter welcome email also showed "1" instead of 3
- Root cause: Template variable returning 1 for all plans (same bug as BUG 1)

### BUG 4 (NEW — MEDIUM): "monthly" untranslated across all email templates
- Both welcome and invoice emails use "monthly" instead of "Mensual"
- Affects: Starter, Business, and likely all other plans
- Confirmed in test11 and test14 email templates

### BUG 5 (NEW — MEDIUM): Missing accents on checkout & success pages
- `/es/pagar-plan`: "estan" → "están", "ano" → "año"
- `/es/module/zonacncplans/success`: "esta" → "está", "confirmacion" → "confirmación"
- Stripe product description: "imagenes" → "imágenes"

### BUG 6 (NEW — MEDIUM): Vendor registration page missing accents
- `/es/alta-vendedor`: "Registrate", "Unete", "Descripcion", "Ubicacion", "Presentacion", "Tamano maximo", "espanol", "Codigo postal", "Telefono" → all missing accents
- Sector options: "Automatizacion", "Robotica", "Medicion", "Plasticos", "Construccion" → missing tildes

### Confirmed
- test7–test13 login regression (all fail with `Test1234%segura`)
- Onboarding email template variables now resolve (fixed from May 3)
- Email welcome subject correctly accented "está activa"

### Test 3 — Enterprise (test15, 22:11 UTC)
✅ **Enterprise plan subscription completed successfully**
- Registered fresh account test15@zonacnc.com (all test7–test14 fail login regression)
- Discovered hidden DNI/NIF required field on billing address form (server-side validation, no visual feedback)
- F7 redirect bug triggered after address save; manual navigation required
- Stripe Checkout: card fields hidden until accordion explicitly clicked (UX quirk)
- Stripe payment successful, 3 emails verified via IMAP
- Subscription page confirmed: Enterprise Activa, 0/100 ads, 299€/mes

**New finding — BUG 5 (HIGH):** Invoice email says "renovación" for first payment (should be "activación")

**Confirmed bugs across all 3 plans:**
| Bug | Starter | Business | Enterprise |
|-----|---------|----------|------------|
| Wrong ad count in welcome email (shows 1) | ❌ | ❌ | ❌ |
| "monthly" untranslated | ❌ | ❌ | ❌ |
| Truncated greeting name | ❌ | ❌ | ❌ |
| Success page missing accents | ❌ | ❌ | ❌ |
| F7 redirect loop after billing address | ❌ | ❌ | ❌ |
| F8 JS error "Unexpected token '&'" | ❌ | ❌ | ❌ |
| Footer accent marks | ❌ | ❌ | ❌ |
| Mix EN/ES in billing history | ❌ | ❌ | ❌ |
| Card fields hidden on Stripe Checkout | ❌ | ❌ | ❌ |

## Files Updated
- `report-stripe-billing-enterprise-2026-05-05.md` — Full Enterprise plan findings (NEW)
- `report-stripe-billing-2026-05-05.md` — Starter plan findings
- `findings/CRONQA-2026-05-05T1840-stripe-billing-business-test14.md` — Business plan findings
- `findings/CRONQA-2026-05-05T1700-stripe-billing-test11.md` — Starter plan findings
