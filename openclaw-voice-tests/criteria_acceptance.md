# Criterios de Aceptación - OpenClaw Voice

## Objetivo
Definir las condiciones que deben cumplirse para considerar que OpenClaw Voice está **completamente funcional y listo para producción**.

## Categorías

### A. Infraestructura (Requisitos Mínimos)
1. **Contenedores en ejecución:**
   - [ ] Contenedor `openclaw-voice-backend` corriendo y saludable
   - [ ] Contenedor `openclaw-voice-nginx` corriendo y saludable
   - [ ] Contenedor `openclaw-gateway` corriendo y saludable
   - [ ] Logs sin errores críticos en últimos 15 minutos

2. **Puertos accesibles:**
   - [ ] Puerto 3002 (HTTP) responde con código 200
   - [ ] Puerto 3443 (HTTPS) responde con código 200 y certificado válido
   - [ ] Puerto 3080 redirige HTTP → HTTPS (301/302)
   - [ ] Puerto 18789 (Gateway) accesible

3. **Conectividad:**
   - [ ] Backend puede conectar a Gateway (timeout < 5s)
   - [ ] Gateway responde a health check interno

### B. Backend (Funcionalidad Central)
4. **Health Check:**
   - [ ] `GET /health` responde 200 OK dentro de 1 segundo
   - [ ] Respuesta JSON incluye `{"status":"ok"}` y versión

5. **Transcripción de audio:**
   - [ ] `POST /api/transcribe` acepta audio WAV (16kHz mono) y devuelve transcripción
   - [ ] Tiempo de respuesta < 5 segundos para audio de 10 segundos
   - [ ] Respuesta JSON incluye campo `text` no vacío
   - [ ] Campo opcional `confidence` presente (valor entre 0 y 1)

6. **Formatos soportados:**
   - [ ] Audio/WAV (PCM) - **Requerido**
   - [ ] Audio/WEBM (Opus) - **Deseable**
   - [ ] Audio/MP3 - **Opcional**

7. **Manejo de errores:**
   - [ ] Audio vacío → HTTP 400 con mensaje claro
   - [ ] Audio > 5 minutos → HTTP 413
   - [ ] Formato no soportado → HTTP 415
   - [ ] Gateway no disponible → HTTP 503

### C. Frontend (Experiencia de Usuario)
8. **Carga de interfaz:**
   - [ ] Página carga sin errores JavaScript en Chrome/Firefox/Safari
   - [ ] Tiempo de carga < 3 segundos

9. **Acceso al micrófono:**
   - [ ] Solicitud de permiso de micrófono al hacer clic en "Iniciar Voz"
   - [ ] Mensaje claro cuando permiso es denegado
   - [ ] Indicador visual de "Escuchando" durante grabación

10. **Grabación y transcripción:**
    - [ ] Botón "Iniciar Voz" inicia grabación
    - [ ] Botón "Detener" detiene grabación y envía audio al backend
    - [ ] Transcripción aparece en interfaz dentro de 10 segundos
    - [ ] Interfaz es usable en móvil (responsive)

### D. Integración (Flujo Completo)
11. **Flujo end-to-end:**
    - [ ] Usuario graba 10 segundos de voz clara en español
    - [ ] Transcripción recibida en < 10 segundos total
    - [ ] Precisión > 80% (palabras correctas vs esperadas)

12. **Resiliencia:**
    - [ ] Si micrófono no disponible, mensaje claro (no crash)
    - [ ] Si Gateway no responde, mensaje "servicio no disponible"
    - [ ] Reconexión automática después de pérdida de red < 30s

### E. Seguridad (Protección Básica)
13. **HTTPS:**
    - [ ] Certificado TLS válido (no self‑signed en producción)
    - [ ] Redirección HTTP → HTTPS forzada

14. **Headers de seguridad:**
    - [ ] `X‑Content‑Type‑Options: nosniff` presente
    - [ ] `X‑Frame‑Options: DENY` presente
    - [ ] `Strict‑Transport‑Security` presente (para producción)

15. **Validación:**
    - [ ] Tamaño máximo de audio validado server‑side (≤ 50 MB)
    - [ ] Tipo MIME validado server‑side

### F. Rendimiento (Escalabilidad Básica)
16. **Carga concurrente:**
    - [ ] 5 usuarios simultáneos pueden transcribir audio de 10s
    - [ ] Latencia promedio < 15 segundos por usuario
    - [ ] 0% de errores (HTTP 5xx)

17. **Recursos:**
    - [ ] Uso de memoria por instancia backend < 1 GB
    - [ ] Uso de CPU < 80% bajo carga máxima esperada

## Métricas de Aceptación

| Métrica | Valor Objetivo | Unidad | Medición |
|---------|----------------|--------|----------|
| Disponibilidad | ≥ 99.9% | % | Uptime últimos 7 días |
| Latencia (p95) | ≤ 5 | segundos | Audio de 10s |
| Precisión (WER) | ≤ 20% | % | Audio claro español |
| Tiempo de respuesta frontend | ≤ 3 | segundos | Page Load |
| Usuarios concurrentes | ≥ 5 | usuarios | Sin degradación |

## Criterios de Fallo
Se considerará **NO APROBADO** si:
- Algún criterio marcado como **Requerido** no se cumple
- La funcionalidad principal (transcripción de voz) no funciona
- Existen vulnerabilidades de seguridad críticas (ej. inyección SQL)
- El sistema no se recupera de errores comunes (ej. Gateway caído)

## Proceso de Verificación
1. **Preparación:** Entorno limpio, datos de prueba listos
2. **Ejecución:** Suite de testing completa (scripts automatizados)
3. **Validación:** Checklist de criterios marcado por tester
4. **Documentación:** Reporte con evidencia (screenshots, logs)
5. **Aprobación:** Firma de tester, desarrollador y coordinator

## Firmas

**Tester:** ____________________   Fecha: ______  
**Desarrollador (Sam/Bill):** ____________________   Fecha: ______  
**Coordinator:** ____________________   Fecha: ______  

---
*Documento vivo: actualizar según cambios en requisitos.*  
*Versión: 1.0.0*  
*Última actualización: 2026-03-25*