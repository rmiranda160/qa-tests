# CRONQA Finding: Stripe Billing — i18n & Email Template Audit (Enterprise Plan)

**Date:** 2026-05-06 08:10–08:25 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing (subscription/billing i18n + email template review)  
**Duration:** ~15 min  
**Account:** test15@zonacnc.com (Test Empresa Quince) — Enterprise plan  
**IMAP Credentials:** test15@zonacnc.com / KKfGoMaZoJAN (verified via openssl s_client)  
**Scenario:** 1/1 — ✅ COMPLETED (4 bugs found, 1 template issue)

## Scenario: Subscription & Billing Page i18n Audit (EN vs ES) + Email Review

| Step | Action | Result |
|------|--------|--------|
| 1 | Login as test15@zonacnc.com | ✅ Logged in |
| 2 | Navigate to `/es/suscripcion` | ✅ Reviewed, ES OK |
| 3 | Navigate to `/es/facturacion` | ✅ Reviewed — mixed ES/EN strings found |
| 4 | Switch to `/en/suscripcion` | ✅ Reviewed — massive untranslated content |
| 5 | Switch to `/en/facturacion` | ✅ Reviewed — mixed strings |
| 6 | Navigate to `/en/pricing` | ✅ Reviewed — content translated, footer still ES |
| 7 | IMAP verify (test15, 13 emails) | ✅ 3 billing emails reviewed |
| 8 | Review invoice email (UID 12) | ✅ Template structure OK |
| 9 | Review welcome email (UID 10) | ⚠️ Wrong ad count for Enterprise |
| 10 | Review add-on email (UID 13) | ⚠️ Placeholder instead of prorated amount |

---

## BUG-2026-05-06-1: Subscription Module Completely Untranslated in English (CRITICAL)

**Severity:** CRITICAL  
**Affected page:** `/en/suscripcion`  
**Impact:** English-speaking users see 100% Spanish subscription management interface

When navigating to the English version of the subscription page (`/en/suscripcion`), the entire `zonacncplans` module content area renders in Spanish. Only the global header/footer templates are translated; the core subscription content is not.

### Untranslated Strings (23 identified)

| Element | Current (ES) | Expected (EN) |
|---------|-------------|---------------|
| Breadcrumb 1 | Mi cuenta | My account |
| Breadcrumb 2 | Mi suscripción | My subscription |
| Page heading | Mi suscripción | My subscription |
| Plan status badge | Enterprise Activa | Enterprise Active |
| Next charge label | Próximo cobro: | Next charge: |
| Price format | 299 € /mes | 299 € /month |
| Active ads label | Anuncios activos | Active listings |
| Change plan button | Cambiar de plan | Change plan |
| Section: Payment | Método de pago | Payment method |
| Section: Subscription | Suscripción | Subscription |
| Cancel description | Puedes cancelar tu suscripción... | You can cancel your subscription... |
| Cancel button | Cancelar al final del período | Cancel at end of period |
| Invoice history | Historial de facturas | Invoice history |
| Table: Date | Fecha | Date |
| Table: Plan | Plan | Plan |
| Table: Amount | Importe | Amount |
| Table: Status | Estado | Status |
| Table: Invoice | Factura | Invoice |
| Invoice link | Ver factura | View invoice |
| Add-ons section | Add-ons | Add-ons |
| Add-on table: Type | Tipo | Type |
| Add-on table: Qty | Cantidad | Quantity |
| Add-on table: Price | Precio | Price |
| Add-on table: Period | Período | Period |
| Add-on table: Status | Estado | Status |
| Add-on description | Anuncios extra: Aumenta el número... | Extra listings: Increase the number... |
| Add-on status | Activo | Active |
| Add-on cancel | Cancelar | Cancel |
| Add-on CTA | Añadir add-on a tu plan | Add add-on to your plan |
| Add-on qty label | Cantidad | Quantity |
| Add-on submit | Añadir | Add |

### Evidence
- Screenshot: `screenshot-subscription-en-test15-2026-05-06.png`
- Page snapshot: `page-subscription-es-test15-2026-05-06.md`

---

## BUG-2026-05-06-2: Billing Page Mixed ES/EN Strings

**Severity:** HIGH  
**Affected pages:** `/es/facturacion`, `/en/facturacion`  
**Impact:** Inconsistent language experience; Stripe-generated strings untranslated

### Issues on Spanish billing page (`/es/facturacion`)
- Stripe descriptions appear in English:
  - `"Remaining time on Add-on Anuncio Extra after 06 May 2026"` (should be in Spanish)
  - `"1 × Plan Enterprise (at €299.00 / month)"` (should be in Spanish)
  - `"1 × ZonaCNC — Add-on: Extra Ad after 05 May 2026 (+2,99 €)"` (should be in Spanish)

### Issues on English billing page (`/en/facturacion`)
- Invoice status shows `"completado"` (lowercase) instead of `"Completed"`
- Category header shows `"Suscripción"` instead of `"Subscription"`
- Same Stripe descriptions in English only (no ES fallback when on ES page)

### Inconsistency
- Status casing: subscription page shows `"Completado"` (uppercase) while billing page shows `"completado"` (lowercase)

