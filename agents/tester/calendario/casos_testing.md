# Casos de Testing - Calendario Cenarbe

## Contexto
Sistema de calendario implementado por Kevin (commit `[FEAT] Sistema de calendario de reservas`).
URL: `https://dev1.cenarbe.com/calendario/`
Tecnología: FullCalendar.js + PHP/MySQL API

## Hallazgos iniciales (análisis 20/03/2026 19:19 UTC)
1. **Página principal `/calendario/`**: Error fatal PHP (Call to undefined function getConfig()). No carga FullCalendar.
2. **API eventos**: `/calendario/api/eventos.php` responde HTTP 200, devuelve array vacío `[]` (con comentarios debug).
3. **API bicicletas**: `/calendario/api/bicicletas.php` responde HTTP 200, devuelve JSON válido con lista de bicicletas.
4. **Otras rutas bajo `/calendario/`**: Todas devuelven 200 pero redirigen a página de inicio (posible rewrite).
5. **Integración con sistema existente**: Enlaces desde `mis-reservas.php` y `reservas.php` por verificar (requiere sesión activa).

## Casos de Testing Definidos

### Caso 1: Carga básica del calendario
**Objetivo**: Verificar que la página del calendario carga sin errores y muestra el componente FullCalendar.
**URL**: `GET /calendario/`
**Criterios de aceptación**:
- HTTP 200 sin errores PHP/JS
- Elemento `#calendar` presente y visible
- Biblioteca FullCalendar cargada (verificar presencia de `.fc-view` o scripts FullCalendar)
- Título "Calendario de Reservas" visible
**Estado actual**: **FALLO** (error fatal PHP)

### Caso 2: Filtros por bicicleta
**Objetivo**: Verificar que el selector de bicicletas carga opciones y filtra eventos.
**Elemento**: `<select id="bicicleta">`
**Criterios de aceptación**:
- Selector visible en la página
- Opciones cargadas desde API (`/calendario/api/bicicletas.php`)
- Cambio de selección filtra eventos en el calendario (verificar llamada API con parámetro `bicicleta_id`)
**Estado actual**: **PENDIENTE** (no se puede verificar sin página funcional)

### Caso 3: Visualización de eventos/reservas
**Objetivo**: Verificar que los eventos se cargan y muestran con colores según estado.
**API**: `GET /calendario/api/eventos.php?bicicleta_id=X&fecha=YYYY-MM`
**Criterios de aceptación**:
- API responde HTTP 200 con JSON válido
- JSON es un array de eventos con campos: `id`, `title`, `start`, `end`, `color`, `estado`
- Los eventos se renderizan en el calendario con colores correspondientes
**Estado actual**: **PARCIAL** (API responde pero array vacío)

### Caso 4: Interacción con el calendario
**Objetivo**: Verificar acciones de usuario: click en fecha, click en evento, cambio de vista.
**Acciones**:
- Click en día: abre modal para nueva reserva (si corresponde)
- Click en evento existente: abre detalles de reserva
- Cambio vista (mensual/semanal/diario): actualiza calendario
**Criterios de aceptación**:
- Navegación entre vistas funciona
- Modales se abren con contenido apropiado
- Los eventos son seleccionables
**Estado actual**: **PENDIENTE**

### Caso 5: Integración con sistema existente
**Objetivo**: Verificar enlaces desde otras páginas al calendario.
**Páginas origen**:
- `mis-reservas.php` → enlace "Ver calendario disponibilidad"
- `reservas.php` → enlace "Ver calendario antes de reservar"
**Criterios de aceptación**:
- Enlaces existen y son visibles
- Redirigen correctamente a `/calendario/`
- Sesión de usuario se mantiene
**Estado actual**: **PENDIENTE** (requiere sesión activa)

### Caso 6: APIs funcionales
**Objetivo**: Verificar que todas las APIs del calendario responden correctamente.
**Endpoints**:
- `GET /calendario/api/eventos.php`
- `GET /calendario/api/bicicletas.php`
- `GET /calendario/api/eventos.php?bicicleta_id=X&fecha=YYYY-MM`
**Criterios de aceptación**:
- Todas responden HTTP 200
- Content-Type: application/json
- Estructura JSON válida
- Manejo de parámetros opcionales
**Estado actual**: **PARCIAL** (eventos.php vacío, bicicletas.php funciona)

## Prioridades
1. **ALTA**: Corregir error fatal en `/calendario/` para habilitar testing funcional.
2. **MEDIA**: Verificar integración con sistema existente.
3. **BAJA**: Testing de interacción completa.

## Notas para desarrollo
- Revisar inclusión de `includes/config.php` o función `getConfig()`.
- Verificar rewrite rules en servidor que redirigen rutas bajo `/calendario/`.
- Crear datos de prueba (eventos) para testing de visualización.