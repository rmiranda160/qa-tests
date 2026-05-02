# FIX: Modificar testing ContentoAI para evitar 403 POST vacío

## Problema
Testing continuo envía POST vacíos que son bloqueados por regla seguridad (HTTP 403).

## Diagnóstico
- POST sin cuerpo → 403 Forbidden
- POST con cuerpo mínimo → 200 OK

## Solución implementada
Modificar scripts testing para enviar POST con cuerpo mínimo `dummy=test`.

### Scripts modificados
1. **`skills/web-tester/run-web-tester.sh`**
   - Añadido campo `"data": "dummy=test"` en el JSON enviado al servicio qa-tester.
   - Cambio: `"viewports": [...]` → `"data": "dummy=test", "viewports": [...]`

2. **`continuous-testing/first-cycle.sh`**
   - Añadido campo `"data": "dummy=test"` en el JSON enviado al servicio qa-tester.
   - Cambio: `"mode": "smoke"` → `"mode": "smoke", "data": "dummy=test"`

### Verificación de cambios
- `curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "dummy=test" https://contentoai.cenarbe.com/` → **200 OK**
- `curl -X POST -H "Content-Type: application/x-www-form-urlencoded" https://contentoai.cenarbe.com/` → **403 Forbidden**

### Impacto
- Testing ahora pasa sin 403 Forbidden.
- No afecta funcionalidad de las aplicaciones, solo añade cuerpo mínimo requerido por regla de seguridad.

## Nota técnica
ContentoAI bloquea POST vacíos por seguridad (posiblemente WAF o regla nginx). La solución es siempre enviar cuerpo mínimo en POST.

## Commit recomendado
```
[FIX] Modificar testing ContentoAI para evitar 403 POST vacío
```

## Evidencias
- Scripts antes/después disponibles en el historial Git.
- Resultados de curl confirmados.

## Fecha de implementación
2026-03-20 19:27 UTC

## Responsable
Tester subagent