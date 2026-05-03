# CRON QA: Stripe Billing — Email Template Bugs CONFIRMED via IMAP (test7)

**Date:** 2026-05-03 14:11 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** stripe-billing  
**Escenario:** 1/1 — ⚠️ Pool exhausto (test7-test30), pero login reparado. Confirmación de bugs via IMAP.

---

## Current Site Status

| Chequeo | Resultado |
|---------|-----------|
| Login (`/es/iniciar-sesion`) | ✅ **HTTP 200 OK** (Fixed desde día 8) |
| Pricing (`/es/pricing`) | ✅ HTTP 200, Plan info correcta |
| test7@zonacnc.com login | ✅ **Logged in** (creds originales funcionan) |
| test8@zonacnc.com login | ❌ **Error autenticación** (password cambiado por resets previos) |
| Subscription page (`/module/zonacncplans/subscription`) | ✅ Pro Activa, next charge 03/06/2026 |
| Billing page (`/module/zonacncplans/billing`) | ✅ "Sin movimientos todavía" (Bug #3: sin facturas pese a pago exitoso) |
| QA pool (test7-test30) | ❌ Completamente exhausto |

---

## IMAP Verification — test7@zonacnc.com Inbox (12 emails)

### Email #12: "¡Bienvenido a Pro! Tu suscripción está activa"
**Plan:** Pro · **Estado:** Activa · **Mailgun tag:** `plans-subscription_started`

#### Bug #1: "Anuncios incluidos: 1" → Debería ser 10
**Plain text:**
```
- Anuncios incluidos: 1
```
**HTML:**
```html
<strong>Anuncios incluidos:</strong> 1
```
**Pricing page:** Pro plan = **10 anuncios activos** (99€/mes)
**Subscription page:** "Anuncios activos 2 / 10"
**Severity:** High — El email está mostrando el contador de anuncios activos actuales, no el límite del plan.

#### Bug #2: "Periodo: monthly" → Debería ser español
**Plain text:**
```
- Periodo: monthly
```
**HTML:**
```html
<strong>Periodo:</strong> monthly
```
**Severity:** Medium — Falta de traducción al español en la plantilla.

---

### Email #11: "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"
**Mailgun tag:** likely `plans-onboarding`  
**Subject:** Correcto y en español

#### Bug #3: Template variables sin renderizar (6 vars)
Variables literales encontradas en el email entregado:
| Variable | Contexto |
|----------|----------|
| `{vendor_dashboard_url}` | Paso 1: "→ {vendor_dashboard_url}" |
| `{max_listings}` | Paso 2: "Tu plan Pro permite hasta {max_listings} anuncios activos." |
| `{new_ad_url}` | Paso 2: "→ {new_ad_url}" |
| `{messaging_url}` | Paso 3: "→ {messaging_url}" |
| `{boost_quota_monthly}` | "Tu plan incluye {boost_quota_monthly} Boosts 24h al mes." |
| `{boostpacks_url}` | "packs sin permanencia en: {boostpacks_url}" |

**Severity:** Medium — Los usuarios reciben enlaces rotos en lugar de URLs funcionales.

---

### Email #4/6/8/10: Password reset ("Su nueva contraseña")
- Template PrestaShop por defecto con "Powered by PrestaShop"
- Funcional pero con branding por defecto

---

### Email #9: "Password query confirmation" — EN INGLÉS
- Subject en inglés pero cuerpo en español
- **Anomalía:** El asunto no coincide con el idioma del cuerpo

---

## QA Pool Status

| Email | Estado |
|-------|--------|
| test7@zonacnc.com | **TAKEN — Pro Activa** (logged in OK, 2/10 ads) |
| test8@zonacnc.com | **TAKEN — Pro Activa** (password changed, no access) |
| test9-test30 | **TAKEN** (pool exhausto desde día 4) |

---

## Issues Summary (Re-Confirmed)

| # | Bug | Severidad | Confirmado |
|---|-----|-----------|------------|
| 1 | Anuncios incluidos: muestra 1 en vez de 10 (Pro welcome) | High | ✅ Via IMAP |
| 2 | "Periodo: monthly" sin traducir | Medium | ✅ Via IMAP |
| 3 | Template variables sin renderizar en onboarding (6 vars) | Medium | ✅ Via IMAP |
| 4 | Billing history vacío pese a pago exitoso | High | ✅ Via UI |
| 5 | Success page: "esta activa" → "está activa", faltan acentos | Low | Previamente reportado |
| 6 | Subscription page: "metodo" → "método", "suscripcion" → "suscripción" | Low | Previamente reportado |
| 7 | Password reset: template PrestaShop default | Low | ✅ Via IMAP |

---

## Conclusión

✅ **Login reparado** — Primer día en 9 que podemos operar  
⚠️ **QA pool exhausto** — Test7-test30 agotados, sin cuentas frescas para nuevo registro + compra  
🔍 **3 bugs confirmados via IMAP** (1, 2, 3) + correcciones de traducción necesarias  
📨 **Mailgun funcionando** — Emails DKIM-firmados, SPF/DMARC OK, entrega correcta  
📊 **Stripe Checkout OK** — pago procesado, suscripción activa, pero sin facturas visibles
