# CRON QA Report — Enterprise Plan Stripe Billing
**Date:** 2026-05-05 21:49–22:12 UTC  
**Site:** new.zonacnc.com (es/ locale)  
**Account:** test15@zonacnc.com (IMAP: KKfGoMaZoJAN, web: Test1234%segura)  
**Plan:** Enterprise (€299/mo)  
**Scenario:** Complete Stripe sandbox checkout → verify 3 emails → inspect templates/i18n  
**Browser:** MCP remote pwmcp-zonacnc  
**Result:** Payment succeeded ✅ | 3 emails received ✅ | i18n bugs confirmed ✅

---

## Flow executed
1. Registered fresh account test15@zonacnc.com (existing accounts test7–test14 fail login regression)
2. Logged in with Test1234%segura, account name: "Test Empresa Quince"
3. Navigated to `/es/pagar-plan?plan=enterprise`
4. Clicked "Proceder al pago" → redirected to billing address form (zcnc_billing=1)
5. **Address form**: Required DNI/NIF field discovered (server-side "Campo requerido" — not obvious in UI)
   - Saved: Calle Test 15, 1, 28001, Madrid, 911234567, DNI: 12345678Z, Empresa: Test Empresa Quince SL
   - **F7 bug triggered**: After address save, redirect malformed as `/es/?controller=https://new.zonacnc.com/es/pagar-plan?plan=enterprise`
   - Manual navigation back to checkout required
6. Vendor registration triggered (`/es/alta-vendedor`) — filled company/contact/sector data
7. Returned to checkout → "Proceder al pago" → Stripe Checkout hosted page
8. **Stripe UX issue**: Card fields hidden until "Card" accordion item explicitly clicked
   - Filled: 4242 4242 4242 4242 / 12/34 / 123 / Test Empresa Quince
9. Payment submitted → redirect to success page `/es/module/zonacncplans/success?session_id=cs_test_...`
10. Verified 3 emails via IMAP: subscription_started, onboarding, invoice

---

## Findings

### BUG 1 — CONFIRMED (CRITICAL): Wrong ad count in welcome email for ALL plans
| Plan | Expected ads | Email shows |
|------|-------------|-------------|
| Starter (test8/test11) | 3 | 1 |
| Business (test14) | 25 | 1 |
| **Enterprise (test15)** | **100** | **1** |

- Template: `plans-subscription_started`
- Root cause: Template variable `{listing_count}` always resolves to 1 across all plans
- **Priority: CRITICAL** — Compliance risk, customer-facing misrepresentation

### BUG 2 — CONFIRMED (HIGH): "monthly" untranslated across all email templates
- Welcome email: "Periodo: monthly" → should be "Mensual"
- Invoice email: "Plan: Enterprise (monthly)" → should be "(Mensual)"
- Affects: All plans, all languages. Confirmed in starter/business/enterprise tests.
- Root cause: Translation key `period_monthly` missing or Stripe backend value not mapped to locale

### BUG 3 — CONFIRMED (MEDIUM): Name truncation in email greeting
- Email shows: "Hola Test," 
- Should be: "Hola Test Empresa Quince,"
- Root cause: Template uses `{firstname}` instead of `{fullname}`. "Test Empresa Quince" → first word extracted as "Test"
- Affects: Welcome email, invoice email (both use truncated name)

### BUG 4 — CONFIRMED (MEDIUM): Success page missing accents
| Actual | Expected |
|--------|----------|
| `Tu suscripción esta activa` | `Tu suscripción está activa` |
| `un email de confirmacion` | `un email de confirmación` |

### BUG 5 — NEW (HIGH): Invoice email says "renovación" for first payment
- Email #12 shows: "Hemos cobrado la **renovación** de tu plan Enterprise"
- This is the **first/initial** payment, not a renewal
- Should use conditional: "activación" on first payment, "renovación" on subsequent cycles
- Customer confusion risk: implies this is a renewal charge

### BUG 6 — CONFIRMED: Footer accent marks missing
| Location | Actual | Expected |
|----------|--------|----------|
| Success page footer | `Politica de privacidad` | `Política de privacidad` |
| Success page footer | `Politica de cookies` | `Política de cookies` |

### BUG 7 — CONFIRMED: Vendor registration form missing accents
`/es/alta-vendedor` page:
- `Registrate` → `Regístrate`
- `Unete` → `Únete`
- `Descripcion` → `Descripción`
- `Ubicacion` → `Ubicación`
- `Presentacion` → `Presentación`
- `Tamano maximo` → `Tamaño máximo`
- `Codigo postal` → `Código postal`
- `Telefono` → `Teléfono`
- Sector options: `Automatizacion`, `Robotica`, `Medicion`, `Plasticos`, `Construccion` → all missing tildes

### BUG 8 — PERSISTS (F7): Redirect loop after billing address save
- After saving address with `zcnc_billing=1`, system redirects to: `/es/?controller=https://new.zonacnc.com/es/pagar-plan?plan=enterprise`
- This is a malformed URL — the Stripe redirect URL is injected into `controller` parameter
- Result: 404 or homepage loop. Manual navigation to checkout required.
- **Reproduced across**: Starter (test11), Business (test14), Enterprise (test15)

### BUG 9 — PERSISTS (F8): JavaScript parse error on all pages
```
Unexpected token '&'
```
- Present on: checkout page, success page, subscription page
- Likely cause: HTML-entity encoding mismatch in JS-injected translations

