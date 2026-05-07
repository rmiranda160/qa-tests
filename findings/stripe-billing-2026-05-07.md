# QA: Stripe Billing — ZonaCNC (new.zonacnc.com)

**Date:** 2026-05-07 15:18–15:30 UTC  
**Account:** test3@zonacnc.com (Pro tier)  
**Session:** `f88c723f-9d7c-485a-b506-55f4e41efab3`

---

## Summary

✅ Stripe integration is functional end-to-end: pricing display, subscription management, plan change with prorated billing, card update via Stripe Elements, Boost pack purchase through Stripe Checkout, and invoice links to Stripe portal.

⚠️ **Translation coverage is critically incomplete** for the billing module (zonacncplans). All subscription/plan-change pages show Spanish content when in English mode, with only native PS sidebar navigation translated.

---

## Passed

### 1. Pricing Page (`/es/pricing` & `/en/pricing`)
- ✅ All 5 plans displayed: Free (0€), Starter (39€), Pro (99€), Business (199€), Enterprise (299€)
- ✅ 40% launch promo applied correctly (e.g., Pro 99€ → 59.40€/mes)
- ✅ Countdown timer present: "52 días 06h XXm XXs hasta 28/06/2026"
- ✅ Plan detection shows "Tu plan actual" / "Current plan" on the correct tier
- ✅ Logged-in user sees "Plan actual" (disabled) for current plan, "Cambiar a X" for others
- ✅ Free tier shows "No disponible" with link to cancel to return

### 2. Subscription Page (`/es/suscripcion`)
- ✅ Plan status: "Pro Activa", next billing 07/05/2027, 99€/mes
- ✅ Listing counter: "2 / 11" (2 used, 11 = 10 base + 1 add-on)
- ✅ Payment method: Visa •••• 4242
- ✅ "Cancelar al final del período" button present
- ✅ Invoice history with 2 completed entries, links to Stripe invoice portal
- ✅ Add-ons section: active "Anuncios extra x1 @ 12€/mes" with Cancelar button
- ✅ "Añadir add-on": Anuncio extra @ 9€/mes with quantity selector
- ✅ "Cambiar de plan" link navigates to plan change page

### 3. Plan Change Page (`/es/cambiar-plan`)
- ✅ Upgrade preview (Pro→Business): prorated billing table with credit/cargo breakdown
  - Credit -€99.00, New charge +€199.00, **Today €100.00**
- ✅ Upgrade preview (Pro→Enterprise): Cobro hoy €200.00
- ✅ Add-on management during upgrade: "Mantener" or "Quitar" radios
- ✅ Add-on price changes correctly (€12→€6 for Business, €12→€3 for Enterprise)
- ✅ Downgrade preview (Pro→Free): "Downgrade — programado al fin del periodo"
  - Cobro hoy €0.00, change applies at period end
- ✅ Rules explained: upgrade immediate, downgrade deferred, cancel at period end
- ✅ 7-day refund policy with conditions listed

### 4. Stripe Card Update (`Cambiar tarjeta` button)
- ✅ Opens modal dialog: "Actualizar método de pago"
- ✅ Stripe Elements embedded: Card number, MM/YY, CVC fields
- ✅ Stripe Link "Autofill with Link" button
- ✅ "Guardar tarjeta" + "Cancelar" buttons

### 5. Boost Packs (`/es/packs-boost`)
- ✅ 5 packs displayed: 5 (€25), 10 (€45), 25 (€100 ★RECOMENDADO), 50 (€179), 100 (€200)
- ✅ Current balance: 0 Boosts
- ✅ Clicking "Comprar" redirects to `checkout.stripe.com`
- ✅ Stripe Checkout: "Boost Pack 5" / Subtotal €25.00 / IVA 21% €5.25 / Total €30.25
- ✅ Payment methods: Tarjeta, MB WAY, Klarna, Bancontact, EPS
- ✅ Email pre-filled (test3@zonacnc.com)
- ✅ "Entorno de prueba" sandbox badge visible

### 6. Invoice History (`/es/facturacion`)
- ✅ 3 entries: 1 pending (Boost Pack 5, €25.00), 2 completed
- ✅ PDF download and "Ver factura" links working
- ✅ Stripe invoice links: `invoice.stripe.com/i/acct_1TTkeR...`

---

## Issues Found

### 🔴 BUG-1: Plan change page shows "Ya tienes este plan activo" after selecting different plan (race condition)
- **Severity:** Medium  
- **Page:** `/es/cambiar-plan`
- **Reproduction:** Navigate directly to cambiar-plan, immediately click a non-current plan. The plan price updates but validation text says "Ya tienes este plan activo. Selecciona otro plan distinto..."
- **Workaround:** Reload page and wait for JS to fully initialize before clicking.

### 🟡 BUG-2: `40%%` double percent sign in English pricing page
- **Severity:** Low  
- **Page:** `/en/pricing`
- **Observed:** "Launch offer · -40%% for 6 months" and "LAUNCH OFFER 40%% OFF"
- **Expected:** "40%" (single percent sign)
- **Root cause:** Template likely uses `40%` already and `%` is added as escape/format char.

### 🟡 BUG-3: Invoice line items use mixed English/Spanish
- **Severity:** Low  
- **Page:** `/es/suscripcion` and `/es/facturacion`
- **Observed:** "Remaining time on ZonaCNC — Add-on: anuncio extra after 06 May 2026 (+11,94 €)"
- **Expected:** Fully localized: "Tiempo restante en ZonaCNC — Add-on: anuncio extra tras 06 May 2026 (+11,94 €)"

### 🟡 BUG-4: "Boost Pack 5" uses English in Spanish interface
- **Severity:** Low  
- **Page:** `/es/facturacion`
- **Observed:** Invoice concept "Boost Pack 5" in English
- **Expected:** "Pack Boost 5" or consistent Spanish naming

### 🔴 BUG-5 (TRANSLATION): Billing module (zonacncplans) NOT translated to English
- **Severity:** High  
- **Pages affected:** `/en/suscripcion`, `/en/cambiar-plan`, `/en/facturacion`
- **Observed:** All module-specific strings remain in Spanish even when English is selected:
  - "Mi suscripción" → should be "My subscription"
  - "Próximo cobro" → should be "Next charge"
  - "Anuncios activos" → should be "Active listings"
  - "Cambiar de plan" → should be "Change plan"
  - "Método de pago" → should be "Payment method"
  - "Cancelar al final del período" → should be "Cancel at end of period"
  - "Historial de facturas" → should be "Invoice history"
  - All plan feature descriptions remain Spanish
- **Only translated:** Native PS sidebar navigation items
- **Note:** `/en/pricing` page IS properly translated, suggesting translation files exist for public-facing pages but not for account management pages.

---

## Blockers / Limitations

- **test7-test30 accounts:** Accounts exist on site but passwords are unknown (not shared in `.env.qa.email`). IMAP passwords differ from site passwords. Password recovery throttled (360 min cooldown). Could not create anuncios with test7-test30 accounts as required.
- **Stripe test mode:** All charges use Stripe sandbox (acct_1TTkeRPzDPgjo8Yc). No real payments were triggered.

---

## Recommendations

1. **HIGH:** Add English translations for all zonacncplans module strings (suscripcion, cambiar-plan, facturacion templates)
2. **MEDIUM:** Fix the `40%%` rendering issue on English pricing page
3. **LOW:** Localize Stripe invoice line item descriptions to match UI language
4. **LOW:** Investigate race condition on plan change page (JS initialization timing)
5. **NON-BLOCKING:** Provide site passwords for test7-test30 QA accounts for full end-to-end listing creation testing
