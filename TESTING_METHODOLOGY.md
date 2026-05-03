# Metodología de Testing - OpenClaw Tester

## Regla Obligatoria de Verificación de Botones/Acciones

**Regla:** Siempre que haya un botón o una acción en el código, se debe comprobar si se encuentra desarrollada la funcionalidad.

Esta regla debe integrarse en TODOS los procesos de testing y fijarse en el comportamiento de todos los testers.

## 1. Checklist de Verificación Sistemática

### Para cada botón/acción encontrado en la interfaz:
- [ ] **Identificar** el botón/acción (etiqueta, texto, icono, selector)
- [ ] **Verificar** que el botón/acción es clickeable/interactivo
- [ ] **Ejecutar** la acción (click, hover, submit, etc.)
- [ ] **Comprobar** que la funcionalidad esperada se ejecuta:
  - Navegación a página correcta
  - Apertura de formulario/modal
  - Ejecución de proceso (generación, cálculo, envío)
  - Actualización de datos en UI
  - Respuesta de sistema (mensajes, confirmaciones)
  - Cambio de estado (login/logout, selección)
- [ ] **Validar** coherencia UI: el botón debe mostrar contenido correspondiente a su etiqueta
- [ ] **Documentar** resultado (PASS/FAIL) con evidencia (screenshot, logs)

### Criterios de Aceptación para Funcionalidades:
- **Funcionalidad completa:** La acción ejecuta todas las etapas esperadas sin errores
- **Feedback visual:** El usuario recibe confirmación visual (mensaje, cambio de estado)
- **Persistencia:** Los cambios se guardan correctamente (BD, localStorage, etc.)
- **Seguridad:** La acción respeta permisos y no expone datos sensibles
- **Rendimiento:** La respuesta ocurre en tiempo razonable (<3s para acciones simples)

### Detección de Funcionalidad AJAX/JavaScript
Para evitar falsos positivos en botones que no cambian la URL pero realizan acciones asíncronas, se deben verificar múltiples indicadores de funcionalidad:

- **Cambio de URL:** Redirección a nueva página
- **Solicitudes de red (AJAX):** Detección de requests HTTP/XHR después del click
- **Descargas:** Eventos de descarga de archivos (exportar, guardar)
- **Modales/Overlays:** Apertura de diálogos modales o paneles
- **Cambios en DOM:** Inserción, eliminación o modificación de elementos en la página
- **Cambio de estado:** Modificación de clases CSS, atributos o propiedades del botón

**Implementación en scripts de testing:** Se ha actualizado `miranda-verifier-node.js` para incluir detección multicriterio. La función `testButton` ahora evalúa seis indicadores y considera funcional si al menos uno es positivo.

**Excepciones configuradas:** Se ha creado el archivo `miranda-ajax-exceptions.json` para definir el comportamiento esperado de botones específicos por aplicación (Refresh Data, Export Report, etc.) y los indicadores relevantes.

**Configuración:** En `miranda_config.json` se ha añadido la sección `miranda_rule` con los criterios funcionales y tiempos de espera específicos para AJAX.

## 2. Tipos de Tests que deben incluir verificación de botones/acciones

### Smoke Tests
- Verificar que botones de navegación principal funcionen
- Confirmar que formularios de login/registro envían datos
- Comprobar que enlaces redirigen a páginas correctas

### Functional Tests
- Flujos completos de usuario (ej: reserva bicicleta)
- Interacciones con formularios (submit, reset, cancel)
- Acciones de datos (añadir, editar, eliminar, filtrar)

### Coherence Tests
- Verificar que botones muestran contenido correspondiente
- Detectar incoherencias entre etiqueta y funcionalidad
- Confirmar que estados UI reflejan cambios de estado reales

### Interactive Elements Tests
- Gráficos interactivos (hover, click)
- Menús desplegables
- Acordeones, pestañas, modales
- Carruseles, sliders

## 3. Implementación en Testing Continuo

### Modificación de scripts Playwright
- Añadir assertions después de cada interacción con botones/acciones
- Verificar que las promesas se resuelven (ej: navegación, actualización DOM)
- Capturar screenshots antes/después de acciones críticas
- Generar reportes específicos de funcionalidad

### Ejemplo de assertions en Playwright:
```javascript
// Antes: solo hacer click
await page.click('button[type="submit"]');

// Después: verificar funcionalidad
await page.click('button[type="submit"]');
await expect(page).toHaveURL(/success/); // Verificar navegación
await expect(page.locator('.confirmation')).toBeVisible(); // Verificar feedback
```

### Template de reporte de funcionalidad
- Nombre del botón/acción
- Selector utilizado
- Acción ejecutada
- Resultado esperado
- Resultado obtenido
- Evidencia (screenshot, log)
- Estado (PASS/FAIL)
- Severidad si FAIL

## 4. Ejemplos Concretos por Proyecto

### Cenarbe Bike Rental
| Botón/Acción | Verificación Esperada |
|--------------|----------------------|
| "Mis Reservas" | Muestra lista de reservas del usuario actual |
| "Mi Perfil" | Muestra información de perfil del usuario |
| "Reservar" | Abre formulario de reserva con campos requeridos |
| "Login/Logout" | Funciona autenticación correctamente, cambia estado sesión |
| "Añadir al carrito" | Producto aparece en carrito con cantidad y precio |

### ContentoAI
| Botón/Acción | Verificación Esperada |
|--------------|----------------------|
| "Generar Contenido" | Ejecuta demo IA y muestra resultado |
| "Copiar" | Copia texto al portapapeles (verificar con API clipboard) |
| "Regenerar" | Genera nuevo contenido diferente al anterior |
| Formulario waitlist | Envía datos correctamente y muestra confirmación |

### Dashboard
| Botón/Acción | Verificación Esperada |
|--------------|----------------------|
| Gráficos interactivos | Responden a hover/click mostrando detalles |
| Botones refresh | Actualizan datos (verificar cambio timestamp) |
| Alertas clickeables | Redirigen a página de detalles correspondiente |
| Filtros | Aplican filtros y actualizan resultados |

## 5. Documentación y Tracking

### Archivos obligatorios:
1. **TESTING_METHODOLOGY.md** (este archivo) - Contiene la regla y metodología
2. **button-action-checklist.md** - Template para verificación sistemática
3. **button-action-report-template.md** - Template para reportes específicos

### Sistema de tracking:
- Mantener registro de funcionalidades verificadas por proyecto
- Actualizar `KNOWN_ISSUES.md` del proyecto con bugs encontrados
- Documentar en `shared-memory/` hallazgos que afectan múltiples proyectos

## 6. Aplicación Inmediata

### En tareas actuales:
- En screenshots, verificar botones en cada captura
- En próximos ciclos testing, incluir verificación sistemática
- Reportar inmediatamente incoherencias encontradas

### En procesos existentes:
- Actualizar checklist de testing en cada `TESTS.md` de proyecto
- Modificar scripts de Playwright para incluir assertions
- Revisar reportes anteriores y añadir columna de verificación funcional

## 7. Responsabilidades del Tester

1. **Leer** `TESTS.md` del proyecto antes de validar
2. **Verificar** cada botón/acción según checklist
3. **Documentar** resultados con evidencia
4. **Reportar** fallos inmediatamente a coordinator y desarrollador
5. **Actualizar** metodología con lecciones aprendidas

---

*Última actualización: 2026-03-20 - Implementación de regla obligatoria por instrucción directa de Miranda (CEO)*