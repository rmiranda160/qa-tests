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

## Segunda Verificación — Plan Starter (2026-05-03 22:43 UTC)
- **Email destino:** test16@zonacnc.com
- **Plan:** Starter (39€/mo) — contratado exitosamente vía Stripe test card (4242 4242 4242 4242)
- **Mailgun tags:** plans-vendor_onboarding
- **Resultado:** REGRESIÓN CONFIRMADA — misma plantilla, mismas variables sin sustituir

## Prioridad
**HIGH** — Afecta TODOS los planes (Starter, Pro). Los usuarios recién registrados en cualquier plan reciben emails con enlaces rotos. Esto bloquea el onboarding funcional.
