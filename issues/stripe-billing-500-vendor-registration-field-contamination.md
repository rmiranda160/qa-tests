---
title: "[stripe-billing] 500 Server Error en vendor registration por contaminación de campos"
labels: ["bug", "stripe-billing", "vendor-registration"]
---

## Descripción
Al llenar el formulario de registro vendor (`/es/module/zonacncvendor/register`) con valores rápidos/secuenciales, los campos intercambian valores: el valor de `city` se escribe en `phone` y el valor de `postal_code` se escribe en `description`. Esto provoca un **500 Server Error** al enviar el formulario.

## Pasos para reproducir
1. Crear cuenta nueva (e.g., test27@zonacnc.com)
2. Navegar a `/es/pricing` → "Contratar Starter"
3. Hacer clic en "Proceder al pago" (redirige a vendor registration)
4. Llenar todos los campos del formulario vendor rápidamente
5. Enviar formulario → **500 Server Error**

## Comportamiento esperado
El formulario debe procesarse correctamente, sin importar la velocidad de llenado de campos.

## Comportamiento actual
Los valores de los campos se contaminan entre sí, resultando en un error 500 del servidor.

## Evidencia
- Usuario: test27@zonacnc.com
- Flujo completo: Registration → Address → Vendor → Checkout → Stripe
- Stripe Checkout Session: `cs_test_a1hKQEn1qGLFU3svfYqgvtVuHhBaTyzVft6LJw4al3SOkGuM3xQMeTqz3s`
- Solución workaround: `clear()` antes de cada `fill()` evita el error

## Causa probable
Race condition entre llamadas asíncronas de llenado de formulario. `fill()` o `type()` no se completan antes de empezar el siguiente campo.

## Severidad
Media - No bloqueante (workaround existe), pero puede afectar usuarios con autofill.

## Entorno
- new.zonacnc.com (TEST MODE)
- Stripe pk_test_*
- Plan: Starter (39€/mes)
