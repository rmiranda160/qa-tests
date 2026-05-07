# QA Report: Stripe Billing Flow — new.zonacnc.com
**Date**: 2026-05-07 17:17-17:35 UTC  
**Account**: test15@zonacnc.com (Enterprise plan, Visa •••• 4242)  
**Scope**: Subscription management, card update, add-on purchase, cancel flow, email verification

## Scenario 1: Stripe Subscription & Billing Management

### ✅ Passes

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Password reset flow | ✅ | Email sent, IMAP retrieval works, reset link functional |
| 2 | Login after password reset | ✅ | Redirect to "Panel de Vendedor" |
| 3 | `/es/suscripcion` page | ✅ | Full page renders: plan, card, add-ons, invoices, cancel button |
| 4 | Stripe Elements card update dialog | ✅ | Opens with card number/expiry/CVC/ZIP, validation works |
| 5 | Card form — ZIP validation | ✅ | "Your postal code is incomplete" warning if empty |
| 6 | Card saved | ✅ | Form submits, returns to subscription page |
| 7 | Plan change preview (downgrade) | ✅ | Prorated calculations shown, downgrade deferred to period end |
| 8 | Quota validation on plan change | ✅ | "Quota 101 no cabe en plan Pro (rango 1-10)" correctly blocks |
| 9 | Cancel dialog | ✅ | Confirmation with reason textbox, "Volver"/"Confirmar cancelación" |
| 10 | Add-on purchase triggers Stripe charge | ✅ | €2.82 charged, quota updated 101→102 |
| 11 | Add-on confirmation email | ✅ | Sent immediately |
| 12 | Invoice/paid email with PDF link | ✅ | Stripe invoice link works, amount displayed |
| 13 | `/es/facturacion` invoice list | ✅ | 3 invoices with PDF download & Stripe links |
| 14 | Auto-renewal status display | ✅ | "Activa. Próximo cobro 06/06/2026" |

### 🟡 Findings

| # | Severity | Finding | Detail |
|---|----------|---------|--------|
| **F1** | Medium | Placeholder text in add-on email | Email shows literal `(prorrateado por Stripe)` instead of actual prorated amount. The amount (€2.82) only appears in the separate invoice email. |
| **F2** | Low | Misleading wording in invoice email | "Hemos cobrado el ciclo de tu plan Enterprise" appears for any charge (including €2.82 add-on proration). Should say "add-on" or "cargo parcial" for non-cycle charges. |
| **F3** | Low | No email on card change | No notification email sent when payment method is updated. |
| **F4** | Low | JS console error | `Uncaught SyntaxError: Unexpected token '&'` on `/es/suscripcion` (theme bundle issue, non-blocking). |
| **F5** | Low | Subject domain branding | Password emails use `[zonacnc.com]` in subject. Should be `[ZonaCNC]` for consistency with other emails. |

### Email Template Quality

| Template | Subject | Body | Findings |
|----------|---------|------|----------|
| Password change | `Su nueva contraseña` | "Su contraseña ha sido actualizada correctamente." | Clear, minimal. Domain branding issue (F5) |
| Add-on added | `Add-on añadido a tu suscripción` | Lists add-on, unit price, link to subscription | **F1**: placeholder `(prorrateado por Stripe)` |
| Invoice paid | `Factura pagada — Tu plan sigue activo` | Amount, plan name, next charge, PDF link | **F2**: says "ciclo" for prorated charges |

### Stripe Integration Status
- Stripe Elements iframe loads correctly ✅
- Card tokenization works (card update accepted) ✅
- Prorated charges calculate correctly ✅
- Stripe invoice links resolve to `pay.stripe.com` ✅
- PDF invoice download links present ✅

### Test Account State After Test
- Plan: Enterprise (mensual), €299/mes
- Add-ons: 2 × anuncio extra (€3.00/mes each) = €6.00/mes extra
- Total ads quota: 102
- Next charge: 06/06/2026
- Card: Visa •••• 4242
- Invoices: 3 (2 original + 1 add-on proration)
