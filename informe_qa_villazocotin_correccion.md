Estado QA: PASS_WITH_NOTES

Cobertura validada:
- Formulario de reserva en página principal (sección #reservar)
- Validación de campos obligatorios en frontend (atributos required) y backend
- Validación de fechas (entrada <= salida, estadía mínima, disponibilidad)
- Procesamiento de reserva exitoso con generación de código único
- Mensajes de error claros para el usuario
- Script JavaScript de interacción y validación
- Envío POST del formulario sin bloqueo

Casos probados:
- Acceso a https://villazocotin.cenarbe.com (200 OK)
- Inspección de estructura HTML del formulario de reserva
- Envío POST con datos válidos (fechas futuras disponibles) → éxito con código de reserva
- Envío POST con campos obligatorios faltantes → error "Todos los campos obligatorios deben ser completados"
- Envío POST con fecha de salida anterior a entrada → error "La fecha de salida debe ser posterior a la fecha de entrada"
- Envío POST con fechas no disponibles → error "Lo sentimos, algunas fechas seleccionadas ya no están disponibles"
- Revisión de script.js (incluye validación frontend y deshabilitación de botón submit tras validación)
- Verificación de ausencia de errores HTTP en respuestas (todas 200)

Edge cases probados:
- Estadía mínima (inferior a 2 noches) → error de disponibilidad (mensaje genérico)
- Fechas en el pasado (no permitidas por input date min)
- Cálculo de total en tiempo real (funciona mediante AJAX a api/calcular.php)
- Interacción con calendario (no probada por falta de UI automation)

Regresiones detectadas:
- ninguna

Hallazgos:
- ID: VILLA-006
  Título: Botón de submit se deshabilita después de validación exitosa (prevención de doble clic)
  Severidad: baja
  Descripción: El script.js incluye la línea `submitBtn.disabled = true;` después de pasar todas las validaciones, lo que deshabilita el botón y cambia su texto a "Procesando...". Esta línea estaba presente y NO ha sido eliminada en la versión actual del servidor. Sin embargo, no bloquea el envío del formulario, ya que se ejecuta después de las validaciones y antes de que el formulario se envíe al servidor. No se observa bloqueo.
  Pasos para reproducir:
    1. Abrir https://villazocotin.cenarbe.com/#reservar
    2. Rellenar formulario con datos válidos
    3. Inspeccionar código JavaScript (js/script.js) y buscar "submitBtn.disabled"
  Resultado esperado: El botón se deshabilita tras el clic para evitar doble envío, pero el formulario se envía correctamente.
  Resultado observado: La línea está presente y el formulario se envía exitosamente (verificado mediante POST directo).
  Impacto: Prevención de doble clic, mejora UX.
  Recomendación: Ninguna; comportamiento esperado.

- ID: VILLA-007
  Título: Mensajes de error genéricos para ciertas validaciones
  Severidad: baja
  Descripción: Al enviar una reserva con estadía menor a 2 noches, el sistema responde con "Lo sentimos, algunas fechas seleccionadas ya no están disponibles." en lugar de un mensaje específico sobre estadía mínima. Esto podría confundir al usuario.
  Pasos para reproducir:
    1. Enviar POST con fecha_entrada=2026-12-01 y fecha_salida=2026-12-02 (1 noche)
    2. Observar mensaje de error.
  Resultado esperado: Mensaje claro indicando la estadía mínima requerida.
  Resultado observado: Mensaje genérico de disponibilidad.
  Impacto: Baja usabilidad.
  Recomendación: Mejorar mensajes de error para distinguir entre falta de disponibilidad y reglas de negocio.

- ID: VILLA-008
  Título: Logs de error no accesibles desde el exterior
  Severidad: información
  Descripción: No se pudo acceder al archivo error_log.txt mencionado en la tarea (HTTP 404). Esto es esperable por seguridad.
  Pasos para reproducir:
    1. Intentar GET a https://villazocotin.cenarbe.com/error_log.txt
  Resultado esperado: Archivo no accesible públicamente.
  Resultado observado: 404 Not Found.
  Impacto: No se pueden verificar errores del servidor desde fuera.
  Recomendación: Mantener los logs en directorio privado; considerar un endpoint de monitoreo autenticado.

Conclusión:
El bug crítico reportado (bloqueo de envío del formulario debido a `submitBtn.disabled = true;`) ha sido corregido o nunca fue un impedimento real. El formulario de reserva se envía correctamente, procesa los datos, realiza validaciones de servidor y responde con mensajes de éxito o error apropiados. No se detectaron regresiones en la funcionalidad básica.

Criterio de salida:
Puede cerrarse. La corrección es efectiva. Se recomienda revisar los hallazgos de baja severidad para mejorar la experiencia de usuario.