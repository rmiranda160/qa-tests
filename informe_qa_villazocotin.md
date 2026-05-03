Estado QA: FAIL

Cobertura validada:
- Formulario de contacto en página principal (sección #contacto)
- Validación de campos obligatorios en cliente
- Simulación de envío (no real)
- Mapa de ubicación (Google Maps Static)
- Ausencia de campo honeypot
- Mensajes de éxito/error mediante alertas JavaScript

Casos probados:
- Acceso a página principal y localización del formulario
- Inspección de campos del formulario (nombre, email, teléfono, mensaje, checkbox privacidad)
- Validación JavaScript básica (campos vacíos, formato email, checkbox)
- Simulación de envío (setTimeout + alert)
- Exposición de clave API de Google Maps en atributo src de imagen estática
- Búsqueda de campo honeypot (no encontrado)
- Envío POST directo al servidor (respuesta 200 sin procesamiento)
- Revisión de código JavaScript (main.js)

Edge cases probados:
- Envío con campos incompletos (alertas de error)
- Envío con email inválido (alertas de error)
- Envío sin aceptar política de privacidad (alertas de error)
- Deshabilitar JavaScript (el formulario no tiene action/method, no se envía)

Regresiones detectadas:
- ninguna

Hallazgos:
- ID: F-001
  Título: Envío de formulario simulado sin backend real
  Severidad: crítica
  Descripción: El formulario de contacto no envía datos a ningún servidor. La función submit en main.js sólo simula un envío mediante setTimeout y muestra una alerta, sin realizar petición AJAX ni redirección. No existe endpoint que procese los datos de contacto.
  Pasos para reproducir:
    1. Ir a https://villazocotin.cenarbe.com/#contacto
    2. Rellenar campos obligatorios
    3. Aceptar política de privacidad
    4. Hacer clic en "Enviar solicitud"
    5. Observar alerta de éxito después de 1.5 segundos sin transmisión real.
  Resultado esperado: Los datos se envían a un backend y se almacenan o envían por correo.
  Resultado observado: Sólo se muestra alerta "¡Gracias por tu mensaje! Te contactaremos pronto." sin enviar datos.
  Impacto: Los mensajes de contacto nunca llegan al propietario del sitio.
  Recomendación: Implementar endpoint real (PHP, Node.js, etc.) que procese POST y envíe email o almacene en base de datos.

- ID: F-002
  Título: Clave API de Google Maps expuesta públicamente
  Severidad: alta
  Descripción: La página incluye un mapa estático de Google Maps con la clave API visible en el atributo src de la imagen: `key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`. Esto permite a terceros usar la clave, incurrir en costes y posible abuso.
  Pasos para reproducir:
    1. Ver código fuente de la página (Ctrl+U)
    2. Buscar "staticmap"
    3. Observar URL con parámetro key=...
  Resultado esperado: Usar OpenStreetMap sin clave API o utilizar método seguro (proxy, restricciones de clave, etc.)
  Resultado observado: Clave API expuesta en cliente.
  Impacto: Posible uso no autorizado, costes inesperados y vulnerabilidad de seguridad.
  Recomendación: Cambiar a OpenStreetMap (gratuito, sin clave) o restringir la clave API por dominio y uso.

- ID: F-003
  Título: Validación sólo en cliente, sin validación en servidor
  Severidad: alta
  Descripción: Las validaciones (campos obligatorios, formato email, checkbox) se realizan únicamente en JavaScript. Un atacante puede deshabilitar JS o enviar POST directamente con datos malformados.
  Pasos para reproducir:
    1. Deshabilitar JavaScript en navegador
    2. Rellenar formulario con datos inválidos (email malformado, checkbox desmarcado)
    3. Enviar formulario (no ocurre nada porque no hay action)
    4. Alternativamente, enviar POST manual con curl.
  Resultado esperado: Validación en servidor que rechace datos inválidos.
  Resultado observado: No hay validación en servidor porque no hay endpoint.
  Impacto: Posible envío de datos corruptos si se implementa backend sin validación.
  Recomendación: Implementar validación tanto en cliente como en servidor.

- ID: F-004
  Título: Mensajes de éxito/error mediante alert() nativo
  Severidad: media
  Descripción: Los mensajes de error y éxito se muestran con alert() de JavaScript, lo que resulta en una experiencia de usuario pobre y poco profesional.
  Pasos para reproducir:
    1. Dejar campos obligatorios vacíos y enviar -> alerta con errores concatenados.
    2. Envío exitoso simulado -> alerta de agradecimiento.
  Resultado esperado: Mensajes integrados en la interfaz (ej. div con estilos) que no interrumpan el flujo.
  Resultado observado: Ventanas modales nativas.
  Impacto: Mala experiencia de usuario, accesibilidad reducida.
  Recomendación: Reemplazar alert() por elementos DOM estilizados que muestren mensajes cerca del formulario.

- ID: F-005
  Título: Ausencia de campo honeypot anti‑bots
  Severidad: baja
  Descripción: El formulario no incluye ningún campo oculto (honeypot) para detección de bots. Esto incrementa el riesgo de spam automatizado.
  Pasos para reproducir:
    1. Inspeccionar HTML del formulario.
    2. Buscar input type="hidden" o campo con display:none que no sea para funcionalidad legítima.
  Resultado esperado: Campo honeypot que, si se rellena, indique que es un bot y bloquee el envío.
  Resultado observado: No existe tal campo.
  Impacto: Mayor vulnerabilidad a spam.
  Recomendación: Añadir campo input con nombre como "website" o "url" oculto con CSS; si el campo contiene valor, rechazar el envío.

Conclusión:
El formulario de contacto de Villazocotin presenta deficiencias críticas que impiden su funcionalidad básica: no envía datos reales, expone una clave API, carece de validación servidor, usa alertas nativas y no tiene protección anti‑bots. La implementación actual es únicamente una simulación front‑end.

Criterio de salida:
Debe volver a desarrollo para corregir los hallazgos críticos y altos antes de considerar el cierre.