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

---

# CRON_QA Results — Responsive
**Run:** 2026-05-06 08:27 UTC | **Duration:** ~15 min  
**Branch:** `cronqa/responsive-2026-05-06T0827` | **Account:** test25@zonacnc.com | **IMAP:** ✅ verified

**Scope:** Responsive layout testing on `new.zonacnc.com/es/` — Desktop (1280×800), Tablet (768×1024), Mobile (375×812)

## Pages Tested
| Page | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| Home (`/es/`) | ✅ | ✅ | ✅ |
| Login (`/es/iniciar-sesion`) | — | — | ✅ |
| Contact (`/es/contactenos`) | ✅ | — | ✅ |
| Product Detail (`/es/tornos/13109-haas-st-30y-cnc-lathe-2019.html`) | — | — | ✅ |

## Findings (3 bugs + 1 template issue)

### BUG-RESP-001 ⚠️ MEDIUM — Cookie dialog too tall on mobile
**Page:** All pages at 375×812
- Cookie consent dialog height: ~426px on mobile vs 71px on desktop
- Eats significant viewport space (~50%) on first visit
- Text wraps into many lines making it overwhelming on small screens

### BUG-RESP-002 ⚠️ LOW — Header links collapse to icon-only on tablet
**Page:** Home at 768×1024
- "Vendedores" and "Tarifas" become icon-only — no text label visible
- Users must guess meaning from icons; accessibility concern
- Language selector also hidden at this breakpoint

### BUG-RESP-003 ⚠️ LOW — Footer accordion on mobile hides SEO content
**Page:** All pages at 375×812
- Footer sections collapse into expandable accordion at mobile
- SEO-rich content (categories, brands, legal links) hidden by default
- May impact SEO crawl budget; users must tap to find footer links

### Contact Form Test
- Submitted test message from test25@zonacnc.com ✅
- Success alert: "Su mensaje ha sido enviado a nuestro equipo" ✅
- Test mode banner: "Los emails NO llegan a vendedores reales" noted

## Email Template Review (test25 IMAP, 15 emails)

| UID | Template | Status |
|-----|----------|--------|
| 6 | Confirmación decontraseña (Password reset confirm) | ⚠️ Type: missing space |
| 7 | Su nueva contraseña (Password changed) | ✅ Clean |
| 8 | Confirmación decontraseña | ⚠️ Same typo |
| 9 | Su nueva contraseña | ✅ Clean |
| 10 | ¡Bienvenido! (Account welcome) | ✅ Clean |
| 11 | ¡Bienvenido a Starter! | ✅ Clean |
| 12 | Empieza con buen pie (Onboarding) | ✅ Clean |
| 13 | Factura pagada (Invoice paid) | ✅ Clean |
| 14 | Confirmación decontraseña | ⚠️ Same typo |
| 15 | Su nueva contraseña | ✅ Clean |

### BUG-EMAIL-TYPO ⚠️ LOW — "Confirmación decontraseña" missing space
**All password reset emails:** Subject reads "Confirmación decontraseña"
- Should be "Confirmación de contraseña" (missing space between "de" and "contraseña")
- Present in emails #6, #8, #14 — all password reset confirmation emails

### Translation note
- All Spanish email templates properly translated
- PrestaShop footer: "Powered by PrestaShop" shows in English (minor, could be localized)
- Welcome email (#10): good Spanish with "Consejos Importantes de Seguridad" section
- Onboarding email (#12): well-structured Spanish with numbered steps

## Console Errors (non-blocking)
| Page | Error |
|------|-------|
| Home | FedCM: Google Sign-In account chooser |
| Home | Unrecognized feature: 'identity-credentials-get' | 
| Contact | Same FedCM error |

All console errors are Google Sign-In FedCM related — not blocking responsive functionality.

## Resolution
Findings documented → commit → PR → merge → issue.
