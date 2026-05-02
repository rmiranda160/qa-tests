# Informe QA - Prueba Cenarbe Bike Rental después de subida de cambios
Fecha: 2026-03-18 UTC

## Estado QA: FAIL

## Cobertura validada:
- Registro de usuario: funciona (HTTP 302, autenticación automática).
- Agregar ítem al carrito: funciona (HTTP 302, mensaje de confirmación).
- Checkout: error de foreign key constraint (SQLSTATE[23000]).
- Login con usuario creado: no funciona (credenciales incorrectas).

## Casos probados:
1. Registro de nuevo usuario con datos únicos (email, DNI nuevos) y contraseña >=8 caracteres.
2. Verificación de autenticación automática post-registro (index.php muestra nombre de usuario).
3. Agregar bicicleta al carrito (ID 4) con fechas por defecto (2026-03-18 a 2026-03-19) y horas=4.
4. Intentar checkout con método de pago "tarjeta" y términos aceptados.

## Edge cases probados:
- Registro con contraseña de 7 caracteres: error de validación (mensaje "La contraseña debe tener al menos 8 caracteres").
- DNI duplicado: no probado (riesgo de colisión).

## Regresiones detectadas:
- Error de foreign key constraint en checkout (nuevo, no observado en informe anterior).
- Login con credenciales de usuario recién registrado no funciona (posible regresión o bug existente).

## Hallazgos:

### ID: 1
**Título:** Login falla con credenciales de usuario recién registrado  
**Severidad:** alta  
**Descripción:** Después de un registro exitoso (redirección 302), el usuario queda autenticado automáticamente (sesión iniciada). Sin embargo, al intentar iniciar sesión posteriormente con las mismas credenciales (email y contraseña), el sistema responde con mensaje "Email o contraseña incorrectos".  
**Pasos para reproducir:**
1. Registrar un nuevo usuario con contraseña válida (≥8 caracteres).
2. Cerrar sesión (logout.php) o usar un navegador sin cookies.
3. Intentar login con el email y contraseña utilizados en el registro.
4. Observar la respuesta.

**Resultado esperado:** Login exitoso, redirección a index.php con sesión iniciada.  
**Resultado observado:** Página de login se recarga con alerta de error "Email o contraseña incorrectos".  
**Impacto:** Los usuarios no pueden acceder a sus cuentas después de cerrar sesión, obligándolos a registrarse de nuevo.  
**Recomendación:** Revisar la lógica de almacenamiento/hashing de contraseñas en el registro y la comparación en el login. Verificar que la contraseña se guarde correctamente en la base de datos.

### ID: 2
**Título:** Error de foreign key constraint en checkout (bicicleta_id)  
**Severidad:** crítica  
**Descripción:** Al procesar el checkout, la inserción en la tabla `reservas` falla por una violación de restricción de clave foránea: la columna `bicicleta_id` referencia a la tabla `bicicletas` pero el valor insertado no existe en dicha tabla (o es NULL). El error SQL específico es: `SQLSTATE[23000]: Integrity constraint violation: 1452 Cannot add or update a child row: a foreign key constraint fails (\`bikebd01\`.\`reservas\`, CONSTRAINT \`reservas_ibfk_2\` FOREIGN KEY (\`bicicleta_id\`) REFERENCES \`bicicletas\` (\`id\`) ON DELETE CASCADE)`.  
**Pasos para reproducir:**
1. Registrar un nuevo usuario (o usar uno autenticado).
2. Agregar una bicicleta al carrito (ej. ID 4 o 7).
3. Navegar a checkout.php.
4. Seleccionar método de pago (ej. tarjeta) y aceptar términos.
5. Enviar el formulario.

**Resultado esperado:** La reserva se crea exitosamente y se muestra una confirmación.  
**Resultado observado:** Error SQL de foreign key constraint, se muestra alerta roja en la página de checkout.  
**Impacto:** Los usuarios no pueden finalizar reservas, bloqueando el flujo principal de negocio.  
**Recomendación:** Revisar la relación entre el carrito de compras y la tabla `bicicletas`. Asegurar que el `bicicleta_id` pasado al checkout corresponde a un registro existente en `bicicletas`. También verificar que la inserción en `reservas` incluya el `bicicleta_id` correcto y no esté siendo alterado/nuleado por algún trigger o lógica intermedia.

### ID: 3
**Título:** Mensaje de confirmación de registro no visible  
**Severidad:** baja  
**Descripción:** Tras un registro exitoso, el sistema redirige a index.php pero no se muestra el mensaje flash de éxito. Esto ya fue reportado en el informe anterior y persiste.  
**Pasos para reproducir:**
1. Acceder a register.php.
2. Completar el formulario con datos válidos (contraseña ≥8 caracteres).
3. Enviar el formulario.
4. Ver la página de destino (index.php).

**Resultado esperado:** Debe mostrarse un mensaje de confirmación (alert-success).  
**Resultado observado:** No se visualiza ningún mensaje de confirmación.  
**Impacto:** El usuario no recibe feedback inmediato sobre el éxito de su registro, lo que puede generar confusión.  
**Recomendación:** Verificar la implementación de `setFlash()` y la recuperación del flash en `index.php`. Asegurar que la sesión esté siendo manejada correctamente.

## Conclusión:
Los cambios subidos no resuelven el bloqueo funcional del checkout; por el contrario, introducen un nuevo error de foreign key constraint. Además, el login con credenciales de usuario recién registrado no funciona, lo que impide el acceso posterior a la cuenta. El registro y el carrito funcionan correctamente, pero la experiencia de usuario se ve afectada por la falta de mensajes de confirmación.

## Criterio de salida:
**Debe volver a desarrollo** para corregir:
1. Error de foreign key constraint en checkout.
2. Fallo de login con credenciales válidas.
3. (Opcional) Mejora de visualización de mensajes flash.

---
*QA realizado por subagent prueba-cenarbe-despues-subida*