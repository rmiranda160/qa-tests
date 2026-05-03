# QA Report: Stripe Billing — Pro Active ✅, Ad Created ✅, Template Bug Persists
**Date:** 2026-05-03 18:25 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Escenario:** 1/1 — ✅ Ejecutado

---

## Resumen

Login fijo desde última revisión (HTTP 200). Se ejecutó flujo completo de Stripe Billing:
1. Password reset para test8 (Pro activa)
2. Login exitoso como "Test Usuario SEO"
3. Verificación de suscripción Pro activa
4. Creación de anuncio (ID: 12957)
5. Verificación de facturación
6. Verificación de plantillas email vía IMAP

## Resultados

| Acción | Resultado |
|--------|-----------|
| Homepage | ✅ HTTP 200 |
| Login `/es/iniciar-sesion` | ✅ HTTP 200 |
| Password Reset | ✅ Enviado vía Mailgun, confirmado IMAP |
| Login como test8 | ✅ Password reset exitoso |
| Subscription page | ✅ Pro Activa, 99€/mes, renueva 02/06/2026 |
| Anuncios activos | 5 / 10 |
| Crear anuncio (ID: 12957) | ✅ "QA Test Torno CNC Automático ST-10" publicado |
| Billing page | ✅ Accesible, "Sin movimientos todavía" |
| Mis anuncios | ✅ Anuncio listado como PUBLICADO |

## Bugs

### 1. [Medium] Template variables sin sustituir en email onboarding (REGRESIÓN)
- Email: "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"
- Variables afectadas: `{vendor_dashboard_url}`, `{max_listings}`, `{new_ad_url}`, `{messaging_url}`, `{boost_quota_monthly}`, `{boostpacks_url}`
- **Impacto:** Usuarios reciben enlaces rotos. Reportado previamente sin fix.
- **Verificación IMAP:** Confirmado — texto literal en body text/html

### 2. [Low] Sin facturas en billing (Regresión Stripe webhook)
- Pro activa desde 02/05/2026 pero `/billing` muestra "Sin movimientos todavía"
- Causa probable: Stripe test mode, webhook no configurado, o invoice no generada

### 3. [Info] Sin email de notificación al crear anuncio
- No se recibió email de confirmación/aviso al publicar anuncio 12957
- El sistema muestra "pendiente de revisión" pero el anuncio aparece como PUBLICADO

## Email Templates Verificados (IMAP)

| Email | Variables | Estado |
|-------|-----------|--------|
| "¡Bienvenido a Pro! Tu suscripción está activa" | Plan, Precio, Fecha renovación | ✅ Correcto |
| "Confirmación de contraseña" | Token reset | ✅ Correcto |
| "Su nueva contraseña" | Texto | ✅ Correcto |
| "Empieza con buen pie..." | `{vendor_dashboard_url}`, etc. | ❌ Sin sustituir |

## QA Email Pool

| Email | Estado |
|-------|--------|
| test8@zonacnc.com | **ACTIVO — Pro Active** (nueva password: TestQA2026!) |
