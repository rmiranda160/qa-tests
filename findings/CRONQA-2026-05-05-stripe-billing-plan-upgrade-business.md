# CRONQA Finding: Stripe Billing — Plan Upgrade Pro → Business

**Date:** 2026-05-05 04:00 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing (plan upgrade flow)  
**Duration:** ~30 min  
**Escenario:** 1/1 — ✅ SUCCESS (upgrade completed, issues found)

## Scenario Executed

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Login as test7@zonacnc.com | ✅ Logged in as "Test Vendor Seven QA" |
| 2 | Navigate to change plan page (`/es/cambiar-plan`) | ✅ Page loaded, current plan: Pro (€99/mes) |
| 3 | Select Business plan (€199/mes) | ✅ Preview showed "€100,00 prorrateado hoy" |
| 4 | Confirm plan change | ✅ Upgrade successful, plan immediately active |
| 5 | Verify subscription page (`/es/suscripcion`) | ✅ Business Active, €199/mes, next charge 03/06/2026 |
| 6 | Verify emails via IMAP (test7@zonacnc.com) | ✅ 32 emails verified; 2 relevant templates analyzed |
| 7 | Verify Stripe invoice | ✅ #AZHLKTSF-0096, €99.30 paid, Visa •••• 4242 |

## Plan Change Result

| Indicator | Before (Pro) | After (Business) |
|-----------|-------------|-------------------|
| Plan | Pro (€99/mes) | Business (€199/mes) |
| Anuncios incluidos | 10 | 25 (+ 3 extra via add-ons = 28) |
| Fotos/anuncio | 20 | 30 |
| Destacados/mes | 8 | 20 |
| Anuncios extra | €9,00/mes | €6,00/mes |
| Import Machineseeker | 0/20 este mes | 0/100 este mes |
| Facturas count | 10 | 13 |
| Prorated charge | — | €99,30 (preview: €100,00) |

## Issues Found

### 1. 🔴 CRITICAL — Stripe invoice line items in English on ES locale

Stripe invoice line items use English label templates mixed with Spanish plan names:

```
"Remaining time on ZonaCNC — Business after 05 May 2026"   (+€197,62)
"Unused time on ZonaCNC — Pro after 05 May 2026"            (−€98,32)
```

**Expected:** Spanish translations for prorated-time labels, e.g.:
- "Tiempo restante de ZonaCNC — Business a partir del 05/05/2026"
- "Tiempo no consumido de ZonaCNC — Pro hasta el 05/05/2026"

**Reproduction:** Upgrade/downgrade any plan → check Stripe invoice line items

---

### 2. 🟠 HIGH — Stripe invoice UI labels in English

All Stripe-hosted invoice UI strings are in English despite the site being in Spanish:

| Label | Expected (ES) |
|-------|---------------|
| "Invoice number" | "Número de factura" |
| "Payment date" | "Fecha de pago" |
| "Payment method" | "Método de pago" |
| "Download invoice" | "Descargar factura" |
| "Download receipt" | "Descargar recibo" |
| "Invoice paid" | "Factura pagada" |
| "Summary" | "Resumen" |
| "Items" | "Conceptos" |
| "Total due" | "Total a pagar" |
| "Amount paid" | "Importe pagado" |
| "Questions?" | "¿Preguntas?" |
| "Contact …" | "Contactar …" |

**Note:** The Stripe invoice page title also shows `"Entorno de prueba de Veleta Comercializaciones y Servicios SLU Invoice"` — the legal entity name combined with "Entorno de prueba" is a test-mode artifact.

---

### 3. 🟡 MEDIUM — No email notification for plan upgrade

Unlike other subscription events (renewal payments, add-on additions), **no confirmation email was sent** when upgrading from Pro to Business. The user must manually check the subscription page to confirm the change.

Emails that ARE sent successfully:
- ✅ "Factura pagada" — renewal payment confirmation (email #31)
- ✅ "Add-on añadido a tu suscripción" — add-on purchase (email #32)

Missing email:
- ❌ Plan upgrade/downgrade confirmation

---

### 4. 🟢 LOW — Prorated amount rounding discrepancy

| Source | Amount |
|--------|--------|
| Plan change preview (`/es/cambiar-plan`) | **€100,00** |
| Actual Stripe charge (invoice #AZHLKTSF-0096) | **€99,30** |
| Difference | **€0,70** |

The preview shows a rounded amount (€100.00) while Stripe calculates the proration to the cent. The breakdown:
- Remaining time on Business (31 days): +€197.62
- Unused time on Pro (31 days): −€98.32
- **Total: €99.30**

The preview rounding to €100.00 is misleading. Should display the exact calculated amount or match Stripe's precision.

---

### 5. ℹ️ INFO — Email templates well-formed (positive finding)

Both email templates analyzed show good quality:

**Template: "Factura pagada" (email #31)**
- Subject: `Factura pagada — Tu plan sigue activo`
- Greeting: `Hola Test Vendor,` (personalized)
- HTML: Dark header (#1a2332), branded, responsive, "Descargar factura" CTA button
- Text part: Quoted-printable UTF-8, legible plaintext fallback
- Footer: ZonaCNC · new.zonacnc.com

**Template: "Add-on añadido" (email #32)**
- Subject: `Add-on añadido a tu suscripción`
- HTML: Red CTA button (#c62828) for "Ver mi suscripción", consistent layout
- Both text/html parts present
- Proper proration description: "Stripe ha cobrado solo la parte proporcional"

---

## Email Verification via IMAP

| # | Date (UTC) | Subject | Status |
|---|------------|---------|--------|
| 30 | 2026-05-04 22:47 | Empieza con buen pie en ZonaCNC | Onboarding |
| 31 | 2026-05-04 22:47 | Factura pagada — Tu plan sigue activo | ✅ Renewal |
| 32 | 2026-05-05 00:27 | Add-on añadido a tu suscripción | ✅ Add-on |

No email with subject matching plan upgrade was found (searched 1–32).

---

## Environment

- **URL:** https://new.zonacnc.com/es/
- **Mode:** TEST (⚠️ MODO TEST — entorno de pruebas)
- **Stripe mode:** Sandbox (confirmed on invoice page)
- **Account:** test7@zonacnc.com (Test Vendor Seven QA)
- **Payment method:** Visa •••• 4242 (test card)

---

## Recommendations

1. Add Spanish translations to Stripe invoice product descriptions (metadata passed at checkout)
2. Configure Stripe Customer Portal / invoice settings for Spanish locale
3. Implement plan change confirmation email (similar to Add-on email template)
4. Fix preview rounding to match Stripe's exact proration calculation
5. Remove "Entorno de prueba" prefix from Stripe account metadata in production
