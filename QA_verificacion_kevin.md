# Informe QA - Verificación cambios Kevin (primer bloque Cenarbe)
Fecha: 2026-03-18 UTC

## Estado QA: FAIL

## Cobertura validada:
- Validación JavaScript tiempo real en register.php (contraseñas, DNI, teléfono)
- CSRF protección login.php y register.php (token presente y validado)
- Documentación creada (DOCUMENTACION.md)

## Casos probados:
- Revisión de código fuente de register.php, login.php, includes/functions.php, script.js, header.php, footer.php
- Búsqueda de tokens CSRF en archivos PHP
- Búsqueda de archivo DOCUMENTACION.md en el proyecto

## Edge cases probados:
- No aplica (solo revisión estática)

## Regresiones detectadas:
- ninguna

## Hallazgos:

### ID: 1
**Título:** Validación JavaScript tiempo real insuficiente en register.php  
**Severidad:** media  
**Descripción:** El archivo register.php no incluye validación JavaScript en tiempo real para contraseñas, DNI y teléfono. Solo cuenta con validación HTML5 (atributos required, minlength). Existe un script.js que contiene validación de teléfono, pero no se carga en register.php (no se incluye en header.php ni footer.php). No hay validación de formato de DNI ni de fortaleza de contraseñas en tiempo real.  
**Pasos para reproducir:**
1. Abrir register.php en el navegador.
2. Inspeccionar el código fuente.
3. Buscar scripts de validación en línea o referencias a script.js.
**Resultado esperado:** Debería haber validación JavaScript que muestre mensajes en tiempo real al usuario mientras completa los campos (contraseña segura, DNI válido, teléfono válido).  
**Resultado observado:** Solo validación HTML5 básica. No se carga script.js (no se referencia en header ni footer).  
**Impacto:** Experiencia de usuario deficiente; los usuarios no reciben feedback inmediato sobre errores de formato.  
**Recomendación:** Incluir script.js en header.php o footer.php y asegurar que las funciones de validación se activen para los campos de register.php. Implementar validación específica para DNI (formato español) y contraseñas (mínimo 6 caracteres, mayúsculas, números).

### ID: 2
**Título:** Falta protección CSRF en login.php y register.php  
**Severidad:** alta  
**Descripción:** Los formularios de login y registro no implementan tokens CSRF, lo que los hace vulnerables a ataques de Cross-Site Request Forgery. No se genera ni valida ningún token en las solicitudes POST.  
**Pasos para reproducir:**
1. Examinar login.php y register.php en busca de campos hidden con token CSRF.
2. Buscar en el código PHP la generación y validación de tokens.
**Resultado esperado:** Debería existir un token único por sesión en un campo hidden, y el backend debe validarlo antes de procesar la solicitud.  
**Resultado observado:** No hay tokens CSRF en los formularios. No hay funciones de CSRF en includes/functions.php.  
**Impacto:** Vulnerabilidad de seguridad que permite a atacantes realizar registros o logins no autorizados en nombre de usuarios víctimas.  
**Recomendación:** Implementar generación de token CSRF en sesión, incluirlo en formularios como campo hidden, y validarlo en el lado del servidor.

### ID: 3
**Título:** Documentación DOCUMENTACION.md no creada  
**Severidad:** baja  
**Descripción:** No se encuentra el archivo DOCUMENTACION.md en el proyecto. Existen otros archivos de documentación (RESUMEN_CAMBIOS_BAJABIKES.md, INSTALACION.md, etc.), pero no el solicitado.  
**Pasos para reproducir:**
1. Buscar DOCUMENTACION.md en el directorio del proyecto.
**Resultado esperado:** Debería existir DOCUMENTACION.md con información del proyecto, estructura, instrucciones.  
**Resultado observado:** Archivo no encontrado.  
**Impacto:** Incumplimiento de requisito; falta documentación centralizada.  
**Recomendación:** Crear DOCUMENTACION.md con la documentación general del proyecto.

## Conclusión:
Los tres puntos verificados presentan deficiencias. La validación JavaScript en tiempo real es insuficiente, falta protección CSRF crítica, y no se ha creado la documentación solicitada. No se puede aprobar el primer bloque de trabajo.

## Criterio de salida:
**Debe volver a desarrollo** para corregir los hallazgos de severidad alta y media, y completar la documentación.

---
*QA realizado por subagent tester-verificar-cambios-kevin*