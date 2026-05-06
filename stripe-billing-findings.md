# Stripe Billing Findings — 2026-05-06 19:12 UTC

**Run:** CRON_QA stripe-billing
**Account:** test7@zonacnc.com
**Plan:** Starter (39€/mes + IVA = 47,19€)
**Site:** new.zonacnc.com

---

## Flow Summary

| Step | Status | Detail |
|------|--------|--------|
| Navigate to pricing | ✅ | new.zonacnc.com/es/pricing |
| Select Starter plan | ✅ | Redirected to /es/pagar-plan?plan=starter |
| Stripe Checkout | ✅ | checkout.stripe.com sandbox |
| Fill card details | ✅ | 4242 4242 4242 4242 (test Visa) |
| Payment submitted | ✅ | Session: cs_test_a1gETId30UAYzz2M14o0n6IetPEcLapqaalQNQ02eLCd6x6ALTLiamKycG |
| Success redirect | ✅ | /es/module/zonacncplans/success |
| Subscription active | ✅ | Starter — Activa, next billing: 06/06/2026 |
| Invoice in history | ✅ | 47,19 EUR, Completado, PDF available |
| Email received | ✅ | Received at 19:12:50 UTC (< 2s after payment) |

---

## Findings

### BUG-SB-001 ⚠️ MEDIUM — First subscription email uses "renovación" (renewal) wording

**Email:** "Factura pagada — Tu plan sigue activo" (`plans-invoice_paid`)
**Issue:** The email body says "Hemos cobrado la **renovación** de tu plan Starter" and "Tu suscripción **sigue** activa". This wording is for renewals, not first-time subscriptions.

**Expected:** New subscribers should receive a welcome message like "Tu suscripción al plan Starter se ha activado correctamente."

**Impact:** Confusing UX for new subscribers who just signed up for the first time.

---

### BUG-SB-002 ⚠️ MEDIUM — Missing accent on success page

**Page:** /es/module/zonacncplans/success
**Text:** "Tu suscripción **esta** activa y ya puedes disfrutar de todas las ventajas de tu nuevo plan."

**Expected:** "Tu suscripción **está** activa…" (missing accent on "está").

---

### BUG-SB-003 ⚠️ LOW — Invoice line item shows misleading "+" prefix

**Page:** /es/suscripcion → Historial de facturas
**Text:** "1 × Plan Starter (at €39.00 / month) (**+**39,00 €)"

The "+" sign suggests an add-on or extra charge, but this is the base plan price.

**Expected:** "1 × Plan Starter (at €39.00 / month) (39,00 €)" — remove the "+" prefix.

---

### BUG-SB-004 ⚠️ LOW — Payment method not saved after checkout

**Page:** /es/suscripcion → Método de pago
**Text:** "No hay método de pago guardado en este sitio. Si tu suscripción está activa, Stripe usará la tarjeta registrada en tu cuenta."

After completing Stripe Checkout, the payment method is not reflected in the user's account page. The card should be shown as saved or linked.

---

## Email Template Review (test7 IMAP)

| UID | Template | Subject | Status |
|-----|----------|---------|--------|
| 48 | plans-invoice_paid | Factura pagada — Tu plan sigue activo | ⚠️ Renewal wording for new sub |
| 47 | password | [zonacnc.com] Your new password | ✅ Clean |
| 46 | password_query | [zonacnc.com] Password query confirmation | ✅ Clean |
| 45 | password_changed | [zonacnc.com] Su nueva contraseña | ✅ Clean |

### Email quality checks (UID 48):
- **DKIM:** ✅ pass (d=mg.zonacnc-sales.es)
- **SPF:** ✅ pass
- **DMARC:** ✅ pass
- **Subject encoding:** ✅ =?UTF-8?q?...?=  
- **Multipart:** ✅ text/plain + text/html
- **HTML template:** ✅ Dark header (#1a2332), white card, CTA button "Descargar factura", footer with branding
- **Plain text:** ✅ Quoted-printable encoded, readable
- **Translation:** ✅ All Spanish, no mixed language
- **Content match:** ✅ Amount 47,19€, plan Starter, next billing 06/06/2026 all correct
- **Mailgun:** Tracking tags present (plans-invoice_paid), opens/clicks disabled

---

## Resolution
Findings documented → commit → PR → merge → issue.
