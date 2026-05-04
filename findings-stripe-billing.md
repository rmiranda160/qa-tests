# Stripe Billing QA Findings — 2026-05-04 20:35 UTC

**Test account:** test25@zonacnc.com (Fresh account, Free plan, 2/3 ads)
**Focus area:** stripe-billing — Plans, Subscription, Checkout, Billing, Emails
**Scope:** new.zonacnc.com only

---

## Finding 1: Checkout page has generic page title (SEO/A11y)

**Severity:** Low  
**URLs:**
- `https://new.zonacnc.com/es/pagar-plan?plan=starter`
- `https://new.zonacnc.com/en/pagar-plan?plan=starter`

**Description:** The checkout/payment page (`/pagar-plan`) sets `<title>zonacnc.com</title>` instead of a descriptive title like "Subscribe to Starter Plan · ZonaCNC" or "Contratar plan Starter · ZonaCNC".

**Impact:** Poor SEO, confusing browser tab labels, accessibility issue for screen readers.

---

## Finding 2: English checkout page (/en/pagar-plan) renders entirely in Spanish — CRITICAL i18n

**Severity:** High  
**URL:** `https://new.zonacnc.com/en/pagar-plan?plan=starter`

**Description:** The English checkout page displays virtually ALL content in Spanish:
- Page heading: "Contratar plan" (not "Subscribe to plan")
- "Resumen del pedido" (not "Order summary")
- Plan features: "10 fotos por anuncio", "3 destacados al mes"
- Pricing toggle: "Mensual" / "Anual" (not "Monthly" / "Annual")
- Price: "39.00 €/mes" (should be "€39.00/month")
- Annual price: "390.00 €/ano" (should be "€390.00/year")
- Savings: "Ahorras 78 €"
- Security: "Pago seguro con Stripe. Tus datos estan protegidos."
- CTA button: "Proceder al pago" (not "Proceed to payment")
- "Cómo se factura" section entirely in Spanish
- Trust badges: "Sin permanencia", "Cancela cuando quieras", "Soporte en castellano"
- "Aceptamos:" (not "We accept:")
- "Volver a planes" (not "Back to plans")

**Impact:** English-speaking users cannot reliably complete the payment flow. This likely affects Stripe conversion rates for international users. The checkout page appears to not respect the language context at all.

---

## Finding 3: English pricing page (/en/pricing) has mixed i18n — price units and footer

**Severity:** Medium  
**URL:** `https://new.zonacnc.com/en/pricing`

**Description:** On the English pricing page:
- **Plan prices display `/mes` instead of `/month`** — All paid plans (Starter €39, Pro €99, Business €199, Enterprise €299) show the Spanish frequency unit "/mes" instead of English "/month"
- **Footer sections untranslated:**
  - Legal nav: "Aviso legal", "Politica de privacidad", "Politica de cookies" (all Spanish)
  - Marketplace nav: "Cómo funciona", "Planes para vendedores", "Todos los vendedores", "Preguntas frecuentes" (all Spanish)
  - Section heading: "Nuestra empresa" (not "Our company")
  - Newsletter unsubscribe: "Puede darse de baja en cualquier momento..." (Spanish)
  - Store location: "España" (not "Spain")

**Impact:** Mixed-language UI erodes trust and looks unprofessional. Price units in wrong language could confuse international buyers about billing frequency.

---

## Finding 4: Password reset emails have language mismatch (English subject, Spanish body)

**Severity:** Medium  
**Evidence:** IMAP inbox for test25@zonacnc.com, email from May 3, 2026

**Description:** When a password reset is requested from the English interface (`/en/`), the email is sent with:
- **Subject:** "Password query confirmation" (English)  ← also "query" is odd wording, should be "Password reset request"
- **Body:** "Hola Test UserLastName, Confirmación de la solicitud de contraseña…" (Spanish)
- The body is entirely in Spanish despite the English subject and English URL context

Similarly, the "Your new password" confirmation email has English subject but Spanish body.

**Impact:** Confusing user experience. Users who requested password reset in English receive an email with an English subject line but Spanish content they may not understand.

---

## Finding 5: JavaScript console error on checkout page

**Severity:** Low-Medium  
**Evidence:** Browser console shows `Unexpected token '&'` on both Spanish and English checkout (`/es/pagar-plan` and `/en/pagar-plan`)

**Description:** A JavaScript parsing error occurs on the checkout/payment page. The error `Unexpected token '&'` suggests malformed JS (possibly an unescaped ampersand in inline script or HTML entity in wrong context).

**Impact:** Could break JS-dependent features on the checkout page, potentially affecting Stripe Elements initialization or form validation.

---

## Finding 6: Email subject Q-encoding splits across lines

**Severity:** Low  
**Evidence:** IMAP inbox for test25@zonacnc.com, emails from May 4, 2026

**Description:** Spanish password reset emails have subject headers that split mid-word across lines:
```
Subject: [zonacnc.com] =?utf-8?Q?Confirmaci=C3=B3n?= de
 =?utf-8?Q?contrase=C3=B1a?=
```

While this is technically valid RFC 2047 encoding, it renders poorly in some email clients and looks unprofessional.

**Impact:** Minor cosmetic issue but contributes to poor email deliverability perception.

---

## Summary

| # | Finding | Severity | Page/Feature |
|---|---------|----------|-------------|
| 1 | Generic page title "zonacnc.com" on checkout | Low | Checkout |
| 2 | **English checkout fully in Spanish** | **High** | /en/pagar-plan |
| 3 | English pricing mixed i18n (/mes, footer Spanish) | Medium | /en/pricing |
| 4 | Password reset email: EN subject + ES body | Medium | Email templates |
| 5 | JS error `Unexpected token '&'` on checkout | Low-Medium | Checkout |
| 6 | Email subject Q-encoding split across lines | Low | Email headers |
