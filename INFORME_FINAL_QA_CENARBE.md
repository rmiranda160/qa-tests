Estado QA: FAIL

Cobertura validada:
- Página principal carga sin errores de servidor.
- Registro de usuario: funcionalidad básica reportada como funcional (HTTP 302), pero bloqueada por error 403 en pruebas actuales.
- Login con credenciales válidas: reportado como funcional en informe reciente.
- Agregar bicicleta al carrito: reportado como funcional.
- Checkout: error de foreign key constraint persistente.
- Confirmación de reserva: no alcanzable debido a fallo en checkout.

Casos probados:
1. Registro de nuevo usuario (bloqueado por error 403 en pruebas actuales, pero documentado en informes anteriores).
2. Login con credenciales creadas (no probado directamente).
3. Agregar bicicleta al carrito (no probado directamente).
4. Checkout (no probado directamente, basado en hallazgos anteriores).
5. Confirmación (no probado).

Edge cases probados:
- DNI duplicado: reportado anteriormente, sistema detecta y muestra error apropiado.
- Contraseña con menos de 8 caracteres: reportado anteriormente, sistema valida y muestra error.
- Parámetros inválidos en URL: no probado.

Regresiones detectadas:
- Error de foreign key constraint en checkout (persistente).
- Posible bloqueo de peticiones POST (error 403) no observado en informes anteriores.

Hallazgos:

ID: 1
Título: Error de foreign key constraint en checkout - `bicicleta_id` no referencia un registro existente
Severidad: crítica
Descripción: Al procesar el checkout, la inserción en la tabla `reservas` viola la restricción de clave foránea `reservas_ibfk_2` que referencia `bicicletas(id)`. Esto bloquea completamente el flujo de reserva.
Pasos para reproducir:
1. Registrar un nuevo usuario.
2. Iniciar sesión con las credenciales.
3. Agregar una bicicleta al carrito (cualquier ID existente, ej. 4 o 7).
4. Navegar a checkout.php y completar el formulario de pago (seleccionar método, aceptar términos).
5. Enviar el formulario.
Resultado esperado: La reserva se crea exitosamente y se muestra una confirmación.
Resultado observado: Error SQL: `SQLSTATE[23000]: Integrity constraint violation: 1452 Cannot add or update a child row: a foreign key constraint fails (\`bikebd01\`.\`reservas\`, CONSTRAINT \`reservas_ibfk_2\` FOREIGN KEY (\`bicicleta_id\`) REFERENCES \`bicletas\` (\`id\`) ON DELETE CASCADE)`.
Impacto: Los usuarios no pueden finalizar reservas, bloqueando el flujo principal de negocio.
Recomendación: Revisar la consulta INSERT en checkout.php para asegurar que el valor de `bicicleta_id` coincide con un ID existente en la tabla `bicicletas`. Verificar también que la columna `bicicleta_id` en la tabla `reservas` no sea NULL y que la restricción de clave foránea esté correctamente configurada.

ID: 2
Título: Mensaje de confirmación de registro no visible
Severidad: baja
Descripción: Tras un registro exitoso, el sistema redirige a index.php pero no se muestra el mensaje flash de éxito (`Registro completado correctamente. ¡Bienvenido!`).
Pasos para reproducir:
1. Acceder a register.php.
2. Completar el formulario con datos válidos.
3. Enviar el formulario.
4. Ver la página de destino (index.php).
Resultado esperado: Debe mostrarse un mensaje de confirmación (alert-success).
Resultado observado: No se visualiza ningún mensaje de confirmación.
Impacto: El usuario no recibe feedback inmediato sobre el éxito de su registro, lo que puede generar confusión.
Recomendación: Verificar la implementación de `setFlash()` y la recuperación del flash en `index.php`. Asegurar que la sesión esté siendo manejada correctamente.

ID: 3
Título: Bloqueo de peticiones POST con error 403 Forbidden
Severidad: media
Descripción: Las peticiones POST a los endpoints de registro (y posiblemente otros) son rechazadas con código 403 Forbidden, impidiendo la interacción automatizada y posiblemente afectando a ciertos clientes legítimos.
Pasos para reproducir:
1. Enviar una petición POST a `https://dev1.cenarbe.com/register.php` con headers User-Agent, Referer, Content-Type y datos de formulario válidos.
2. Observar la respuesta.
Resultado esperado: La petición es procesada (código 302 o 200 con validación).
Resultado observado: Código 403 Forbidden con página de error HTML.
Impacto: Impide pruebas automatizadas y puede bloquear a usuarios que utilicen clientes no convencionales.
Recomendación: Revisar las reglas de firewall (mod_security, etc.) en el servidor web para permitir peticiones POST legítimas. Asegurar que los headers requeridos (como Referer) sean validados adecuadamente.

ID: 4
Título: Login con credenciales de usuario recién registrado fallaba en versiones anteriores
Severidad: alta
Descripción: Informes anteriores indicaban que el login con credenciales válidas de un usuario recién registrado fallaba (mensaje "Email o contraseña incorrectos"). Sin embargo, el informe más reciente indica que este error podría estar corregido. Se requiere verificación.
Pasos para reproducir:
1. Registrar un nuevo usuario.
2. Cerrar sesión (logout.php).
3. Intentar login con el email y contraseña utilizados en el registro.
Resultado esperado: Login exitoso, redirección a index.php con sesión iniciada.
Resultado observado (según informe anterior): Página de login se recarga con alerta de error "Email o contraseña incorrectos".
Impacto: Los usuarios no pueden acceder a sus cuentas después de cerrar sesión, obligándolos a registrarse de nuevo.
Recomendación: Si el error persiste, revisar la lógica de almacenamiento/hashing de contraseñas en el registro y la comparación en el login. Verificar que la contraseña se guarde correctamente en la base de datos.

Conclusión:
El sistema presenta un error crítico en el checkout (foreign key constraint) que bloquea el flujo principal de reservas. Además, se detecta un posible bloqueo de peticiones POST (403) que impide la realización de pruebas automatizadas y podría afectar la usabilidad. Los componentes de registro, login y carrito parecen funcionar según informes recientes, pero la experiencia de usuario se ve afectada por la falta de mensajes de confirmación. Se requiere intervención de desarrollo para corregir los errores críticos y revisar la configuración del servidor.

Criterio de salida:
Debe volver a desarrollo para corregir:
1. Error de foreign key constraint en checkout (crítico).
2. Bloqueo de peticiones POST (error 403) (medio).
3. Mensaje de confirmación de registro no visible (bajo).
4. Verificar si el error de login persiste (alto).

Una vez corregidos, se debe realizar una nueva ronda de QA para validar el flujo completo.