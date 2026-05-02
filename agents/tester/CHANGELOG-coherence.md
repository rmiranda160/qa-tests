# Cambios en coherence tests - Cenarbe

## Fecha: 2026-03-20 18:27 UTC

### Problema
Coherence tests buscaban términos inexistentes en `mis-reservas.php` causando falsos positivos.

### Diagnóstico
- Testing original buscaba: `['reserva', 'booking', 'alquiler', 'fecha', 'bicicleta']`
- Página real contiene: `'reserva', 'alquiler', 'bicicleta', 'no tienes reservas', 'hacer una reserva'`
- Términos faltantes: `'booking'` (inglés) y `'fecha'` (solo aparece en tabla vacía)

### Solución aplicada
Modificado `coherence-tests.js` en la prueba "Botón 'Mis Reservas' → Página de reservas":
- **ANTES:** `expectedElements: ['reserva', 'booking', 'alquiler', 'fecha', 'bicicleta']`
- **DESPUÉS:** `expectedElements: ['reserva', 'alquiler', 'bicicleta']`

### Justificación
- `'booking'` es término inglés, no aparece en la UI en español.
- `'fecha'` solo aparece en la tabla cuando hay reservas; en estado vacío no está presente.
- `'reserva', 'alquiler', 'bicicleta'` son términos esenciales que siempre deben aparecer.

### Evidencia
- Backup del archivo original: `agents/tester/coherence-tests.js.backup`
- Diff aplicado:
```diff
- expectedElements: ['reserva', 'booking', 'alquiler', 'fecha', 'bicicleta']
+ expectedElements: ['reserva', 'alquiler', 'bicicleta']
```

### Verificación
- Cambio aplicado exitosamente en `/home/node/.openclaw/workspace-tester/coherence-tests.js`
- Se requiere ejecutar pruebas de coherencia para confirmar que desaparecen los falsos positivos.

### Commit recomendado
`[FIX] Ajustar criterios coherence test mis-reservas`