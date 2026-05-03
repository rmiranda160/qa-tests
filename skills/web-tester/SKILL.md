---
name: web-tester
description: Ejecuta pruebas web funcionales, responsive, visuales y de accesibilidad usando el servicio qa-tester
---

Usa esta skill solo cuando se pida probar una aplicación web o validar:
- funcionalidad básica
- responsive
- accesibilidad
- regresión visual

Herramienta disponible:
{baseDir}/run-web-tester.sh "<URL>" "<MODO>"

Modos soportados:
- smoke
- responsive
- accessibility
- visual
- full

Comportamiento esperado:
1. Identifica la URL objetivo.
2. Elige el modo más adecuado según la petición del usuario.
3. Ejecuta el script:
   {baseDir}/run-web-tester.sh "<URL>" "<MODO>"
4. Lee la salida JSON.
5. Resume el resultado de forma clara.

Al responder:
- indica si la prueba pasó o falló
- resume los hallazgos importantes
- menciona errores funcionales
- menciona problemas responsive
- menciona incidencias de accesibilidad
- menciona fallos visuales si los hubiera
- si no hay incidencias, dilo explícitamente

Ejemplos:
- {baseDir}/run-web-tester.sh "https://dev1.cenarbe.com/" "smoke"
- {baseDir}/run-web-tester.sh "https://dev1.cenarbe.com/" "responsive"
- {baseDir}/run-web-tester.sh "https://dev1.cenarbe.com/" "accessibility"
- {baseDir}/run-web-tester.sh "https://dev1.cenarbe.com/" "full"
