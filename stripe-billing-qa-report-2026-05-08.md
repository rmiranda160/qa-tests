# QA Report: Stripe Billing — new.zonacnc.com
**Date**: 2026-05-08 07:00 UTC  
**Tester**: QA agent (tester)  
**Account used**: test3@zonacnc.com (Enterprise plan)  
**Scope**: Pricing page → Checkout on-site → Stripe Checkout → Boost packs → IMAP verification

---

## 1. EXECUTIVE SUMMARY

✅ **Stripe integration functional**. Checkout flow (pricing → on-site summary → Stripe hosted checkout) works end-to-end for monthly and annual billing.  
⚠️ **CRITICAL: Data inconsistency between PrestaShop pricing page and Stripe product catalog** across Pro, Business, and Enterprise plans. Plan limits and boost counts differ significantly.  
⚠️ **MEDIUM: Monthly/Annual toggle has no visible selection state**.  
✅ **IVA (21%) calculation correct** across all plans.  
✅ **Boost ledger balance** functional (test3 has €3.47 credit applied).  
✅ **IMAP emails** delivered from `no-reply@mg.zonacnc-sales.es`.

---

## 2. PRICING PAGE (`/es/pricing`)

### 2.1 All 5 plans render correctly (desktop 1440×900)

| Plan | Price/mes | Anuncios | Imágenes | Boosts/mes | Extras |
|------|-----------|----------|----------|------------|--------|
| Free | 0 € | 1 | 5 | packs only | Perfil público |
| Starter | 39 € | 3 | 10 | packs only | Perfil público |
| Pro ⭐ | 99 € | 10 | 20 | **3** | Stats, CSV, Soporte |
| Business | 199 € | **25** | 30 | **10** | Badge, Stats, CSV, Soporte, Prod. nuevo |
| Enterprise | 299 € | 100 | 50 | 25 | Badge, Stats, CSV, Soporte, Prod. nuevo |

- "Más popular" badge on Pro ✅
- "Tu plan actual" badge on Enterprise ✅ (test3 is on Enterprise)
- Free plan: "No disponible" + "Cancela tu plan actual para volver a Free" link ✅
- Logged-in CTAs change from "Contratar X" to "Cambiar a X" ✅
- Annual pricing: Starter 390€ (-78€), Pro 990€ (-198€), Business 1990€ (-398€) ✅
- Boost section explains packs and included boosts ✅

### 2.2 Responsive (mobile 375×667)
- Footer collapses to accordion ✅
- Mobile header with hamburger/search/user renders ✅
- Plan cards stack vertically ✅
- No layout overflow ✅

---

## 3. CHECKOUT ON-SITE (`/es/pagar-plan?plan=X`)

### 3.1 Plan summaries verified

| Plan | Features shown | Price (monthly) | Price (annual) |
|------|---------------|-----------------|----------------|
| Starter | ✓ 3 anuncios, ✓ 10 fotos | 39€/mes | 390€/ano (-78€) |
| Pro | ✓ 10 anuncios, ✓ 20 fotos, ✓ 3 destacados | 99€/mes | 990€/ano (-198€) |
| Business | ✓ 25 anuncios, ✓ 30 fotos, ✓ 10 destacados | 199€/mes | 1990€/ano (-398€) |

- Trust elements: lock icon, "Pago seguro con Stripe" ✅
- Billing explanation in Spanish ✅
- Payment method icons: VISA, MasterCard, AMEX, Apple Pay, Google Pay ✅
- Stripe PCI-DSS Nivel 1 compliance text ✅
- Invoice info: "Recibirás factura por correo. Datos fiscales editables en tu panel." ✅

### 3.2 Monthly/Annual Toggle
- ⚠️ **No visual selection state** — clicking Mensual/Anual doesn't change appearance of the toggle, though it correctly sends the right billing interval to Stripe.

---

## 4. STRIPE CHECKOUT (hosted)

### 4.1 Integration
- ✅ Redirects to `checkout.stripe.com/c/pay/cs_test_*`
- ✅ Sandbox mode: "Zonacnc.com sandbox" + "Entorno de prueba" badge
- ✅ "Volver a Zonacnc.com sandbox" returns to `/es/pricing`
- ✅ Email pre-filled from logged-in user (test3@zonacnc.com)

### 4.2 Payment Methods
- Tarjeta (Visa, MasterCard, Cartes Bancaires, AMEX, UnionPay, JCB, Discover, Diners) ✅
- Klarna ✅
- Pay with Link ✅
- Amazon Pay (sandbox) ✅
- "Guarda mis datos para un proceso de compra más rápido" checkbox ✅

### 4.3 Pricing & IVA Verification

| Plan | Base | IVA (21%) | Subtotal | Balance | Total | Then |
|------|------|-----------|----------|---------|-------|------|
| Starter (monthly) | 39.00€ | 8.19€ | 47.19€ | -3.47€ | **43.72€** | 47.19€/mes |
| Pro (monthly) | 99.00€ | 20.79€ | 119.79€ | -3.47€ | **116.32€** | 119.79€/mes |
| Business (annual) | 1990.00€ | 417.90€ | 2407.90€ | -3.47€ | **2404.43€** | 2407.90€/año |

✅ All IVA and subtotal calculations correct.  
✅ Balance credit (€3.47) consistently applied.

### 4.4 Billing Cycle Labels
- Monthly: "al mes" ✅
- Annual: "por año" / "Se factura cada año" ✅

