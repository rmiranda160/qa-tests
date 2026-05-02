# Preparación Nocturna - Tester/QA (MODO MEJORAS CONTINUAS)

**Fecha:** 2026-03-18 (noche)  
**Hora actual:** $(date -u +"%H:%M UTC")  
**Estado:** Sistema de monitoreo continuo preparado.

## Nuevo Enfoque: Mejoras Incrementales (CEO)
- Verificar cada commit/mejora pequeña que Kevin/Sam implementen.
- Asegurar no regresiones.
- Probar flujos completos periódicamente.
- Reportar issues inmediatamente.
- Trabajo continuo durante noche.

## Sistema Implementado

### 1. Monitor de Mejoras Continuas v2 (`monitor_continuous_v2.sh`)
- **Intervalo:** 15 minutos (configurable).
- **Funciones:**
  - Health check general (sitios accesibles, sin errores PHP).
  - Prueba específica bug carrito (checkout) - detecta si Kevin corrige.
  - Prueba sanitización SQL ContentoAI - detecta si Sam corrige.
  - Prueba de regresión básica (flujo Cenarbe sin checkout).
  - **Estado persistente:** Compara resultados entre iteraciones.
  - **Alertas inmediatas:** Detecta cambios (FAIL→PASS = mejora, PASS→FAIL = regresión).
  - **Logging completo:** Cada iteración genera log y mini-informe.

### 2. Pruebas Específicas (bash, sin dependencias Python)
- `test_checkout_bash.sh`: Flujo completo checkout Cenarbe (detecta error SQL `horas_totales`).
- `test_sql_contentoai_bash.sh`: Pruebas inyección SQL en ContentoAI (formulario waitlist, endpoints admin).
- `test_exhaustivo_hourly.sh`: Pruebas exhaustivas cada hora (flujos completos, validaciones, edge cases).
- Scripts existentes: `health_check.sh`, `check_villazocotin_db.sh`, `flujo_cenarbe.sh`.

### 3. Sistema de Alertas y Reportes
- **Alertas inmediatas:** Detectadas → archivo `alerts.txt` en directorio de log.
- **Cambios detectados:** Archivo `changes.txt` con histórico.
- **Informes automáticos:** Cada iteración genera mini-informe; final genera reporte completo.
- **Formato QA:** Cumple estructura SOUL.md (Estado QA, Cobertura, Hallazgos, etc.).

### 4. Plan de Ejecución Nocturna
1. **Monitor continuo (15 min):** Ejecuta pruebas básicas + detección cambios.
2. **Pruebas exhaustivas (60 min):** Cada 4 iteraciones, ejecuta `test_exhaustivo_hourly.sh`.
3. **Reporte 09:00 UTC:** Última iteración generará informe final consolidado.
4. **Intervención manual:** Si alertas críticas, notificar inmediatamente al coordinator.

## Archivos Generados
```
tests/monitor_continuous_v2.sh           # Monitor principal (estado persistente)
tests/test_checkout_bash.sh              # Prueba bug carrito
tests/test_sql_contentoai_bash.sh        # Prueba sanitización SQL  
tests/test_exhaustivo_hourly.sh          # Pruebas exhaustivas horarias
tests/regression_suite.sh                # Suite de regresión
tests/run_nocturnal_tests.sh             # Ejecución única (legacy)
preparacion_nocturna.md                  # Este documento
```

## Comandos de Inicio
```bash
# Iniciar monitor (ejecuta hasta 8 horas, intervalo 15 min)
cd /home/node/.openclaw/workspace-tester
./tests/monitor_continuous_v2.sh 15 32

# Ejecutar pruebas exhaustivas manualmente
./tests/test_exhaustivo_hourly.sh

# Ver estado actual
cat /tmp/qa_monitor_state.txt 2>/dev/null || echo "No hay estado"
```

## Criterios de Éxito
- **Bug carrito corregido:** Checkout pasa consistentemente (sin errores SQL).
- **Sanitización SQL corregida:** Pruebas de inyección no revelan errores de BD.
- **Sin regresiones:** Health check y flujos básicos pasan siempre.
- **Mejoras detectadas:** Cambios FAIL→PASS en checkout o SQL indican correcciones.

## Próximos Pasos
1. Iniciar monitor continuo (ya puede comenzar).
2. Revisar alertas generadas durante la noche.
3. Generar informe consolidado a las 09:00 UTC.
4. Entregar resultados al coordinator.

---
*Preparado por subagent tester-mejoras-continuas*

## Scripts desarrollados

