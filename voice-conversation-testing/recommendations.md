# RECOMENDACIONES ESPECÍFICAS PARA EQUIPO DEV

Basado en la suite de testing preparada, estas son recomendaciones clave para el desarrollo del sistema de conversación voz↔voz.

## PRIORIDAD CRÍTICA (MVP)

### 1. Monitoreo de Latencia en Tiempo Real
- **Problema:** Los usuarios abandonan si la respuesta tarda >10 segundos
- **Recomendación:** Implementar métricas de tiempo en cada etapa (STT, procesamiento, TTS)
- **Acción:** Exponer endpoint `/metrics` con percentiles P50, P95, P99

### 2. Fallback a Texto Obligatorio
- **Problema:** Si TTS falla, la conversación se rompe
- **Recomendación:** Siempre incluir `response_text` en JSON aunque `audio_url` falle
- **Acción:** Interfaz debe mostrar texto si audio no está disponible después de X segundos

### 3. Estados de UI Claros y Persistentes
- **Problema:** Usuarios no saben qué está pasando durante procesamiento
- **Recomendación:** Implementar máquina de estados visible:
  - `IDLE` → `RECORDING` → `PROCESSING` → `PLAYING` → `IDLE`
- **Acción:** Cada estado con icono, color y texto descriptivo

### 4. Manejo Elegante de Errores de Micrófono
- **Problema:** Denegación de permisos resulta en experiencia rota
- **Recomendación:** Detectar `NotAllowedError` y mostrar guía paso a paso para habilitar micrófono
- **Acción:** Incluir capturas de pantalla de configuraciones de navegadores comunes

## PRIORIDAD ALTA (Experiencia de Usuario)

### 5. Historial Persistente en SessionStorage
- **Problema:** Refresh de página pierde historial de conversación
- **Recomendación:** Guardar historial en `sessionStorage` o `localStorage`
- **Acción:** Recuperar historial al cargar página, indicar "conversación restaurada"

### 6. Control de Volumen Integrado
- **Problema:** Usuarios necesitan ajustar volumen de respuesta TTS
- **Recomendación:** Slider de volumen en interfaz, persistir preferencia
- **Acción:** Icono de altavoz con deslizador al hacer hover

### 7. Visualización de Onda de Audio en Grabación
- **Problema:** Usuarios no saben si micrófono está captando audio
- **Recomendación:** Mostrar waveform en tiempo real durante grabación
- **Acción:** Usar Web Audio API para visualización simple

### 8. Cancelación de Grabación
- **Problema:** Una vez iniciada grabación, no hay manera de cancelar
- **Recomendación:** Botón "Cancelar" o deslizar para cancelar (patrón móvil)
- **Acción:** Timer con opción de cancelar antes de que termine automáticamente

## PRIORIDAD MEDIA (Robustez)

### 9. Reintento Automático en Fallos de Red
- **Problema:** Conexión intermitente rompe flujo
- **Recomendación:** Implementar retry con exponential backoff para peticiones HTTP
- **Acción:** Máximo 2 reintentos, luego mostrar error amigable

### 10. Queue de Procesamiento en Frontend
- **Problema:** Múltiples clicks en botón generan múltiples solicitudes
- **Recomendación:** Deshabilitar botón durante procesamiento, queue de mensajes
- **Acción:** Botón cambia a "Procesando..." y se deshabilita

### 11. Timeouts Configurables por Etapa
- **Problema:** Timeouts genéricos no reflejan diferente naturaleza de STT vs TTS
- **Recomendación:** Timeouts separados:
  - STT: 10 segundos
  - Procesamiento: 5 segundos
  - TTS: 15 segundos
- **Acción:** Configurable por entorno, mostrar progreso por etapa

### 12. Validación de Formato de Audio
- **Problema:** Audio en formato no soportado causa error críptico
- **Recomendación:** Validar formato y sample rate antes de enviar a backend
- **Acción:** Mensaje claro: "Formato de audio no soportado. Use micrófono del navegador."

## PRIORIDAD BAJA (Mejoras)

### 13. Soporte para Continuar Hablando (VAD mejorado)
- **Problema:** Usuarios hacen pausas naturales y grabación termina
- **Recomendación:** Implementar Voice Activity Detection (VAD) más inteligente
- **Acción:** Permitir pausas de hasta 2 segundos antes de cortar

### 14. Compartición de Conversación
- **Problema:** Usuarios quieren compartir conversaciones interesantes
- **Recomendación:** Exportar conversación como texto o imagen
- **Acción:** Botón "Compartir" que genera imagen con historial

### 15. Múltiples Idiomas en Tiempo Real
- **Problema:** Usuarios bilingües quieren cambiar idioma
- **Recomendación:** Selector de idioma que afecte STT y TTS
- **Acción:** Detectar idioma automáticamente con opción de forzar

### 16. Comandos de Voz para Control
- **Problema:** Manos ocupadas (conduciendo, cocinando)
- **Recomendación:** Comandos como "detener", "repetir", "siguiente"
- **Acción:** "Oye [nombre]" para activar por voz

## RECOMENDACIONES TÉCNICAS

### Backend (Sam/Bill)
- **Logs estructurados:** JSON logs con `correlation_id` para seguir flujo completo
- **Circuit breaker:** Para servicios externos (TTS, STT) evitar cascading failures
- **Health checks profundas:** Verificar no solo que servicio corre, sino que puede sintetizar audio
- **Rate limiting por IP:** Evitar abuso, especialmente en endpoints TTS que son costosos

### Frontend (Kevin)
- **Lazy loading de componentes:** Cargar Waveform visualizer solo cuando se necesita
- **Service Worker para cache:** Cachear audios frecuentes (saludos comunes)
- **Progressive Web App:** Permitir instalación en móvil para mejor experiencia
- **Accesibilidad:** ARIA labels, navegación por teclado, alto contraste

### DevOps/Infra
- **Auto-scaling para TTS:** Basado en longitud de texto o requests por segundo
- **CDN para audios:** Audios TTS cacheables, servir desde edge
- **Monitoring dashboard:** Grafana con latencia por percentil, errores por tipo
- **Alertas automáticas:** Si latencia P95 > 8s o error rate > 1%

## METAS DE CALIDAD PARA MVP

| Métrica | Objetivo | Alerta | Crítico |
|---------|----------|--------|---------|
| Latencia total (P95) | < 10s | > 12s | > 15s |
| Tasa de error | < 1% | > 2% | > 5% |
| Satisfacción usuario | > 4/5 | < 3.5/5 | < 3/5 |
| Uso de memoria frontend | < 100MB | > 150MB | > 200MB |

## PRÓXIMOS PASOS INMEDIATOS

1. **Semana 1:** Implementar monitoreo de latencia y fallback a texto
2. **Semana 2:** Estados de UI claros y manejo errores micrófono
3. **Semana 3:** Historial persistente y control de volumen
4. **Semana 4:** Robustez (retry, queue, timeouts)

---

**Nota:** Estas recomendaciones se basan en mejores prácticas de sistemas de conversación y patrones comunes de problemas. Priorizar según capacidad del equipo y feedback de usuarios beta.