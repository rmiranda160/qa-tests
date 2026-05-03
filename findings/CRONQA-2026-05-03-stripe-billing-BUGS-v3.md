# CRON QA: stripe-billing — Findings Report
**Date:** 2026-05-03  
**Scope:** new.zonacnc.com  
**Focus:** stripe-billing  
**User:** test8@zonacnc.com (Pro subscriber)  
**Hard cap:** 30 min  

---

## Executive Summary

Two bugs found in email templates and one observation about account pool exhaustion.

---

## Bug #1: Unrendered Template Variables in Vendor Onboarding Email

**Severity:** Medium  
**Component:** Email templates (Mailgun)  
**Email type:** Vendor onboarding / "Empieza con buen pie"  
**Email #3** in test8 inbox

### Description
The vendor onboarding email contains live, unrendered Smarty/Twig template variables that were not replaced with actual values before sending.

### Variables Found Unrendered
- `{vendor_dashboard_url}`
- `{max_listings}`
- `{new_ad_url}`
- `{messaging_url}`
- `{boost_quota_monthly}`
- `{boostpacks_url}`

### Impact
User receives an email with broken links and placeholder text, making onboarding instructions unusable.

### Raw Snippet from Email (HTML decoded)
```
Comienza a vender hoy mismo:
Panel de vendedor: {vendor_dashboard_url}
Límite de anuncios: {max_listings} anuncios activos
Crear anuncio: {new_ad_url}
Bandeja de mensajes: {messaging_url}
Boosts 24h este mes: {boost_quota_monthly}
Comprar más Boosts: {boostpacks_url}
```

---

## Bug #2: Pro Plan "Anuncios incluidos" Discrepancy in Welcome Email

**Severity:** Low  
**Component:** Email template — Pro subscription confirmation  
**Email type:** "¡Bienvenido a Pro!" (email #4)  
**Pricing page:** Pro = 10 anuncios activos  
**Email says:** "Anuncios incluidos: 1"

### Description
The "Bienvenido a Pro!" email sent after subscribing displays "Anuncios incluidos: 1" while:
- The pricing page (`/es/pricing`) shows **10** anuncios activos for Pro
- The subscription page shows "4/10" anuncios activos

The email template is likely using the wrong variable or is a generic welcome template that doesn't adapt to the purchased plan.

### Raw Email Snippet
```
Anuncios incluidos: 1
Boosts 24h incluidos: 8 /mes
```

Note: "Boosts 24h incluidos: 8" correctly matches the pricing page (8 boosts/mes for Pro).

### Suggested Fix
Update the Pro welcome email template to read the correct `max_listings` value from the subscription plan (should be 10, not 1).

---

## Bug #3: Password Reset Email Contains PrestaShop Default Template

**Severity:** Low  
**Component:** Email templates  
**Email type:** Password reset confirmation (emails #5, #6)

### Description
The password reset confirmation email uses the **default PrestaShop template** with "Powered by PrestaShop" branding in the footer. While functional, this breaks brand consistency.

---

## Verification: test8 Pro Subscription Status

| Field | Value |
|-------|-------|
| Plan | Pro Activa |
| Price | 99€/mo |
| Next charge | 02/06/2026 |
| Ads used | 4 / 10 |
| Billing history | "Sin movimientos todavía" (subscription started May 2, no invoices yet) |
| Login | Working correctly (previous HTTP 500 bug is fixed) |

### Emails Received (test8 inbox)
1. Account creation welcome (PrestaShop default template)
2. Onboarding "Empieza con buen pie" (vendor onboarding — **see Bug #1**)
3. Onboarding "Empieza con buen pie" (duplicate from re-registration)
4. "¡Bienvenido a Pro!" subscription activated **— See Bug #2**
5. Password reset confirmation (PrestaShop default template)
6. Password reset notification ("su nueva contraseña")

---

## Account Pool Status

- **test7–test17**: All taken/registered
- **test18+**: Likely fresh, untested this run
- Registration with test17 failed due to zxcvbn password strength validation requiring "Fuerte" (strong) score. The default password `ZonacncTest2026!` doesn't meet this requirement.

---

## Limitations
- **IMAP reachable**: Yes (mail.zonacnc.com:143, 993), successfully fetched all 6 test8 emails
- **IMAP limitation**: Only test8 inbox was checked (6 emails)
- **Test environment**: New user registration blocked by password strength checks
- **Time**: Started ~12:17 UTC, completed ~12:23 UTC