### 1. Pruebas de checkout de Cenarbe (bug carrito)
- **Ubicación:** `tests/test_cenarbe_checkout.py`
- **Propósito:** Valida el flujo completo de registro, login, carrito y checkout. Detecta errores SQL (ej. columna `horas_totales` faltante) y confirma que la reserva se crea exitosamente.
- **Uso:** `python3 tests/test_cenarbe_checkout.py`
- **Salida:** Log detallado y código de salida (0 = éxito, 1 = fallo).

### 2. Pruebas de sanitización SQL para ContentoAI
- **Ubicación:** `tests/test_contentoai_sql.py`
- **Propósito:** Envía payloads de inyección SQL al formulario de lista de espera y otros endpoints administrativos. Detecta mensajes de error de base de datos en respuestas.
- **Uso:** `python3 tests/test_contentoai_sql.py`
- **Salida:** Log de vulnerabilidades detectadas.

### 3. Suite de regresión para proyectos existentes
- **Ubicación:** `tests/regression_suite.sh`
- **Propósito:** Ejecuta pruebas de health check, verificación de BD en Villazocotin, flujo básico de Cenarbe (sin checkout), y opcionalmente checkout y sanitización SQL.
- **Uso:** `./tests/regression_suite.sh`
- **Salida:** Resumen de passes/fallos y logs en `/tmp/regression_logs`.

### 4. Script de ejecución nocturna (todo en uno)
- **Ubicación:** `tests/run_nocturnal_tests.sh`
- **Propósito:** Ejecuta todas las pruebas anteriores y genera un informe QA estructurado en formato estándar.
- **Uso:** `./tests/run_nocturnal_tests.sh`
- **Salida:** Informe en `/tmp/qa_logs_<timestamp>/informe_qa.md` y resumen en terminal.

### 5. Scripts existentes reutilizados
- `tests/health_check.sh`: Health check básico de ambos sitios.
- `tests/check_villazocotin_db.sh`: Verificación indirecta de BD Villazocotin.
- `tests/flujo_cenarbe.sh`: Flujo básico de Cenarbe (registro, login, carrito).
- `tests/flujo_completo.py`: Flujo completo anterior (incluye checkout básico).

## Plan de ejecución nocturna

### Cuando Kevin anuncie que ha corregido el bug del carrito:
1. Ejecutar `./tests/run_nocturnal_tests.sh` (o solo `python3 tests/test_cenarbe_checkout.py` para prueba específica).
2. Revisar el informe generado.
3. Si hay fallos, notificar inmediatamente.

### Cuando Sam anuncie que ha corregido la sanitización SQL en ContentoAI:
1. Ejecutar `python3 tests/test_contentoai_sql.py`.
2. Verificar que no se detecten vulnerabilidades (errores SQL visibles).
3. Si se detectan, notificar.

### Durante la noche (cada hora, opcional):
1. Ejecutar `./tests/regression_suite.sh` para detectar regresiones.
2. Registrar resultados en archivo de log.

## Preparación de datos para reporte 09:00 UTC

- **Plantilla de informe:** El script `run_nocturnal_tests.sh` genera automáticamente un informe con el formato requerido por SOUL.md.
- **Estructura:** Incluye Estado QA, Cobertura validada, Casos probados, Edge cases, Regresiones detectadas, Hallazgos, Conclusión y Criterio de salida.
- **Datos a incluir:** Resultados de las pruebas ejecutadas durante la noche. Se recomienda ejecutar el script completo cerca de las 08:30 UTC para capturar el estado final.

## Disponibilidad para pruebas rápidas

- Los scripts están listos para ejecutarse en cualquier momento.
- Para pruebas manuales adicionales, se puede usar el browser tool de OpenClaw (si está disponible) para interacciones complejas.
- En caso de necesitar pruebas específicas no cubiertas, contactar al tester para ampliar cobertura.

## Notas y advertencias

- Los scripts de checkout y registro crean datos reales en la base de datos (usuarios de prueba, reservas). Asegurar que es un entorno de desarrollo.
- Las pruebas de inyección SQL son básicas; una auditoría completa requeriría más payloads y técnicas.
- La verificación de BD en Villazocotin es indirecta (busca errores en frontend). No se tienen credenciales de BD para verificación directa.
- Los logs se guardan en `/tmp/` y pueden perderse en reinicios. Si es necesario, moverlos a workspace.

## Próximos pasos

1. Esperar confirmación de Kevin y Sam sobre correcciones.
2. Ejecutar pruebas correspondientes.
3. Recolectar resultados y generar informe final para 09:00 UTC.
4. Entregar informe al coordinator.

---
*Preparado por subagent tester-nocturno-disponible*