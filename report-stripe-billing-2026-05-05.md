# CRON QA Report — Stripe Billing
**Date:** 2026-05-05 06:42–07:00 UTC  
**Site:** new.zonacnc.com (es/ locale)  
**Account:** test8@zonacnc.com (password: Test1234%segura)  
**Scenario:** Complete Stripe checkout for Starter plan (€39/mo) + email verification  
**Browser:** MCP remote pwmcp-zonacnc  
**Result:** Payment succeeded ✓

---

## Flow executed
1. Logged in as test8@zonacnc.com on /es/ (password Test1234%segura) — success
2. Navigated to /es/pagar-plan?plan=starter
3. Clicked "Proceder al pago"
4. Stripe Checkout loaded — filled card (4242…4242 / 12/34 / 123 / Test Usuario SEO / France)
5. Clicked "Pay and subscribe" — processing → redirect to success page
6. Success page: "¡Tu plan se ha activado correctamente!"
7. Subscription page verified (/es/suscripcion)
8. Checked IMAP — 2 emails received (subscription_started + onboarding)
9. Reviewed Stripe invoice page

---

## Findings

### F2 — Variable substitution / i18n failures (REPEAT, MULTIPLE INSTANCES)

| # | Location | Expected | Actual |
|---|----------|----------|--------|
| F2.1 | Email `subscription_started` (msg 15) — period value | `Mensual` (Spanish) | `monthly` (English untranslated) |
| F2.2 | Email `subscription_started` — listing count | `3` (Starter = 3 anuncios) | `1` (Anuncios incluidos: 1) |
| F2.3 | Email `subscription_started` — greeting | `Hola Test Usuario SEO` (full name) | `Hola Test` (firstname only, truncated) |
| F2.4 | Subscription page `/es/suscripcion` — active listing count | ≤3 (Starter limit) | `10 / 3` (shows 10 active for this test account, correct warning text though) |
| F2.5 | Billing history table — item description | `Plan Starter (39,00 € / mes)` fully Spanish | `1 × Plan Starter (at €39.00 / month) (+39,00 €)` mixed EN/ES |
| F2.6 | Billing history — plan label | `Starter` | Shows `Pro` in bold for a Starter purchase |
| F2.7 | Stripe invoice — customer name | `Test Usuario SEO` | `Test User` (uses shorter name field) |
| F2.8 | Add-on history — description | Fully Spanish | `Remaining time on ZonaCNC — Add-on: anuncio extra after 05 May 2026 (+8,25 €)` mixed EN/ES/date-format |

### F3 — UI text concatenation / stray badge text (NEW)

| # | Location | Issue |
|---|----------|-------|
| F3.1 | Sidebar `/es/suscripcion` | `Facturas y pagos 2` — the notification badge "2" is rendered as part of the link text |
| F3.2 | Sidebar `/es/suscripcion` | `Importar de Machineseeker lock Disponible en Pro / Business / Enterprise` — "lock" word is embedded in link text instead of being an icon |

### F4 — Missing accent marks (REPEAT)
| # | Location | Actual | Expected |
|---|----------|--------|----------|
| F4.1 | Success page | `Tu suscripción esta activa` | `Tu suscripción está activa` |
| F4.2 | Success page | `un email de confirmacion` | `un email de confirmación` |

### F5 — Plan mislabeling in billing (NEW)
| # | Location | Issue |
|---|----------|-------|
| F5.1 | Billing history rows | Both Starter and add-on purchases show `Pro` label in bold left column despite being Starter plan |

### F6 — Mixed language / untranslated Stripe content (CONFIRMED/REPEAT)
| # | Location | Content |
|---|----------|---------|
| F6.1 | Stripe Checkout page title | `Subscribe to Plan Starter` (English) |
| F6.2 | Stripe Checkout plan details | `3 listings · 10 fotos · perfil público` (mixed EN/ES) |
| F6.3 | Stripe Checkout business name | `Entorno de prueba de Veleta Comercializaciones y Servicios SLU` (Spanish test name in production-style flow) |
| F6.4 | Stripe invoice page — full UI | Entire invoice UI is in English (dates, labels, buttons) |
| F6.5 | Stripe invoice — company details | `From: Entorno de prueba de Veleta Comercializaciones y Servicios SLU` (leaks test environment name) |
| F6.6 | Stripe invoice — period | `May 5 - June 5, 2026` (English date format, should be `05 may - 05 jun 2026`) |

### F8 — JS error (PERSISTS)
| # | Location | Error |
|---|----------|-------|
| F8.1 | `/es/pagar-plan?plan=starter` | `Unexpected token '&'` |
| F8.2 | `/es/module/zonacncplans/success` | `Unexpected token '&'` |
| F8.3 | `/es/suscripcion` | `Unexpected token '&'` |

---

## Email review

### Email 1: subscription_started (15)
- **Subject:** `¡Bienvenido a Starter! Tu suscripción está activa` ✓ (properly accented!)
- **Template:** Clean, dark-header design, one-column
- **Issues:** period="monthly", count="1", greeting="Hola Test"
- **Tag:** `plans-subscription_started`

### Email 2: vendor_onboarding (16)
- **Subject:** `Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos` ✓
- **Content:** 3-step onboarding flow (perfil → anuncio → consultas)
- **Template:** Brand-new design, color-coded step cards, all Spanish
- **Correct data:** Greeting="Hola Test Usuario SEO", 3 anuncios activos mentioned
- **Tag:** `plans-vendor_onboarding`
- **Note:** This template appears brand new — was not present in May 3-4 testing

---

## Assessment

### Fixed since May 3-4:
- Email onboarding template is brand new and well-translated (was not previously observed)
- Subscription_started email subject now has proper accents
- "Politica de privacidad" in footer still missing accent mark on both pages

### Regressions / unchanged:
- **F2** (variable substitution): Still broken — wrong count (1 vs 3), untranslated period value, wrong name field. 8 instances found
- **F4** (accents): Success page still missing ¿está¿ and ¿confirmación¿
- **F6** (mixed i18n): Stripe checkout and invoice remain untranslated / mixed-language
- **F8** (JS error): `Unexpected token '&'` persists on billing-related pages

### New:
- **F3** (stray text): Badge count "2" concatenated into sidebar link text; "lock" text in link
- **F5** (mislabeling): "Pro" label shown for Starter plan purchases in billing history
- **F6** extension: Stripe invoice now uses full Spanish test company name visible to customers

### Priority assessment:
1. **CRITICAL — F2.1 / F2.2**: Wrong values in order confirmation email (customer-facing, compliance-risk)
2. **HIGH — F2.5 / F6**: Mixed EN/ES in billing history (confusing for Spanish-only customers)
3. **MEDIUM — F5**: Plan mislabeling as "Pro" (inaccurate records)
4. **MEDIUM — F8**: JS parse error (likely encoding issue in translations)
5. **LOW — F3 / F4**: Cosmetic issues
