# Integración de Screenshots en Alertas

## Cambios realizados

### 1. Modificación de `run_cycle.py`
- **Función `analyze_result`**: Ahora extrae las rutas de screenshots del campo `rawResult.screenshots` (si existe) y las incluye en el análisis bajo la clave `screenshot_paths`.
- **Creación de alertas**: El diccionario de alerta incluye ahora un campo `screenshot_paths` con la lista de rutas de screenshots correspondientes al fallo.
- **Nueva función `send_telegram_alert`**: Intenta enviar la alerta al canal de Telegram configurado (chatId `7885094157`). Si hay screenshots disponibles, envía el primero como foto adjunta (con caption). Si falla, solo envía el mensaje de texto.
- La función `send_alert` ahora llama a `send_telegram_alert` automáticamente después de escribir en `alerts.json`.

### 2. Script de gestión de screenshots `manage_screenshots.py`
- **Limpieza automática**: Elimina screenshots con más de 7 días de antigüedad (basado en fecha de modificación).
- **Organización por fecha**: Mueve todos los screenshots del directorio `playwright-tester/results/` a una estructura organizada por fecha (`screenshots/YYYY-MM-DD/`).
- Puede ejecutarse manualmente o integrarse en el ciclo de testing periódico.

### 3. Investigación de capacidad de Telegram
- Se confirmó que la herramienta `message` de OpenClaw admite el envío de imágenes mediante el parámetro `media`.
- Se descubrió el chatId destino (`7885094157`) revisando logs anteriores.
- Se verificó el envío exitoso de mensajes de texto y se identificó un error `PHOTO_INVALID_DIMENSIONS` al enviar una captura directamente (posiblemente por dimensiones de imagen no válidas para la API de Telegram). Esto puede solucionarse redimensionando las imágenes antes del envío.

### 4. Próximos pasos recomendados
- **Configuración del chatId**: Hacer configurable el chatId (por ejemplo, mediante variable de entorno `TELEGRAM_CHAT_ID` o campo en `config.json`).
- **Redimensionamiento de imágenes**: Añadir un paso de preprocesamiento que redimensione las capturas a dimensiones aceptables por Telegram (máx. 1280x1280) antes de enviarlas.
- **Envío múltiple**: Si hay más de un screenshot, enviar un álbum (group media) o seleccionar el más representativo.
- **Integración con reportes periódicos**: Modificar `generate_summary.py` para incluir enlaces a los screenshots en el reporte markdown.
- **Ejecución automática de organización**: Llamar a `manage_screenshots.py` al final de cada ciclo (o diariamente) para mantener el almacenamiento ordenado.

### 5. Testing end-to-end (pendiente)
Se requiere simular un fallo en modo responsive que genere screenshots y verificar:
- Que la alerta incluye `screenshot_paths` no vacío.
- Que la alerta se escribe en `alerts.json`.
- Que se intenta el envío a Telegram (log apropiado).

### Notas
- Los cambios son compatibles con el funcionamiento existente: si no hay screenshots, el sistema sigue operando normalmente.
- La política de retención de 7 días se aplica sobre la fecha de modificación del archivo (no sobre la fecha de la prueba). Esto puede ajustarse para usar el timestamp embebido en el nombre del archivo.
- La organización por fecha no tiene en cuenta el sitio web origen; podría mejorarse extrayendo el nombre de la aplicación del ciclo correspondiente (requiere cruzar datos con los resultados guardados).

## Implementación de Regla Obligatoria de Verificación de Botones/Acciones

### Cambios realizados (2026-03-20)
- **Metodología:** Creación de `TESTING_METHODOLOGY.md` con regla obligatoria
- **Templates:** `button-action-checklist.md` y `button-action-report-template.md`
- **Herramientas:** `tests/button-action-verification.js` módulo Playwright
- **Tests actualizados:** `playwright-basic.spec.js` incluye verificaciones de botones
- **Proyectos:** Actualización de `TESTS.md` en cenarbe, contentoai, dashboard
- **Configuración tester:** Actualización de `SOUL.md` con referencia a metodología

### Impacto en testing continuo
- Todos los ciclos de testing deben incluir verificación de botones/acciones
- Reportes deben documentar funcionalidad verificada
- Alertas deben incluir fallos en funcionalidad de botones como issues críticos

**Fecha de implementación:** 2026-03-20
**Responsable:** Subagente tester (tarea asignada por coordinator)

## Corrección de selectores de Villa Zocotin en configuración Miranda

### Cambios realizados (2026-03-20 19:05 UTC)
- **Diagnóstico:** Testing buscaba selectores incorrectos que no existen en producción:
  - `button:has-text('Reservar')` → no existe
  - `a:has-text('Contactar')` → no existe  
  - `form[action*='contacto']` → no existe
- **Realidad:** Existen 3 enlaces ancla con texto 'Reservar' y un botón 'Confirmar reserva'
- **Configuración actualizada:** `miranda_config.json` para Villa Zocotin con selectores reales:
  - `a:has-text('Reservar')` (enlace reservar)
  - `button:has-text('Confirmar reserva')` (botón confirmar)
  - `form:has-text('Reservar')` (formulario de reserva)
  - `footer` (sección contacto)
- **Resultado:** Eliminación de falsos positivos en testing. Verificación pasa con warnings aceptables.
- **Responsable:** Subagente coder (tarea asignada por coordinator)