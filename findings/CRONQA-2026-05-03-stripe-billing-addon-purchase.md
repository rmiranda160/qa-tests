---
# CRONQA Finding: Stripe Billing — Add-on Purchase Flow ✅

**Date:** 2026-05-03 16:16 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Scenario:** 1/1 — ✅ Add-on (anuncio extra) purchase via Stripe
**Account:** test7@zonacnc.com (Business Activa, 199€/mo)

---

## Executive Summary

Successfully tested the **add-on purchase flow** for the first time. A one-time Stripe charge (prorated) for an extra ad slot was processed, invoiced, and reflected on the subscription page immediately. All email templates (add-on confirmation, invoice paid) are correctly translated with proper variable substitution.

---

## Test Flow

### Step 1: Login ✅
- **URL:** https://new.zonacnc.com/es/iniciar-sesion
- **Credentials:** test7@zonacnc.com / IMAP password
- **Result:** Login successful (IMAP password matches stored credential)
- **Note:** Password reset was blocked (360-min cooldown from earlier test), but IMAP password worked to authenticate

### Step 2: Verify Subscription Status ✅
- **Plan:** Business Activa
- **Price:** 199 €/mes
- **Next charge:** 03/06/2026
- **Active ads:** 5 / 25
- **Payment method:** Visa •••• •••• •••• 4242
- **Invoice history:** 1 invoice visible (upgrade from Pro → Business, 99.73€ prorated)

### Step 3: Purchase Add-on (Anuncio Extra) ✅
- **Flow:** Clicked "Añadir" on add-on section with quantity=1
- **Confirmation dialog:** "¿Añadir 1 anuncio(s) extra? Stripe cobrará la parte proporcional del periodo en curso con la tarjeta guardada."
- **Accepted** → Stripe processed the prorated charge immediately
- **Result:** ✅ Transaction completed without errors

### Step 4: Verify Post-Purchase State ✅
- **Ad limit:** 5 / **26** (increased from 5/25 — 25 base + 1 addon)
- **New Add-ons table:** "Anuncios extra x1 — 6.00 € — 6.00 € /mes — **Activo**" with "Cancelar" button
- **Invoice #2 generated:** "Remaining time on ZonaCNC — Add-on: anuncio extra after 03 May 2026 (+5,98 €)" — **5.98 EUR — Completado**
- **Sidebar badge:** "Facturas y pagos **2**"
- **Invoice links:** PDF download + "Ver factura" (links to Stripe invoice page)

---

## Email Verification (IMAP)

### Email 14: Add-on Added Confirmation ✅
| Field | Value | Status |
|-------|-------|--------|
| **Subject** | `Add-on añadido a tu suscripción` | ✅ Spanish |
| **From** | ZonaCNC <no-reply@mg.zonacnc-sales.es> | ✅ |
| **To** | test7@zonacnc.com | ✅ |
| **Mailgun tag** | `plans-addon_added` | ✅ |
| **Template** | Professional HTML with dark header, white body, red CTA | ✅ |
| **Personalization** | "Test Vendor" correctly used | ✅ |
| **Add-on name** | "anuncio extra × 1" | ✅ |
| **Price** | 6,00 € (Spanish locale) | ✅ |
| **Prorated info** | "(prorrateado por Stripe)" — shows literal text instead of numeric amount | ⚠️ Minor |
| **CTA link** | "Ver mi suscripción" → https://new.zonacnc.com/module/zonacncplans/subscription | ✅ |
| **Spanish quality** | Correct, professional | ✅ |

### Email 13: Invoice Paid Confirmation ✅
| Field | Value | Status |
|-------|-------|--------|
| **Subject** | `Factura pagada — Tu plan sigue activo` | ✅ Spanish |
| **Mailgun tag** | `plans-invoice_paid` | ✅ |
| **Template** | Professional HTML | ✅ |
| **Amount** | 99,73 € | ✅ |
| **Plan** | Business (monthly) | ✅ |
| **Next charge** | 03/06/2026 | ✅ |
| **PDF link** | Stripe invoice PDF | ✅ |
| **Spanish quality** | Correct, professional | ✅ |

