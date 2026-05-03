# Reporte de Testing Continuo - Ciclo 20260319_092029

## Estado QA: FAIL

## Cobertura validada:
- Cenarbe Bike Rental (https://dev1.cenarbe.com/)
  - Smoke test (raíz, /reservar.php, /checkout.php)
  - Responsive test (raíz)
  - Accessibility test (raíz)
- ContentoAI (https://contentoai.cenarbe.com/)
  - Smoke test (raíz, /api/submit_waitlist.php)
  - Responsive test (raíz)
- Villa Zocotin (https://villazocotin.cenarbe.com/)
  - Smoke test (raíz)
  - Responsive test (raíz)

## Casos probados:
1. Smoke test: carga de página, título no vacío, body visible.
2. Responsive test: sin overflow horizontal en viewports móvil, tablet, desktop.
3. Accessibility test: sin violaciones graves (critical/serious) según axe-core.

## Edge cases probados:
- Rutas críticas de reserva y checkout (Cenarbe).
- Endpoint API (ContentoAI).

## Regresiones detectadas:
No evaluado (sin baseline previo).

## Hallazgos:

### ID: ACC-001
**Título:** Múltiples violaciones de accesibilidad en Cenarbe Bike Rental.
**Severidad:** crítica
**Descripción:** La prueba de accesibilidad detectó 1575 violaciones, incluyendo:
- Botones sin texto discernible (impacto crítico).
- Contraste de color insuficiente (impacto serio).
- Formularios sin etiquetas (impacto crítico).
- Select sin nombre accesible (impacto crítico).
- Enlaces sin texto accesible (impacto serio).
**Pasos para reproducir:**
1. Navegar a https://dev1.cenarbe.com/
2. Ejecutar auditoría axe-core.
**Resultado esperado:** Cero violaciones críticas/serias.
**Resultado observado:** 1575 violaciones (críticas y serias).
**Impacto:** Usuarios con discapacidad no pueden utilizar el sitio correctamente. Incumplimiento de WCAG.
**Recomendación:** Revisar y corregir los problemas identificados, especialmente botones, etiquetas de formulario y contraste.

### ID: RESP-001
**Título:** Overflow horizontal en vista móvil de Villa Zocotin.
**Severidad:** alta
**Descripción:** La prueba responsive falló en viewport móvil (390x844) debido a overflow horizontal.
**Pasos para reproducir:**
1. Navegar a https://villazocotin.cenarbe.com/
2. Reducir viewport a 390px de ancho.
3. Detectar scroll horizontal.
**Resultado esperado:** Sin overflow horizontal.
**Resultado observado:** Overflow horizontal presente.
**Impacto:** Mala experiencia en móviles, contenido cortado.
**Recomendación:** Ajustar CSS para evitar overflow en móvil.

### ID: SMOKE-001
**Título:** Endpoint API sin título (ContentoAI /api/submit_waitlist.php).
**Severidad:** baja
**Descripción:** Smoke test espera título no vacío, pero el endpoint API devuelve contenido sin título.
**Pasos para reproducir:**
1. Navegar a https://contentoai.cenarbe.com/api/submit_waitlist.php
**Resultado esperado:** Página con título (o smoke test adaptado para APIs).
**Resultado observado:** Título vacío, timeout.
**Impacto:** Falso positivo en smoke test; no afecta funcionalidad.
**Recomendación:** Excluir endpoints API de smoke test o modificar criterio de validación.

## Conclusión:
Se detectaron errores críticos y altos que afectan la accesibilidad y usabilidad móvil. El estado actual no es aceptable para producción.

## Criterio de salida:
**Debe volver a desarrollo** para corregir los hallazgos críticos/altos antes de cerrar el ciclo.

---
*Reporte generado automáticamente por agente tester/QA.*
