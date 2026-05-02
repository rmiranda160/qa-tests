# INFORME QA - Crisis Cenarbe

**Fecha**: 2026-03-19 05:35 UTC
**Tester**: Agente QA
**Base URL**: https://dev1.cenarbe.com

## Estado QA: FAIL

## Cobertura validada:
- Página principal carga correctamente
- Formulario de login muestra error con credenciales inválidas
- Páginas críticas (reservar.php, mi_cuenta.php) accesibles (status 200)
- Navegación básica (Inicio → Bicicletas → Reservas) funciona
- Listado de bicicletas NO contiene modelos esperados (Rockhopper, Talon, Roadmaster)

## Casos probados:
1. Home page load
2. Login form validation (invalid credentials)
3. Bicicletas list visibility
4. Critical pages accessibility
5. Navigation flow

## Edge cases probados:
- Login con credenciales incorrectas (alerta de error)

## Regresiones detectadas:
- Bicicletas faltantes en listado (posible regresión después de script Kevin)

## Hallazgos:

### ID: BIC-001
**Título**: Bicicletas Rockhopper, Talon, Roadmaster no aparecen en listado
**Severidad**: crítica
**Descripción**: Después de ejecutar script de corrección de Kevin, se esperaba que las bicicletas mencionadas estuvieran visibles en bicicletas.php. Sin embargo, no se encuentran en el contenido HTML.
**Pasos para reproducir**:
1. Navegar a https://dev1.cenarbe.com/bicicletas.php
2. Buscar texto "Rockhopper", "Talon", "Roadmaster" (Ctrl+F)
**Resultado esperado**: Al menos una mención de cada modelo.
**Resultado observado**: Ninguna de las tres bicicletas aparece.
**Impacto**: Los clientes no pueden ver ni reservar estas bicicletas, afectando negativamente el negocio.
**Recomendación**: Verificar script de Kevin, revisar base de datos y regenerar listado.

### ID: LH-001 (Pendiente)
**Título**: Auditoría Lighthouse no completada por tiempo
**Severidad**: baja
**Descripción**: No se pudo ejecutar Lighthouse debido a límite de tiempo en la tarea.
**Recomendación**: Ejecutar auditorías por separado.

## Conclusión:
QA falla debido a falta de bicicletas en listado. Las demás funcionalidades probadas funcionan correctamente.

## Criterio de salida:
**Debe volver a desarrollo** para corregir listado de bicicletas.

---

*Reporte generado automáticamente por scripts de testing.*