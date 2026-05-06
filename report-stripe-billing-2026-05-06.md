# CRON QA Report: Stripe Billing — 2026-05-06

**Focus Area:** stripe-billing  
**Site:** new.zonacnc.com  
**Date:** 2026-05-06 05:32–05:45 UTC  
**Test Account:** test25@zonacnc.com (Customer #6652, "Test TwentyFive", Plan Starter mensual)  
**Scenario Count:** 1

---

## Test Flow Executed

1. **Password Recovery** → Requested reset for test25@zonacnc.com via `/es/recuperar-contraseña`
2. **Email Verification (IMAP)** → Retrieved reset email from mail.zonacnc.com:993 (credentials from `.env.qa.email`)
3. **Password Reset** → Set new password via reset link, verified "Su contraseña ha sido restablecida correctamente" alert
4. **Login** → Auto-login after reset, verified Mi Cuenta dashboard
5. **Subscription Page** → Checked `/es/suscripcion`: plan details, payment method, invoice history, add-ons
6. **Billing/Invoices Page** → Checked `/es/facturacion`: invoice table, PDF download, Stripe invoice link
7. **Plan Change Page** → Checked `/es/cambiar-plan`: all 5 plans displayed, upgrade/downgrade logic, refund policy
8. **Email Template Review** → Reviewed all 15 emails in inbox for template/translation issues

---

## Email Templates Reviewed

| # | Email | Subject | Issues |
|---|-------|---------|--------|
| 15 | Password changed | [zonacnc.com] Su nueva contraseña | ✅ OK |
| 14 | Password reset confirmation | [zonacnc.com] Confirmación decontraseña | ❌ Missing space |
| 13 | Invoice paid | Factura pagada — Tu plan sigue activo | ✅ OK |
| 12 | Onboarding (3 steps) | Empieza con buen pie en ZonaCNC | ✅ OK |
| 11 | Starter welcome | ¡Bienvenido a Starter! Tu suscripción está activa | ❌ "1 anuncio" vs 3 |
| 10 | Account welcome | [zonacnc.com] ¡Bienvenido! | ✅ OK |

---

## Findings Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| F1 | HIGH | "Confirmación decontraseña" — missing space | Confirmed regression |
| F2 | MEDIUM | Starter welcome email: "1 anuncio" vs 3 actual | New |
| F3 | LOW | /es/suscripcion page title: "zonacnc.com" | New |
| F4 | LOW | Footer: "Politica" → "Política" (missing accent) | New |
| F5 | INFO | Console JS error: "Unexpected token '&'" | New |

---

## Verified Working

- Password recovery flow (ES) ✅
- Password reset email delivery ✅
- Password reset form (show/hide toggle) ✅
- Login after password reset ✅
- Subscription dashboard display ✅
- Invoice history table ✅
- PDF invoice download ✅
- Stripe invoice external link ✅
- Plan change page (5 plans) ✅
- Upgrade/downgrade/proration rules ✅
- 7-day refund policy ✅
- Breadcrumb navigation ✅
- Language switcher (10 languages) ✅
- Sidebar account navigation ✅
