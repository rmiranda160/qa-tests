# CRON QA: stripe-billing — Email Template Verification
**Date:** 2026-05-04  
**Tester:** test7@zonacnc.com (Enterprise plan, €299/mes)  
**Focus:** Invoice email templates, translation quality, template variable substitution, i18n  
**URL:** https://new.zonacnc.com  
**Scope:** Email verification via IMAP (zonacnc.com:993) + browser inspection (MCP pwmcp-zonacnc)

---

## Summary

| ID | Severity | Template | Issue | Status |
|----|----------|----------|-------|--------|
| FINDING-001 | 🔴 CRITICAL | `plans-vendor_onboarding` | 6 template variables unsubstituted | REGRESSION |
| FINDING-002 | 🟠 HIGH | All billing emails (4 templates) | Name truncated to first 2 words | REGRESSION |
| FINDING-003 | 🟡 MEDIUM | `plans-addon_added` | Prorated charge placeholder not replaced | NEW |
| FINDING-004 | 🟡 MEDIUM | Billing page `/en/facturacion` | 10+ i18n strings remain in Spanish on English page | NEW |

---

## FINDING-001 🔴 CRITICAL — Onboarding Email: 6 Template Variables Unsubstituted

**Template:** `plans-vendor_onboarding` (X-Mailgun-Tag)  
**Subject:** "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"  
**Message ID:** #11 (IMAP)  
**Date:** 03-May-2026 13:22 UTC

### Affected Variables (both plain text AND HTML parts)

| Variable | Where appears | Expected | Actual |
|----------|--------------|----------|--------|
| `{vendor_dashboard_url}` | Step 1 link | `https://new.zonacnc.com/panel` | literal `{vendor_dashboard_url}` |
| `{max_listings}` | Step 2 text | `10` (for Pro) | literal `{max_listings}` |
| `{new_ad_url}` | Step 2 link | `https://new.zonacnc.com/publicar` | literal `{new_ad_url}` |
| `{messaging_url}` | Step 3 link | `https://new.zonacnc.com/mensajes` | literal `{messaging_url}` |
| `{boost_quota_monthly}` | Boost info | numeric value | literal `{boost_quota_monthly}` |
| `{boostpacks_url}` | Boost packs link | `https://new.zonacnc.com/module/zonacncplans/boostpacks` | literal `{boostpacks_url}` |

### Plain text excerpt:
```
→ {vendor_dashboard_url}
...
Tu plan Pro permite hasta {max_listings} anuncios activos.
→ {new_ad_url}
...
→ {messaging_url}
...
Tu plan incluye {boost_quota_monthly} Boosts 24h al mes.
{boostpacks_url}
```

### HTML excerpt:
```html
<a href="{vendor_dashboard_url}" ...>Ir a mi panel de vendedor →</a>
...
<strong>{max_listings} anuncios activos</strong>
...
<a href="{new_ad_url}" ...>Crear anuncio →</a>
```

### Impact
Links are completely broken in the onboarding email. New vendors cannot navigate to dashboard, create ads, configure messaging, or access boost packs from their welcome email. This directly affects new vendor activation and first-ad conversion.

### Previously Reported
Same issue found 2026-05-03 on test24@zonacnc.com (Pro plan). **Still NOT fixed.**

---

## FINDING-002 🟠 HIGH — Name Truncation in All Billing Emails

**Affected templates:** `plans-vendor_onboarding`, `plans-subscription_started`, `plans-subscription_invoice_paid`, `plans-addon_added`

| Email | Subject | Actual Greeting | Expected |
|-------|---------|----------------|----------|
| #11 | Empieza con buen pie en ZonaCNC | "Hola **Test Vendor**," | "Hola **Test Vendor Seven QA**," |
| #12 | ¡Bienvenido a Pro! Tu suscripción está activa | "Hola Test Vendor," | "Hola Test Vendor Seven QA," |
| #13 | Factura pagada — Tu plan sigue activo | "Hola Test Vendor," | "Hola Test Vendor Seven QA," |
| #14 | Add-on añadido a tu suscripción | "Hola Test Vendor," | "Hola Test Vendor Seven QA," |

