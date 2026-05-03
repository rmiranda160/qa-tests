# Finding: Onboarding Email Template Variables Not Substituted (Regresión)
**Cron QA:** Stripe Billing — 2026-05-03 18:25 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  

## Descripción
El email de onboarding "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos" continúa mostrando variables de plantilla literales sin sustituir. Es una **regresión** de reportes anteriores (reportado en 2026-05-03 10:34 UTC).

## Variables Afectadas (verificadas vía IMAP)
- `{vendor_dashboard_url}` → aparece literalmente
- `{max_listings}` → aparece literalmente
- `{new_ad_url}` → aparece literalmente
- `{messaging_url}` → aparece literalmente
- `{boost_quota_monthly}` → aparece literalmente
- `{boostpacks_url}` → aparece literalmente

## Impacto
Los usuarios recién registrados reciben un email con enlaces rotos (texto literal `{vendor_dashboard_url}` en lugar de `https://new.zonacnc.com/es/mi-cuenta`). Esto afecta la experiencia de onboarding y puede generar confusión.

## Contexto del Test
- **Email destino:** test8@zonacnc.com
- **Plan:** Pro (activo)
- **Mailgun tags:** plans-subscription_started (Pro email) + user-onboarding (onboarding)
- Ambos emails se envían secuencialmente al contratar el plan

## Reproducción
1. Contratar plan Pro → se reciben 2 emails
2. Email 1: "¡Bienvenido a Pro!" → variables OK
3. Email 2: "Empieza con buen pie..." → variables NO sustituidas

## Evidencia IMAP
Body text/plain muestra literalmente:
```
{vendor_dashboard_url}
{max_listings}
{new_ad_url}
{messaging_url}
{boost_quota_monthly}
{boostpacks_url}
```

## Prioridad
**MEDIUM** — Afecta UX de onboarding. El email de suscripción Pro funciona correctamente, pero el onboarding no.
