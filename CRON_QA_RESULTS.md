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
