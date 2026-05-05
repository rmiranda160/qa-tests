# CRON_QA Report: stripe-billing
**Date:** 2026-05-05 02:40 UTC  
**Account:** test8@zonacnc.com (Customer ID 6608, "Test Usuario SEO")  
**Scenario:** Stripe billing flows: add-on purchase → cancellation → email verification → i18n review  
**MCP:** pwmcp-zonacnc (remote)

---

## Summary

| Step | Status | Notes |
|------|--------|-------|
| Site health | ✅ UP | HTTP 200 on new.zonacnc.com |
| Password reset / login | ✅ Done | test8: reset via IMAP link → logged in |
| Subscription status | ✅ Done | Pro plan active, 10/10 ads (at limit), next charge 02/06/2026 |
| Add-on purchase | ✅ Done | 1x Anuncio extra (€9/mo), prorated €8.25 charged |
| Add-on cancellation | ✅ Done | Cancelled successfully, status shows "Cancelado" |
| Email verification | ✅ Done | IMAP via zonacnc.com:993, 14 messages total |
| i18n review (English) | ❌ FAIL | Massive Spanish leakage on English subscription page |
| Template review | ❌ FAIL | Variable substitution failure in add-on email |

---

## Detailed Log

### 1. Login (test8@zonacnc.com)
- Standard password failed; password recovery triggered (5:33 AM CEST)
- Reset link extracted from IMAP message #11: `https://new.zonacnc.com/es/recuperar-contraseña?token=cc5e9e722acd598d37effb68c2fdc16b&id_customer=6608&reset_token=ae8bdec7c7b55ab057ead61873ce209d181f7025`
- QP-decoded the link (`=3D`→`=`, `=C3=B1`→`ñ`), navigated, set new password
- Logged in successfully as "Test Usuario SEO"

### 2. Subscription page — Add-on purchase
- Pro plan: €99/mo, 10/10 ads used, no payment method displayed
- Clicked "Añadir" for extra listing (€9/mo)
- Confirmation dialog: "¿Añadir 1 anuncio(s) extra? Stripe cobrará la parte proporcional..."
- Add-on added instantly: ads 10→11, payment card (Visa 4242) now visible
- Invoice generated: €8.25 prorated, status "Completado"

### 3. Add-on cancellation
- Clicked "Cancelar" on the active add-on
- Dialog: "¿Cancelar este add-on? Dejará de cobrarse al final del período actual."
- Confirmed; add-on shows "Cancelado", ads back to 10/10

### 4. Email verification (IMAP)
- 14 messages in test8 inbox (spanning May 3–5)
- Emails received for both add-on (msg #13) and invoice (msg #14)
- No cancellation email sent (expected: cancel at period end)

### 5. i18n review
- Navigated to `/en/subscription` — language suggestion popup appeared
- Page rendered with ~80% Spanish content despite English selection
- 25+ UI strings untranslated (see findings)

---

## Findings Summary

| ID | Severity | Description |
|----|----------|-------------|
| 1 | **HIGH** | Variable `(prorrateado por Stripe)` not substituted in add-on email |
| 2 | **HIGH** | Massive i18n leakage: ~80% of English subscription page in Spanish |
| 3 | **MEDIUM** | Email body in Spanish when user language is English |
| 4 | **MEDIUM** | Invoice description mixes English/Spanish |
| 5 | **LOW** | Missing space in subject: "Confirmación decontraseña" |
| 6 | **LOW** | Invoice email says "renovación" (renewal) for add-on purchase |
| 7 | **INFO** | No payment method shown before add-on, but transaction succeeds |

> Full finding details in `findings-stripe-billing.md`
