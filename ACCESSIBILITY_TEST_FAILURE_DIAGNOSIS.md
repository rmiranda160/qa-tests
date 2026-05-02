# DIAGNÓSTICO DE FALLO COMPLETO TESTING ACCESSIBILITY

**Fecha:** 2026-03-21 18:30 UTC  
**Prioridad:** CRÍTICA  
**Estado:** Diagnóstico completado

## APPS AFECTADAS
1. ContentoAI (https://cntai.cenarbe.com/)
2. Dashboard (https://dashboard.cenarbe.com/)
3. Villa Zocotin (https://villazocotin.cenarbe.com/)

## ERROR REPORTADO
- Reporte 20260321_182153_extended.json muestra:
  - "Test execution failed for <url> (accessibility): " (mensaje vacío)
  - Severidad: critical
  - No se reportan violaciones específicas

## INVESTIGACIÓN REALIZADA

### 1. Verificación acceso apps
- Las tres apps responden HTTP 200 OK
- Contenido HTML básico presente
- Apps son accesibles y funcionales

### 2. Verificación herramienta testing accessibility
- Script de testing: `/home/node/.openclaw/workspace-tester/continuous-testing/playwright-tester/compat.js`
- Usa axe-core (instalado como dependencia de lighthouse)
- Playwright WS endpoint operativo (tests smoke/responsive funcionan)
- Screenshots de coherence tests confirman visibilidad de apps (4/4 apps pasan)

### 3. Prueba manual de accessibility tool
- Ejecución directa del script para ContentoAI:
  ```bash
  node playwright-tester/compat.js "https://cntai.cenarbe.com/" "accessibility"
  ```
- **RESULTADO:** El test funciona correctamente, detecta 3 violaciones de accesibilidad
- **SALIDA:** `ok: false` (porque hay violaciones)
- **STDOUT:** "Accessibility test failed for https://cntai.cenarbe.com/. Violations: 3"
- **STDERR:** vacío

### 4. Análisis de lógica de reporting
El problema está en `run_extended_cycle.py`, función `analyze_result`:

```python
if not result['ok']:
    return 'critical', f"Test execution failed for {url} ({mode}): {result['stderr']}"
```

**Problema:** Cuando el test de accesibilidad encuentra violaciones, devuelve `ok: false`. La lógica actual interpreta cualquier `ok: false` como "fallo de ejecución" (error crítico) en lugar de "violaciones de accesibilidad".

**Consecuencia:**
- Severidad incorrectamente asignada como `critical` en lugar de `medium`
- Mensaje de error genérico "Test execution failed" en lugar de mostrar violaciones
- El campo `stderr` vacío produce mensaje vacío

## CAUSA RAÍZ
**Error de lógica en el análisis de resultados.** El sistema no distingue entre:
1. **Fallo de ejecución:** Timeout, error de conexión, excepción no controlada → `critical`
2. **Violaciones de accesibilidad:** Test pasa pero encuentra problemas → `medium`

Actualmente ambos casos se tratan igual porque el test de accesibilidad devuelve `ok: false` cuando hay violaciones.

## SOLUCIÓN RECOMENDADA

### Solución inmediata (parche):
Modificar `run_extended_cycle.py`, función `analyze_result` para tratar los tests de accesibilidad de forma especial:

```python
def analyze_result(result, url, mode):
    # Caso especial: accessibility test con violaciones
    if mode == 'accessibility' and not result['ok']:
        # Verificar si es por violaciones (stderr vacío, stdout contiene información)
        if not result['stderr'] and 'violations' in str(result.get('raw', {})):
            # Contar violaciones del raw result
            violations = result.get('raw', {}).get('violations', [])
            count = len(violations)
            return 'medium', f"Accessibility test found {count} violations for {url}"
        # Si hay stderr, es un error real
        if result['stderr']:
            return 'critical', f"Test execution failed for {url} ({mode}): {result['stderr']}"
    
    # Lógica original para otros modos
    if not result['ok']:
        return 'critical', f"Test execution failed for {url} ({mode}): {result['stderr']}"
    
    # Resto de la función...
```

### Solución a largo plazo (mejor diseño):
1. Cambiar el test de accesibilidad para devolver `ok: true` siempre que se complete (sin errores de ejecución)
2. Agregar campo `violations` con número de violaciones
3. Modificar análisis para evaluar severidad basada en número/impacto de violaciones

## IMPACTO
- **Testing actual:** Falsos positivos críticos que generan alertas innecesarias
- **Monitoreo:** No se reportan violaciones reales de accesibilidad (solo "test execution failed")
- **Priorización:** Equipo puede ignorar alertas por ser genéricas y sin detalles

## VERIFICACIÓN DE OTROS FACTORES
- ✅ No hay timeout (test se completa en < 5 segundos)
- ✅ axe-core está instalado y funciona
- ✅ Playwright endpoint conecta correctamente
- ✅ Apps son accesibles vía HTTP

## ACCIONES RECOMENDADAS

### Urgente (hoy):
1. Aplicar parche a `run_extended_cycle.py` para corregir clasificación de accesibilidad
2. Ejecutar ciclo de testing para validar que violaciones se reporten correctamente
3. Actualizar alertas.json para reflejar severidad adecuada

### Mediano plazo:
1. Refactorizar `compat.js` para separar "error de ejecución" de "violaciones"
2. Mejorar reporte de accesibilidad con detalles de violaciones específicas
3. Implementar thresholds de severidad (ej: >5 violaciones críticas = high)

---

**Diagnóstico realizado por:** Subagente de testing (smoke-diagnose-accessibility-failure)  
**Hora finalización:** 2026-03-21 18:35 UTC  
**Próximos pasos:** Enviar diagnóstico al Coordinator Agent para implementación de fix.