# Informe QA - Cambios actuales Cenarbe Bike
Fecha: 2026-03-18 UTC

## Estado QA: FAIL

## Cobertura validada:
- Página principal carga sin errores de servidor.
- Registro de usuario funciona (HTTP 302, sesión iniciada).
- Login con credenciales válidas funciona (HTTP 302, sesión iniciada).
- Agregar bicicleta al carrito funciona (HTTP 302, carrito muestra items).
- Checkout: error de foreign key constraint persiste.

## Casos probados:
1. Registro de nuevo usuario con datos únicos (email, DNI nuevos).
2. Login con credenciales creadas.
3. Agregar bicicleta al carrito (IDs 7 y 4) con fechas futuras.
4. Intentar checkout con método de pago (tarjeta) y términos aceptados.

## Edge cases probados:
- DNI duplicado: no probado (no pertinente para el objetivo actual).
- Parámetros inválidos en URL: no probado.

## Regresiones detectadas:
- Ninguna (el error de columna `horas_totales` reportado anteriormente ya no aparece).

## Hallazgos:

### ID: 1
**Título:** Error de foreign key constraint en checkout - `bicicleta_id` no referencia un registro existente  
**Severidad:** crítica  
**Descripción:** Al procesar el checkout, la inserción en la tabla `reservas` viola la restricción de clave foránea `reservas_ibfk_2` que referencia `bicicletas(id)`. El error indica que no se puede agregar o actualizar una fila hija porque la clave foránea falla. Esto bloquea completamente el flujo de reserva.  
**Pasos para reproducir:**
1. Registrar un nuevo usuario.
2. Iniciar sesión con las credenciales.
3. Agregar una bicicleta al carrito (cualquier ID existente, ej. 4 o 7).
4. Navegar a checkout.php y completar el formulario de pago (seleccionar método, aceptar términos).
5. Enviar el formulario.

**Resultado esperado:** La reserva se crea exitosamente y se muestra una confirmación.  
**Resultado observado:** Error SQL: `SQLSTATE[23000]: Integrity constraint violation: 1452 Cannot add or update a child row: a foreign key constraint fails (\`bikebd01\`.\`reservas\`, CONSTRAINT \`reservas_ibfk_2\` FOREIGN KEY (\`bicicleta_id\`) REFERENCES \`bicicletas\` (\`id\`) ON DELETE CASCADE)`.  
**Impacto:** Los usuarios no pueden finalizar reservas, bloqueando el flujo principal de negocio.  
**Recomendación:** Revisar la consulta INSERT en checkout.php para asegurar que el valor de `bicicleta_id` coincide con un ID existente en la tabla `bicicletas`. Verificar también que la columna `bicicleta_id` en la tabla `reservas` no sea NULL y que la restricción de clave foránea esté correctamente configurada.

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
Los cambios implementados han corregido el error de columna faltante (`horas_totales`) pero persiste un error crítico de foreign key constraint en el checkout. El sistema sigue bloqueando el flujo principal de reservas. Además, no se observaron warnings deprecados. El registro, login y carrito funcionan correctamente, aunque la experiencia de usuario podría mejorarse con mensajes de confirmación visibles.

## Criterio de salida:
**Debe volver a desarrollo** para corregir el error de foreign key constraint y, opcionalmente, mejorar la visualización de mensajes flash.

---
*QA realizado por subagent testear-cambios-cenarbe-actuales*