# CRONQA — Stripe Billing: Fresh Vendor Free → Starter Plan Checkout Flow (test27)

**Fecha:** 2026-05-02 13:30–13:55 UTC  
**Tester:** test27@zonacnc.com (nuevo usuario registrado + vendor)  
**Entorno:** new.zonacnc.com (MODO TEST)  
**Focus Area:** stripe-billing  
**Escenario:** 1 — Registro de usuario nuevo, registro vendor, navegación suscripción/facturas, upgrade a Starter vía Stripe Checkout

---

## Resumen

Se probó el flujo completo de **registro → vendor → suscripción → checkout Stripe** para un usuario sin plan previo (réplica del test test7 para verificar consistencia).

---

## Flujo ejecutado

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Registro cuenta test27@zonacnc.com (web) | ✅ Cuenta creada, redirigido a homepage |
| 2 | Navegar a /es/pricing | ✅ Todos los planes visibles, warning dirección facturación presente |
| 3 | Completar dirección facturación (empresa, NIF, dirección, ciudad, CP) | ✅ Dirección guardada, warning desaparece |
| 4 | Click "Contratar Starter" (39€/mes) | ✅ Checkout page — resumen correcto del plan |
| 5 | Click "Proceder al pago" | 🔀 Redirigido a /module/zonacncvendor/register (vendor obligatorio) |
| 6 | Registro vendor (compañía, CIF, sector, ciudad, provincia, CP, teléfono) | ⚠️ **Primer intento: 500 Server Error** — campos city→phone y postal_code→description contaminados |
| 7 | Reintento registro vendor (campos limpiados + llenado atómico) | ✅ Vendor registrado, redirigido a /dashboard?registered=1 |
| 8 | Volver a /es/module/zonacncplans/checkout?plan=starter | ✅ Checkout page — resumen correcto |
| 9 | Click "Proceder al pago" (ahora como vendor) | ✅ Stripe Checkout session creada |
| 10 | Stripe Checkout page | ✅ Subscribe to Plan Starter — €39.00/month — email test27@zonacnc.com |

---

## Hallazgos

### ⚠️ Hallazgo A — 500 Server Error en vendor registration por contaminación de campos
- **Severidad:** Media
- **URL:** `/es/module/zonacncvendor/register`
- **Descripción:** Tras llenar el formulario de registro vendor con llamadas `.type()` secuenciales, varios campos intercambiaron valores: el valor de `city` terminó en `phone`, y el valor de `postal_code` terminó en `description`. Esto provocó un error 500 en el servidor.
- **Causa probable:** Las llamadas `clear()` y `fill()` asíncronas no se completaron antes de pasar al siguiente campo, o el order de las promesas causó una race condition en el llenado del formulario.
- **Solución:** Usar un bloque único con `await` explícito para cada campo y `clear()` + `fill()` en secuencia resolvió el problema.
- **Impacto:** Funcionalidad ok con llenado correcto, pero podría afectar a usuarios con autofill lento o conexiones lentas.

### ✅ Hallazgo B — Stripe Checkout (test mode) funcional
- Stripe Checkout session creada correctamente con parámetros correctos
- Plan: Starter, 39.00€/month
- Email del usuario pre-poblado
- **Sandbox/Test mode confirmado** (pk_test_* key)
- Merchant: "Entorno de prueba de Veleta Comercializaciones y Servicios SLU"
- Métodos de pago disponibles: Card, Klarna, Amazon Pay, Link

### ✅ Hallazgo C — Flujo completo consistente con test7
Los resultados replican exactamente los del test con test7@zonacnc.com:
- Misma secuencia de pasos
- Misma UI/UX observada
- Stripe Checkout con misma estructura de sesión
- Confirmación de que el flujo es consistente entre diferentes usuarios

---

## Detalles Stripe Checkout

```
Plan:         Starter
Precio:       39.00€/month (o 390€/año)
Anuncios:     3 listings
Fotos:        10 fotos
Perfil:       público
Merchant:     Veleta Comercializaciones y Servicios SLU (TEST MODE)
Email usado:  test27@zonacnc.com
Session ID:   cs_test_a1hKQEn1qGLFU3svfYqgvtVuHhBaTyzVft6LJw4al3SOkGuM3xQMeTqz3s
```

---

## Conclusión

El flujo completo de **fresh user → vendor → checkout Stripe** funciona correctamente. Se identificó un issue de **contaminación de campos en vendor registration** que causa 500 error cuando los campos se llenan de forma rápida/secuencial. Este bug podría afectar a usuarios con autofill automático.

**Riesgo:** Bajo-Medio. La funcionalidad core es correcta, pero el bug de contaminación de campos en vendor registration puede causar confusión.
