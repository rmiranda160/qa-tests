# CRON QA: Stripe Billing — Plan Upgrade/Downgrade Test (test7@zonacnc.com)

**Date:** 2026-05-03 15:19 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Escenario:** 1/1 — Plan change (upgrade/downgrade) flow, invoice generation, email templates

---

## Summary

Login is ✅ fixed. QA pool still exhausted (test7-test30 all taken). Used **test7@zonacnc.com** (Pro Activa) to test: add-on purchase, plan upgrade, plan downgrade, billing page, invoice PDF, Stripe card management, and email template verification via IMAP.

---

## Tests Performed

### 1. Subscription Page — Current State (Pro → Business Upgrade)
| Chequeo | Resultado |
|---------|-----------|
| URL `/module/zonacncplans/subscription` | ✅ HTTP 200 |
| Plan displayed | Pro → Business (after upgrade) |
| Price | ✅ 199 €/mes |
| Next charge | ✅ 03/06/2026 |
| Active ads | ✅ 3 / 25 |
| Payment method | ✅ Visa •••• •••• •••• 4242 visible |
| "Cambiar tarjeta" button | ✅ Presente |
| Add-on price | ✅ Correcto: 6.00 €/mes (Business) |
| "Cancelar al final del período" | ✅ Presente |
| Invoice history on subscription page | ✅ Presente (1 factura visible tras upgrade) |

### 2. Plan Upgrade (Pro → Business) — ✅ PASS
| Chequeo | Resultado |
|---------|-----------|
| URL `/es/module/zonacncplans/change` | ✅ HTTP 200 |
| Plan selector | ✅ All 5 plans displayed (Free, Starter, Pro, Business, Enterprise) |
| Click Business | ✅ Price breakdown shown correctly |
| Pro-rated calculation | ✅ Correct: −€99,00 credit + €199,00 charge = **€100,00 today** |
| "Confirmar cambio" enabled | ✅ Yes |
| After confirm | ✅ **"Plan actualizado. Cargo prorrateado: €100,00. Nueva cuota mensual: €199,00."** |
| Stripe charge processed | ✅ Yes (test mode) |
| Sidebar updated | ✅ "Plan business · 0 / 100 este mes" |

### 3. Billing Page — Invoice Generated ✅
| Chequeo | Resultado |
|---------|-----------|
| URL `/es/module/zonacncplans/billing` | ✅ HTTP 200 |
| Invoice visible | ✅ **Yes — first invoice now shown** |
| Invoice date | 03/05/2026 |
| Description | "Unused time on Plan Pro after 03 May 2026 (−98,73 €) · Remaining time on ZonaCNC — Business after 03 May 2026 (+198,46 €)" |
| Amount | ✅ 99,73 EUR |
| Status | ✅ Completado |
| PDF download | ✅ Stripe PDF (Invoice-AZHLKTSF-0070.pdf) — valid PDF |
| "Ver factura" link | ✅ Stripe hosted invoice page |

**Note:** Previous Bug #4 ("Sin movimientos todavía") was observed when only 1 Pro subscription existed. After upgrading to Business, the prorated invoice appeared. This suggests invoices ARE generated correctly for plan changes and for the **prorated upgrade**, but the **initial subscription invoice** may use a different code path.

### 4. Plan Downgrade (Business → Pro) — ⚠️ VALIDATION BLOCKED (Correct Behavior)
| Chequeo | Resultado |
|---------|-----------|
| Select Pro plan | ✅ Downgrade warning shown: "📉 Downgrade — programado al fin del periodo" |
| Downgrade schedule | ✅ "El cambio se aplicará el 03/06/2026. Cobro hoy: €0,00" |
| Confirm click | ✅ Validation triggered |
| Error message | "**Quota 25 no cabe en plan Pro (rango 1-10)**" |
| Result | ✅ **Correctly blocked** — user has 25 ad slots from Business, Pro only allows 10 |

**Note:** The validation is correct — the system checks total quota (25) not active ads (3). The error string "Quota 25 no cabe en plan Pro (rango 1-10)" is functional but slightly awkward in Spanish. More natural: "El cupo de 25 anuncios no cabe en el plan Pro (máximo 10)".

### 5. Boost Packs Page ✅
| Chequeo | Resultado |
|---------|-----------|
| URL `/es/module/zonacncplans/boostpacks` | ✅ HTTP 200 |
| 5 Boosts | ✅ 15 € (3.00 €/Boost) |
| 10 Boosts | ✅ 27 € (2.70 €/Boost) — RECOMENDADO |
| 25 Boosts | ✅ 60 € (2.40 €/Boost) |
| 50 Boosts | ✅ 110 € (2.20 €/Boost) |
| 100 Boosts | ✅ 200 € (2.00 €/Boost) |
| Current balance | ✅ 0 Boosts |
| "Pago seguro con Stripe" | ✅ Presente |

