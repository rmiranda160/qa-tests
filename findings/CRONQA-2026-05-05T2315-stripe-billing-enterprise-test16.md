# Findings — Stripe Billing Enterprise (test16 flow)
**Date:** 2026-05-05 23:15–23:32 UTC  
**Account:** test16@zonacnc.com (freshly registered)  
**Plan:** Enterprise (€299/mo)  
**Browser:** MCP remote pwmcp-zonacnc  
**Stripe session:** `cs_test_a1cwpkv9zSeaPWnQoQUgIIMSYVqDXBwZgxi5cCkz5cEOeovr2teElKi76N`

## Flow Summary
1. Registered test16@zonacnc.com via `/es/?controller=registration` (password: `Test1234%segura`)
2. Filled billing address: Calle Test 16, Nave 8, 08016 Barcelona
3. Navigated to `/es/pagar-plan?plan=enterprise`
4. Filled vendor registration form at `/es/alta-vendedor` (triggered by checkout)
5. Completed Stripe Checkout (card: 4242…4242, exp: 12/34, CVC: 123)
6. Redirected to success page
7. Verified emails via IMAP (3 new emails: welcome, invoice, onboarding)

## New Findings

*None specific to Enterprise — all issues match previously documented bugs. Details below.*

## Confirmed Issues (cross-plan consistency)

### BUG-CONFIRMED: Wrong ad count in Welcome email (ALL plans)
| Plan | Expected ads | Actual in email |
|------|-------------|-----------------|
| Starter (test11) | 3 | 1 |
| Business (test14) | 40 | 1 |
| **Enterprise (test16)** | **100** | **1** |

- **Email:** `plans-subscription_started` (text + HTML)
- **Root cause:** Template variable `{max_listings}` (or similar) always returns 1 regardless of plan
- **Template:** Both text and HTML versions affected

### BUG-CONFIRMED: English "monthly" in Spanish emails (ALL plans)
- **Email #11** (subscription_started): `"Periodo: **monthly**"` → should be `"Periodo: mensual"`
- **Email #12** (invoice_paid): `"Plan: Enterprise **(monthly)**"` → should be `"(mensual)"`
- **Consistent across Starter, Business, Enterprise**

### BUG-CONFIRMED: Truncated greeting in emails
- **Actual:** `"Hola Test"` 
- **Expected:** `"Hola Test Quince"` or `"Hola Test Quince Usuario QA"`  
- **Root cause:** First word of name only used in email templates

## Accent/Translation Issues (existing, confirmed on Enterprise flow)

### Checkout page (`/es/pagar-plan`)
- "2990.00 €/**ano**" → "año" (yearly price display)

### Success page (`/es/module/zonacncplans/success`)
- `"Tu suscripción **esta** activa"` → "está"
- `"email de **confirmacion**"` → "confirmación"

### Dashboard/Panel (`/es/panel`)
- "Ver perfil **publico**" → "público"
- "**Aun** no has publicado **ningun** anuncio" → "Aún… ningún"
- Section headings: "**Ubicacion**" → "Ubicación", "**Presentacion**" → "Presentación", "**Descripcion**" → "Descripción"
- "**Tamano maximo**" → "Tamaño máximo"
- "**Codigo postal**" → "Código postal"
- "**Telefono**" → "Teléfono"

### Sector dropdown accents
- "**Automatizacion**" → "Automatización"
- "**Robotica**" → "Robótica"
- "**Medicion**" → "Medición"
- "**Plasticos**" → "Plásticos"
- "**Construccion**" → "Construcción"

### Province dropdown accents
- "**Alava**" → "Álava", "**Almeria**" → "Almería", "**Avila**" → "Ávila", "**Caceres**" → "Cáceres", "**Cadiz**" → "Cádiz", "**Castellon**" → "Castellón", "**Cordoba**" → "Córdoba", "**A Coruna**" → "A Coruña", "**Guipuzcoa**" → "Guipúzcoa", "**Jaen**" → "Jaén", "**Leon**" → "León", "**Malaga**" → "Málaga"

### Footer
- "**Politica** de privacidad" → "Política"
- "**Politica** de cookies" → "Política"

### Stripe Checkout product description
- "50 **imagenes**" → "imágenes" (Stripe-managed; this string comes from ZonaCNC's product metadata in Stripe)

## Boost Quota
The onboarding email (#13, "Empieza con buen pie en ZonaCNC") was received but contains the same boost quota → 0 bug documented in the test11 report.

## Summary
Enterprise checkout works functionally (payment processed, subscription active). All i18n/translation issues are **cross-plan**, confirming these are template-level bugs affecting all plan tiers equally. The wrong-ad-count (always=1) and untranslated "monthly" issues are the most impactful for user trust.
