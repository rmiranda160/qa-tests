# CRON_QA Results — stripe-billing

## Run 2: Post-PR #237 Regression Verification
**Run:** 2026-05-07 05:49 UTC | **Duration:** ~8 min  
**PR:** #241 (merged) | **Issue:** #242  
**Result:** ❌ REGRESSION — 3 prior findings NOT FIXED + 1 new  

PR #237 was merged but i18n fixes are not deployed. All 3 previous findings persist:
- **Finding #1:** English cambiar-plan entirely in Spanish (REGRESSION)
- **Finding #2:** English footer partially untranslated (PERSISTS)
- **Finding #3:** Add-on email shows "(prorrateado por Stripe)" placeholder (PERSISTS)
- **Finding #4 (NEW):** English subscription page: title="zonacnc.com" (generic), H1="Mi suscripción" (Spanish)

Full report: `findings/CRONQA-2026-05-07-stripe-billing-i18n-regression-post-pr237.md`

---

## Run 1: Initial Translation & Template Review
**Run:** 2026-05-07 04:52 UTC | **Duration:** ~25 min  
**Scenario:** Stripe billing flow translation & email template review on new.zonacnc.com  
**Cron ID:** f88c723f-9d7c-485a-b506-55f4e41efab3  
**Focus:** stripe-billing (1 escenario: review translations/templates in billing pages + emails)  
**Account:** test26@zonacnc.com | **IMAP:** test26@zonacnc.com / Ttc5ZxPltimz  

---

## Result: ⚠️ PASS with 3 findings

---

## Scenario: Billing Flow Translation & Email Template Review

### Site Under Test
- `new.zonacnc.com` — ✅ UP (HTTP 200)
- Test mode banner visible: "⚠️ MODO TEST — entorno de pruebas. Los emails NO llegan a vendedores reales."

### Account Used
- **Email:** test26@zonacnc.com (from .env.qa.email pool)
- **Display name:** QA Tester DE TestTwentySix
- **Plan:** Starter (€39/mes + IVA 21%)
- **Payment method:** Visa ••••4242
- **Next charge:** 06/06/2026
- **Active ads:** 1/4 (3 base + 1 add-on anuncio extra at €12/mes)

---

## Pages Reviewed

### 1. /es/suscripcion (Subscription — Spanish) ✅
- Plan status, limits, add-ons, payment method, billing history all correct
- No translation issues detected
- Invoice #1 visible: Completed on 07/05/2026 for 14.13 EUR

### 2. /es/cambiar-plan (Change Plan — Spanish) ✅
- All plans listed with correct pricing and features
- Pro upgrade preview: credit -39€ (unused Starter days) + new Pro 99€ = charge 60€ today, next invoice 06/06/2026 at 99€/month
- Add-on handling: keep extra ads at new plan price (€9 instead of €12 for Pro)
- Help text and refund policy in correct Spanish

### 3. /es/pricing (Pricing — Spanish) ✅
- All 5 plans displayed correctly with features and pricing
- "+ IVA (21%)" shown on all paid plans
- "Sin comisiones sobre ventas" messaging correct
- Boost 24h section well explained