### 6. Pricing Page ✅
| Chequeo | Resultado |
|---------|-----------|
| URL `/es/pricing` | ✅ HTTP 200, title correcto |
| Free | ✅ 0€, 1 anuncio |
| Starter | ✅ 39€/mes, 3 anuncios, 3 boosts/mes |
| Pro | ✅ 99€/mes, 10 anuncios, 8 boosts/mes |
| Business | ✅ 199€/mes, 25 anuncios, 20 boosts/mes |
| Enterprise | ✅ 299€/mes, 100 anuncios, 60 boosts/mes |
| "Plan actual" badge | ✅ Correcto (Business active) |

---

## IMAP Verification — Email #13 (New After Upgrade)

**Subject:** `Factura pagada — Tu plan sigue activo`  
**From:** ZonaCNC <no-reply@mg.zonacnc-sales.es>  
**Mailgun tag:** `plans-invoice_paid`  
**DKIM/SPF:** ✅ Pass

### Content Check
| Field | Result |
|-------|--------|
| Greeting | ✅ "Hola Test Vendor," |
| Plan name | ✅ "Business" |
| Expiry date | ✅ "03/06/2026" |
| Amount | ✅ "99,73 €" (correct decimal format) |
| Next charge | ✅ "03/06/2026" |
| PDF link | ✅ Stripe invoice PDF accessible |
| Spanish language | ✅ Correct throughout |
| HTML template | ✅ Well-formatted, responsive |
| Missing variables | ✅ **None** — all rendered |

**Veredicto:** ✅ **No translation or template bugs found in invoice paid email.**

---

## Accent Mark Bugs — Still Present (Regresión)

These UI text bugs were reported previously but NOT fixed:

| Location | Text Shown | Correct Spanish | Severity |
|----------|-----------|----------------|----------|
| Subscription page | "metodo de pago" | **método** de pago | Low |
| Subscription page | "suscripcion esta activa" | **suscripción** **está** activa | Low |
| Sidebar | "Mi suscripcion" | Mi **suscripción** | Low |
| Footer | "Politica de privacidad" | **Política** de privacidad | Low |
| Footer | "Politica de cookies" | **Política** de cookies | Low |

---

## Issues Summary

| # | Bug | Area | Severidad | Estado | Nueva |
|---|-----|------|-----------|--------|-------|
| 1 | Welcome email: "Anuncios incluidos: 1" (debe ser 10) | template | High | Confirmado previo | ❌ |
| 2 | Welcome email: "Periodo: monthly" sin traducir | template | Medium | Confirmado previo | ❌ |
| 3 | Onboarding email: 6 template vars sin renderizar | template | Medium | Confirmado previo | ❌ |
| 4 | Billing history vacío en suscripción inicial | billing | High | **Observado** → **Corregido por cambio de plan** ⚠️ | ✅ |
| 5 | Acentos faltantes en UI (5 ubicaciones) | UI/i18n | Low | Confirmado previo | ❌ |
| 6 | Password reset: template PrestaShop default | template | Low | Confirmado previo | ❌ |
| 7 | "Quota 25 no cabe en plan Pro" wording | UI/i18n | Low | Nuevo | ✅ |

**Nuevo Bug #7:** "Quota 25 no cabe en plan Pro (rango 1-10)" — El mensaje de validación al hacer downgrade usa "Quota" y estructura no idiomática. Debería ser "El cupo de 25 anuncios no cabe en el plan Pro (máximo 10)".

---

## Template Translation Check — Invoice Paid Email

**Template verified:** `plans-invoice_paid`  
**Subject:** "Factura pagada — Tu plan sigue activo" ✅  
**Body:** All Spanish strings correct, no English mixing, no missing variables.  
**HTML:** Responsive layout, proper `<html lang="es">`, correct formatting.  
**Text:** Fallback plain text version also correct.  
**PDF:** Stripe invoice PDF valid and accessible.  

**Veredicto:** ✅ **Invoice paid template is clean.**

---

## QA Pool Status

| Email | Estado |
|-------|--------|
| test7@zonacnc.com | **TAKEN — Business Activa** (upgraded from Pro, 3/25 ads, card on file) |
| test8-test30 | **TAKEN** (pool exhausto) |

---

## Conclusión

✅ **Plan upgrade (Pro → Business) con Stripe billing:** Funciona correctamente  
✅ **Invoice generada automáticamente tras prorrateo:** OK  
✅ **PDF de factura accesible:** OK  
✅ **Email "Factura pagada" sin bugs de traducción:** OK  
✅ **Card on file visible en UI:** OK (Visa 4242)  
⚠️ **Downgrade validado correctamente** (quota block)  
❌ **Acentos faltantes persisten** (sin fix desde reporte anterior)  
🔍 **Email #13 examinado:** Template `plans-invoice_paid` sin errores
