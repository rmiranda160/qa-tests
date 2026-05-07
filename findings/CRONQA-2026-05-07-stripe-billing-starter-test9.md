# CRON QA — Stripe Billing: Starter Subscription (test9)

**Date:** 2026-05-07 09:02 UTC  
**Account:** test9@zonacnc.com (displays as "Test Eight")  
**Focus:** stripe-billing — new subscription flow  
**Plan tested:** Starter (39€/mes + IVA)  
**Status:** ✅ Subscription completed successfully  

---

## Flow Executed

1. **Login** → test9@zonacnc.com / `ZonacncTest2026!` ✅
2. **Seller registration** completed (Test Machines SL, Mecanizado CNC, Barcelona) ✅
3. **Billing address** filled at `/es/direccion?zcnc_billing=1` ✅
4. **Pricing page** → selected Starter (mensual, 39€/mes) ✅
5. **Stripe Checkout** → filled card `4242 4242 4242 4242` / `12/34` / `123` ✅
6. **Payment success** → redirected to `/module/zonacncplans/success` ✅
7. **Subscription page** confirms Starter Activa, next charge 07/06/2026 ✅
8. **IMAP verification** → 3 emails received ✅

---

## Emails Received (IMAP UIDs 24-26)

### Email 24: "¡Bienvenido a Starter! Tu suscripción está activa"
- From: ZonaCNC `<no-reply@mg.zonacnc-sales.es>`
- Template: Clean HTML with dark header (#1a2332), card layout, details box in light gray
- Has CTA button "Ir a Mi suscripción" (red, #c62828)
- Text version present ✓
- **🐛 BUG: "Anuncios incluidos: 1" → should be 3** (plan allows 3 but email shows 1, likely showing currently used count instead of allotment)
- Plan details: Starter, mensual, 39€, próxima renovación 07/06/2026 ✅

### Email 25: "Factura pagada — Tu plan sigue activo"
- From: ZonaCNC `<no-reply@mg.zonacnc-sales.es>`
- Template: Same dark header style, invoice details card
- Amount: 47.19€ (39€ + 8.19€ IVA 21%) ✅
- PDF download link to Stripe invoice ✅
- Text version present ✓

### Email 26: "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"
- From: ZonaCNC `<no-reply@mg.zonacnc-sales.es>`
- Template: Modern green/amber/blue step cards, clean onboarding flow
- 3 steps: Complete profile → Publish ad → Configure inquiries
- **Bien**: Personalized with name "Test Eight", correct links to dashboard/add/inbox
- **INFO**: "0 Boosts 24h al mes" — correct per plan card (Starter = comprar en packs), matches UI

---

## Bugs Found

### 🐛 BUG-1: Welcome email shows wrong ads count
- **Location:** Email template for welcome/activation (Email 24)
- **Expected:** "Anuncios incluidos: 3" (Starter plan allows 3)
- **Actual:** "Anuncios incluidos: 1"
- **Impact:** Low — user sees 1 instead of 3, may think plan is more limited than it is
- **Root cause:** Template likely reports `ads_used` instead of `ads_allowed`

### 🐛 BUG-2: Pricing page contradiction about Starter Boosts
- **Location:** `/es/pricing`
- **Starter card:** "⭐ Boosts 24h: comprar en packs" (no free boosts)
- **Footer text:** "Los planes Starter y superiores ya incluyen Boosts 24h cada mes (3 a 60 según plan)"
- **Impact:** Medium — misleads users about whether Starter includes free boosts
- **Root cause:** Footer copy was written when Starter included boosts (or assumes all paid plans include them), but plan definition changed

---

## UX Observations

| Aspect | Rating | Notes |
|--------|--------|-------|
| Checkout flow | ✅ Smooth | Stripe Checkout integrated correctly, redirect back to success page |
| Card form | ✅ Works | `#cardNumber`, `#cardExpiry`, `#cardCvc`, `#billingName` — type() works |
| Billing address | ⚠️ Awkward | Must fill address before subscribing; redirect from pricing to address loses plan context |
| Email templates | ✅ Well-designed | Consistent dark header, readable, good CTA buttons |
| Email text version | ✅ Present | All 3 emails have plain-text alternatives |
| Invoice status | ✅ Correct | 47.19€, Completado, PDF available |
| Subscription page | ✅ Correct | Shows "Starter Activa", 1/3 ads, next charge date |

---

## Technical Notes

- Stripe test card `4242 4242 4242 4242` used successfully
- Stripe redirect: `checkout.stripe.com/c/pay/cs_test_...` → `new.zonacnc.com/es/module/zonacncplans/success`
- IMAP: zonacnc.com:993, Dovecot, 26 total emails, 3 new from this flow
- Accordion card form in Stripe Checkout required JS click to expand (`.card-accordion-item .AccordionItemHeader--clickable`)
- MCP remote browser: pwmcp-zonacnc
