# CRONQA — Stripe Billing: Fresh User → Vendor → Enterprise Plan Checkout Flow

**Fecha:** 2026-05-02 14:40–14:51 UTC  
**Tester:** test21@zonacnc.com (nuevo registro completo)  
**Entorno:** new.zonacnc.com (MODO TEST)  
**Focus Area:** stripe-billing  
**Escenario:** 1 — Registro completo de usuario nuevo → vendor → Enterprise (299€/mes) vía Stripe Checkout, verificación suscripción activa

---

## Resumen

Se probó el flujo completo de **registro de usuario → vendor registration → Enterprise plan checkout → Stripe payment → suscripción activa**. Este es el plan de mayor valor (299€/mes) y no había sido testeado en flujo completo desde registro de usuario nuevo. Los tests previos cubrían Starter y Pro con usuarios preexistentes.

---

## Flujo ejecutado

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Registro nuevo usuario test21@zonacnc.com (Sr., QA Tester Stripe, Billing, QA Stripe Billing S.L., B12345678) | ✅ Registro exitoso, redirigido a homepage logueado |
| 2 | Navegar a /es/pricing para contratar Enterprise | ⚠️ Redirigido con warning de dirección de facturación incompleta |
| 3 | Completar dirección facturación (Oficina, QA Tester Stripe Billing, QA Stripe Billing S.L., Calle Principal 123, 28001 Madrid, Madrid, España) | ✅ Dirección guardada |
| 4 | Navegar a /module/zonacncplans/checkout?plan=enterprise | ✅ Checkout page — resumen Enterprise (299€/mes) |
| 5 | Click "Proceder al pago" | 🔀 Redirigido a /module/zonacncvendor/register (vendor obligatorio) |
| 6 | Registro vendor (QA Stripe Billing S.L., B12345678, Mecanizado CNC, Madrid, 28001, +34666000000) | ✅ Vendor registrado, redirigido a /dashboard?registered=1 |
| 7 | Navegar nuevamente a /module/zonacncplans/checkout?plan=enterprise | ✅ Checkout page — resumen Enterprise (299€/mes) |
| 8 | Click "Proceder al pago" → Stripe Checkout | ✅ Stripe Checkout carga correctamente (entorno sandbox) |
| 9 | Stripe Checkout — test card 4242 4242 4242 4242 (exp 12/34, CVC 123), cardholder QA Tester Stripe Billing, Spain | ✅ Pago procesado exitosamente |
| 10 | Redirect a /module/zonacncplans/success?session_id=cs_test_a1hfRbFsyKGZ9L87neLVtwPhDN1HhW6st6yfjr50adZYx3SBJlQFzmNOBi | ✅ "Suscripción activada — ¡Tu plan se ha activado correctamente!" |
| 11 | Subscription page post-pago | ✅ **Enterprise Activa — 299€/mes — Próximo cobro: 02/06/2026 — 0/100 anuncios** |

---

## Hallazgos

### ✅ Hallazgo 1 — Stripe Checkout → Suscripción Enterprise activa inmediata
Tras completar el pago en Stripe (test card 4242...), la redirección a `/module/zonacncplans/success` ocurre correctamente. La página de suscripción se actualiza de inmediato:
- **Plan:** Enterprise Activa
- **Precio:** 299€/mes
- **Próximo cobro:** 02/06/2026
- **Anuncios:** 0/100 activos
- **Sidebar:** Aparece opción "Importar de Machineseeker (Plan enterprise · cuota ilimitada)"

### ⚠️ Hallazgo 2 — Flujo de checkout redirige a vendor registration antes de Stripe
Confirmado que, al hacer clic en "Proceder al pago" sin tener vendor registrado, el sistema redirige correctamente a `/module/zonacncvendor/register`. Sin embargo, **no hay mensaje informativo** explicando al usuario que debe registrarse como vendedor primero. Sería mejor UX mostrar un mensaje tipo "Para contratar un plan, primero debes registrarte como vendedor" en lugar de una redirección silenciosa.

**Severidad:** Baja — UX mejorable

### ✅ Hallazgo 3 — Enterprise incluye cuota ilimitada de importación
En el sidebar de la cuenta aparecen:
- "Importar de Machineseeker (Plan enterprise · cuota ilimitada)" ✅

Comparado con test previo en Pro que mostraba "Plan pro · 0/20 este mes", esto confirma que el límite de importación se ajusta correctamente al plan contratado.

### ⚠️ Hallazgo 4 — Dos intentos de checkout necesarios (1→vendor reg, 2→Stripe)
Un usuario nuevo que quiere contratar Enterprise necesita:
1. Ir a checkout (redirigido a vendor registration)
2. Registrarse como vendor
3. Volver a checkout manualmente
4. Proceder a Stripe

**Esto no es un bug**, pero la UX podría mejorarse: si el sistema detecta que el usuario no es vendor, podría redirigir a vendor registration **primero** (antes de llegar a checkout), o mostrar un enlace claro en la página de precios.

### ✅ Hallazgo 5 — Billing address saved from registration form
Los datos de dirección de facturación (Calle Principal 123, 28001 Madrid) se guardaron correctamente cuando se completaron desde el warning de dirección. No hubo pérdida de datos ni errores.

---

## Detalles Stripe Checkout

```
Plan:         Enterprise
Precio:       299.00€/month (o 2.990€/año — ahorra 598€)
Anuncios:     100 activos
Fotos:        50 por anuncio
Boosts:       60/mes incluidos
Merchant:     Veleta Comercializaciones y Servicios SLU (TEST MODE)
Email usado:  test21@zonacnc.com
Session ID:   cs_test_a1hfRbFsyKGZ9L87neLVtwPhDN1HhW6st6yfjr50adZYx3SBJlQFzmNOBi
Test Card:    4242 4242 4242 4242 (exp 12/34, CVC 123)
```

---

## Conclusión

El flujo de **Stripe Checkout para Enterprise (299€/mes) funciona correctamente**: el registro de usuario, registro vendor, pago y activación de suscripción se completan sin errores. No se identificaron bugs críticos o funcionales.

| # | Severidad | Descripción |
|---|-----------|-------------|
| H2 | ⚠️ Baja | UX mejorable: checkout → vendor registration sin mensaje informativo |
| H4 | ⚠️ Baja | Usuario necesita 2 intentos de checkout (1° vendor reg, 2° Stripe) |

Se recomienda:
1. Añadir mensaje informativo al redirigir a vendor registration desde checkout
2. Considerar redirigir a vendor registration desde pricing si el usuario no es vendor

---

## Notas adicionales

- El checkbox "I am an AI agent acting on behalf of someone else" estaba presente en Stripe Checkout y se marcó durante el test
- Stripe Checkout mostraba opciones de pago: Card, Klarna, Link, Amazon Pay
- El entorno de prueba tenía banner visible "⚠️ MODO TEST — entorno de pruebas"
