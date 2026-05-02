# Informe QA - Correcciones Sam ContentoAI

**Fecha:** 2026-03-18
**Tester:** Subagent QA
**Sistema:** ContentoAI Landing Page & Waitlist

## Estado QA: FAIL

Las correcciones reportadas por Sam no están funcionando en el entorno desplegado (contentoai.cenarbe.com). El token admin nuevo no es válido, la exportación CSV/JSON no es accesible, el rate limiting sigue siendo 5/minuto (no 15), y no se pudo verificar la mitigación de XSS reflejado por falta de acceso. El panel admin no es accesible con ningún token válido.

## Cobertura validada

- ❌ Token admin nuevo funciona
- ❌ Exportación CSV/JSON descarga archivos
- ❌ XSS token reflejado prevenido
- ❌ Rate limiting 15/minuto funciona
- ❌ Panel admin acceso
- ❌ Estadísticas
- ❌ Paginación

## Casos probados

1. **Token admin nuevo** – acceso denegado (401 Unauthorized).
2. **Token admin antiguo** – error interno del servidor (500).
3. **Exportación CSV/JSON con token nuevo** – 401 Unauthorized.
4. **Rate limiting** – se permiten solo 4 solicitudes exitosas antes del bloqueo (límite ≈5/minuto).
5. **Panel admin acceso** – no accesible (token nuevo inválido, token antiguo error 500).
6. **Estadísticas y paginación** – no accesibles.

## Edge cases probados

- **Rate limiting con solicitudes rápidas** – comportamiento correcto pero límite incorrecto.

## Regresiones detectadas

- Ninguna (no se dispone de versión anterior).

## Hallazgos

### ID: TOKEN-001
**Título:** Token admin nuevo no funciona
**Severidad:** crítica
**Descripción:** El token proporcionado (35788be798509c60127f68763ec29c194757a32b495c0d19fca4bf843aa6ad64) no permite acceso al panel admin. El servidor responde con HTTP 401 y mensaje "Acceso no autorizado". El token antiguo (contentoai_admin_token_2024) produce error 500 interno, indicando posible problema de configuración.
**Pasos para reproducir:**
  1. Navegar a `https://contentoai.cenarbe.com/admin.php?token=35788be798509c60127f68763ec29c194757a32b495c0d19fca4bf843aa6ad64`.
  2. Observar respuesta HTTP 401 y mensaje de acceso no autorizado.
**Resultado esperado:** Panel de administración cargado con estadísticas y lista de espera.
**Resultado observado:** Acceso denegado.
**Impacto:** Imposibilidad de acceder al panel admin para revisar registros, estadísticas o usar exportación.
**Recomendación:** Verificar que el token configurado en el servidor coincida con el proporcionado. Asegurar que la constante ADMIN_TOKEN en admin.php esté actualizada.

### ID: EXPORT-001
**Título:** Exportación CSV/JSON no accesible debido a token inválido
**Severidad:** alta
**Descripción:** Al intentar acceder a los enlaces de exportación (CSV/JSON) con el token nuevo se recibe HTTP 401. Con token antiguo, error 500. Por lo tanto, no es posible probar si la funcionalidad de exportación funciona correctamente.
**Pasos para reproducir:**
  1. Acceder a `https://contentoai.cenarbe.com/admin.php?token=35788be798509c60127f68763ec29c194757a32b495c0d19fca4bf843aa6ad64&export=csv`.
  2. Observar respuesta HTTP 401.
**Resultado esperado:** Descarga de archivo CSV con registros.
**Resultado observado:** Acceso no autorizado.
**Impacto:** No se puede validar la corrección de exportación.
**Recomendación:** Corregir primero el token admin; luego probar exportación.

### ID: RATE-001
**Título:** Rate limiting no actualizado a 15 solicitudes/minuto
**Severidad:** alta
**Descripción:** El límite de solicitudes por IP sigue siendo aproximadamente 5 por minuto (4 exitosas + bloqueo). Se observó que la quinta solicitud falla con error 429. La corrección prometida de 15/minuto no está implementada.
**Pasos para reproducir:**
  1. Enviar 5 solicitudes POST consecutivas al endpoint `/api/submit_waitlist.php` con datos válidos y emails únicos.
  2. Observar que la quinta solicitud recibe error "Demasiadas solicitudes".
**Resultado esperado:** Las primeras 15 solicitudes deben tener éxito.
**Resultado observado:** Solo 4 exitosas (la quinta falla).
**Impacto:** Los usuarios legítimos pueden ser bloqueados prematuramente.
**Recomendación:** Actualizar el valor de `$max_attempts` en `api/config.php` de 5 a 15 y desplegar el cambio.

### ID: ACCESS-001
**Título:** Panel admin inaccesible (error 500 con token antiguo)
**Severidad:** crítica
**Descripción:** El token antiguo, que antes funcionaba (según informe anterior), ahora produce error 500 interno del servidor. Esto sugiere un problema de configuración en el servidor (posiblemente base de datos no disponible o error en el script).
**Pasos para reproducir:**
  1. Navegar a `https://contentoai.cenarbe.com/admin.php?token=contentoai_admin_token_2024`.
  2. Observar respuesta HTTP 500.
**Resultado esperado:** Panel admin cargado.
**Resultado observado:** Error interno del servidor.
**Impacto:** No se puede acceder al panel admin incluso con el token antiguo, impidiendo cualquier operación de administración.
**Recomendación:** Revisar logs del servidor para identificar la causa del error 500 (posiblemente falta de conexión a base de datos, permisos de archivo, o error de sintaxis PHP).

### ID: XSS-001
**Título:** No se pudo verificar mitigación de XSS reflejado por falta de acceso
**Severidad:** media
**Descripción:** Dado que no se dispone de un token válido, no se pudo probar si el parámetro `token` se escapa adecuadamente para prevenir XSS reflejado. En el código local, el token se refleja en los enlaces usando `urlencode()` pero no `htmlspecialchars()`. Sin embargo, no se puede confirmar si la versión desplegada incluye la mitigación.
**Pasos para reproducir:** Requiere token válido para cargar página admin e inyectar payload en parámetro token.
**Resultado esperado:** El token debería escaparse con `htmlspecialchars()` al insertarse en HTML.
**Resultado observado:** No se puede observar por falta de acceso.
**Impacto:** Riesgo potencial de XSS reflejado si no se ha corregido.
**Recomendación:** Una vez solucionado el acceso, probar con payloads como `<script>alert(1)</script>` y verificar que no se ejecute.

## Conclusión

Las correcciones reportadas por Sam **no están implementadas** en el entorno desplegado. El sistema presenta problemas críticos de acceso al panel admin y el rate limiting no cumple con el requisito de 15 solicitudes/minuto. Hasta que se resuelvan estos problemas, no es posible validar la funcionalidad de exportación ni la mitigación de XSS reflejado.

## Criterio de salida

**Debe volver a desarrollo** para corregir:
1. Token admin nuevo (TOKEN-001).
2. Error 500 en panel admin (ACCESS-001).
3. Rate limiting a 15/minuto (RATE-001).

Solo después de que estos puntos sean corregidos se podrá proceder a probar exportación CSV/JSON y XSS reflejado.

---

*Fin del informe.*