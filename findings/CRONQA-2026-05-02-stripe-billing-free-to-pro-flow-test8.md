# CRONQA — Stripe Billing: Fresh Vendor Free → Pro Plan Checkout Flow

**Fecha:** 2026-05-02 12:50–13:00 UTC  
**Tester:** test8@zonacnc.com (usuario preexistente + vendor nuevo)  
**Entorno:** new.zonacnc.com (MODO TEST)  
**Focus Area:** stripe-billing  
**Escenario:** 1 — Upgrade Free → Pro (99€/mes) vía Stripe Checkout, verificación suscripción, facturas e email

---

## Resumen

Se probó el flujo de **login (usuario existente) → registro vendor → upgrade a Pro → Stripe Checkout → verificación suscripción activa → facturas y pagos → confirmación email**. El escenario cubre el upgrade Free → Pro que no había sido testeado (tests previos cubrían Starter y Enterprise).

---

## Flujo ejecutado

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Login test8@zonacnc.com (credenciales IMAP: FCtyMNYkhoCh) | ✅ Login exitoso |
| 2 | Navegar a /module/zonacncplans/subscription | 🔀 Redirigido a /module/zonacncvendor/register (vendor obligatorio) |
| 3 | Registro vendor (QA Test Corp, B12345678, Mecanizado CNC, Barcelona) | ✅ Vendor registrado, redirigido a /dashboard?registered=1 |
| 4 | Subscription page (tras vendor register) | ✅ Free plan — 0/1 anuncios activos. Botón "Mejorar plan" |
| 5 | Billing page (/module/zonacncplans/billing) | ✅ "Sin movimientos todavía" |
| 6 | Pricing page (/pricing) | ⚠️ Warning dirección facturación |
| 7 | Completar dirección (QA Test Corp S.L., ESB12345678, Calle Test 123, 08001 Barcelona) | ✅ Dirección guardada |
| 8 | Navegar a checkout Pro: /module/zonacncplans/checkout?plan=pro | ✅ Checkout page — resumen Pro (99€/mes) |
| 9 | Stripe Checkout — test card 4242... (exp 12/30, CVC 123) | ✅ Pago procesado |
| 10 | Redirect a /module/zonacncplans/success?session_id=... | ✅ "Suscripción activada — ¡Tu plan se ha activado correctamente!" |
| 11 | Subscription page post-pago | ✅ **Pro Activa — 99€/mes — Próximo cobro: 02/06/2026 — 0/10 anuncios** |
| 12 | Billing page post-pago | ⚠️ Sigue mostrando "Sin movimientos todavía" |
| 13 | IMAP test8@zonacnc.com | ✅ Email confirmación recibido: "¡Bienvenido a Pro! Tu suscripción está activa" |

---

## Hallazgos

### ✅ Hallazgo 1 — Stripe Checkout → Suscripción activa inmediata
Tras completar el pago en Stripe (test card 4242...), la redirección a `/module/zonacncplans/success` ocurre correctamente. La página de suscripción se actualiza de inmediato:
- **Plan:** Pro Activa
- **Precio:** 99€/mes
- **Próximo cobro:** 02/06/2026
- **Anuncios:** 0/10 activos
- **Sidebar:** Aparecen opciones nuevas: "Comerciales delegados", "Importar de Machineseeker (Plan pro · 0/20 este mes)"

### ⚠️ Hallazgo 2 — Billing page no refleja el pago (posible bug)
A pesar de que:
1. Stripe Checkout devolvió éxito ✅
2. La suscripción muestra "Pro Activa" ✅
3. El email de confirmación llegó ✅

**La página de facturas y pagos sigue mostrando:**
> "Sin movimientos todavía. Cuando contrates un plan o un pack Boost, los pasos aparecerán aquí."

**Posibles causas:**
- Stripe webhook de invoice no se procesó (no se generó la factura)
- La factura se genera en diferido (batch)
- Bug en test mode: el webhook no se dispara correctamente

**Riesgo:** Medio. Si esto ocurre en producción, el usuario no vería su factura en el panel aunque la suscripción esté activa y se haya cobrado correctamente.

### 🐛 Hallazgo 3 — Email de confirmación: "Anuncios incluidos: 1" incorrecto
El email de bienvenida a Pro (subject: `¡Bienvenido a Pro! Tu suscripción está activa`) muestra:
```
- Plan: Pro
- Periodo: monthly
- Cuota mensual: 99,00 €
- Anuncios incluidos: 1     ← INCORRECTO: debería ser 10
- Próxima renovación: 02/06/2026
```

El plan Pro incluye **10 anuncios activos**, no 1. El email template usa un valor incorrecto o está usando el valor genérico del Free plan.

### 🐛 Hallazgo 4 — Onboarding email: placeholders sin renderizar
El email "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos" contiene placeholders literales:
```
→ {vendor_dashboard_url}
Tu plan Pro permite hasta {max_listings} anuncios activos.
→ {new_ad_url}
```

Los placeholders `{vendor_dashboard_url}`, `{max_listings}` y `{new_ad_url}` no fueron reemplazados por valores reales, lo que indica que el template engine no procesó las variables.

### 📋 Hallazgo 5 — Sidebar evoluciona con el plan (correcto)
| Elemento | Free | Pro |
|----------|------|-----|
| Estadísticas | 🔒 lock (locked) | ✅ (unlocked) |
| Importar de Machineseeker | 🔒 lock + "Disponible en Pro/Business/Enterprise" | ✅ "Plan pro · 0/20 este mes" |
| Comerciales delegados | ❌ (no aparece) | ✅ (visible) |

Esto confirma que los permisos/gating de funcionalidades según plan funcionan correctamente.

### ⚠️ Hallazgo 6 — Fresh user redirección a vendor registration (confirmado)
Al igual que en el test del plan Starter (test7), un usuario sin vendor es redirigido correctamente a `/module/zonacncvendor/register` al intentar acceder a suscripción. No hay error ni pantalla en blanco. Consistente.

---

## Detalles Stripe Checkout

```
Plan:         Pro
Precio:       99.00€/month (o 990€/año — ahorra 198€)
Anuncios:     10 activos
Fotos:        20 por anuncio
Boosts:       8/mes incluidos
Merchant:     Veleta Comercializaciones y Servicios SLU (TEST MODE)
Email usado:  test8@zonacnc.com
Session ID:   cs_test_a17wRqA1Leg3el004KGY3HDCwcl3pbZi5XjXqWUhkcqc1BTP69NBXpmpTZ
Test Card:    4242 4242 4242 4242 (exp 12/30, CVC 123)
```

---

## Conclusión

El flujo de **Stripe Checkout para upgrade a Pro funciona correctamente**: el pago se procesa, la suscripción se activa y el email de confirmación llega. Sin embargo, hay **tres problemas identificados**:

| # | Severidad | Descripción |
|---|-----------|-------------|
| H2 | ⚠️ Medio | Billing page no muestra la factura tras el pago exitoso |
| H3 | 🐛 Bajo | Email de confirmación dice "Anuncios incluidos: 1" en vez de 10 |
| H4 | 🐛 Bajo | Email onboarding contiene placeholders sin renderizar |

Se recomienda:
1. Verificar que el webhook de Stripe Invoice esté generando correctamente los registros en `zonacncplans_billing`
2. Corregir el template del email de confirmación para que use `max_listings` del plan contratado
3. Revisar el template engine del email onboarding

---

## Screenshots

- `subscription-pro-active.png` — Página de suscripción mostrando Pro Activa (99€/mes)
- `billing-empty.png` — Página de facturas mostrando "Sin movimientos todavía" tras el pago
