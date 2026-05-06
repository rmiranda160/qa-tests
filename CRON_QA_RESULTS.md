# CRON_QA Results — stripe-billing
**Run:** 2026-05-04 01:26 UTC | **Duration:** ~12 min  
**Account:** test24@zonacnc.com | **Plan:** Starter (Stripe) | **Ad:** ID 12987

## Findings (2)

### FINDING-001 ❌ — Onboarding template variables NOT substituted
**Email:** "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos" (`plans-vendor_onboarding`)
- Variables `{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, `{boostpacks_url}` appear literally
- All CTA buttons link to literal `{...}` strings → **broken emails for all new vendors**

### FINDING-002 ❌ — Name truncation in welcome email
**Email:** "¡Bienvenido a Starter! Tu suscripción está activa" (`plans-subscription_started`)
- Greets "Hola Test" instead of "Hola Test SEO User"
- Only first token of display name used

## Resolution
Report saved → commit → PR → merge → issue.

---

# CRON_QA Results — stripe-billing (i18n + Email Audit)
**Run:** 2026-05-06 08:10 UTC | **Duration:** ~15 min  
**Account:** test15@zonacnc.com | **Plan:** Enterprise | **IMAP:** ✅ verified

## Findings (4 bugs + 1 template issue)

### BUG-2026-05-06-1 ❌ CRITICAL — Subscription module completely untranslated in EN
**Page:** `/en/suscripcion` — 23+ strings in Spanish when English selected
- Breadcrumbs, headings, buttons, table headers, labels, add-on descriptions all ES
- Only global header/footer work; `zonacncplans` module has zero EN translations

### BUG-2026-05-06-2 ❌ HIGH — Billing page mixed ES/EN strings
**Pages:** `/es/facturacion`, `/en/facturacion`
- Stripe descriptions leak English into Spanish page: "Remaining time on Add-on…"
- Status "completado" not translated to "Completed" on EN page
- Inconsistent casing: "Completado" vs "completado"

### BUG-2026-05-06-3 ❌ MEDIUM — Footer always shows Spanish links on EN pages
- All footer sections (Marketplace, Legal, Nuestra empresa) remain Spanish on `/en/*`
- Newsletter unsubscribe text untranslated
- Featured category "Tornos" not translated to "Lathes"

### BUG-2026-05-06-4 ❌ MEDIUM — Welcome email shows wrong ad count
**Email:** `¡Bienvenido a Enterprise!` (UID 10) shows "Anuncios incluidos: 1"
- Enterprise plan has 100 ads; template variable incorrect

### Template Issue ⚠️ LOW — Add-on email shows placeholder
**Email:** `Add-on añadido` (UID 13) shows "(prorrateado por Stripe)" instead of actual amount

## Email Template Review (test15 IMAP, 13 emails)
| UID | Template | Status |
|-----|----------|--------|
| 10 | Welcome (Enterprise) | Wrong ad count |
| 12 | Invoice paid | Clean, no issues |
| 13 | Add-on confirmed | Placeholder text |

## Prior Bugs Status
- BUG-2 (Email subject not translated): ❌ STILL UNFIXED
- BUG-3 (Welcome email missing plan details): ❌ STILL UNFIXED
