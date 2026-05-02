# Diagnóstico: Advertencia "funcionalidad no detectable" en formulario reserva

**Fecha:** 2026-03-20 19:03 UTC  
**URL:** https://dev1.cenarbe.com/reservas.php  
**Problema:** Testing reporta advertencia "Advertencia en formulario reserva (funcionalidad no detectable)"

## Hallazgos

### 1. Análisis HTML de reservas.php
- Página responde HTTP 200
- No contiene etiqueta `<form>` en el HTML inicial
- No contiene `<input>`, `<select>`, `<button>` (excepto navbar)
- Muestra mensaje "Tu reserva está vacía" con enlace a bicicletas
- No hay scripts inline ni externos que carguen formulario dinámicamente
- No hay handlers `onsubmit`, `onclick`, `addEventListener`

### 2. Comportamiento con carrito
- Se añadió bicicleta al carrito mediante POST a `/carrito.php` (acción "agregar")
- La respuesta fue redirección 302, pero el carrito no muestra formulario de reserva
- Incluso con item en carrito, `reservas.php` sigue sin mostrar formulario
- No hay indicios de formulario de reserva en carrito.php

### 3. Integración con calendario
- Existe `calendario.php` con múltiples botones "Reservar" (enlaces `<a>`)
- Los botones "Reservar" tienen clase `btn btn-bajabikes-orange` pero no son formularios
- Calendario.php incluye formulario de filtro (GET) pero no formulario de reserva

### 4. Posibles causas de "funcionalidad no detectable"
**A. Formulario no existe en DOM** ✅ Confirmado: No hay `<form>` en reservas.php  
**B. Botón no tiene event listener** ✅ No hay botón de reserva  
**C. JavaScript no se ejecuta** ✅ No hay JavaScript relevante  
**D. Formulario usa AJAX no detectable** ❌ No aplica (no hay formulario)  
**E. Redirección no detectable** ❌ No aplica  

**Causa raíz:** La funcionalidad de reserva no está implementada como formulario tradicional en `reservas.php`. El flujo actual parece ser:
1. Usuario selecciona bicicleta en `calendario.php` o `bicicletas.php`
2. Añade al carrito (POST a `carrito.php`)
3. ¿Procede a checkout? (no identificado)
4. ¿Reserva finalizada? (no identificado)

### 5. Verificación de Regla Miranda
- ❌ **Botón existe en DOM**: No hay botón de reserva en reservas.php
- ❌ **Botón clickeable**: No aplica
- ❌ **Event listener**: No aplica
- ❌ **Acción detectable**: No aplica

**Conclusión:** La advertencia de testing es correcta. No hay funcionalidad de reserva detectable en la página `reservas.php`.

## Soluciones inmediatas

### Opción A (Recomendada): Implementar formulario de reserva en reservas.php
- Mostrar formulario cuando hay items en el carrito
- Campos: datos de usuario, fechas, bicicletas seleccionadas, botón "Confirmar reserva"
- Usar `method="post"` y `action="reservas.php?action=create"`
- Añadir atributos `data-testid="form-reserva"` y `data-testid="btn-confirmar"`

### Opción B: Hacer detectable el flujo actual
- Añadir `data-testid="btn-reservar"` a los enlaces "Reservar" en calendario.php
- Asegurar que el flujo de carrito → reserva sea detectable (redirecciones claras)
- Incluir parámetros en URL para tracking (ej: `reservas.php?action=checkout`)

### Opción C: Simplificar formulario (submit tradicional)
- Si hay lógica AJAX, agregar fallback tradicional para testing
- Asegurar que el submit del formulario cause navegación detectable

### Opción D: Actualizar testing para detectar flujo actual
- Modificar tests para seguir el flujo: calendario → carrito → checkout
- Requiere identificar endpoint de creación de reserva

## Próximos pasos urgentes
1. **Identificar endpoint de creación de reserva** (POST a qué URL?)
2. **Verificar si requiere autenticación**
3. **Probar flujo completo con usuario logueado**
4. **Implementar solución antes de 19:15 UTC**

## Evidencias adjuntas
- `reservas.html` - HTML inicial de reservas.php
- `reservas_con_carrito.html` - HTML después de añadir item al carrito
- `carrito_response.html` - Respuesta de POST a carrito.php
- `calendario.html` - Página de calendario con botones "Reservar"

**Prioridad:** ALTA CRÍTICA - Core business de reservas afectado.