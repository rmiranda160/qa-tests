# Continuous Testing Report

**Fecha:** 2026-03-22 19:27:11 UTC  
**Ciclo:** Testing continuo y testing de coherencia usando skill web-tester

## Aplicaciones evaluadas

1. https://dev1.cenarbe.com/ (Cenarbe Bike Rental)
2. https://contentoai.cenarbe.com/ (ContentoAI)
3. https://villazocotin.cenarbe.com/ (Villazocotin)

## Resultados por aplicación

### Cenarbe Bike Rental
- **Smoke test:** PASS
- **Accessibility test:** PASS (0 violaciones)
- **Errores críticos:** Ninguno

### ContentoAI
- **Smoke test:** PASS
- **Accessibility test:** FAIL (4 violaciones)
  - **Crítico:** `select-name` - Select element sin nombre accesible (impacto critical)
  - **Serious:** `color-contrast` - Contraste de color insuficiente en múltiples elementos (22 instancias)
  - **Serious:** `link-name` - Enlaces sin texto accesible (4 instancias)
  - **Moderate:** `heading-order` - Orden de encabezados inválido (2 instancias)
- **Errores críticos:** SÍ (select-name critical)

### Villazocotin
- **Smoke test:** PASS
- **Accessibility test:** FAIL (3 violaciones)
  - **Serious:** `color-contrast` - Contraste de color insuficiente en múltiples elementos (58 instancias)
  - **Moderate:** `landmark-one-main` - Documento sin landmark principal
  - **Moderate:** `region` - Contenido no contenido por landmarks (6 instancias)
- **Errores críticos:** NO (solo serious/moderate)

## Resumen de errores críticos

1. **ContentoAI - select-name (critical)**
   - Descripción: El elemento select no tiene un nombre accesible (sin label, aria-label, aria-labelledby o title).
   - Impacto: Usuarios de lectores de pantalla no pueden identificar el propósito del control.
   - Elemento: `<select id="planInterest">`
   - Recomendación: Agregar etiqueta `<label>` asociada o atributos ARIA.

## Alertas

Se requiere **notificación al agente coordinator** por errores críticos en ContentoAI (accesibilidad crítica).

## Evidencia

Los resultados completos en formato JSON están en este directorio:
- `cenarbe_smoke.json`, `cenarbe_accessibility.json`
- `contentoai_smoke.json`, `contentoai_accessibility.json`
- `villazocotin_smoke.json`, `villazocotin_accessibility.json`

Las screenshots de responsive tests están en el directorio de playwright-tester/results.

## Ciclo de testing de coherencia (navegador)

No se pudo ejecutar debido a que el browser tool no está disponible en este momento. Se recomienda revisar manualmente la coherencia de botones y acciones (Regla Miranda) en cada aplicación.

## Conclusiones

- ContentoAI presenta **errores críticos de accesibilidad** que deben ser priorizados.
- Villazocotin tiene problemas de contraste de color que afectan accesibilidad (serious).
- Cenarbe pasa todas las pruebas.
- Se recomienda enviar alerta al coordinador para revisión de ContentoAI.

---
*Reporte generado automáticamente por Tester (OpenClaw)*