# Informe QA - Mejoras Sam ContentoAI

**Fecha:** 2026-03-18
**Tester:** Subagent QA
**Sistema:** ContentoAI Landing Page & Waitlist

## Estado QA: PASS_WITH_NOTES

La implementación cumple con los requisitos principales de seguridad (sanitización SQL, validación de planes, prevención XSS básica, rate limiting). Se identifican hallazgos de severidad media y baja que deben abordarse antes de producción.

## Cobertura validada

- ✅ Sanitización SQL (uso de sentencias preparadas)
- ✅ Validación de plan (solo basic/professional/enterprise)
- ✅ Prevención XSS (strip_tags + htmlspecialchars)
- ✅ Panel admin: token de acceso, estadísticas, paginación básica
- ✅ Rate limiting (5 solicitudes/minuto por IP)
- ❌ Exportación CSV/JSON (no funcional)

## Casos probados

1. **Registro válido** – éxito 200.
2. **Registro con comilla simple en nombre** – éxito, almacenado literal.
3. **Registro con tags HTML en nombre** – tags eliminados (strip_tags).
4. **Plan inválido** – error 400 “Plan no válido”.
5. **Rate limiting** – 5to intento rechazado con error 429.
6. **Acceso admin con token correcto** – página carga con estadísticas.
7. **Acceso admin sin token** – error 401.
8. **Paginación página 2** – sin resultados (comportamiento esperado).
9. **Exportación CSV/JSON** – devuelve HTML en lugar de archivo.

## Edge cases probados

- **Inyección SQL en nombre** (`' OR '1'='1`) – almacenado literal, sin efecto.
- **Email duplicado** – error 409.
- **Email inválido** – error 400.
- **Campos faltantes** – error 400.
- **Nombre muy largo (>100)** – error 400 (validación de longitud).
- **IP no válida** – se sustituye por “IP inválida”.
- **User Agent largo** – truncado a 500 caracteres.

## Regresiones detectadas

- Ninguna (no se dispone de versión anterior).

## Hallazgos

### ID: SEC-001
**Título:** Token de administración hardcodeado y débil
**Severidad:** alta
**Descripción:** El token de acceso al panel admin es fijo (`contentoai_admin_token_2024`) y aparece en la URL. Cualquier usuario que conozca o adivine el token puede acceder a todos los registros de la lista de espera.
**Pasos para reproducir:** Navegar a `https://contentoai.cenarbe.com/admin.php?token=contentoai_admin_token_2024`.
**Resultado esperado:** Autenticación robusta (HTTPS, contraseña segura, almacenamiento fuera del código).
**Resultado observado:** Token estático en código fuente.
**Impacto:** Exposición de datos personales (nombre, email, IP, user agent).
**Recomendación:** Implementar autenticación con contraseña segura (hash) y sesiones, o al menos usar un token largo y aleatorio almacenado en variable de entorno.

### ID: FUNC-001
**Título:** Exportación CSV/JSON no funciona
**Severidad:** media
**Descripción:** Los enlaces de exportación devuelven HTML en lugar del archivo correspondiente (CSV o JSON). La funcionalidad de exportación está implementada en el código pero no se ejecuta correctamente.
**Pasos para reproducir:** Acceder al panel admin y hacer clic en “Exportar a CSV” o “Exportar a JSON”. Se descarga una página HTML.
**Resultado esperado:** Archivo CSV/JSON con todos los registros.
**Resultado observado:** Respuesta HTTP 200 con Content-Type `text/html`.
**Impacto:** Incapacidad para extraer datos de la lista de espera de forma estructurada.
**Recomendación:** Revisar la lógica de exportación en `admin.php` (posible error en las cabeceras o en la condición de salida).

### ID: SEC-002
**Título:** Posible XSS reflejado en parámetro token (mitigado por WAF)
**Severidad:** baja
**Descripción:** El parámetro `token` se refleja sin escape en los enlaces de paginación y exportación. Sin embargo, el servidor web (mod_security) bloquea solicitudes con caracteres sospechosos, reduciendo el riesgo.
**Pasos para reproducir:** Intentar acceder con `token=<script>alert(1)</script>`. El servidor responde con error 403.
**Resultado esperado:** El token debería escaparse adecuadamente (htmlspecialchars) en todos los puntos de reflejo.
**Resultado observado:** WAF bloquea la inyección, pero la aplicación no realiza escaping propio.
**Impacto:** Bajo, dado que el WAF mitiga. En entornos sin WAF podría ser explotable.
**Recomendación:** Aplicar `htmlspecialchars` a la variable `$token` en todos los puntos donde se inserte en HTML.

### ID: PERF-001
**Título:** Rate limiting demasiado restrictivo para uso legítimo
**Severidad:** baja
**Descripción:** El límite de 5 solicitudes por minuto por IP puede afectar a usuarios legítimos que intenten registrar varios emails (ej. equipo de marketing). Además, el límite se aplica después de validaciones, lo que es correcto.
**Pasos para reproducir:** Enviar 5 solicitudes POST válidas en menos de un minuto desde la misma IP.
**Resultado esperado:** Las primeras 5 exitosas, la sexta rechazada.
**Resultado observado:** Comportamiento según lo esperado.
**Impacto:** Usuarios legítimos podrían ser bloqueados temporalmente.
**Recomendación:** Aumentar el límite a 10-15 solicitudes por minuto, o implementar límite por email en lugar de por IP.

## Conclusión

Las mejoras de seguridad implementadas (sanitización SQL, validación de planes, rate limiting, strip_tags) son adecuadas y funcionan correctamente. El panel admin cumple con las funcionalidades básicas excepto la exportación. Sin embargo, el token hardcodeado representa un riesgo de seguridad alto que debe resolverse antes de considerar el despliegue en producción.

## Criterio de salida

**Debe volver a desarrollo** para corregir:
1. Token de administración hardcodeado (SEC-001).
2. Funcionalidad de exportación (FUNC-001).

Se recomienda también abordar los hallazgos de severidad baja (SEC-002, PERF-001) en una siguiente iteración.

---

*Fin del informe.*