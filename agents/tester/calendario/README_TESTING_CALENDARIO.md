# Testing Calendario Cenarbe

## Objetivo
Validar la nueva funcionalidad de calendario de reservas implementada por Kevin (commit `[FEAT] Sistema de calendario de reservas`).

## Estado actual (20/03/2026 19:20 UTC)
- **Página principal**: ERROR FATAL (Call to undefined function getConfig())
- **APIs**: Parcialmente funcionales (`bicicletas.php` OK, `eventos.php` vacío)
- **Integración**: Pendiente de verificación (requiere sesión)

## Requisitos previos
1. Sesión activa en dev1.cenarbe.com (cookie PHPSESSID válida)
2. Node.js y Playwright instalados (ya presentes en entorno)
3. Acceso al contenedor de testing remoto (51.254.244.216:3000)

## Ejecución de tests

### Tests API (independientes de UI)
```bash
cd /home/node/.openclaw/workspace-tester
npm test -- agents/tester/calendario/tests/calendario-cenarbe.spec.js
```

O ejecutar directamente con Playwright:
```bash
npx playwright test agents/tester/calendario/tests/calendario-cenarbe.spec.js --reporter=line
```

### Testing manual básico (contenedor remoto)
```bash
# Probar carga calendario (actualmente falla)
curl -X POST "http://51.254.244.216:3000/test/smoke" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://dev1.cenarbe.com/calendario/"}'

# Probar API eventos
curl -X POST "http://51.254.244.216:3000/test/api" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://dev1.cenarbe.com/calendario/api/eventos.php", "method":"GET", "expectedStatus":200}'

# Probar API bicicletas
curl -X POST "http://51.254.244.216:3000/test/api" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://dev1.cenarbe.com/calendario/api/bicicletas.php", "method":"GET", "expectedStatus":200}'
```

### Tests de integración (requiere sesión)
1. Obtener cookie de sesión válida (ver archivo cookies.txt en workspace raíz)
2. Ejecutar tests de integración con Playwright (los tests detectan automáticamente si hay redirección a login)

## Casos de prueba

### 1. Carga básica del calendario
**Criterios PASS**:
- HTTP 200 sin errores PHP/JS
- Elemento `#calendar` presente
- FullCalendar cargado (clase `.fc-view`)
- Título "Calendario de Reservas" visible

**Estado**: FALLO (error fatal)

### 2. Filtros por bicicleta
**Criterios PASS**:
- Selector `#bicicleta` visible
- Opciones cargadas desde API
- Cambio de selección filtra eventos

**Estado**: PENDIENTE (requiere página funcional)

### 3. Visualización de eventos
**Criterios PASS**:
- API `/calendario/api/eventos.php` responde JSON array
- Eventos se renderizan en calendario con colores según estado

**Estado**: PARCIAL (API responde pero array vacío)

### 4. Interacción calendario
**Criterios PASS**:
- Click en fecha abre modal
- Click en evento muestra detalles
- Cambio de vista (mes/semana/día) funciona

**Estado**: PENDIENTE

### 5. Integración con sistema existente
**Criterios PASS**:
- Enlace desde `mis-reservas.php` a calendario existe y redirige correctamente
- Enlace desde `reservas.php` a calendario existe y redirige correctamente

**Estado**: PENDIENTE (requiere sesión)

### 6. APIs funcionales
**Criterios PASS**:
- Todas las APIs responden HTTP 200 con JSON válido
- Parámetros opcionales funcionan (`bicicleta_id`, `fecha`)

**Estado**: PARCIAL

## Criterios de aceptación globales
Para considerar la funcionalidad como **PASS**, se deben cumplir **todos** los siguientes:

1. ✅ Página `/calendario/` carga sin errores
2. ✅ Selector de bicicletas carga opciones y filtra eventos
3. ✅ Eventos de reserva se visualizan correctamente (colores, tooltips)
4. ✅ Interacción básica (click fecha, click evento) funciona
5. ✅ Integración con páginas existentes (`mis-reservas.php`, `reservas.php`)
6. ✅ APIs responden consistentemente

## Alertas configuradas
En el sistema de testing continuo, se han configurado alertas para:
- Fallo en carga de página calendario
- Fallo en APIs de calendario
- Cambios en respuesta de APIs (estructura JSON)

## Próximos pasos
1. **Corregir error fatal** en `/calendario/` (función `getConfig()`)
2. **Crear datos de prueba** (eventos de reserva) para validar visualización
3. **Verificar integración** con sesión de usuario
4. **Ejecutar batería completa** de tests una vez corregido el error

## Referencias
- [Casos de testing detallados](casos_testing.md)
- [Script Playwright](tests/calendario-cenarbe.spec.js)
- [Configuración testing continuo](../../continuous-testing/config.json)