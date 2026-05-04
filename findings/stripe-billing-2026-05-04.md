# QA Findings: Stripe Billing — new.zonacnc.com
**Date**: 2026-05-04 | **Tester**: test7@zonacnc.com | **Session**: cron:f88c723f

## Scope
Stripe billing flows on new.zonacnc.com: pricing/checkout, subscription management, invoices, billing emails, and translations across ES/EN.

---

## Finding 1: Stripe Checkout mixed language (ES user → EN checkout UI)
**Severity**: Medium | **Page**: `checkout.stripe.com` (triggered from `/es/module/zonacncplans/checkout?plan=starter`)

When a Spanish-language user clicks "Proceder al pago" for the Starter plan, the Stripe-hosted checkout page shows:
- Company name: "Entorno de prueba de Veleta Comercializaciones y Servicios SLU" (correct Spanish)
- **All payment UI is in English**: "Subscribe to Plan Starter", "Payment method", "Card information", "Pay", etc.
- **Expected**: Stripe Checkout should respect the user's language (Spanish) when triggered from /es/ path.

---

## Finding 2: Footer newsletter unsubscribe text not translated on English pages
**Severity**: Low | **Pages**: All `/en/` pages

Newsletter heading "Get our latest news and special sales" is correctly in English, but the unsubscribe disclaimer stays in Spanish:
> "Puede darse de baja en cualquier momento. Para ello, consulte nuestra información de contacto en el aviso legal."

**Expected**: Should show English translation on English pages.

---

## Finding 3: Footer navigation "Legal" and "Nuestra empresa" sections not translated on English pages
**Severity**: Medium | **Pages**: All `/en/` pages

Legal section links remain in Spanish:
- "Aviso legal" → should be "Legal notice"
- "Politica de privacidad" → should be "Privacy policy" 
- "Politica de cookies" → should be "Cookie policy"

"Nuestra empresa" header and sub-items mixed:
- "Nuestra empresa" → should be "Our company"
- "Términos y condiciones · ZonaCNC" → Spanish link text with Spanish description
- Some items translated ("About us", "Contact us", "Sitemap") while others not

---

## Finding 4: Category names not fully translated on English pages
**Severity**: Low | **Pages**: English footer "Featured categories"

- "Tornos" shows instead of "Lathes" (though URL correctly points to `/en/15-lathes`)
- "Special machines" URL slug retains Spanish: `/en/1057-maquinas-especiales`

---

## Finding 5: Breadcrumb shows Spanish text on English account pages
**Severity**: Low | **Pages**: `/en/module/zonacncplans/subscription`, `/en/module/zonacncplans/billing`

Breadcrumb shows "Mi cuenta" instead of "My account" on English pages:
> Home / **Mi cuenta** / My subscription
> Home / **Mi cuenta** / Facturas y pagos

---

## Finding 6: Subscription management page largely untranslated (English version)
**Severity**: High | **Page**: `/en/module/zonacncplans/subscription`

Heading "**Mi suscripción**" despite English being selected. Major untranslated sections:

| Actual (Spanish) | Expected (English) |
|---|---|
| Mi suscripción | My subscription |
| Enterprise Activa | Enterprise Active |
| Próximo cobro | Next payment |
| Anuncios activos | Active ads |
| Método de pago | Payment method |
| Cambiar tarjeta | Change card |
| Suscripción | Subscription |
| Cancelar al final del período | Cancel at end of period |
| Historial de facturas | Invoice history |
| Fecha / Importe / Estado / Factura | Date / Amount / Status / Invoice |
| Completado | Completed |
| Ver factura | View invoice |
| Add-ons section: Tipo / Cantidad / Precio / Período / Estado / Activo / Cancelar | Type / Quantity / Price / Period / Status / Active / Cancel |
| Añadir add-on a tu plan | Add add-on to your plan |
| Anuncios extra / Anuncio extra / Cantidad / Añadir | Extra ads / Extra ad / Quantity / Add |

---

## Finding 7: Billing/Invoices page completely untranslated (English version)
**Severity**: High | **Page**: `/en/module/zonacncplans/billing`

Page title: "**Facturas y pagos** · ZonaCNC" (Spanish)
All content in Spanish despite English language selection:
- Heading: "Facturas y pagos"
- Description: "Aquí encontrarás un histórico de los pagos realizados..."
- Table headers: Fecha / Concepto / Importe / Estado / Factura
- Status: "completado"
- Action: "Ver factura"
- Breadcrumb: "Mi cuenta / Facturas y pagos"
- "Suscripción" used for "Subscription" in description rows

---

## Finding 8: Stripe invoice page in English for Spanish customers
**Severity**: Medium | **Page**: `invoice.stripe.com/*`

Stripe invoice page displays all UI labels in English ("Invoice paid", "View invoice and payment details", "Download invoice", "Download receipt") for Spanish customers. 
**Expected**: Invoice should respect the customer's language/region.

---

## Finding 9: Email template — "Periodo" label shows untranslated "monthly" in Spanish emails
**Severity**: Low | **Email**: Subscription activation (`plans-subscription_started`)

```
Periodo: monthly
```
Should be: `Periodo: mensual`

Also appears in invoice-paid email as: `Business (monthly)` → should be `Business (mensual)`

---

## Finding 10: Add-on email — Placeholder not populated
**Severity**: Medium | **Email**: Add-on added (`plans-addon_added`)

```
Cobro proporcional ahora: (prorrateado por Stripe)
```
The parenthetical `(prorrateado por Stripe)` appears to be an unfilled template placeholder. Should show actual prorated amount (e.g. "5,98 €").

---

## Finding 11: Onboarding email — All template variables unfilled
**Severity**: High | **Email**: Vendor onboarding (`plans-vendor_onboarding`)

Six template variables show as raw placeholders instead of actual values:

- `{vendor_dashboard_url}` — should be link to seller dashboard
- `{max_listings}` — should be the plan's listing limit
- `{new_ad_url}` — should be link to create listing
- `{messaging_url}` — should be link to messaging
- `{boost_quota_monthly}` — should be boost allowance number
- `{boostpacks_url}` — should be link to boost packs

This makes the onboarding email non-functional — users cannot click through to any of the recommended actions.

---

## Summary

| # | Finding | Severity | Area |
|---|---|---|---|
| 1 | Stripe Checkout UI in English for ES users | Medium | Checkout |
| 2 | Footer newsletter text not translated | Low | Translations |
| 3 | Footer Legal/Nuestra empresa not translated | Medium | Translations |
| 4 | Category names not fully translated | Low | Translations |
| 5 | Breadcrumb "Mi cuenta" on EN pages | Low | Translations |
| 6 | Subscription page mostly Spanish on EN | **High** | Translations |
| 7 | Billing page completely Spanish on EN | **High** | Translations |
| 8 | Stripe invoice in English for ES customers | Medium | Invoices |
| 9 | "monthly" not translated in ES email templates | Low | Email templates |
| 10 | Add-on email placeholder not populated | Medium | Email templates |
| 11 | Onboarding email template variables unfilled | **High** | Email templates |

**Total**: 11 findings (3 High, 5 Medium, 3 Low)
