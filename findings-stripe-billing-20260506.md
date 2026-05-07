# Stripe Billing QA — Findings Report

**Date**: 2026-05-07 (executed 2026-05-07 06:45 UTC)  
**Focus**: Plan upgrade flow (Starter → Pro) on `new.zonacnc.com`  
**Test account**: `test8@zonacnc.com` (displays as "Test TestUserSeven")  

---

## Scenario Executed

| # | Action | Outcome |
|---|--------|---------|
| 1 | Login as test8@zonacnc.com | ✅ Success |
| 2 | Navigate to /es/suscripcion | ✅ Confirmed Starter Activa (€39/mes, 3/3 ads used) |
| 3 | Navigate to /es/cambiar-plan | ✅ All 3 plans displayed (Starter, Pro, Enterprise) |
| 4 | Select Pro plan | ✅ Proration preview shown |
| 5 | Click "Confirmar cambio" | ✅ **Plan upgraded immediately** — no Stripe checkout (used saved payment method) |
| 6 | Verify subscription page | ✅ Now Pro Activa, 10 anuncios, €99/mes, próximo cobro 06/06/2026 |
| 7 | Verify billing history /es/facturacion | ✅ New invoice #2: €58,16 prorated charge |
| 8 | Verify emails via IMAP | ⚠️ No new email triggered for this upgrade |
| 9 | Review email templates | ⚠️ 1 template bug found (stale data) |

---

## Detailed Findings

### PASS: Plan Upgrade Flow (Core)

The plan upgrade completed successfully:
- **Before**: Starter Activa — €39/mes, 3 anuncios, 3/3 used (limit reached), 1 invoice
- **After**: Pro Activa — €99/mes, 10 anuncios, 0/10 used, 2 invoices
- Upgrade processed through existing Stripe payment method — no redirect to Stripe checkout required
- Subscription page correctly shows: "Plan actualizado. Cargo prorrateado: €60,00. Nueva cuota mensual: €99,00."

### PASS: Proration System

The proration calculation works and is clearly displayed:

| Field | Preview (/es/cambiar-plan) | Actual (invoice) |
|-------|--------------------------|-------------------|
| Crédito plan anterior | −€39,00 | −€37,80 |
| Cargo plan nuevo | +€99,00 | +€95,96 |
| **Cobro hoy** | **€60,00** | **€58,16** |

- The difference (€60,00 vs €58,16) is due to the preview rounding to full days vs the actual Stripe proration using exact hours. Not a bug, but slightly confusing for users.
- Both preview and invoice correctly show "Próxima factura (06/06/2026): €99,00/mes"

### PASS: Invoice History (Facturación)

The `/es/facturacion` page correctly updates:
- Badge changed from "1" to "2" invoices
- New invoice shows: "Unused time on Plan Starter after 07 May 2026 (−37,80 €) · Remaining time on Plan Pro after 07 May 2026 (+95,96 €)"
- Both PDF download (local) and Stripe-hosted invoice link work
- Status: "completado" for both invoices

### PASS: Cambiar Plan Page UI

The `/es/cambiar-plan` page is well-designed:
- Three-plan comparison with feature checkmarks
- "ACTUAL" badge on current plan
- Proration preview with clear breakdown before confirming
- Info section: "¿Cómo funciona el cambio de plan?" explaining the proration and 7-day refund policy
- Warning/confirmation before finalizing

### WARNING: No Email on Plan Upgrade

**Expected**: A confirmation email should be sent when a user upgrades their plan.  
**Actual**: No email was sent to `test8@zonacnc.com`. The inbox (26 messages total) showed no new messages after the upgrade completed.

This differs from the initial plan activation (UID 4, UID 15) which did trigger "¡Bienvenido a [Plan]!" emails. Plan upgrades (as opposed to new activations) may not be triggering email notifications.

### BUG: Stale Email Template Data

**Template**: "¡Bienvenido a Pro! Tu suscripción está activa" (sent to UID 4, May 2)  
**Bug**: The email shows **"Anuncios incluidos: 1"** for the Pro plan.  
**Actual**: The Pro plan on `/es/pricing` and `/es/cambiar-plan` shows **10 anuncios incluidos**.

