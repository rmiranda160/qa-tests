# CRON QA — Stripe Billing: Business Plan (test14)

**Date:** 2026-05-05 18:37–18:55 UTC  
**Environment:** new.zonacnc.com (MODO TEST)  
**Account:** test14@zonacnc.com (Test Catorce Usuario QA)  
**Plan:** Business — €199.00/mes  
**Stripe Session:** `cs_test_a1sk7xC66hYBVNt0EXbXy9vvn9IKiXtq53KEb9wDbFDyN7xNW748eiuzy7`  
**Status:** ✅ Payment succeeded, subscription activated

---

## Flow Executed

1. Registered new account test14@zonacnc.com (existing test7–test13 have login regression)
2. Filled billing address (Calle Test 14, Nave 7, 08014 Barcelona)
3. Registered as vendor (Mecanizado CNC sector, Barcelona)
4. Navigated to `/es/pagar-plan?plan=business` → Stripe Checkout
5. Completed Stripe payment with test card 4242...
6. Verified 3 emails received via IMAP

---

## Findings

### 🔴 Critical — Email Template Bug

**Subscription welcome email (`plans-subscription_started`):**
- **"Anuncios incluidos: 1"** — Business plan should show 25–30 anuncios, not 1. The template is using a hardcoded or wrong variable for the listing count.

### 🟡 Medium — Untranslated Strings in Emails

Both welcome and invoice emails use **"monthly"** (English) instead of **"Mensual"** (Spanish):
- Welcome: `Periodo: monthly`
- Invoice: `Plan: Business (monthly)`

### 🟡 Medium — i18n: Missing Accents (Checkout Page)

`/es/pagar-plan?plan=business`:
- "Tus datos **estan** protegidos." → debe ser "están"
- "1990.00 €/**ano**" → debe ser "año" (falta la ñ)

### 🟡 Medium — i18n: Missing Accent (Stripe Checkout Description)

Stripe product description (passed from ZonaCNC to Stripe):
- "30 **imagenes**" → debe ser "imágenes"

### 🟡 Medium — i18n: Missing Accents (Success Page)

`/es/module/zonacncplans/success`:
- "Tu suscripción **esta** activa" → debe ser "está"
- "Recibirás un email de **confirmacion**" → debe ser "confirmación"

### 🟡 Medium — i18n: Missing Accents (Vendor Registration)

`/es/alta-vendedor` — múltiples faltas de acentuación:
- "Registrate" → "Regístrate"
- "Unete" → "Únete"  
- "Descripcion" → "Descripción"
- "Ubicacion" → "Ubicación"
- "Presentacion" → "Presentación"
- "Tamano maximo" → "Tamaño máximo"
- "espanol" → "español"
- "Codigo postal" → "Código postal"
- "Telefono" → "Teléfono"
- Sectores: "Automatizacion", "Robotica", "Medicion", "Plasticos", "Construccion" → necesitan tildes

---

## Email Verification (IMAP)

3 emails received at test14@zonacnc.com within seconds of payment:

| # | Subject | Tag |
|---|---------|-----|
| 10 | ¡Bienvenido a Business! Tu suscripción está activa | `plans-subscription_started` |
| 11 | Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos | (onboarding) |
| 12 | Factura pagada — Tu plan sigue activo | `plans-invoice_paid` |

---

## Notes
- Card fields on Stripe Checkout are rendered as plain `<input>` elements (type=text), not in iframes — found via `browser_evaluate`, not accessible via aria snapshot
- test7–test13 accounts have login regression (password `Test1234%segura` no longer works on new.zonacnc.com)
