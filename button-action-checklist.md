# Checklist de Verificación de Botones/Acciones

## Propósito
Este template se utiliza para verificar sistemáticamente cada botón o acción en una interfaz, asegurando que la funcionalidad correspondiente esté desarrollada y funcione correctamente.

## Instrucciones
1. Para cada botón/acción identificado en la página, completar una sección de este checklist
2. Incluir evidencias (screenshots, logs) para cada verificación
3. Marcar con ✅ (PASS) o ❌ (FAIL) cada ítem
4. Si FAIL, documentar detalles en la sección de observaciones

---

## Información del Proyecto
- **Proyecto:** [Nombre del proyecto]
- **URL probada:** [URL específica de la página]
- **Fecha de prueba:** [YYYY-MM-DD]
- **Tester:** [Nombre del tester]
- **Navegador/Dispositivo:** [Ej: Chrome 122, Desktop 1920x1080]

---

## Checklist por Botón/Acción

### 1. [Nombre del botón/acción]
**Selector:** `[selector CSS, XPath o identificador]`
**Ubicación en página:** [Descripción de dónde se encuentra]

#### Verificaciones:
- [ ] **Presencia:** El botón/acción está visible en la página
- [ ] **Interactividad:** El elemento es clickeable/hoverable (no está disabled)
- [ ] **Acción ejecutada:** Al interactuar, se desencadena la acción esperada
- [ ] **Feedback visual:** Se muestra confirmación visual (mensaje, cambio de estado, navegación)
- [ ] **Funcionalidad completa:** Todas las etapas de la funcionalidad se ejecutan sin errores
- [ ] **Coherencia UI:** El contenido mostrado corresponde a la etiqueta del botón
- [ ] **Persistencia:** Los cambios se guardan correctamente (si aplica)
- [ ] **Rendimiento:** La respuesta ocurre en tiempo razonable (<3s)

#### Resultado:
- **Estado general:** ✅ PASS / ❌ FAIL
- **Severidad si FAIL:** [Crítica / Alta / Media / Baja]

#### Evidencia:
- **Screenshot antes:** [enlace/ruta]
- **Screenshot después:** [enlace/ruta]
- **Logs/Console:** [captura de errores o mensajes]

#### Observaciones:
[Detalles adicionales, pasos para reproducir fallo, sugerencias]

---

### 2. [Nombre del botón/acción]
**Selector:** `[selector]`
**Ubicación en página:** [Descripción]

#### Verificaciones:
- [ ] **Presencia:** 
- [ ] **Interactividad:** 
- [ ] **Acción ejecutada:** 
- [ ] **Feedback visual:** 
- [ ] **Funcionalidad completa:** 
- [ ] **Coherencia UI:** 
- [ ] **Persistencia:** 
- [ ] **Rendimiento:** 

#### Resultado:
- **Estado general:** 
- **Severidad si FAIL:** 

#### Evidencia:
- **Screenshot antes:** 
- **Screenshot después:** 
- **Logs/Console:** 

#### Observaciones:
---

## Resumen de Verificación

| Total botones/acciones verificados | PASS | FAIL | % Éxito |
|-----------------------------------|------|------|---------|
| [N]                               | [X]  | [Y]  | [Z]%    |

### Problemas Críticos Encontrados:
1. [Descripción del problema crítico]
2. ...

### Recomendaciones:
1. [Recomendación para desarrollo]
2. ...

### Próximos pasos:
- [ ] Reportar fallos al equipo de desarrollo
- [ ] Actualizar `KNOWN_ISSUES.md` del proyecto
- [ ] Programar re-test después de correcciones

---

## Consideraciones para Botones con Funcionalidad AJAX/JavaScript

Para botones que realizan acciones asíncronas sin cambiar la URL (actualización de datos, filtros, descargas, modales), se deben verificar los siguientes indicadores adicionales:

### Indicadores Clave:
1. **Solicitudes de red:** Monitorear eventos `request` en Playwright para detectar llamadas AJAX
2. **Descargas:** Registrar eventos `download` para botones de exportar/guardar
3. **Cambios en DOM:** Buscar nuevos elementos, modificaciones en contenido o visibilidad
4. **Modales/Overlays:** Detectar apertura de diálogos (`role="dialog"`, clases `.modal`)
5. **Cambio de estado del botón:** Comparar clases CSS, atributos `disabled`, `aria-*` antes/después
6. **Mensajes de feedback:** Buscar notificaciones, toasts, textos de confirmación

### Ejemplo de Verificación Multicriterio (Playwright):
```javascript
// Función mejorada para detectar funcionalidad AJAX
async function verifyButtonFunctionality(page, buttonSelector) {
  const indicators = {
    urlChanged: false,
    domChanged: false,
    networkRequest: false,
    downloadTriggered: false,
    modalOpened: false,
    stateChanged: false
  };
  
  // Registrar listeners
  const requests = [];
  page.on('request', req => requests.push(req.url()));
  
  let downloadDetected = false;
  page.on('download', () => { downloadDetected = true; });
  
  const initialUrl = page.url();
  const button = page.locator(buttonSelector);
  const initialClass = await button.getAttribute('class');
  
  await button.click();
  await page.waitForTimeout(1000); // Esperar efectos AJAX
  
  // Evaluar indicadores
  indicators.urlChanged = page.url() !== initialUrl;
  indicators.networkRequest = requests.length > 0;
  indicators.downloadTriggered = downloadDetected;
  
  // ... más evaluaciones (DOM, modales, estado)
  // Verificar cambios en DOM
  try {
    await page.waitForSelector(`${buttonSelector} + *`, { timeout: 1000 });
    indicators.domChanged = true;
  } catch {}
  
  // Verificar modales visibles
  const modals = await page.locator('.modal, [role="dialog"]').count();
  if (modals > 0) {
    indicators.modalOpened = true;
  }
  
  // Verificar cambio de estado del botón
  const newClass = await button.getAttribute('class');
  indicators.stateChanged = newClass !== initialClass;
  
  return Object.values(indicators).some(v => v);
}
```

### Configuración de Excepciones:
Para botones específicos con comportamiento conocido, se puede definir un archivo `miranda-ajax-exceptions.json` que describa el tipo de acción y los indicadores esperados.

## Plantilla para Scripts de Automatización

```javascript
// Ejemplo de verificación de botón con Playwright
async function verifyButtonAction(page, buttonSelector, expectedOutcome) {
  const testResult = {
    button: buttonSelector,
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // 1. Verificar presencia
  const button = page.locator(buttonSelector);
  testResult.checks.presence = await button.isVisible();
  
  // 2. Verificar interactividad
  testResult.checks.interactive = await button.isEnabled();
  
  // 3. Ejecutar acción
  await button.click();
  
  // 4. Verificar resultado esperado
  // (depende del tipo de acción)
  if (expectedOutcome.type === 'navigation') {
    testResult.checks.navigation = await page.url().includes(expectedOutcome.urlPattern);
  } else if (expectedOutcome.type === 'visibility') {
    testResult.checks.visibility = await page.locator(expectedOutcome.selector).isVisible();
  }
  // ... más verificaciones
  
  return testResult;
}
```

---

*Template versión 1.0 - Parte de la metodología de testing de OpenClaw*