### 4. /en/pricing (Pricing — English) ⚠️
- Plan cards and features translated to English correctly ✅
- Boost section translated ✅
- No-commission / cancel-anytime / secure-payment / 3,400+ ads messaging translated ✅
- **Footer has untranslated Spanish text** (see Finding #2)

### 5. /en/cambiar-plan (Change Plan — English) ❌
- **Most content is in Spanish** (see Finding #1)

### 6. /es/facturacion (Invoices — Spanish) ✅
- Invoice list with download options (PDF + Stripe invoice link)
- Correct amount and status display

---

## Email Verification via IMAP

### Inbox: 21 emails found for test26@zonacnc.com

| # | Date | Subject | Type |
|---|------|---------|------|
| 20 | 2026-05-07 | Add-on añadido a tu suscripción Starter | Billing notification |
| 21 | 2026-05-07 | Factura pagada — Tu plan sigue activo | Invoice paid |

### Email #20: "Add-on añadido a tu suscripción Starter" ⚠️
- **Content:** Bilingual (text/plain + text/html) notification about adding 1x anuncio extra
- **Issue:** Prorated amount shows literal text "(prorrateado por Stripe)" instead of the actual charged amount (see Finding #3)
- Template: HTML uses ZonaCNC dark header branding, Spanish-only
- **Finding #3 applies**

### Email #21: "Factura pagada — Tu plan sigue activo" ✅
- **Content:** Invoice paid confirmation for 14.13 EUR, plan remains active
- Template: Properly formatted, all amounts shown correctly
- Spanish-only, no English version detected
- No issues found

---

## Findings

### Finding #1: English cambiar-plan page is mostly Spanish (MEDIUM)

**URL:** `/en/cambiar-plan`  
**Title tag:** "Cambiar plan — ZonaCNC" (Spanish, should be "Change plan — ZonaCNC")

**Untranslated elements:**
| Element | Current (Spanish) | Expected (English) |
|---------|-------------------|-------------------|
| Page `<title>` | Cambiar plan — ZonaCNC | Change plan — ZonaCNC |
| Main heading `<h1>` | Cambiar plan | Change plan |
| Section heading | Tu plan actual | Your current plan |
| Section heading | 1. Elige el plan | 1. Choose your plan |
| Plan descriptions | Hasta X anuncios incluidos | Up to X ads included |
| Add-on description | Anuncios extra: €X.00/mes | Extra ads: €X.00/month |
| Pricing display | Cuota mensual del plan: €39,00 /mes | Monthly plan fee: €39.00/month |
| Period text | Período actual hasta: 06/06/2026 | Current period until: 06/06/2026 |
| Breadcrumb | Mi cuenta | My account |
| Help section title | ¿Cómo funciona el cambio de plan? | How does plan switching work? |
| Upgrade/downgrade text | Upgrade (subir de plan)... | Entire section untranslated |
| Refund policy | Devolución 7 días — condiciones | 7-day refund — conditions |
| Refund conditions | No has recibido ningún... | You have not received any... |
| Empty state text | Ya tienes este plan activo... | You already have this plan... |
| Plan change note | Add-ons: si subes de plan... | Add-ons: if you upgrade... |

**Root cause:** The `ZonaCNCPlans` module likely has no English translation strings for the cambiar-plan template.

---

### Finding #2: English pages have partially untranslated footer (LOW)

**URLs:** `/en/pricing`, `/en/cambiar-plan`, `/en/suscripcion`

**Untranslated elements in footer:**
| Element | Current | Expected |
|---------|---------|----------|
| Legal section | Aviso legal, Politica de privacidad, Politica de cookies | Legal notice, Privacy policy, Cookie policy |
| Section header | Nuestra empresa | Our company |
| "Cómo funciona" link text | Cómo funciona | How it works |
| "Planes para vendedores" | Planes para vendedores | Seller plans |
| "Todos los vendedores" | Todos los vendedores | All sellers |
| "Preguntas frecuentes" | Preguntas frecuentes | FAQ |
| Newsletter description | Puede darse de baja en cualquier momento. Para ello, consulte nuestra información de contacto en el aviso legal. | You can unsubscribe at any time. To do so, please refer to our contact information in the legal notice. |

**Note:** Category links are partially translated (e.g., "Tornos" still in Spanish while "Press brakes" is translated). Brand links and technical categories appear untranslated, which may be intentional for SEO/recognition purposes.

---

### Finding #3: Add-on email shows literal placeholder instead of prorated amount (MEDIUM)

**Email:** #20 — "Add-on añadido a tu suscripción Starter"  
**Recipient:** test26@zonacnc.com

**Issue:** The email body shows:
```
Precio: 12,00 € /mes (prorrateado por Stripe)
```
The text `(prorrateado por Stripe)` is a literal placeholder indicating that Stripe handles proration, but the actual prorated charge amount (e.g., "€10.84 for the remaining 28 days") is never shown. The user sees this ambiguous message and doesn't know what they were actually charged.

**Appears in:** Both `text/plain` and `text/html` parts of the email.

**Expected:** Either show the actual prorated amount (e.g., "€10.84 charged today") or provide a link to the Stripe Customer Portal where the user can see the exact charge.

---

## Passed Checks

| Check | Status |
|-------|--------|
| Site accessible (HTTP 200) | ✅ |
| Login works (test26) | ✅ |
| Subscription page loads | ✅ |
| Plan details correct (Starter 3+1) | ✅ |
| Payment method displayed (••••4242) | ✅ |
| Next charge date shown | ✅ |
| Billing history accessible | ✅ |
| Invoice PDF download available | ✅ |
| Stripe invoice link works | ✅ |
| Pro upgrade preview calculations correct | ✅ |
| Pricing page (ES) correct | ✅ |
| Pricing page (EN) plan cards correct | ✅ |
| Plan change buttons functional | ✅ |
| Invoice email (#21) correctly formatted | ✅ |
| IMAP email verification works | ✅ |
| Add-on pricing tiered correctly (€12→9→6→3) | ✅ |
| Test mode banner present | ✅ |

## Notes
- **test27/test28**: Passwords not recoverable — reset emails not delivered in test environment (likely same limitation as banner states: test env doesn't send all email types)
- **test26 credentials**: Test262026! (web), Ttc5ZxPltimz (IMAP) — still valid from prior CRON run
- **English URLs**: Some English pages work at unexpected paths (e.g., `/en/cambiar-plan` not `/en/change-plan` or `/en/switch-plan` which 404s)