### Email 11: Onboarding (Confirmed Bug) ❌
| Field | Value | Status |
|-------|-------|--------|
| **Subject** | `Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos` | ✅ Spanish |
| **Mailgun tag** | `plans-vendor_onboarding` | ✅ |
| **Template** | Professional, well-designed with colored step cards | ✅ |
| **Variable substitution** | `{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, `{boostpacks_url}` — **ALL unresolved** | ❌ **BUG** |
| **Impact** | Users receive broken links instead of clickable CTAs | Medium severity |

---

## Issues Found

### Bug 1 (Confirmed): Onboarding email template variables NOT substituted
- **Email #11**, Mailgun tag `plans-vendor_onboarding`
- **First reported:** 2026-05-03 10:34 UTC (previous run)
- **Status:** ✅ Confirmed still present
- **Unresolved placeholders:** `{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, `{boostpacks_url}`
- **Impact:** New vendors get broken links in their onboarding email — reduces conversion

### Observation: Add-on email shows "(prorrateado por Stripe)" instead of numeric amount
- **Email #14**, Mailgun tag `plans-addon_added`
- **Text:** "Cobro proporcional ahora: (prorrateado por Stripe)"
- **Expected:** The actual prorated amount (5,98 €) should be displayed
- **Impact:** Low — user can see the amount in the invoice on the website
- **Root cause:** Likely the proration calculation from Stripe API is not parsed/formatted for display in the email template

---

## Email Inventory (test7@zonacnc.com — 14 total)

| # | Subject | Tag | Status |
|---|---------|-----|--------|
| 1 | ¡Bienvenido! | — | Standard |
| 2 | ¡Bienvenido! | — | Standard (duplicate registration) |
| 3 | Confirmación de contraseña | — | Standard |
| 4 | Su nueva contraseña | — | Standard |
| 5 | Su nueva contraseña | — | Standard |
| 6 | Su nueva contraseña | — | Standard |
| 7 | Confirmación de contraseña | — | Standard |
| 8 | Su nueva contraseña | — | Standard |
| 9 | Password query confirmation | — | English (password reset system) |
| 10 | Your new password | — | English (password reset system) |
| 11 | Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos | `plans-vendor_onboarding` | ❌ Template var bug |
| 12 | ¡Bienvenido a Pro! Tu suscripción está activa | `plans-subscription_activated` | ✅ All vars substituted |
| 13 | Factura pagada — Tu plan sigue activo | `plans-invoice_paid` | ✅ |
| 14 | Add-on añadido a tu suscripción | `plans-addon_added` | ✅ (minor proration display) |

---

## Plans Module — UI Components Verified

| Component | Status | Notes |
|-----------|--------|-------|
| Subscription header | ✅ | Shows plan name + status badge |
| Plan price + next charge | ✅ | 199 €/mes, 03/06/2026 |
| Active ads counter | ✅ | 5 / 26 (includes addon) |
| Payment method card | ✅ | Visa 4242, "Cambiar tarjeta" button |
| Cancel subscription | ✅ | "Cancelar al final del período" button |
| Invoice history table | ✅ | 2 invoices, PDF + Stripe links |
| Add-ons table (NEW) | ✅ | Shows active add-ons with cancel button |
| Add-on purchase form | ✅ | Quantity + confirm dialog + Stripe charge |
| "Cambiar de plan" link | ✅ | Links to change page |
| Sidebar navigation | ✅ | All links functional |
| Breadcrumb | ✅ | Inicio > Mi cuenta > Mi suscripción |

---

## Stripe Integration Verification

| Check | Status | Evidence |
|-------|--------|----------|
| Stripe.js loaded | ✅ | Seen in earlier snapshot |
| Stripe Elements (card) | ✅ | Visa 4242 stored |
| Stripe charge processed | ✅ | New invoice: 5.98€ prorated |
| Stripe invoice link | ✅ | invoice.stripe.com link works |
| Stripe webhook (inferred) | ✅ | Invoice appears on subscription page immediately |

---

## Conclusion

✅ **Add-on purchase flow works end-to-end via Stripe.**
- Stripe successfully charged the prorated amount (5,98€) to the saved Visa card
- Invoice generated immediately with "Completado" status
- Ad limit correctly increased from 25 to 26
- New "Add-ons" UI table displays the active add-on with cancel option
- Email confirmation received with proper Spanish template
- All CTA links functional

**Bugs still open:**
1. Onboarding email template variable substitution (Medium severity) — confirmed still present
2. Add-on email shows "(prorrateado por Stripe)" instead of numeric amount (Low severity)

**Recommended next steps:**
1. Fix onboarding email template variable substitution
2. Fix add-on email to display numeric prorated amount
3. Refresh QA email pool (test7-test30 exhausted)
4. Test Boost Pack purchase (next billing flow to verify)
