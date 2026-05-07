# Stripe Billing QA — Add-on Purchase Flow

**Date**: 2026-05-07 08:19 UTC  
**Focus**: Add-on purchase flow (Anuncio Extra) via saved payment method on `new.zonacnc.com`  
**Test account**: `test8@zonacnc.com` (displays as "Test TestUserSeven")  
**Cron ID**: f88c723f-9d7c-485a-b506-55f4e41efab3  

---

## Scenario Executed

| # | Action | Outcome |
|---|--------|---------|
| 1 | Login as test8@zonacnc.com | ✅ Success |
| 2 | Navigate to /es/suscripcion | ✅ Pro Activa, €99/mes, 4/10 ads, saved Visa ••••4242 |
| 3 | Click "Añadir" on "Anuncio extra" (€9.00/mes) | ✅ Confirmation dialog: "¿Añadir 1 anuncio(s) extra? Stripe cobrará la parte proporcional…" |
| 4 | Accept confirmation dialog | ✅ Add-on purchased immediately (saved card) — no Stripe redirect |
| 5 | Verify subscription page | ✅ Anuncios activos 4/11, new Add-ons section with cancel option |
| 6 | Verify facturación page | ✅ New invoice #3: €10,54, badge updated to 3 |
| 7 | Verify emails via IMAP | ✅ 2 emails received (add-on + invoice) |
| 8 | Review templates/translations | ⚠️ 2 template bugs found, 1 persistent placeholder |
| 9 | Check English subscription page | ❌ REGRESSION: Most content still in Spanish |

---

## Detailed Findings

### ✅ PASS: Add-on Purchase Flow (Core)

The add-on purchase completed successfully via saved payment method:
- **Before**: Anuncios activos 4/10, no add-ons, 2 invoices
- **After**: Anuncios activos 4/11, 1 active add-on ("Anuncios extra x1"), 3 invoices
- Confirmation dialog clearly states: "¿Añadir 1 anuncio(s) extra? Stripe cobrará la parte proporcional del periodo en curso con la tarjeta guardada."
- No Stripe redirect needed — uses saved Visa ••••4242
- "Add-ons" section appears immediately with status, price, and cancel option

### ✅ PASS: Proration Calculation

| Field | Amount |
|-------|--------|
| Add-on base price | €9,00/mes |
| Prorated charge (base) | €8,71 |
| Final charge (with IVA) | **€10,54** |
| Invoice concept | "Remaining time on Add-on Anuncio Extra after 07 May 2026 (+8,71 €)" |

Proration works correctly. Concept shows base amount (+8,71 €), final total includes IVA (€10,54).

### ✅ PASS: Invoice History Update

- Sidebar badge: "Facturas y pagos 2" → "Facturas y pagos 3" ✅
- New invoice row: 07/05/2026, €10,54, completado ✅
- PDF download link works ✅
- Stripe-hosted invoice link works ✅

### ✅ PASS: Add-on Management

New "Add-ons" section on subscription page:
- Table with columns: Tipo, Cantidad, Precio, Período, Estado
- Shows: "Anuncios extra x1, 9.00 €, 9.00 €/mes, Activo"
- "Cancelar" button available to cancel add-on
- "Añadir add-on a tu plan" section still visible for additional purchases

### ✅ PASS: Emails Sent

Two emails received within seconds of purchase:

**Email #28: "Add-on añadido a tu suscripción"**
- Subject: "Add-on añadido a tu suscripción" (ES, UTF-8)
- From: ZonaCNC <no-reply@mg.zonacnc-sales.es>
- Body: Confirms add-on type, quantity, unit price
- HTML title: "Add-on añadido"
- Link to subscription page present

**Email #27: "Factura pagada — Tu plan sigue activo"**
- Subject: Uses UTF-8 em-dash (—)
- From: ZonaCNC <no-reply@mg.zonacnc-sales.es>
- Body: Confirms charge, plan, next billing date
- Stripe invoice PDF link present
- CTA: "Descarga tu factura PDF"

---

## 🐛 BUG #1: Placeholder in Add-on Email (PERSISTS since PR #237)

