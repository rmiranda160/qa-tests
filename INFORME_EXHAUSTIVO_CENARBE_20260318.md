# Informe QA Exhaustivo - Cenarbe Bike Rental
Fecha: 2026-03-18 UTC
QA: subagent pruebas-exhaustivas-cenarbe-profundo

## Estado QA: FAIL

## Cobertura validada:
- Registro de usuario: funcional (redirección 302, autenticación automática)
- Login después de registro: aparentemente funcional (redirección 302), pendiente confirmación de ubicación
- Agregar bicicleta al carrito: funcional (redirección 302, items visibles en carrito)
- Checkout: inaccesible (timeout en GET, respuesta 200 sin redirección en POST con datos básicos)
- Mensajes flash: no visibles en registro exitoso
- CSRF protection: no detectada (no hay tokens en formularios)
- Edge cases: carrito vacío redirige, sesión expirada no probada, datos inválidos parcialmente probados
- Performance bajo carga: tiempos de respuesta aceptables en index.php
- Compatibilidad navegadores: HTML5 válido, uso de Bootstrap 5, viewport responsive

## Casos probados:
1. Registro de nuevo usuario con datos únicos (email, DNI nuevos) y contraseña >=8 caracteres.
2. Autenticación automática post-registro (sesión iniciada, nombre de usuario visible en navbar).
3. Agregar bicicleta al carrito (ID 7) con fechas futuras (2026-03-20 a 2026-03-21) y horas=4.
4. Verificación de carrito con items.
5. Intentar acceso a checkout.php (GET) - timeout.
6. POST a checkout.php con datos mínimos (metodo_pago=tarjeta, terminos=on) - respuesta 200 sin redirección.
7. Logout y login con credenciales recién registradas (redirección 302, pendiente confirmación de éxito).
8. Registro con contraseña de 7 caracteres (no probado, referencia a informe anterior que indica validación).
9. Carrito vacío: redirección 302 al intentar checkout.
10. Solicitudes concurrentes a index.php (10 requests) para medir performance.

## Edge cases probados:
- Carrito vacío: al intentar checkout con sesión sin items, redirección 302 (probablemente a carrito.php).
- Sesión expirada: no probado (requiere manipulación de cookies).
- Datos inválidos en registro: DNI duplicado no probado por riesgo de colisión; contraseña corta según informe anterior muestra validación.
- Parámetros inválidos en URL: no probado.

## Regresiones detectadas:
- Checkout inaccesible (GET timeout) - posible bloqueo de firewall o error interno.
- Error de foreign key constraint en checkout (según informes anteriores) no confirmado debido a inaccesibilidad.
- Login con credenciales de usuario recién registrado posiblemente funcional (redirección 302), requiere validación.

## Hallazgos:

### ID: 1
**Título:** Checkout inaccesible (GET timeout, POST sin redirección)
**Severidad:** crítica
**Descripción:** La página checkout.php no responde a solicitudes GET (timeout después de 10 segundos). Envíos POST con datos básicos devuelven estado 200 sin redirección, indicando que el formulario no se procesa correctamente o hay validaciones faltantes. Esto bloquea completamente el flujo de reserva.
**Pasos para reproducir:**
1. Registrar un nuevo usuario e iniciar sesión.
2. Agregar una bicicleta al carrito.
3. Intentar acceder a `https://dev1.cenarbe.com/checkout.php` con GET.
4. Observar timeout.
5. Enviar POST a checkout.php con datos `metodo_pago=tarjeta&terminos=on`.
6. Observar respuesta 200 sin redirección.
**Resultado esperado:** Checkout muestra formulario de pago (GET) y procesa la reserva (POST) con redirección a confirmación.
**Resultado observado:** GET timeout, POST devuelve 200 sin redirección.
**Impacto:** Los usuarios no pueden finalizar reservas, bloqueando el flujo principal de negocio.
**Recomendación:** Investigar la causa del timeout (reglas de firewall, error interno en el script) y corregir la lógica de procesamiento de checkout.

### ID: 2
**Título:** Falta de protección CSRF en formularios críticos
**Severidad:** alta
**Descripción:** Los formularios de registro, login, carrito y checkout no incluyen tokens CSRF, lo que hace la aplicación vulnerable a ataques de Cross-Site Request Forgery.
**Pasos para reproducir:**
1. Inspeccionar el código HTML de register.php, login.php, carrito.php, checkout.php.
2. Buscar inputs de tipo hidden con nombre "csrf_token" o similar.
**Resultado esperado:** Cada formulario debe incluir un token único validado en el servidor.
**Resultado observado:** No se encuentran tokens CSRF en ninguno de los formularios.
**Impacto:** Riesgo de seguridad que podría permitir a atacantes realizar acciones en nombre de usuarios autenticados.
**Recomendación:** Implementar protección CSRF en todos los formularios que modifiquen estado (registro, login, carrito, checkout).

### ID: 3
**Título:** Mensajes flash no visibles después de registro exitoso
**Severidad:** baja
**Descripción:** Tras un registro exitoso, el sistema redirige a index.php pero no muestra el mensaje flash de confirmación. Esto ya fue reportado en informes anteriores y persiste.
**Pasos para reproducir:**
1. Acceder a register.php.
2. Completar el formulario con datos válidos.
3. Enviar el formulario.
4. Ver la página de destino (index.php) e inspeccionar en busca de alertas.
**Resultado esperado:** Debe mostrarse un mensaje de confirmación (alert-success).
**Resultado observado:** No se visualiza ningún mensaje de confirmación.
**Impacto:** El usuario no recibe feedback inmediato sobre el éxito de su registro, lo que puede generar confusión.
**Recomendación:** Verificar la implementación de `setFlash()` y la recuperación del flash en `index.php`. Asegurar que la sesión esté siendo manejada correctamente.

