# Stripe Billing CRON QA — Reporte 2026-05-02 18:44 UTC

## Resumen
**Resultado: ✅ PASS** — Flujo completo de registro → dirección de facturación → registro como vendedor → suscripción Business → Stripe Checkout → pago → verificación post-suscripción exitoso.

## Detalle del escenario

### Datos del usuario
| Campo | Valor |
|-------|-------|
| Email | test20@zonacnc.com |
| Nombre | QA Tester Stripe Billing |
| Empresa | QA Stripe Billing S.L. |
| CIF/NIF | B12345678 |
| Plan contratado | **Business** (199€/mes) |
| Método pago | Stripe Checkout (tarjeta test 4242...) |

### Pasos ejecutados

| # | Paso | Resultado |
|---|------|-----------|
| 1 | Registro de usuario (new.zonacnc.com) | ✅ Redirigido a homepage, sesión iniciada |
| 2 | Navegación a pricing | ✅ 5 planes visibles, banner de dirección de facturación presente |
| 3 | Rellenar dirección de facturación | ✅ Campos (Empresa, IVA, Dirección, CP, Ciudad, Teléfono, NIF) guardados correctamente |
| 4 | Selección plan Business (checkout) | ✅ Checkout page con Business plan |
| 5 | Registro como vendedor | ✅ Vendor ID 797, perfil verificado |
| 6 | Stripe Checkout (test card) | ✅ Pago procesado, redirigido a /success |
| 7 | Verificación suscripción | ✅ **Business Activa**, próximo cobro 02/06/2026, 199€/mes, 25/25 anuncios incluidos |

### Verificaciones post-suscripción
- Página de suscripción: ✅ "Business" con badge "Activa"
- Próximo cobro: ✅ 02/06/2026
- Precio: ✅ 199 €/mes
- Anuncios: ✅ 0 / 25 usados
- Sidebar "Importar de Machineseeker": ✅ Plan business · 0 / 100 este mes
- Facturas y pagos: ✅ Enlace disponible en menú lateral

### Tiempo total
- Inicio: 18:37 UTC
- Fin: 18:44 UTC
- Duración: ~7 minutos

### Observaciones
- **Bug de contaminación de campos**: El campo "Empresa" se replica en "NIF" y "IVA" contamina "Dirección" en el formulario de dirección de facturación. Mitigado limpiando cada campo antes de rellenar.
- **Bug de prellenado**: Nombre y apellidos aparecen pre-rellenos en el formulario de dirección.
- **Bug de contaminación email**: En Stripe Checkout el email se mostraba como "B12345678test20@zonacnc.com" (NIF contaminó el email).
- Post-registro como vendedor exitoso, se requiere vendor registration antes de suscribir.
