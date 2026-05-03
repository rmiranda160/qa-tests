# Informe QA - Verificación sistema completamente funcional después corrección parse error
Fecha: 2026-03-18 UTC
QA: subagent tester-verificar-sistema-completamente-funcional

## Estado QA: FAIL

## Cobertura validada:
- login.php carga sin errores de parse (HTTP 200, sin mensajes de error PHP)
- register.php carga sin errores de parse (HTTP 200, sin mensajes de error PHP)
- POST login funciona con credenciales incorrectas (devuelve mensaje de error de autenticación)
- POST register responde (HTTP 200) pero falla por token de seguridad inválido

## Casos probados:
1. Solicitud GET a https://dev1.cenarbe.com/login.php - verificación de código 200 y ausencia de errores PHP.
2. Solicitud GET a https://dev1.cenarbe.com/register.php - verificación de código 200 y ausencia de errores PHP.
3. Solicitud POST a login.php con credenciales incorrectas - verificación de respuesta HTTP 200 con mensaje "Email o contraseña incorrectos".
4. Solicitud POST a register.php con datos de prueba (sin token CSRF) - verificación de respuesta HTTP 200 con mensaje de error de token inválido.
5. Solicitud POST a register.php con token CSRF vacío - verificación de respuesta HTTP 500 (error interno).

## Edge cases probados:
- No aplica (verificación básica de funcionalidad)

## Regresiones detectadas:
- Ninguna (el parse error reportado previamente ha sido corregido)

## Hallazgos:

### ID: 1
**Título:** Token CSRF no generado en formulario de registro
**Severidad:** alta
**Descripción:** El formulario de registro (register.php) incluye un campo hidden `csrf_token` con valor vacío. El servidor valida la presencia de un token válido en las solicitudes POST, rechazando las que no lo tienen con el mensaje "Token de seguridad inválido". Esto impide que los nuevos usuarios se registren, ya que el cliente no recibe un token válido para incluir en la solicitud.
**Pasos para reproducir:**
1. Navegar a https://dev1.cenarbe.com/register.php
2. Inspeccionar el elemento `<input type="hidden" name="csrf_token" value="">`.
3. Rellenar el formulario y enviarlo.
4. Observar la respuesta: sección "Errores:" con el mensaje "Token de seguridad inválido. Intenta nuevamente."
**Resultado esperado:** El campo csrf_token debería contener un valor generado por el servidor que permita la validación exitosa del formulario.
**Resultado observado:** El campo está vacío, causando el rechazo de todas las solicitudes POST.
**Impacto:** El registro de nuevos usuarios está completamente bloqueado.
**Recomendación:** Corregir la generación del token CSRF en register.php, asegurando que se almacene en la sesión y se incluya en el formulario.

### ID: 2
**Título:** Login.php carece de protección CSRF
**Severidad:** media
**Descripción:** El formulario de login no incluye token CSRF, lo que lo hace vulnerable a ataques de Cross-Site Request Forgery. Aunque el POST funciona, la ausencia de esta medida de seguridad representa un riesgo.
**Pasos para reproducir:**
1. Navegar a https://dev1.cenarbe.com/login.php
2. Inspeccionar el código fuente en busca de campos hidden con token CSRF.
**Resultado esperado:** Debería existir un token CSRF en el formulario de login.
**Resultado observado:** No hay token CSRF.
**Impacto:** Vulnerabilidad de seguridad que permite ataques CSRF en el endpoint de autenticación.
**Recomendación:** Implementar protección CSRF también en login.php.

## Conclusión:
El sistema ha sido corregido del parse error en register.php (commit 018ca80), y las solicitudes GET a login.php y register.php ya no muestran errores de sintaxis. El POST a login.php funciona correctamente. Sin embargo, la funcionalidad de registro sigue bloqueada debido a que el token CSRF no se genera en el formulario, lo que provoca que todas las solicitudes POST sean rechazadas. Además, el login carece de protección CSRF, lo que introduce una vulnerabilidad de seguridad.

## Criterio de salida:
**Debe volver a desarrollo** para corregir la generación del token CSRF en register.php y, opcionalmente, agregar protección CSRF en login.php.

---
*QA realizado por subagent tester-verificar-sistema-completamente-funcional*