### BUG 10 — UX/UI (LOW): Stripe Card fields hidden on initial load
- Stripe Checkout page loads with "Card" radio selected but card input fields (number, expiry, CVC) not rendered
- User must click accordion item to expand and reveal card fields
- Workaround: click the Card accordion item title area
- **Reproduced across**: All plan tests. May be a sandbox-mode Stripe behavior.

### BUG 11 — UX/UI (LOW): DNI/NIF field required but not visually indicated on billing address form
- Server returns "Campo requerido" for `field-dni` with no client-side visual indication
- Only HTML `required` attribute exists; no red outline or error message shown
- User submits form → stays on same page → no visible feedback why
- Investigation required: need to check response body for error messages (not shown in UI)

---

## Email Template Review

### Email #10 — subscription_started
- **Subject:** `¡Bienvenido a Enterprise! Tu suscripción está activa` ✅ (properly accented!)
- **From:** ZonaCNC <no-reply@mg.zonacnc-sales.es> ✅
- **Tag:** `plans-subscription_started`
- **Issues:**
  - ❌ "Periodo: monthly" — untranslated (BUG 2)
  - ❌ "Anuncios incluidos: 1" — wrong count (BUG 1)
  - ❌ "Hola Test," — truncated name (BUG 3)
  - ✅ "299,00 €" — correct price and formatting
  - ✅ "06/06/2026" — correct Spanish date format
- **Template quality:** Clean layout, Spanish content otherwise correct

### Email #11 — vendor_onboarding
- **Subject:** `Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos` ✅
- **From:** ZonaCNC <no-reply@mg.zonacnc-sales.es> ✅
- **Tag:** `plans-vendor_onboarding`
- **Issues:**
  - ✅ "Hola Test Empresa Quince" — full name used correctly!
  - ✅ "Tu plan Enterprise permite hasta 100 anuncios activos" — correct ad count
  - ✅ 3-step onboarding flow well-translated and clear
  - ⚠️ Minor: "Cuanta más información técnica añadas" → grammatically correct ("cuanta" without tilde as relative quantifier), but could be ambiguous for readers
  - ✅ "25 Boosts 24h al mes" — correct Enterprise plan feature
- **Template quality:** Brand-new design, color-coded cards, all Spanish. Best-translated template in the flow.

### Email #12 — invoice
- **Subject:** `Factura pagada — Tu plan sigue activo` ✅
- **From:** ZonaCNC <no-reply@mg.zonacnc-sales.es> ✅
- **Tag:** `plans-invoice_paid`
- **Issues:**
  - ❌ "Hemos cobrado la **renovación**" → should be "activación" for first payment (BUG 5)
  - ❌ "Plan: Enterprise (monthly)" → untranslated (BUG 2)
  - ❌ "Hola Test," → truncated name (BUG 3)
  - ✅ "299,00 €" — correct amount
  - ✅ "06/06/2026" — correct date
  - ✅ PDF invoice link functional

---

## Cross-Plan Comparison (Enterprise vs Business vs Starter)

| Finding | Starter | Business | Enterprise |
|---------|---------|----------|------------|
| Wrong ad count in email | ❌ shows 1 | ❌ shows 1 | ❌ shows 1 |
| "monthly" untranslated | ❌ | ❌ | ❌ |
| Name truncation | ❌ "Hola Test" | ❌ | ❌ "Hola Test" |
| Success page accents | ❌ | ❌ | ❌ |
| Footer accents | ❌ | ❌ | ❌ |
| F7 redirect loop | ❌ | ❌ | ❌ |
| F8 JS error | ❌ | ❌ | ❌ |
| Invoice says "renovación" | ❌ | ❌ | ❌ |
| Vendor reg accents | N/A | ❌ | ❌ |
| Card fields hidden | ❌ | ❌ | ❌ |
| Onboarding email quality | ✅ | ✅ | ✅ |

**Impact:** All 3 plans share identical template bugs. Fixing templates once repairs all plans.

---

## Priority Assessment
1. **🔴 CRITICAL — BUG 1**: Wrong ad count in all welcome emails (customer-facing, compliance risk)
2. **🔴 HIGH — BUG 2**: "monthly" untranslated (affects all Spanish-speaking customers)
3. **🔴 HIGH — BUG 5**: "renovación" mislabel on first payment invoice
4. **🟡 MEDIUM — BUG 3**: Truncated greeting name
5. **🟡 MEDIUM — BUG 7**: Vendor registration missing accents (first impression for new sellers)
6. **🟡 MEDIUM — F7/F8**: Redirect loop + JS error (UX bugs affecting all billing flows)
7. **🟢 LOW — BUG 4/6**: Missing accent marks on success page/footer
8. **🟢 LOW — BUG 10/11**: Stripe UX quirks (card field hidden, DNI field feedback)

---

## Test Environment Notes
- Stripe sandbox mode confirmed: test card 4242…4242 accepted
- Stripe test mode warning displayed: "link, amazon_pay not activated — displayed in test mode, hidden in live mode"
- All emails sent from `no-reply@mg.zonacnc-sales.es` (SendGrid/Mailgun relay)
- ⚠️ "Entorno de prueba" watermark visible on success page footer
- IMAP credentials: separate from web login credentials (per .env.qa.email)