**Severity**: Medium  
**Location**: Add-on confirmation email (#28)  
**Status**: PERSISTS (previously reported in CRONQA-2026-05-07-stripe-billing-i18n-regression-post-pr237.md)

The add-on confirmation email contains unresolved placeholders:

```
Plain text body:
  "Stripe ha cobrado la parte proporcional ((prorrateado por Stripe))."
  "Cobro proporcional ahora: (prorrateado por Stripe)"
```

The email should show the actual prorated amount (€8,71 + IVA = €10,54) instead of `(prorrateado por Stripe)`. This affects both occurrences in the email body.

This was **Finding #3** from the post-PR#237 regression verification and **still persists** after PR #237 merge.

---

## 🐛 BUG #2: Misleading Invoice Email Wording

**Severity**: Low  
**Location**: Invoice email (#27, "Factura pagada — Tu plan sigue activo")  
**Status**: NEW

Email #27 says:
> "Hemos cobrado la **renovación** de tu plan Pro."

But the charge was for an **add-on** ("Anuncio extra"), not a plan renewal. The invoice in facturación correctly shows: "Remaining time on Add-on Anuncio Extra after 07 May 2026 (+8,71 €)".

The email template appears to use a generic "plan renewal" wording for all charges, regardless of whether the charge is for a plan, add-on, or other item. This is misleading to users.

**Expected**: The email should distinguish between plan charges and add-on charges. For add-ons, use wording like "Hemos cobrado un add-on a tu plan Pro" instead of "renovación de tu plan Pro".

---

## 🐛 BUG #3: English Subscription Page Largely Untranslated (PERSISTS)

**Severity**: Medium  
**Location**: https://new.zonacnc.com/en/subscription  
**Status**: PERSISTS (previously reported)

The English subscription page (/en/subscription) shows most content in Spanish:

| Element | Displayed (ES) | Expected (EN) |
|---------|---------------|---------------|
| Page title | `zonacnc.com` | `My Subscription — ZonaCNC` |
| H1 heading | `Mi suscripción` | `My subscription` |
| Plan status | `ACTIVA` | `ACTIVE` |
| Next charge | `Próximo cobro` | `Next charge` |
| Active ads | `Anuncios activos` | `Active listings` |
| Change plan button | `Cambiar de plan` | `Change plan` |
| Payment method | `Método de pago` | `Payment method` |
| Subscription | `Suscripción` | `Subscription` |
| Cancel button | `Cancelar al final del período` | `Cancel at end of period` |
| Invoice history | `Historial de facturas` | `Invoice history` |
| Status | `Completado` | `Completed` |
| View invoice | `Ver factura` | `View invoice` |
| Add-on heading | `Añadir add-on a tu plan` | `Add add-on to your plan` |
| Add-on status | `Activo` | `Active` |
| Add-on cancel | `Cancelar` | `Cancel` |

**Not translated**: 15+ content elements in the main subscription area.

**Translated correctly**: Sidebar navigation ("My Account", "Information", "My listings", etc.) is in English, confirming the issue is specific to the subscription module templates.

This was reported in the i18n regression post PR #237 and **persists**.

---

## Console Errors

1 error on all pages (likely analytics/CSP, not billing-related).

---

## Account State Post-Test

| Field | Before | After |
|-------|--------|-------|
| Plan | Pro Activa | Pro Activa |
| Ads limit | 10 | **11** (+1 add-on) |
| Ads used | 4 | 4 |
| Add-ons | None | 1× Anuncio extra (€9/mes) |
| Invoices | 2 | **3** |
| Last charge | €58,16 (proration) | **€10,54** (add-on) |

---

## Summary

| Category | Count |
|----------|-------|
| ✅ PASS | 5 (Core flow, Proration, Invoice history, Add-on management, Emails) |
| 🐛 BUG | 3 |
| ⚠️ REGRESSION | 2 (Placeholder in add-on email, English page untranslated) |

**Key Issues**:
1. **(PERSISTS)** Add-on email still shows `(prorrateado por Stripe)` placeholder instead of actual amount
2. **(NEW)** Invoice email calls add-on charge "renovación de tu plan" (misleading wording)
3. **(PERSISTS)** English subscription page has 15+ elements still in Spanish

**Recommendations**:
1. Fix add-on email template to display actual prorated amount from Stripe
2. Update invoice email template to distinguish between plan charges and add-on charges
3. Complete i18n translations for subscription module templates (ES→EN, ES→CA, ES→others)
