# Informe QA - Correcciones Cenarbe Bike Rental
Fecha: 2026-03-18 UTC

## Estado QA: FAIL

## Cobertura validada:
- Warnings deprecados: no se detectaron en páginas principales (index, register, login, carrito).
- Registro de usuario: el registro funciona (HTTP 302), pero no se visualizó mensaje de confirmación.
- Carrito: agregar items funciona (HTTP 302), carrito muestra items correctamente.
- Checkout: error SQL de columna faltante (`horas_totales`).

## Casos probados:
1. Registro de nuevo usuario con datos únicos (email, DNI nuevos).
2. Login con credenciales creadas.
3. Agregar bicicleta al carrito (ID 7) con fechas futuras.
4. Intentar checkout con método de pago y términos aceptados.

## Edge cases probados:
- DNI duplicado: el sistema detecta y muestra error apropiado.
- Parámetro inválido en URL de bicicleta (id=abc): no genera warnings visibles.

## Regresiones detectadas:
- Error SQL en checkout: columna `horas_totales` no existe en la tabla `reservas`.

## Hallazgos:

### ID: 1
**Título:** Error SQL en checkout - columna 'horas_totales' no existe  
**Severidad:** crítica  
**Descripción:** Al procesar el checkout, la consulta INSERT intenta insertar en la columna `horas_totales`, que no existe en la tabla `reservas` según el esquema actual. Esto bloquea completamente el flujo de reserva.  
**Pasos para reproducir:**
1. Registrar un nuevo usuario.
2. Iniciar sesión con las credenciales.
3. Agregar una bicicleta al carrito.
4. Navegar a checkout.php y completar el formulario de pago (seleccionar método, aceptar términos).
5. Enviar el formulario.

**Resultado esperado:** La reserva se crea exitosamente y se muestra una confirmación.  
**Resultado observado:** Error SQL: `SQLSTATE[42S22]: Column not found: 1054 Unknown column 'horas_totales' in 'field list'`.  
**Impacto:** Los usuarios no pueden finalizar reservas, bloqueando el flujo principal de negocio.  
**Recomendación:** Revisar el esquema de la tabla `reservas` y ajustar la consulta en `checkout.php` para que coincidan las columnas. Posiblemente faltan también las columnas `subtotal`, `iva`, `total`.

### ID: 2
**Título:** Mensaje de confirmación de registro no visible  
**Severidad:** baja  
**Descripción:** Tras un registro exitoso, el sistema redirige a index.php pero no se muestra el mensaje flash de éxito (`Registro completado correctamente. ¡Bienvenido!`).  
**Pasos para reproducir:**
1. Acceder a register.php.
2. Completar el formulario con datos válidos.
3. Enviar el formulario.
4. Ver la página de destino (index.php).

**Resultado esperado:** Debe mostrarse un mensaje de confirmación (alert-success).  
**Resultado observado:** No se visualiza ningún mensaje de confirmación.  
**Impacto:** El usuario no recibe feedback inmediato sobre el éxito de su registro, lo que puede generar confusión.  
**Recomendación:** Verificar la implementación de `setFlash()` y la recuperación del flash en `index.php`. Asegurar que la sesión esté siendo manejada correctamente.

## Conclusión:
Las correcciones implementadas no resuelven el error crítico de SQL en el checkout. El sistema presenta un bloqueo funcional severo que impide completar reservas. Además, no se observaron warnings deprecados, lo cual es positivo. El registro y carrito funcionan, aunque la experiencia de usuario podría mejorarse con mensajes de confirmación visibles.

## Criterio de salida:
**Debe volver a desarrollo** para corregir el error de SQL y, opcionalmente, mejorar la visualización de mensajes flash.

---
*QA realizado por subagent pruebas-cenarbe-bike-correcciones*