---

## 5. ⚠️ DATA INCONSISTENCY: Pricing Page vs Stripe Product Catalog

### 5.1 Discrepancy Matrix

| Field | Plan | Pricing Page | Stripe Checkout | Delta |
|-------|------|-------------|-----------------|-------|
| Boosts/mes | Pro | **3** | **8** | +5 ❌ |
| Anuncios | Business | **25** | **30** | +5 ❌ |
| Boosts/mes | Business | **10** | **20** | +10 ❌ |
| Boosts/mes | Starter | "comprar en packs" (0) | **3** | +3 ⚠️ |

### 5.2 Stripe Product Descriptions (exact text)

| Plan | Stripe Description |
|------|--------------------|
| Starter | "ZonaCNC Starter — 3 anuncios, 10 imagenes, perfil publico, **3 boosts/mes**" |
| Pro | "ZonaCNC Pro — 10 anuncios, 20 imagenes, stats, soporte prioritario, **8 boosts/mes**" |
| Business | "ZonaCNC Business — **30 anuncios**, 30 imagenes, badge verificado, CSV import, **20 boosts/mes**" |

### 5.3 Pricing Page Features NOT in Stripe
- Pro: "Importación CSV masiva" is on pricing page but missing from Stripe description
- Business: "Estadísticas detalladas", "Puedes vender producto nuevo" not in Stripe

### 5.4 Recommendation
Update the 21 seeded Stripe Prices in the PrestaShop module (`zonacncplans` v1.7.13) to match the pricing page. The pricing page content is likely the canonical source (per PRICING_RULES.md §5).

---

## 6. BOOST PACKS (`/es/packs-boost`)

### 6.1 Packs verified (logged in, mobile 375×667)
| Pack | Price | €/Boost |
|------|-------|---------|
| 5 Boosts | 25 € | 5.00 € |
| 10 Boosts | 45 € | 4.50 € |
| 25 Boosts ⭐ | 100 € | 4.00 € |
| 50 Boosts | 179 € | 3.58 € |
| 100 Boosts | 200 € | 2.00 € |

- "RECOMENDADO" badge on 25-pack ✅
- User balance: "Tu balance actual: 0 Boosts" ✅
- Trust: "Pago seguro con Stripe", "Los Boosts no caducan" ✅
- "Comprar" buttons present for all packs ✅

---

## 7. EMAIL DELIVERY (IMAP)

### 7.1 Test7 mailbox verification
- ✅ IMAP server accessible: `zonacnc.com:993` (Dovecot)
- ✅ 70 emails in inbox, all delivered from `no-reply@mg.zonacnc-sales.es`
- ✅ Recent emails include:
  - Account registration confirmations
  - Password reset ("Confirmación de contraseña")
  - Ad approval notification ("Tu anuncio está pendiente de revisión")
- ✅ Subject encoding (UTF-8) correct for Spanish accented characters
- ✅ Mailgun sender domain configured correctly

---

## 8. CONSOLE ERRORS

| Page | Error |
|------|-------|
| `/es/pricing` (desktop, refreshed) | None |
| All checkout pages | None |
| Stripe Checkout pages | None (2-4 Stripe warnings, non-critical) |
| `/es/pricing` (prior load) | "Provider's accounts list is empty" (Google One Tap — pre-existing) |

---

## 9. BUG SUMMARY

| # | Severity | Component | Description |
|---|----------|-----------|-------------|
| 1 | 🔴 HIGH | Stripe ↔ Pricing | **Pro plan**: 3 boosts on pricing vs 8 in Stripe catalog |
| 2 | 🔴 HIGH | Stripe ↔ Pricing | **Business plan**: 25 anuncios on pricing vs 30 in Stripe |
| 3 | 🔴 HIGH | Stripe ↔ Pricing | **Business plan**: 10 boosts on pricing vs 20 in Stripe |
| 4 | 🟡 MEDIUM | Stripe ↔ Pricing | **Starter plan**: "comprar en packs" on pricing vs 3 boosts included in Stripe |
| 5 | 🟡 MEDIUM | Checkout UI | **Monthly/Annual toggle has no visible selection state** |
| 6 | 🟡 MEDIUM | Stripe ↔ Pricing | Pro/Business missing features in Stripe descriptions (CSV import for Pro, Stats/Producto nuevo for Business) |

---

## 10. TEST COVERAGE

| Test | Status |
|------|--------|
| Pricing page renders (5 plans) | ✅ PASS |
| Pricing page mobile responsive | ✅ PASS |
| Checkout on-site (Starter/Pro/Business) | ✅ PASS |
| Monthly billing to Stripe | ✅ PASS |
| Annual billing to Stripe | ✅ PASS |
| Stripe sandbox mode | ✅ PASS |
| IVA calculation (21%) | ✅ PASS |
| Balance credit application | ✅ PASS |
| Payment method selection | ✅ PASS |
| Boost packs page | ✅ PASS |
| Boost packs mobile responsive | ✅ PASS |
| IMAP email delivery | ✅ PASS |
| Auth gate (redirect to login) | ✅ PASS |
| Data consistency pricing ↔ Stripe | ❌ FAIL (3 high, 2 medium) |
| Monthly/annual toggle UX | ⚠️ ISSUE |
| Console errors (zero tolerance) | ⚠️ 1 pre-existing |

---

*Report generated automatically by OpenClaw QA agent. 30 min hard cap respected.*