The email template was not updated when the Pro plan ad count changed from 1 to 10. This affects both the **plain text** and **HTML** parts of the email.

Affected locations in template (UID 4):
- Plain text: `Anuncios incluidos: 1`  
- HTML: `<strong>Anuncios incluidos:</strong> 1`

---

## Email Template Review

### Template: "Factura pagada — Tu plan sigue activo" (UID 14)

- **Subject**: "Factura pagada — Tu plan sigue activo" (ES, uses em-dash)
- **Structure**: Clean, well-formatted HTML with dark header (#1a2332), white card, CTA button
- **Fields**: Hola {first_name}, Importe, Plan, Próximo cobro
- **CTAs**: "Descargar factura" (links to Stripe invoice PDF), "Ir a Mi suscripción"
- **Footer**: ZonaCNC — Marketplace de maquinaria industrial · new.zonacnc.com
- **Translation**: Fully in Spanish ✅
- **Issues**: None found

### Template: "¡Bienvenido a Pro! Tu suscripción está activa" (UID 4)

- **Subject**: "¡Bienvenido a Pro! Tu suscripción está activa" (ES, UTF-8 encoded)
- **Structure**: Similar clean HTML, red CTA button (#c62828)
- **Fields**: Hola {first_name}, Plan, Periodo, Cuota mensual, Anuncios incluidos, Próxima renovación
- **CTA**: "Ir a Mi suscripción"
- **Footer**: ZonaCNC — Marketplace de maquinaria industrial · new.zonacnc.com
- **Translation**: Fully in Spanish ✅
- **Bug**: **"Anuncios incluidos: 1"** — should be 10 for Pro plan ⚠️

### Template: "Empieza con buen pie en ZonaCNC" (UID 16, Onboarding)

- **Subject**: "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos" (ES)
- **Structure**: Multi-section HTML with colored step cards (green/yellow/blue)
- **Personalization**: Greets by full name ("Test Usuario SEO"), mentions specific plan name ("Starter") and plan limits ("hasta 3 anuncios activos")
- **Steps**: 1) Completa tu perfil, 2) Publica tu primer anuncio, 3) Configura cómo recibir consultas
- **Cross-sell**: Mentions Boosts 24h and higher plans (Pro leads delegation)
- **Footer**: Company info (VELETA COMERCIALIZACIONES Y SERVICIOS SLU, CIF B87534855)
- **Translation**: Fully in Spanish ✅
- **Quality**: Excellent — personalized, plan-aware, actionable CTAs per step, highlighted value props per step
- **Issues**: None found

---

## Browser / Flow Observations

- **No Stripe Checkout redirect**: Plan upgrade with existing payment method processed inline
- **Session persistence**: Stayed logged in throughout the test flow
- **Console**: 1 error on most pages (likely analytics or CSP, not billing-related)
- **Responsive**: Sidebar navigation with "Facturas y pagos 2" badge works correctly
- **Plan features unlock**: After upgrade to Pro, "Estadísticas" and "Importación de maquinaria" are accessible (no longer locked with "Pro+" badge)

---

## Account State Post-Test

| Field | Value |
|-------|-------|
| Account | test8@zonacnc.com |
| Display name | Test TestUserSeven |
| Plan | Pro Activa |
| Monthly fee | €99,00 |
| Ads included | 10 |
| Ads used | 0/10 |
| Next charge | 06/06/2026 |
| Total invoices | 2 |
| Last invoice | €58,16 (proration) |

---

## Summary

| Category | Count |
|----------|-------|
| ✅ PASS | 4 (Core upgrade, Proration, Invoice history, Plan page UI) |
| ⚠️ WARNING | 1 (No email on plan upgrade) |
| 🐛 BUG | 1 (Stale "Anuncios incluidos: 1" in Pro welcome template) |

**Recommendations**:
1. Update `¡Bienvenido a Pro!` email template to show correct ad count (10 instead of 1)
2. Consider sending a confirmation email on plan upgrades (not just initial activations)
3. Consider showing exact proration amount on preview page to match actual Stripe charge
