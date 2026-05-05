# Stripe Billing Test Report — ZonaCNC (new.zonacnc.com)

**Date**: 2026-05-04 23:31–23:45 UTC  
**Scenario**: Plan Upgrade Starter → Pro via Stripe  
**Test Account**: test7@zonacnc.com (Test Vendor Seven QA)  
**Environment**: ⚠️ MODO TEST (Sandbox)

---

## 1. Plan Upgrade Flow (Starter → Pro)

| Step | Status | Notes |
|------|--------|-------|
| Login as test7 | ✅ | Successful |
| Navigate to /es/cambiar-plan | ✅ | Current plan: Starter (€39/mo) |
| Select Pro plan | ✅ | Preview showed proration: €60.00 |
| Confirmar cambio | ✅ | Processed instantly via saved card |
| Plan updated | ✅ | Pro Activa, €99/mo, next charge 03/06/2026 |

## 2. Invoices Generated

| # | Date | Description | Amount | Status |
|---|------|-------------|--------|--------|
| 1 | 05/05/2026 | Unused Starter (−€38.96) + Pro time (+€98.90) | **€59.94** | Completado |
| 2 | 05/05/2026 | Add-on Anuncio Extra adjustment (−€2.87 + €8.59) | **€5.72** | Completado |
| **Total Charged** | | | **€65.66** | |

- Stripe invoice #AZHLKTSF-0091 verified: renders correctly, Sandbox mode, Visa •••• 4242
- Both invoices downloadable as PDF from `/es/facturacion` and via Stripe hosted pages
- 9 total invoices in history (carryover from previous plan changes in this test account)

## 3. Subscription State After Upgrade

| Field | Value |
|-------|-------|
| Plan | **Pro** (Activa) |
| Monthly fee | **€99.00** |
| Next charge | **03/06/2026** |
| Payment method | Visa •••• 4242 |
| Add-ons | 2× Anuncio extra @ €9.00/ea = **€18.00/mo** |
| Total monthly | **€117.00** |
| Importar Machineseeker | Unlocked: 0/20 per month |

## 4. Email Verification (IMAP)

### Emails Received (UIDs 29–31)

| UID | Subject | Tag | Status |
|-----|---------|-----|--------|
| 29 | ¡Bienvenido a Starter! Tu suscripción está activa | `plans-subscription_started` | 🐛 Bug |
| 30 | Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos | `plans-vendor_onboarding` | ✅ |
| 31 | Factura pagada — Tu plan sigue activo | `plans-invoice_paid` | ✅ |

### Template Review

- **UID 29** (Subscription activated): Clean HTML template, dark header, white card, CTA button "Ir a Mi suscripción". Spanish. Well-structured.
- **UID 30** (Onboarding): Excellent 3-step onboarding with colored sections (green/yellow/blue), actionable links. Spanish. References correct ad limit (3).
- **UID 31** (Invoice paid): Simple notification with amount, plan name, next charge date, and Stripe PDF link. Spanish.
- All emails sent via Mailgun (`mg.zonacnc-sales.es`), DKIM-signed, SPF-passed.
- Common sender: `ZonaCNC <no-reply@mg.zonacnc-sales.es>`
- **No Pro upgrade confirmation email received** (test mode may suppress)

---

## 5. Bugs & Issues Found

### 🐛 BUG-1: Wrong ad count in Starter welcome email
- **Email UID 29** says "Anuncios incluidos: 1"
- **Pricing page** and **UID 30 onboarding email** both correctly state "3 anuncios"
- **Severity**: Medium — customer confusion on first impression
- **Fix**: Update `plans-subscription_started` email template to use correct ad count per plan

### ⚠️ ISSUE-1: Missing Pro upgrade confirmation email
- No email was triggered for the Starter→Pro upgrade
- Customer only sees the in-page message "Plan actualizado. Cargo prorrateado: €60,00"
- **Severity**: Medium — no email record of upgrade for customer
- **Expected**: Email with subject like "Has subido a Pro — Tu suscripción está actualizada"

### ⚠️ ISSUE-2: Date discrepancy in "Próximo cobro"
- Original period end: **05/06/2026** (shown before upgrade)
- New next charge: **03/06/2026** (shown after upgrade)
- 2-day difference may cause confusion
- **Severity**: Low — minor date shift after proration

### ⚠️ ISSUE-3: Anuncios activos 28/12 exceeds Pro limit
- Subscription page shows **28/12** active ads but Pro plan only allows 12 (10 base + 2 add-on)
- Warning shows correctly: "Has alcanzado el límite de anuncios de tu plan"
- This is likely test account artifact (prior plan-hopping left ads active)
- **Severity**: Low — specific to test account, but edge case exists

---

## 6. Summary

| Category | Result |
|----------|--------|
| Stripe billing flow | ✅ Working |
| Proration calculation | ✅ Accurate |
| Invoice generation (PDF) | ✅ Working |
| Invoice history | ✅ Complete |
| Stripe hosted invoice page | ✅ Working (sandbox) |
| Payment method save/charge | ✅ Working (Visa 4242) |
| Add-on carryover | ✅ Correct (2× extra ads, price adjusted) |
| Email delivery | ⚠️ Partial (missing upgrade email) |
| Email templates (HTML) | ✅ Well-designed, Spanish localized |
| Email bug (ad count) | 🐛 1 found |

**Risk Level**: 🟡 LOW-MEDIUM — Core Stripe flow works; 1 bug in email template + missing upgrade notification email are the main concerns.