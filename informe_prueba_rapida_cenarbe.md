# Informe QA - Prueba rápida Cenarbe Bike después de corrección error fatal
Fecha: 2026-03-18 UTC

## Estado QA: PASS

## Cobertura validada:
- Página principal carga correctamente (index.php) sin errores de servidor.
- Login funciona con credenciales válidas (redirección a index.php, sesión iniciada).
- Registro de nuevo usuario funciona básicamente (redirección a index.php, usuario creado).

## Casos probados:
1. **Página principal carga**: solicitud GET a `https://dev1.cenarbe.com`. Código HTTP 200, contenido HTML sin mensajes de error interno (PHP warnings, SQL exceptions). La página muestra el contenido esperado (encabezado, secciones de bicicletas, etc.).
2. **Registro de usuario nuevo**: 
   - Datos usados: nombre=Test, apellidos=User, email único con timestamp, teléfono=123456789, DNI único con timestamp, password=Password123 (≥8 caracteres, mayúscula, minúscula, número), aceptar_terminos=on.
   - Envío POST a `register.php`. Respuesta HTTP 302 con cabecera `Location: index.php`, indicando registro exitoso y autenticación automática.
   - Cookie de sesión (`PHPSESSID`) establecida.
3. **Login con credenciales recién registradas**:
   - Envío POST a `login.php` con el mismo email y contraseña.
   - Respuesta HTTP 302 con `Location: index.php` y nueva cookie de sesión.
   - Verificación de sesión iniciada: carga de `index.php` con las cookies muestra el nombre del usuario ("Test") en la interfaz.

## Edge cases probados:
- Ninguno (prueba rápida enfocada en flujo básico).

## Regresiones detectadas:
- Ninguna en las funcionalidades probadas.

## Hallazgos:
- **ID:** 1  
  **Título:** Visualización de email truncado en barra de usuario  
  **Severidad:** baja  
  **Descripción:** En la barra de usuario (dropdown de usuario) se muestra solo la parte local del email (antes de '@'). Ejemplo: para "test123456@example.com" se muestra "test123456". Esto puede ser una decisión de diseño para abreviar, pero podría confundir a usuarios que esperan ver el email completo.  
  **Pasos para reproducir:**
  1. Registrar un usuario con email que contenga dominio.
  2. Iniciar sesión.
  3. Observar el texto junto al avatar de usuario en la esquina superior derecha.
  **Resultado esperado:** Email completo o al menos indicación clara de que está truncado.  
  **Resultado observado:** Solo se muestra la parte local (antes de '@').  
  **Impacto:** Bajo, no afecta funcionalidad.  
  **Recomendación:** Revisar si es intencional. Si se desea mostrar el email completo, ajustar la plantilla correspondiente.

## Conclusión:
Después de la corrección del error fatal, las tres funcionalidades críticas solicitadas (carga de página principal, login y registro) operan correctamente. El registro crea usuarios válidos y el login los reconoce, permitiendo el acceso a la sesión. No se detectaron bloqueos ni errores en estos flujos básicos.

## Criterio de salida:
**Puede cerrarse** – las funcionalidades probadas están operativas y no se encontraron fallos que impidan el uso básico del sitio.

---
*QA realizado por subagent prueba-rapida-cenarbe-reparado*