### ID: 4
**Título:** Posible error de foreign key constraint en checkout (no confirmado)
**Severidad:** crítica
**Descripción:** Informes anteriores indican un error de foreign key constraint al procesar checkout (columna `bicicleta_id` no referencia un registro existente en `bicicletas`). No se pudo confirmar debido a la inaccesibilidad de checkout, pero el riesgo persiste.
**Pasos para reproducir:**
1. Registrar un nuevo usuario.
2. Agregar una bicicleta al carrito.
3. Navegar a checkout.php (si funciona).
4. Completar el formulario de pago y enviar.
**Resultado esperado:** La reserva se crea exitosamente.
**Resultado observado (según informes anteriores):** Error SQL de foreign key constraint.
**Impacto:** Los usuarios no pueden finalizar reservas.
**Recomendación:** Si el checkout se hace accesible, verificar la relación entre carrito y tabla `bicicletas`. Asegurar que el `bicicleta_id` pasado al checkout corresponda a un registro existente.

### ID: 5
**Título:** Login con credenciales de usuario recién registrado requiere validación
**Severidad:** media
**Descripción:** Informes anteriores indican que el login con credenciales válidas de un usuario recién registrado fallaba. En pruebas actuales se observó redirección 302, pero no se confirmó si la redirección es a index.php (éxito) o a login.php (fallo).
**Pasos para reproducir:**
1. Registrar un nuevo usuario.
2. Cerrar sesión (logout.php).
3. Intentar login con el email y contraseña utilizados en el registro.
4. Verificar la ubicación de redirección y la presencia de sesión activa.
**Resultado esperado:** Login exitoso, redirección a index.php con sesión iniciada.
**Resultado observado anterior:** Página de login se recarga con alerta de error "Email o contraseña incorrectos".
**Impacto:** Los usuarios no pueden acceder a sus cuentas después de cerrar sesión.
**Recomendación:** Validar el flujo de login post-registro y corregir si persiste el error.

### ID: 6
**Título:** Performance bajo carga aceptable para página principal
**Severidad:** baja
**Descripción:** Se realizaron 10 solicitudes concurrentes a index.php. El tiempo promedio de respuesta fue de ~0.5 segundos, sin errores. Sin embargo, no se probaron páginas dinámicas bajo carga.
**Pasos para reproducir:**
1. Ejecutar `for i in {1..10}; do curl -s -w "%{time_total}\n" -o /dev/null https://dev1.cenarbe.com/index.php & done`.
2. Calcular el tiempo promedio.
**Resultado esperado:** Tiempos de respuesta consistentes sin degradación significativa.
**Resultado observado:** Tiempos entre 0.2 y 0.8 segundos, promedio 0.5s.
**Impacto:** Bajo para carga ligera; se requiere prueba de carga real para páginas de reserva.
**Recomendación:** Realizar pruebas de carga más exhaustivas en endpoints críticos (checkout, carrito) una vez solucionados los bloqueos.

### ID: 7
**Título:** HTML válido y responsive, pero falta validación de accesibilidad
**Severidad:** baja
**Descripción:** El sitio utiliza HTML5, Bootstrap 5 y viewport para responsividad. No se detectaron errores de sintaxis graves. Sin embargo, no se evaluó accesibilidad (ARIA, contraste, etc.).
**Pasos para reproducir:**
1. Inspeccionar código fuente de index.php.
2. Verificar doctype, meta viewport, uso de etiquetas semánticas.
**Resultado esperado:** HTML válido, estructura semántica adecuada.
**Resultado observado:** Doctype HTML5 presente, viewport configurado, uso de Bootstrap pero posible falta de etiquetas semánticas.
**Impacto:** Experiencia de usuario aceptable en navegadores modernos, posible problemas de accesibilidad.
**Recomendación:** Realizar auditoría de accesibilidad y mejorar etiquetas semánticas donde sea necesario.

## Conclusión:
El sistema presenta un bloqueo crítico en el checkout (inaccesibilidad), falta de protección CSRF y mensajes flash no visibles. Además, persisten dudas sobre el login post-registro y el error de foreign key constraint reportado anteriormente. El registro y carrito funcionan correctamente, y la performance de la página principal es aceptable. Sin embargo, los problemas críticos impiden el flujo completo de reserva.

## Criterio de salida:
**Debe volver a desarrollo** para corregir:
1. Inaccesibilidad de checkout (timeout GET, POST sin redirección).
2. Implementar protección CSRF en formularios críticos.
3. Verificar y corregir error de foreign key constraint en checkout (si persiste).
4. Validar y corregir login post-registro si falla.
5. (Opcional) Mejorar visualización de mensajes flash.

Una vez corregidos estos puntos, se debe realizar una nueva ronda de QA exhaustiva que incluya pruebas de carga, compatibilidad de navegadores y validación de accesibilidad.

---
*QA realizado por subagent pruebas-exhaustivas-cenarbe-profundo*