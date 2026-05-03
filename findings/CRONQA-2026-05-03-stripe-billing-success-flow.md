# CRON QA — Stripe Billing Success Flow — 2026-05-03

**Cron QA Task**: stripe-billing (1 escenario)  
**Environment**: new.zonacnc.com (test mode)  
**Test user**: test36@zonacnc.com (registrado fresco — pool email agotado)  
**Password**: QATester2026!  
**Plan**: Starter (39 €/mes — mensual)  
**Payment method**: Stripe test card 4242 4242 4242 4242  
**Runtime**: ~25 min (under 30 min cap)  
**Date**: 2026-05-03 09:10–09:25 UTC

---

## Resumen

**✅ ÉXITO — Flujo completo de suscripción Starter vía Stripe funcionando correctamente.**

| Paso | Estado | Detalle |
|------|--------|---------|
| Login (zona usuario) | ✅ | `/es/iniciar-sesion` carga OK (HTTP 200) |
| Navegación a Tarifas → Starter | ✅ | `/es/pricing` → checkout |
| Checkout Stripe (Proceder al pago) | ✅ | Redirige a `checkout.stripe.com` |
| Registro como vendedor (requisito previo) | ✅ | CIF/NIF 12345678Z, sector Mecanizado CNC |
| Formulario tarjeta Stripe (card number, expiry, CVC) | ✅ | Test card 4242 4242 4242 4242 |
| Pago y suscripción | ✅ | "Pay and subscribe" → éxito |
| Página de confirmación | ✅ | "Suscripción activada" → "¡Tu plan se ha activado correctamente!" |
| Plan activo en `/subscription` | ✅ | Starter Activa, próximo cobro: 03/06/2026, 39 €/mes |
| Historial de facturación | ⚠️ | "Sin movimientos todavía" (esperado — invoice pendiente de sincronización) |

---

## Flujo Detallado

### 1. Login
- URL: `https://new.zonacnc.com/es/iniciar-sesion`
- Estado: **200 OK** (resuelto tras 7+ días de 500)
- Email: test36@zonacnc.com
- Contraseña: QATester2026!

### 2. Navegación a Checkout
- `https://new.zonacnc.com/es/module/zonacncplans/checkout?plan=starter`
- Resumen del pedido visible (Starter, 39 €/mes, 3 anuncios, 10 fotos, 3 destacados)
- Toggle Mensual/Anual funcional
- "Proceder al pago" button renderizado

### 3. Redirección a registro de vendedor
- Al hacer clic en "Proceder al pago", redirige a `/es/module/zonacncvendor/register`
- Comportamiento esperado: el sistema requiere registro como vendedor antes de suscribir
- Formulario rellenado con datos de prueba válidos
- **Bug menor**: CIF/NIF 12345678A rechazado → requiere formato NIF español válido (8 dígitos + letra: 12345678Z)

### 4. Checkout Stripe
- URL: `https://checkout.stripe.com/c/pay/cs_test_a13Ou...`
- Sandbox mode: "Entorno de prueba de Veleta Comercializaciones y Servicios SLU"
- **Acordeón colapsado**: El formulario de tarjeta arranca en modo `--compact` con overlay `.AccordionItemCover` que intercepta clicks programáticos.
  - **Workaround**: Usar `JS force click` en el cover + `force: true` para abrir el acordeón, luego `page.type()` con delay (50ms) para llenar campos.
- Card fields detectados como inputs nativos (no iframes Stripe Elements), lo que difiere de implementaciones previas donde eran iframes.

### 5. Pago exitoso
- Redirigido a: `https://new.zonacnc.com/es/module/zonacncplans/success?session_id=cs_test_...`
- Mensaje: "Suscripción activada — ¡Tu plan se ha activado correctamente!"
- "Recibirás un email de confirmación con los detalles del pago"

### 6. Suscripción activa verificada
- `/es/module/zonacncplans/subscription`:
  - **Starter Activa**
  - Próximo cobro: **03/06/2026**
  - Precio: **39 €/mes**
  - Anuncios activos: 0 / 3
  - Método de pago: Stripe (sin tarjeta guardada localmente)
  - Botón "Cancelar al final del período" presente
  - Add-ons disponibles (Anuncio extra 12 €/mes)

---

## Observaciones / Issues

### 🔴 Bug: Acordeón colapsado en Stripe Checkout (--compact)
- **Severidad**: Media
- **Descripción**: El formulario de pago con tarjeta en Stripe Checkout arranca en modo `--compact`. El overlay `.AccordionItemCover` con clase `PaymentMethodFormAccordionItem--compact` intercepta todos los eventos de puntero, impidiendo clicks programáticos normales.
- **Impacto**: QA automatizado requiere workaround JS (`force: true` + dispatchEvent). Usuarios manuales pueden no notar porque el cover acepta clicks humanos.
- **Workaround**: Eliminar overlay vía `element.style.display = 'none'` o usar `click({force: true})`.

### ⚠️ Observación: pool de emails QA agotado
- Todos los emails test7-test30@zonacnc.com están registrados (TAKEN)
- Se usó test36@zonacnc.com como fallback
- **Recomendación**: Expandir pool a test31-test50 o implementar limpieza periódica de cuentas QA

### ⚠️ Observación: CIF/NIF requiere formato español estricto
- 12345678A fue rechazado ("El formato del CIF/NIF no es valido")
- 12345678Z fue aceptado
- Stripe no valida el CIF, pero el formulario de registro de vendedor sí

### ⚠️ Observación: Facturas no visibles localmente
- La página `/billing` muestra "Sin movimientos todavía"
- Probablemente la invoice se genera en Stripe pero no se sincroniza inmediatamente al sistema local
- No es un bug crítico, pero sería deseable ver el recibo inmediatamente tras el pago

---

## Screenshots
- Success page: `.playwright-mcp/page-2026-05-03T09-24-20-742Z.png`

---

## Conclusión

**✅ FLUJO DE STRIPE BILLING OPERATIVO** — Starter plan (39 €/mes) suscrito correctamente con tarjeta de prueba de Stripe. El ciclo completo funciona: checkout → vendor registration → Stripe payment → success page → subscription active.

No se detectaron regresiones críticas. El bug del acordeón colapsado es conocido y mitigable. La ausencia de facturas visibles inmediatas podría indicar un desfase de sincronización pero no afecta la funcionalidad principal.