---

## BUG-2026-05-06-3: Footer Navigation Always Shows Spanish Links

**Severity:** MEDIUM  
**Affected pages:** All EN pages (`/en/*`)  
**Impact:** Footer link labels remain Spanish regardless of language selection

### Untranslated Footer Elements on EN Pages

| Section | Current (ES) | Expected (EN) |
|---------|-------------|---------------|
| Marketplace → | Cómo funciona | How it works |
| Marketplace → | Planes para vendedores | Seller plans |
| Marketplace → | Todos los vendedores | All sellers |
| Marketplace → | Preguntas frecuentes | FAQ |
| Legal → | Aviso legal | Legal notice |
| Legal → | Politica de privacidad | Privacy policy |
| Legal → | Politica de cookies | Cookie policy |
| Nuestra empresa (heading) | Nuestra empresa | Our company |
| Terms link | Términos y condiciones · ZonaCNC | Terms & Conditions · ZonaCNC |
| Newsletter unsubscribe | Puede darse de baja en cualquier momento... | You can unsubscribe at any time... |
| Featured category | Tornos | Lathes |

### Evidence
- Screenshot: `screenshot-billing-en-test15-2026-05-06.png`
- Confirmed across `/en/suscripcion`, `/en/facturacion`, `/en/pricing`

---

## BUG-2026-05-06-4: Welcome Email Shows Wrong Ad Count for Enterprise Plan

**Severity:** MEDIUM  
**Affected:** Subscription activation email template  
**Impact:** Misleading information for Enterprise plan subscribers

The Enterprise plan welcome email (test15 UID 10, `¡Bienvenido a Enterprise!`) shows:

```
Anuncios incluidos: 1
```

The Enterprise plan actually includes **100** active ads (confirmed on pricing page at `/en/pricing`). The template variable for included ads is incorrect for this plan.

### Email Details
- Subject: `¡Bienvenido a Enterprise! Tu suscripción está activa`
- From: `ZonaCNC <no-reply@mg.zonacnc-sales.es>`
- Date: 2026-05-05 22:11 UTC
- Template lang: `es`
- Also shows: `Periodo: monthly` (should translate to "Mensual")

---

## Template Issue: Add-on Email Shows Placeholder Instead of Prorated Amount

**Severity:** LOW  
**Affected:** Add-on confirmation email template (test15 UID 13)

The add-on confirmation email shows a literal placeholder text instead of the actual prorated amount:

```
Cobro proporcional ahora: (prorrateado por Stripe)
```

Expected: `Cobro proporcional ahora: 2,99 €` or similar calculated value.

The Stripe API prorated amount is available but the template renders the placeholder text instead of the numeric value.

### Email Details
- Subject: `Add-on añadido a tu suscripción`
- Date: 2026-05-06 01:21 UTC
- Add-on: `anuncio extra × 1` at `3,00 €/mes`

---

## Email Template Review Summary

| UID | Subject | Template | Issues |
|-----|---------|----------|--------|
| 10 | ¡Bienvenido a Enterprise! Tu suscripción está activa | text/plain + text/html (es) | Wrong ad count (1 vs 100), "monthly" not translated |
| 12 | Factura pagada — Tu plan sigue activo | text/plain + text/html (es) | Template OK, clean design |
| 13 | Add-on añadido a tu suscripción | text/plain + text/html (es) | Placeholder instead of prorated amount |

### Positive Notes
- All templates include both `text/plain` and `text/html` parts (accessible)
- Email design is clean and professional (dark header, card layout)
- All emails contain unsubscribe-safe language and direct links to subscription management
- Sender address consistent: `ZonaCNC <no-reply@mg.zonacnc-sales.es>`

---

## Prior Bugs Status (from CRONQA-2026-05-06 regression test)

From the regression verification earlier today on test15:
- **BUG-2** (Email subject not translated to English): ❌ STILL UNFIXED
- **BUG-3** (Welcome email missing plan details): ❌ STILL UNFIXED
- All prior bugs remain open

---

## Comparison: English Pricing Page

The `/en/pricing` page is well-translated in its main content area (headings, plan names, feature lists, CTAs). This contrasts sharply with the subscription management module and footer — suggesting the issue is scope-limited to:
1. The `zonacncplans` module's admin-facing templates
2. The global footer translations

---

## Summary

| Severity | Bug | Description |
|----------|-----|-------------|
| CRITICAL | BUG-2026-05-06-1 | Subscription module completely untranslated in EN (23+ strings) |
| HIGH | BUG-2026-05-06-2 | Billing page mixed ES/EN strings |
| MEDIUM | BUG-2026-05-06-3 | Footer navigation always Spanish on EN pages |
| MEDIUM | BUG-2026-05-06-4 | Welcome email shows 1 ad for Enterprise (should be 100) |
| LOW | Template Issue | Add-on email shows placeholder "(prorrateado por Stripe)" |

**Overall Assessment:** The translation infrastructure exists (header/footer template swaps work) but the zonacncplans module has zero English translations for subscription management, and the billing integration with Stripe leaks English strings into the Spanish UI. Footer translations are globally broken.
