# CRONQA Finding: Stripe Billing — Plan Upgrades (Pro→Business + Business→Enterprise)

**Date:** 2026-05-05 04:00–04:50 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing (plan upgrade flows)  
**Duration:** ~50 min  
**Escenarios:** 2/2 — ✅ SUCCESS (both upgrades completed, issues found)

## Scenario 1: Pro → Business (04:00 UTC)

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Login as test7@zonacnc.com | ✅ Logged in as "Test Vendor Seven QA" |
| 2 | Navigate to change plan page (`/es/cambiar-plan`) | ✅ Page loaded, current plan: Pro (€99/mes) |
| 3 | Select Business plan (€199/mes) | ✅ Preview showed "€100,00 prorrateado hoy" |
| 4 | Confirm plan change | ✅ Upgrade successful, plan immediately active |
| 5 | Verify subscription page (`/es/suscripcion`) | ✅ Business Active, €199/mes, next charge 03/06/2026 |
| 6 | Verify emails via IMAP (test7@zonacnc.com) | ✅ 32 emails verified; 2 relevant templates analyzed |
| 7 | Verify Stripe invoice | ✅ #AZHLKTSF-0096, €99.30 paid, Visa •••• 4242 |

### Plan Change Result (Pro→Business)

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

## Scenario 2: Business → Enterprise (04:44 UTC)

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Navigate to `/es/cambiar-plan` | ✅ Current plan: Business (€199/mes), 26 anuncios |
| 2 | Select Enterprise plan (€299/mes) | ✅ Preview: prorated charge €100.00, next bill €299/mes |
| 3 | Add-on handling: 3 extra ads at €6→€3/mes | ✅ Option to keep (€9/mes total) or remove |
| 4 | Confirm plan change | ✅ Processed with saved card (no Stripe Checkout redirect) |
| 5 | Verify confirmation page | ✅ "Plan actualizado. Cargo prorrateado: €96,67" |
| 6 | Verify invoices page (`/es/facturacion`) | ✅ 16 facturas, latest: €93,37 (not €96,67) |
| 7 | Verify emails via IMAP | ❌ No upgrade confirmation email (only add-on email #32) |

### Plan Change Result (Business→Enterprise)

| Indicator | Before (Business) | After (Enterprise) |
|-----------|-------------------|---------------------|
| Plan | Business (€199/mes) | Enterprise (€299/mes) |
| Anuncios incluidos | 26 (25+1 extra) | 103 (100+3 extra) |
| Fotos/anuncio | 30 | 50 |
| Destacados/mes | 20 | 60 |
| Anuncios extra | €6,00/mes | €3,00/mes |
| Import Machineseeker | 0/100 este mes | cuota ilimitada |
| Facturas count | 13 | 16 |
| Prorated charge | — | €93,37 (confirmation: €96,67; preview: €100,00) |

**Key difference:** With saved card on file, the upgrade processes inline without Stripe Checkout redirect. The confirmation page shows "€96,67" but the actual Stripe invoice is "€93,37" — a €3.30 discrepancy.

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

### 4. 🟡 MEDIUM — Prorated amount rounding discrepancies (2 cases)

**Case 1: Pro→Business**
| Source | Amount |
|--------|--------|
| Plan change preview (`/es/cambiar-plan`) | **€100,00** |
| Actual Stripe charge (invoice #AZHLKTSF-0096) | **€99,30** |
| Difference | **€0,70** |

**Case 2: Business→Enterprise**
| Source | Amount |
|--------|--------|
| Plan change preview (`/es/cambiar-plan`) | **€100,00** |
| Confirmation page (post-upgrade) | **€96,67** |
| Actual Stripe charge (invoice) | **€93,37** |
| Max discrepancy (preview vs actual) | **€6,63** |

Three different amounts for the same transaction: preview (€100), confirmation (€96,67), actual (€93,37). This is fundamentally misleading.

The breakdown (Business→Enterprise):
- Unused time on Business (30 of 31 days): −€197,41
- Remaining time on Enterprise (30 of 31 days): +€296,61
- **Subtotal: €99,20**
- Unused time on 3 add-ons (× €6→€3): various €0,00 adjustments
- **Total: €93,37**

The preview and confirmation pages must match Stripe's exact calculation.

---

### 5. 🟡 MEDIUM — Add-on email references wrong plan name

Email #32 (2026-05-05 00:27) says:
> "Hemos añadido 1 × anuncio extra a tu suscripción Pro"

But the account was on **Business** at that time. The template appears to use a stale or cached plan name. Could also occur if the template sends the previous plan name before the upgrade is fully processed.

---

### 6. ℹ️ INFO — Email templates well-formed (positive finding)

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

**Scenario 1 (Pro→Business):**
| # | Date (UTC) | Subject | Status |
|---|------------|---------|--------|
| 30 | 2026-05-04 22:47 | Empieza con buen pie en ZonaCNC | Onboarding |
| 31 | 2026-05-04 22:47 | Factura pagada — Tu plan sigue activo | ✅ Renewal |
| 32 | 2026-05-05 00:27 | Add-on añadido a tu suscripción | ✅ Add-on (references Pro, not Business) |

**Scenario 2 (Business→Enterprise):**
No new emails after upgrade at 04:44 UTC (mailbox still at 32 messages, 0 recent).

**Total searched:** 32 messages in INBOX, subjects searched: "Enterprise", "factura", "invoice", "suscrip", "plan", "pago".

### Template Issues

**Add-on email (#32) references wrong plan:** The email says "tu suscripción Pro" but the account was on Business at that time. This suggests the template uses a stale or hardcoded plan name rather than the current subscription plan.

---

## Environment

- **URL:** https://new.zonacnc.com/es/
- **Mode:** TEST (⚠️ MODO TEST — entorno de pruebas)
- **Stripe mode:** Sandbox (confirmed on invoice page)
- **Account:** test7@zonacnc.com (Test Vendor Seven QA)
- **Payment method:** Visa •••• 4242 (test card)

---

## Recommendations

1. **🔴 CRITICAL:** Add Spanish translations to Stripe invoice product descriptions (metadata passed at checkout)
2. **🔴 CRITICAL:** Configure Stripe Customer Portal / invoice settings for Spanish locale
3. **🟠 HIGH:** Implement plan change confirmation email (similar to Add-on email template)
4. **🟡 MEDIUM:** Fix preview rounding to match Stripe's exact proration calculation (all 3 values must agree: preview, confirmation, invoice)
5. **🟡 MEDIUM:** Fix add-on email template to use current subscription plan name, not stale/cached value
6. Remove "Entorno de prueba" prefix from Stripe account metadata in production
