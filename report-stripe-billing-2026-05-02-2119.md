# Stripe Billing CRON QA — Reporte 2026-05-02 21:19 UTC

## Resumen
**Resultado: ✅ PASS** — Flujo completo de registro → dirección de facturación → registro como vendedor → suscripción Pro → Stripe Checkout → pago → verificación post-suscripción exitoso.

Completa la cobertura de Stripe Checkout para los 5 planes (tras Starter, Business y Enterprise en informes anteriores).

## Detalle del escenario

### Datos del usuario
| Campo | Valor |
|-------|-------|
| Email | test23@zonacnc.com |
| Nombre | QA Tester Stripe Billing |
| Empresa | QA Stripe Pro S.L. |
| CIF/NIF | B87654321 |
| Plan contratado | **Pro** (99€/mes) |
| Método pago | Stripe Checkout (tarjeta test 4242...) |

### Pasos ejecutados

| # | Paso | Resultado |
|---|------|-----------|
| 1 | Registro de usuario (new.zonacnc.com) | ✅ Redirigido a homepage, sesión iniciada |
| 2 | Navegación a pricing | ✅ 5 planes visibles, banner de dirección de facturación presente |
| 3 | Rellenar dirección de facturación | ✅ Campos guardados correctamente |
| 4 | Selección plan Pro (checkout) | ✅ Checkout page con Pro plan |
| 5 | Proceder al pago → Vendor registration | ✅ Redirigido a registro de vendedor, vendor creado |
| 6 | Stripe Checkout (test card 4242...) | ✅ Pago procesado, redirigido a /success |
| 7 | Verificación suscripción | ✅ **Pro Activa**, próximo cobro 02/06/2026, 99€/mes, 0/10 anuncios |

### Verificaciones post-suscripción
- Página de suscripción: ✅ "Pro" con badge "Activa"
- Próximo cobro: ✅ 02/06/2026
- Precio: ✅ 99 €/mes
- Anuncios: ✅ 0 / 10 usados (10 incluidos en plan Pro)
- Sidebar "Importar de Machineseeker": ✅ Plan pro · 0 / 20 este mes
- Cambiar de plan: ✅ Enlace disponible
- Cancelar suscripción: ✅ Botón "Cancelar al final del período" visible

### Problemas encontrados (bugs conocidos)

| # | Bug | Descripción | Estado |
|---|-----|-------------|--------|
| 1 | Contaminación de campos (dirección facturación) | Al rellenar dirección, los valores de campos previos se replican en otros campos. Ej: "Empresa" aparece también en otros campos. | 🐛 Persiste |
| 2 | Formulario de Stripe Checkout — expansión de tarjeta | La sección de tarjeta (card number, expiry, CVC) está colapsada inicialmente en un acordeón "compact". Es necesario hacer clic en el botón oculto "Pay with card" para expandirla. El botón no es visible/clicable por Playwright normal; requiere `element.click()` via JavaScript. | 🐛 Nuevo |
| 3 | `page.fill()` no funciona en campos de tarjeta Stripe | Los campos de número de tarjeta, expiry y CVC de Stripe Checkout no aceptan `page.fill()` de Playwright. Es necesario usar `page.type()` con delay para que Stripe detecte los valores correctamente. | 🐛 Nuevo |
| 4 | Requisito de registro como vendedor | El sistema redirige a registro de vendedor antes de permitir Stripe Checkout. Si no se completa, se queda en bucle. | ⚠️ Diseño |
| 5 | Stripe Checkout — campos de tarjeta DOM directos | En esta versión de Stripe Checkout (embedded), los campos de tarjeta (cardNumber, cardExpiry, cardCvc) NO están en iframes de Stripe Elements; son inputs HTML normales dentro del DOM de la página de checkout. Esto difiere de implementaciones anteriores. | 🐛 Nuevo |

### Tiempo total
- Inicio: ~21:02 UTC
- Fin: ~21:19 UTC
- Duración: ~17 minutos

### Observaciones adicionales
- Se usó test23@zonacnc.com tras comprobar que los emails test7-test22 ya estaban registrados.
- El registro JS bypass (page.evaluate() para password) sigue siendo necesario por el bug de contaminación de campos.
- El checkout de Stripe Checkout versión embedded muestra los campos de tarjeta directamente en el DOM (no en iframes como en versiones anteriores).
- La expansión del acordeón de tarjeta requiere JavaScript para activar el botón "Pay with card" oculto.
- País por defecto en Stripe: "France" — hubo que cambiarlo a "Spain" manualmente.
