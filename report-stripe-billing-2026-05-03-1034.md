# QA Report: Stripe Billing — Login Fixed ✅, test8 Pro Subscription Active
**Date:** 2026-05-03 10:34 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Escenario:** 1/1 — ⚠️ Parcialmente Ejecutable

---

## Summary (Breakthrough Day)

After **8 consecutive days of being BLOCKED**, the login page is now **HTTP 200** and the checkout redirects to login properly instead of returning HTTP 500. We successfully:
1. Logged in as test8@zonacnc.com (password reset flow)
2. Verified **Pro subscription is active** (purchased May 2)
3. Verified subscription management page works
4. Verified Stripe Elements integration for payment methods
5. Identified a **template variable substitution bug** in the onboarding email

## Test Results

| Acción | URL | Resultado |
|--------|-----|-----------|
| Home | `/` | ✅ 200 OK |
| Login | `/es/iniciar-sesion` | ✅ **HTTP 200** (was 500 for 8 days) |
| Registration | `/es/?controller=registration` | ✅ 200 OK |
| Password Reset Form | `/es/recuperar-contraseña` | ✅ 200 OK, campos correctos |
| Password Reset Submit | — | ✅ Email sent via Mailgun, token received |
| Password Reset Execute | — | ✅ Redirect to /es/mi-cuenta, "contraseña restablecida" |
| Checkout (no auth) | `/module/zonacncplans/checkout?plan=*` | ✅ **302 redirect a login** (was 500) |
| Pricing (es) | `/es/pricing` | ✅ 200 OK (was ERR_ABORTED) |
| Boostpacks | `/es/module/zonacncplans/boostpacks` | ✅ 200 OK |
| Mi Suscripción | `/module/zonacncplans/subscription` | ✅ Pro Activa, 99€/mes, renueva 02/06/2026 |
| Facturas y pagos | `/es/module/zonacncplans/billing` | ✅ 200 OK ("Sin movimientos todavía") |
| Añadir método de pago | — | ✅ Stripe Elements modal opens |
| test7@zonacnc.com login | — | ❌ "Error de autenticación" (wrong password) |
| test8@zonacnc.com login | — | ✅ Password reset → login successful |

## Subscription Details (test8)

- **Plan:** Pro
- **Estado:** Activa
- **Precio:** 99,00 € /mes
- **Anuncios incluidos:** 1 (de 10 activos máximo)
- **Próximo cobro:** 02/06/2026
- **Importar Machineseeker:** Plan pro · 0 / 20 este mes

## Bugs Found

### 1. [Medium] Template variables sin sustituir en email onboarding
- Email: "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"
- Variables literales visibles: `{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, `{boostpacks_url}`
- Los usuarios reciben enlaces rotos en lugar de URLs clickables

### 2. [Low] Facturación sin movimientos
- Suscripción Pro activa desde May 2 pero no hay invoices en /billing
- Posible: Stripe test mode / webhook no configurado

## Email Templates — PRO subscription (verify OK)

```
Plan: Pro
Periodo: monthly
Cuota mensual: 99,00 €
Anuncios incluidos: 1
Próxima renovación: 02/06/2026
```
→ All values correctly substituted ✅

## QA Email Pool

| Email | Estado |
|-------|--------|
| test7@zonacnc.com | TAKEN ("Test Vendor Seven QA", password reset) |
| test8@zonacnc.com | **TAKEN — Pro Active** ("Test Usuario SEO") |
| test9-test30 | TAKEN (pool exhausto) |

## Console Errors

Consistent 1 JS error per page (PrestaShop front controller). No billing-specific errors.

## Conclusión

⚠️ **Parcialmente Ejecutable** — Primera vez en 9 días con progreso real:
- Login HTTP 200 ✅ **fixed**
- Checkout redirect 302 ✅ **fixed**  
- test8 Pro activa ✅ Stripe billing **funcionó** el 2 de mayo
- Bug nuevo encontrado: template variables sin sustituir en onboarding email
- Pool de emails QA necesita refresco completo para continuar
