# Stripe Billing — Bugs encontrados en flujo Free→Pro

**Origen:** CRON QA `tester-stripe-billing` — 2026-05-02  
**Tester:** test8@zonacnc.com | **Entorno:** new.zonacnc.com (MODO TEST)

---

## Bug 1: Billing page no muestra factura tras pago exitoso

**Severidad:** ⚠️ Media  
**Componente:** `zonacncplans` → módulo billing

### Descripción
Tras completar el checkout Stripe para el plan Pro (99€/mes), la suscripción se activa correctamente (prox. cobro 02/06/2026, "Pro Activa"), el email de confirmación llega, pero la página **Facturas y pagos** (`/module/zonacncplans/billing`) sigue mostrando:

> "Sin movimientos todavía. Cuando contrates un plan o un pack Boost, los pagos aparecerán aquí."

### Pasos para reproducir
1. Login como usuario con plan Free + vendor registrado
2. Completar dirección de facturación
3. Contratar plan Pro (99€/mes) via Stripe Checkout
4. Pago exitoso con test card (4242...)
5. Navegar a `/module/zonacncplans/billing`

### Resultado esperado
La factura del primer pago (99€) aparece en el histórico de facturas.

### Resultado actual
"Sig movimientos todavía" — no se genera ningún registro de factura.

### Posible causa
- Stripe webhook `invoice.payment_succeeded` no se procesa o no genera registro en `zonacncplans_billing`
- La factura puede generarse en batch (diferido)

---

## Bug 2: Email confirmación — "Anuncios incluidos: 1" incorrecto

**Severidad:** 🐛 Baja  
**Componente:** Plantilla email `¡Bienvenido a Pro! Tu suscripción está activa`

### Descripción
El email de confirmación de plan Pro muestra:
```
- Anuncios incluidos: 1
```
Debe ser **10** (el plan Pro incluye 10 anuncios activos).

### Impacto
Confunde al usuario que contrata Pro, haciéndole pensar que solo tiene 1 anuncio cuando realmente dispone de 10.

### Causa probable
El template usa una variable fija o el valor del plan Free en lugar del `max_listings` del plan contratado.

---

## Bug 3: Email onboarding con placeholders sin renderizar

**Severidad:** 🐛 Baja  
**Componente:** Plantilla email "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"

### Descripción
El email de onboarding post-compra contiene placeholders literales sin reemplazar:

```
→ {vendor_dashboard_url}
Tu plan Pro permite hasta {max_listings} anuncios activos.
→ {new_ad_url}
```

### Impacto
El usuario ve texto técnico en lugar de enlaces funcionales, reduciendo la efectividad del onboarding.

### Causa probable
- Las variables no se pasaron al template engine
- El template usa una sintaxis incorrecta

---

## Archivos relacionados

- `findings/CRONQA-2026-05-02-stripe-billing-free-to-pro-flow-test8.md` — Reporte completo del test
- Commit: `791606c`