### Impact
The vendor name is truncated to the first 2 space-separated words (first name + first surname). Full name is "Test Vendor Seven QA" (4 words). This affects all billing and subscription emails, reducing personalization and potentially confusing vendors with multi-word company or personal names.

### Previously Reported
Same issue found 2026-05-03 on test24@zonacnc.com. **Still NOT fixed.**

---

## FINDING-003 🟡 MEDIUM — Add-on Email Shows Literal Placeholder Instead of Prorated Amount

**Template:** `plans-addon_added` (X-Mailgun-Tag)  
**Subject:** "Add-on añadido a tu suscripción"  
**Message ID:** #14 (IMAP)  
**Date:** 03-May-2026 16:16 UTC

### Issue
The prorated charge amount is not substituted — the literal string `(prorrateado por Stripe)` appears:

**Plain text:**
```
- Cobro proporcional ahora: (prorrateado por Stripe)
```

**HTML:**
```html
<p style="margin:0;">
  <strong>Cobro proporcional ahora:</strong> (prorrateado por Stripe)
</p>
```

### Expected
Should show the actual prorated amount, e.g.: `5,98 €` or `5,95 €`

### Context
The actual Stripe prorated charges for add-ons on test7 were €5.98 and €5.95 (visible on the billing page). Neither amount appears in the add-on notification email — just the placeholder text.

### Impact
Vendor cannot see the actual amount charged for the add-on from the email notification. They must log in to the billing page to see the charge amount.

---

## FINDING-004 🟡 MEDIUM — English Billing Page Has Extensive i18n Gaps

**URL:** https://new.zonacnc.com/en/facturacion  
**Page title (browser tab):** "Facturas y pagos · ZonaCNC" (Spanish)

### Strings remaining in Spanish on the English page:

| Element | Actual (Spanish) | Expected (English) |
|---------|-----------------|-------------------|
| Page title | "Facturas y pagos · ZonaCNC" | "Invoices & Payments · ZonaCNC" |
| Heading H1 | "Facturas y pagos" | "Invoices & Payments" |
| Description | "Aquí encontrarás un histórico de los pagos realizados en ZonaCNC: suscripciones, packs Boost 24h y otros add-ons. Puedes descargar la factura PDF de cada cobro." | (English equivalent) |
| Table header: Date | "Fecha" | "Date" |
| Table header: Concept | "Concepto" | "Description" |
| Table header: Amount | "Importe" | "Amount" |
| Table header: Status | "Estado" | "Status" |
| Table header: Invoice | "Factura" | "Invoice" |
| Status: pending | "pendiente" | "pending" |
| Status: completed | "completado" | "completed" |
| Invoice link | "Ver factura" | "View invoice" |
| Breadcrumb | "Mi cuenta" | "My Account" |
| Invoice concept | "Suscripción" | "Subscription" |
| Footer privacy | "Puede darse de baja en cualquier momento..." | (English equivalent) |
| Footer nav sections | "Legal", "Nuestra empresa" | "Legal", "Our company" |

### Note
The sidebar navigation IS correctly translated to English. Only the billing page content area and the global footer are affected.

### Impact
English-speaking users see Spanish content on the billing page, creating confusion about their invoices, payment statuses, and charges. This is a trust concern for international vendors reviewing their billing.

---

## Test Account Verified

- **Email:** test7@zonacnc.com
- **IMAP:** zonacnc.com:993, SSL
- **Inbox:** 26 messages, 4 billing-related identified
- **Plan path:** Pro → Business → Enterprise (+ add-ons)
- **Billing page:** 6 invoices (5 completed, 1 pending Boost Pack 5 for €15.00)

## Methodology

1. Logged into new.zonacnc.com via MCP remote browser (pwmcp-zonacnc) using test7@zonacnc.com
2. Navigated to billing page `/es/facturacion` and `/en/facturacion`
3. Inspected all 6 invoices, their statuses, amounts, and links
4. Verified all 26 IMAP messages via direct TLS connection (openssl-equivalent Node.js)
5. Searched inbox for billing-related subjects (factura, pagad, suscripción, activ)
6. Fetched full HTML + plain text bodies of all 4 billing emails
7. Cross-referenced email content against web billing page data
8. Checked English billing page for i18n completeness
