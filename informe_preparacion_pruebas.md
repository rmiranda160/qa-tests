# Informe de Preparación para Pruebas Post-Pull

**Fecha:** 2026-03-18 UTC  
**Agente:** Tester/QA  
**Estado:** Preparación completada

## Contexto
Prepararse para probar después de que Kevin haga pulls:
1. Villazocotin - verificar instalación BD y funcionamiento
2. Cenarbe Bike - probar flujo completo de reserva (registro, login, carrito, checkout)

## Preparativos realizados

### 1. Documentación de planes de prueba
- **`tests/test_plan_villazocotin.md`**: Plan detallado para verificar instalación de BD y funcionamiento de Villazocotin.
- **`tests/test_plan_cenarbe.md`**: Plan detallado para probar flujo completo de reserva en Cenarbe Bike Rental.

### 2. Scripts de verificación automatizada
- **`tests/health_check.sh`**: Health check básico para ambos sitios (verifica accesibilidad HTTP y ausencia de errores PHP visibles).
- **`tests/check_villazocotin_db.sh`**: Verificación indirecta de BD para Villazocotin (errores en frontend, formularios, calendario).
- **`tests/flujo_cenarbe.sh`**: Simulación de flujo de reserva vía curl (registro, login, añadir al carrito, ver carrito, checkout).

### 3. Identificación de URLs y endpoints
#### Villazocotin
- Sitio principal: https://villazocotin.cenarbe.com
- Panel de administración: https://villazocotin.cenarbe.com/admin/login.php
- Formulario de reserva: detectado en página principal (acción por determinar)

#### Cenarbe Bike
- Sitio principal: https://dev1.cenarbe.com
- Registro: https://dev1.cenarbe.com/register.php (POST con campos: nombre, apellidos, email, telefono, password, confirm_password)
- Login: https://dev1.cenarbe.com/login.php (POST con email, password)
- Bicicletas: https://dev1.cenarbe.com/bicicletas.php (formularios POST a /carrito.php con id_bicicleta)
- Carrito: https://dev1.cenarbe.com/carrito.php
- Checkout: https://dev1.cenarbe.com/checkout.php (asumido, por verificar)

### 4. Checklist de verificación rápida
- [ ] Ambos sitios responden HTTP 200.
- [ ] No hay errores PHP fatales visibles.
- [ ] Formularios clave existen (registro, login, añadir al carrito).
- [ ] Panel de administración de Villazocotin accesible.

### 5. Criterios de éxito definidos
#### Villazocotin
- Páginas cargan sin errores de BD.
- Calendario de disponibilidad muestra datos.
- Formulario de reserva tiene campos requeridos.
- Panel de administración permite login (credenciales válidas).

#### Cenarbe Bike
- Registro crea usuario y redirige/login.
- Login inicia sesión correctamente.
- Producto puede añadirse al carrito.
- Carrito muestra producto y calcula total.
- Checkout permite finalizar compra (simulada).

## Próximos pasos (a ejecutar después de pulls de Kevin)
1. Ejecutar `./tests/health_check.sh` para confirmar accesibilidad.
2. Ejecutar `./tests/check_villazocotin_db.sh` para verificación de BD.
3. Ejecutar `./tests/flujo_cenarbe.sh` para prueba de flujo (monitorizar salida y errores).
4. Si los scripts indican problemas, realizar pruebas manuales detalladas con browser (si está disponible).
5. Documentar hallazgos en informe QA estructurado según SOUL.md.

## Notas y advertencias
- Los scripts de flujo realizan acciones reales (creación de usuario, añadir al carrito). Usar en entorno de desarrollo, no en producción.
- Las credenciales de administración de Villazocotin no se probarán por defecto (comentado en script) para evitar bloqueos.
- La verificación de BD es indirecta; para verificación directa se necesitan credenciales de base de datos.
- Se asume que después de los pulls de Kevin, los errores fatales anteriores (ej. $pdo undefined) estarán corregidos.

## Estructura de informe QA final
Al finalizar las pruebas, se generará un informe con formato:

```
Estado QA: PASS | FAIL | PASS_WITH_NOTES
Cobertura validada:
...
Hallazgos:
- ID: ...
  Título: ...
  Severidad: crítica | alta | media | baja
  ...
Conclusión:
...
Criterio de salida: Puede cerrarse | Debe volver a desarrollo
```

## Archivos generados
- `tests/test_plan_villazocotin.md`
- `tests/test_plan_cenarbe.md`
- `tests/health_check.sh`
- `tests/check_villazocotin_db.sh`
- `tests/flujo_cenarbe.sh`
- `informe_preparacion_pruebas.md` (este archivo)

---
Preparado y listo para ejecutar pruebas cuando se indique.