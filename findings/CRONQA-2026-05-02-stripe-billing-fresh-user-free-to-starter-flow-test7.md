# CRONQA — Stripe Billing: Fresh Vendor Free → Starter Plan Checkout Flow

**Fecha:** 2026-05-02 12:14–12:30 UTC  
**Tester:** test7@zonacnc.com (nuevo usuario registrado + vendor)  
**Entorno:** new.zonacnc.com (MODO TEST)  
**Focus Area:** stripe-billing  
**Escenario:** 1 — Registro de usuario nuevo, registro vendor, navegación suscripción/facturas, upgrade a Starter vía Stripe Checkout

---

## Resumen

Se probó el flujo completo de **registro → vendor → suscripción → checkout Stripe** para un usuario sin plan previo. Este escenario **no** había sido cubierto en tests anteriores (todos usaban usuarios Enterprise test1/test3 con suscripciones activas).

---

## Flujo ejecutado

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Registro cuenta test7@zonacnc.com (web) | ✅ Cuenta creada |
| 2 | Navegar a /module/zonacncplans/subscription | 🔀 Redirigido a /module/zonacncvendor/register (vendor obligatorio) |
| 3 | Registro vendor (empresa, CIF, sector, ciudad, provincia, CP, teléfono) | ✅ Vendor registrado, redirigido a /dashboard?registered=1 |
| 4 | Subscription page (tras vendor register) | ✅ Free plan — 0/1 anuncios activos. Botón "Mejorar plan" |
| 5 | Billing page (/module/zonacncplans/billing) | ✅ "Sin movimientos todavía" con descripción y enlace "Ver mi suscripción" |
| 6 | Pricing page (/pricing) — click "Mejorar plan" | ⚠️ **Warning: "Completa tu dirección de facturación antes de contratar un plan. Necesitamos empresa y NIF/CIF para emitir las facturas."** |
| 7 | Completar dirección (calle, CP, ciudad, país, teléfono, DNI) | ✅ Dirección guardada, warning desaparece |
| 8 | Click "Contratar Starter" (39€/mes) | ✅ Checkout page — resumen correcto del plan |
| 9 | Checkout — "Proceder al pago" | ✅ Redirige a Stripe Checkout con sesión correcta |
| 10 | Stripe Checkout page | ✅ **Subscribe to Plan Starter — €39.00/month — 3 listings · 10 fotos · perfil público** |

---

## Hallazgos

### ✅ Hallazgo 1 — Fresh vendor sin suscripción: redirección correcta
Al navegar a `/module/zonacncplans/subscription` sin ser vendor, **el sistema redirige correctamente** a `/module/zonacncvendor/register`. No hay error ni pantalla en blanco.

### ✅ Hallazgo 2 — Empty state billing page
La página de facturas muestra el mensaje:  
> "Sin movimientos todavía. Cuando contrates un plan o un pack Boost, los pagos aparecerán aquí."  
Con enlace a "Ver mi suscripción". Correcto.

### ⚠️ Hallazgo 3 — Billing address obligatoria antes de contratar (gating correcto)
La pricing page bloquea la contratación hasta tener:
- Dirección de facturación con empresa + NIF/CIF
- DNI/NIF

Esto es un **gating correcto** porque Stripe requiere datos fiscales para emitir factura.  
Sin embargo, **el formulario de dirección pide datos que YA se recogieron en el vendor registration** (empresa, CIF). El usuario debe re-ingresarlos.

### ✅ Hallazgo 4 — Stripe Checkout Session creada correctamente
Al hacer clic en "Proceder al pago":
- Se crea una Stripe Checkout Session en test mode
- Redirige a `checkout.stripe.com/c/pay/cs_test_...`
- **El nombre del plan, precio (39.00€/month) y características son correctos**
- El merchant aparece como "Entorno de prueba de Veleta Comercializaciones y Servicios SLU"
- Acepta: Visa, Mastercard, AMEX, Apple Pay, Google Pay, Klarna

### ✅ Hallazgo 5 — Planes anuales disponibles
En el checkout, se puede cambiar a **plan anual a 390€/año (ahorro 78€)**. Selector mensual/anual funcional.

### 📋 Hallazgo 6 — Datos de facturación duplicados (UX)
Los datos de empresa y CIF/NIF se recogen en:
1. Vendor registration form
2. Address/billing form (vía el warning del pricing)

Esto crea fricción. Recomendación: precargar la dirección con los datos del vendor.

---

## Detalles Stripe Checkout

```
Plan:         Starter
Precio:       39.00€/month (o 390€/año)
Anuncios:     3 listings
Fotos:        10 fotos
Perfil:       público
Merchant:     Veleta Comercializaciones y Servicios SLU (TEST MODE)
Email usado:  test7@zonacnc.com
Session ID:   cs_test_a1T4ZWT0VNgZjnKyZGHPXHtaJPNoAevLtwLQKRy0b0x9fgxOPZ7LFKh96t
```

---

## Conclusión

El flujo completo de **fresh user → vendor → checkout Stripe** funciona correctamente.  
No se encontraron bugs funcionales ni regresivos.  
El gating de dirección de facturación es correcto aunque con fricción UX menor (datos duplicados).

**Riesgo bajo:** Stripe Checkout se integra correctamente para nuevos clientes en plan Starter.
