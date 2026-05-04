# CRON_QA Report: stripe-billing
**Date:** 2026-05-04 01:26 UTC  
**Account:** test24@zonacnc.com (Customer ID 6633)  
**Scenario:** Complete stripe-billing flow: login → vendor registration → subscription → ad creation → email verification

---

## Summary

| Step | Status | Notes |
|------|--------|-------|
| Site health | ✅ UP | HTTP 200 on new.zonacnc.com |
| Password reset / login | ✅ Done | test24: reset password → logged in as "Test SEO User" |
| Vendor registration | ✅ Done | Test Vendor 24, CIF B12345678, Barcelona |
| Billing address | ✅ Done | Completed address form |
| Subscription (Starter) | ✅ Done | €39/mo via Stripe test card 4242... |
| Ad creation (ID 12987) | ✅ Done | "Torno Haas ST-20Y 2020" |
| Email verification | ✅ Done | IMAP access via mail.zonacnc.com:993 |

---

## Findings

### FINDING-001 ❌ — Onboarding template variables NOT substituted (REGRESSION)

**Email:** Message 8 — "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"  
**Tag:** `plans-vendor_onboarding`  
**Timestamp:** 2026-05-04 01:37:36 UTC  

The following template variables appear **literally** (unsubstituted) in the email body:

| Variable | Found in plain text | Found in HTML |
|----------|-------------------|---------------|
| `{vendor_dashboard_url}` | ✅ | ✅ (href) |
| `{max_listings}` | ✅ | ✅ |
| `{new_ad_url}` | ✅ | ✅ (href) |
| `{messaging_url}` | ✅ | ✅ (href) |
| `{boost_quota_monthly}` | ✅ | ✅ |
| `{boostpacks_url}` | ✅ | ✅ (href) |

**Impact:** Users see broken links pointing to literal `{vendor_dashboard_url}` instead of actual URLs. All CTA buttons in the onboarding email are non-functional.

**Severity:** HIGH — this is a regression of previously identified issue FINDING-001.

---

### FINDING-002 ❌ — Name truncation in welcome email (REGRESSION)

**Email:** Message 9 — "¡Bienvenido a Starter! Tu suscripción está activa"  
**Tag:** `plans-subscription_started`  
**Timestamp:** 2026-05-04 01:37:37 UTC  

The user display name is "**Test SEO User**" (three words, 13 chars), but the email greets:

- Plain text: `Hola Test,`  
- HTML: `<p>Hola Test,</p>`

The surname "SEO User" is truncated. Only the first word/name is used.

**Impact:** Users see incomplete personalization. For users with compound names (e.g., "María José García López"), only "María" would appear, excluding "José García López".

**Severity:** MEDIUM — visual/UX issue, but links and functionality are unaffected.

---

## Email Inventory (test24@zonacnc.com INBOX)

| # | Date | Subject | Tag |
|---|------|---------|-----|
| 1 | May 2 | ¡Bienvenido! | — |
| 2 | May 2 | ¡Bienvenido! | — |
| 3 | May 3 | Confirmación de contraseña | — |
| 4 | May 3 | Confirmación de contraseña | — |
| 5 | May 3 | Su nueva contraseña | — |
| 6 | May 4 | Confirmación de contraseña | — |
| 7 | May 4 | Su nueva contraseña | — |
| 8 | May 4 | **Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos** | `plans-vendor_onboarding` |
| 9 | May 4 | **¡Bienvenido a Starter! Tu suscripción está activa** | `plans-subscription_started` |

---

## Recommendations

1. **FINDING-001:** Fix template variable substitution in the `plans-vendor_onboarding` Mailgun template. Ensure all `{variable}` placeholders are replaced with actual values before sending.
2. **FINDING-002:** Fix name rendering in the welcome email template (`plans-subscription_started`). Use the full display name instead of only the first token.

---

## Account Credentials (for reference)

- **Email:** test24@zonacnc.com
- **Web password:** Test1234%segura
- **IMAP pass:** Clff5yUAUxKc
- **Customer ID:** 6633
- **Vendor:** Test Vendor 24 (CIF B12345678)
- **Subscription:** Starter (Stripe, active)
- **Ad ID:** 12987
