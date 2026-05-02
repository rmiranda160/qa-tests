# Reporte de Verificación de Botones/Acciones

## Información del Proyecto
- **Proyecto:** [Nombre]
- **Fecha:** [YYYY-MM-DD]
- **Tester:** [Nombre]
- **Entorno:** [Producción/Desarrollo/Staging]
- **URL base:** [https://...]

## Resumen Ejecutivo
| Total Verificaciones | PASS | FAIL | % Éxito | Tiempo Total |
|----------------------|------|------|---------|--------------|
| [N]                  | [X]  | [Y]  | [Z]%    | [T] minutos |

### Estado General:
- ✅ **PASS** - Todas las funcionalidades verificadas funcionan correctamente
- ⚠️ **PASS WITH NOTES** - Funcionalidades principales OK, problemas menores
- ❌ **FAIL** - Una o más funcionalidades críticas no funcionan

## Detalle por Botón/Acción

### 1. [Nombre del botón/acción]
- **Selector:** `[selector]`
- **Ubicación:** [Página/Sección]
- **Acción esperada:** [Descripción]
- **Resultado esperado:** [Qué debería ocurrir]

#### Verificaciones:
| Check | Estado | Observaciones |
|-------|--------|---------------|
| Presencia | ✅/❌ | |
| Interactividad | ✅/❌ | |
| Acción ejecutada | ✅/❌ | |
| Feedback visual | ✅/❌ | |
| Funcionalidad completa | ✅/❌ | |
| Coherencia UI | ✅/❌ | |
| Persistencia | ✅/❌ | |
| Rendimiento | ✅/❌ | |

#### Evidencia:
- **Screenshot antes:** ![Antes](ruta/screenshot-antes.png)
- **Screenshot después:** ![Después](ruta/screenshot-despues.png)
- **Logs/Console:** 
```json
[Captura de logs relevantes]
```

#### Observaciones:
[Detalles adicionales, pasos para reproducir, sugerencias]

---

### 2. [Nombre del botón/acción]
...

## Problemas Críticos Encontrados

### Problema 1: [Título]
- **Severidad:** Crítica/Alta/Media/Baja
- **Botón/Acción afectado:** [Nombre]
- **Descripción:** [Explicación detallada]
- **Impacto:** [Cómo afecta al usuario/negocio]
- **Pasos para reproducir:**
  1. [Paso 1]
  2. [Paso 2]
  3. [Paso 3]
- **Evidencia:** [Screenshots, logs]
- **Recomendación:** [Solución sugerida]

### Problema 2: [Título]
...

## Hallazgos por Categoría

### Funcionalidad Completa
- ✅ [Lista de botones que funcionan correctamente]
- ❌ [Lista de botones con problemas]

### Coherencia UI
- ✅ Botones muestran contenido correspondiente a su etiqueta
- ❌ Incoherencias encontradas:
  - [Ejemplo: Botón "Mis Reservas" muestra perfil en lugar de reservas]

### Rendimiento
- ✅ Todas las acciones responden en <3s
- ❌ Acciones lentas (>3s):
  - [Botón X: 5.2s]

## Recomendaciones para Desarrollo

1. **Prioridad Alta:**
   - [Recomendación 1]
   - [Recomendación 2]

2. **Prioridad Media:**
   - [Recomendación 3]

3. **Prioridad Baja (mejoras):**
   - [Recomendación 4]

## Próximos Pasos

- [ ] Reportar problemas críticos al equipo de desarrollo
- [ ] Actualizar `KNOWN_ISSUES.md` del proyecto
- [ ] Programar re-test después de correcciones
- [ ] Actualizar checklist de testing con lecciones aprendidas

## Metadatos del Reporte

- **Metodología utilizada:** Verificación sistemática de botones/acciones (regla obligatoria)
- **Herramientas:** Playwright, Chrome DevTools, Screenshots
- **Criterios de aceptación:** Según TESTING_METHODOLOGY.md
- **Archivos adjuntos:**
  - Screenshots completos en [directorio]
  - Logs de ejecución en [archivo.log]
  - Datos de prueba en [archivo.json]

---

**Firmado:** [Nombre del Tester]  
**Fecha de generación:** [YYYY-MM-DD HH:MM UTC]  
**Versión del reporte:** 1.0