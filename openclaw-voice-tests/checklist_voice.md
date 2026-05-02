# Checklist de Verificación - OpenClaw Voice

## Instrucciones
- [ ] Marque cada ítem con `[x]` cuando esté verificado y funcional
- [ ] Use `[-]` para verificación parcial o con observaciones
- [ ] Use `[ ]` para no verificado o fallido
- [ ] Incluya comentarios breves cuando aplique

## 1. Infraestructura

### Contenedores Docker
- [ ] Contenedor `openclaw-voice-backend` corriendo y saludable
- [ ] Contenedor `openclaw-voice-nginx` corriendo y saludable
- [ ] Contenedor `openclaw-gateway` corriendo y saludable
- [ ] Logs de contenedores sin errores críticos
- [ ] Restart policy configurada adecuadamente

### Puertos Abiertos
- [ ] Puerto 3002 (HTTP) acepta conexiones
- [ ] Puerto 3443 (HTTPS) acepta conexiones con TLS
- [ ] Puerto 3080 redirige HTTP → HTTPS (301/302)
- [ ] Puerto interno del backend (ej. 3001) accesible desde nginx
- [ ] Puerto 18789 (Gateway) responde a HTTP
- [ ] Puertos no esenciales cerrados al exterior

### Conexión con Gateway
- [ ] Backend puede conectar a Gateway (18789)
- [ ] Gateway responde a health check (`/health` o similar)
- [ ] Plugin de STT registrado en Gateway
- [ ] Token de autenticación configurado y válido

### Variables de Entorno
- [ ] `OPENCLAW_GATEWAY_URL` configurada
- [ ] `OPENCLAW_GATEWAY_TOKEN` configurada
- [ ] `STT_MODEL` configurado (base, tiny, etc.)
- [ ] `MAX_AUDIO_DURATION` configurado
- [ ] `PORT` del backend configurado

### Sistema Operativo
- [ ] Uso de CPU dentro de límites (<80% bajo carga)
- [ ] Uso de memoria dentro de límites (<80%)
- [ ] Espacio en disco suficiente (>20% libre)
- [ ] Servicios systemd (si aplica) activos

## 2. Backend

### Health Check
- [ ] `GET /health` responde 200 OK
- [ ] `GET /health` incluye status de servicios dependientes (Gateway)
- [ ] Respuesta JSON con información de versión, uptime

### API de Transcripción
- [ ] `POST /api/transcribe` acepta audio en formato multipart/form-data
- [ ] `POST /api/transcribe` acepta audio en formato raw binary
- [ ] `POST /api/transcribe` acepta audio en base64 JSON
- [ ] Respuesta incluye campo `text` con transcripción
- [ ] Respuesta incluye campo `confidence` (opcional)
- [ ] Respuesta incluye campo `language` detectado
- [ ] Tiempo de respuesta <5 segundos para 10s de audio
- [ ] Códigos de error adecuados (400, 413, 415, 500, 503)

### WebSocket/SSE
- [ ] WebSocket endpoint disponible (`/ws` o similar)
- [ ] Conexión WebSocket establecida correctamente
- [ ] Streaming de audio en tiempo real (chunked)
- [ ] Transcripción parcial enviada por WebSocket/SSE
- [ ] Cierre limpio de conexión

### Formatos de Audio Soportados
- [ ] Audio/webm (Opus, Vorbis)
- [ ] Audio/wav (PCM)
- [ ] Audio/mp3 (MPEG)
- [ ] Audio/ogg (Vorbis)
- [ ] Audio/flac (FLAC)
- [ ] Tasa de muestreo: 16kHz, 44.1kHz, 48kHz
- [ ] Canales: mono, stereo (conversión a mono)

### Integración con Gateway STT
- [ ] Backend envía audio a Gateway STT endpoint
- [ ] Gateway responde con transcripción
- [ ] Manejo de errores de Gateway (timeout, 5xx)
- [ ] Retry con exponential backoff en fallos temporales
- [ ] Circuit breaker para fallos persistentes

### Logs y Monitoreo
- [ ] Logs estructurados (JSON)
- [ ] Métricas expuestas (`/metrics` Prometheus)
- [ ] Trazas distribuidas (OpenTelemetry)
- [ ] Alertas configuradas para errores críticos

## 3. Frontend

### Carga de Página
- [ ] Página carga sin errores JavaScript
- [ ] CSS aplicado correctamente
- [ ] Imágenes/assets cargados
- [ ] Tiempo de carga <3 segundos

### Acceso al Micrófono
- [ ] `navigator.mediaDevices.getUserMedia` disponible
- [ ] Permiso de micrófono solicitado al usuario
- [ ] Interfaz muestra estado de permiso (concedido/denegado)
- [ ] Mensaje claro cuando micrófono no disponible
- [ ] Selector de dispositivo de audio (si múltiples)

### Captura de Audio
- [ ] Botón "Iniciar Voz" inicia grabación
- [ ] Botón "Detener" detiene grabación
- [ ] Visualizador de audio muestra onda de sonido
- [ ] Indicador de nivel de audio (VU meter)
- [ ] Temporizador muestra duración de grabación
- [ ] Grabación se detiene automáticamente al máximo tiempo

### Envío de Audio
- [ ] Audio se envía al backend al detener grabación
- [ ] Audio se envía en tiempo real (streaming) si configurado
- [ ] Indicador de "enviando..." durante transmisión
- [ ] Manejo de errores de red (reintento, mensaje al usuario)

### Recepción de Transcripción
- [ ] Transcripción aparece en interfaz
- [ ] Actualización en tiempo real (para streaming)
- [ ] Formato legible (párrafos, puntuación)
- [ ] Indicador de confianza (ej. color, porcentaje)
- [ ] Botón para copiar transcripción al portapapeles
- [ ] Botón para descargar transcripción como texto

### Compatibilidad de Navegador
- [ ] Chrome/Chromium (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (última versión)
- [ ] Edge (última versión)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Responsive Design
- [ ] Interfaz usable en desktop (>1024px)
- [ ] Interfaz usable en tablet (768px)
- [ ] Interfaz usable en móvil (375px)
- [ ] Elementos táctiles tamaño adecuado

## 4. Integración

### Flujo Completo End-to-End
- [ ] Audio capturado por micrófono → archivo de audio
- [ ] Audio enviado a backend → recibido correctamente
- [ ] Backend procesa audio → envía a Gateway STT
- [ ] Gateway STT transcribe → devuelve texto
- [ ] Backend devuelve respuesta → frontend muestra texto
- [ ] Tiempo total <10 segundos para 30s de audio

### Calidad de Transcripción
- [ ] Audio claro en español: precisión >90%
- [ ] Audio claro en inglés: precisión >85%
- [ ] Audio con ruido moderado: precisión >70%
- [ ] Audio con acento regional: precisión >60%

### Manejo de Errores
- [ ] Micrófono denegado: mensaje claro y opción para reintentar
- [ ] Gateway no responde: mensaje "servicio temporalmente no disponible"
- [ ] Audio demasiado largo: mensaje "excede duración máxima"
- [ ] Red caída: reintento automático o mensaje de error
- [ ] Formato no soportado: mensaje "formato de audio no compatible"

### Resiliencia
- [ ] Reconexión automática después de pérdida de red
- [ ] Timeouts configurados adecuadamente
- [ ] Queue de procesamiento para picos de carga
- [ ] Degradación elegante bajo carga alta

## 5. Seguridad

### HTTPS/TLS
- [ ] Certificado válido (no self-signed en producción)
- [ ] TLS 1.2 o superior
- [ ] Cifrados seguros (no RC4, no SSLv3)
- [ ] Redirección HTTP → HTTPS forzada

### Headers de Seguridad
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Content-Security-Policy` (CSP)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` para micrófono/cámara

### Validación de Entrada
- [ ] Tamaño máximo de audio validado (server-side)
- [ ] Tipo MIME validado (server-side)
- [ ] Sanitización de transcripción output (XSS prevention)
- [ ] Rate limiting por IP/cliente

### Autenticación y Autorización
- [ ] Si requiere autenticación: tokens JWT válidos
- [ ] Si requiere autorización: roles/permissions verificados
- [ ] Logout/invalidación de tokens funcional

### CORS
- [ ] CORS configurado para dominios permitidos
- [ ] Credenciales (cookies) manejadas adecuadamente
- [ ] Métodos HTTP permitidos (`GET`, `POST`, `OPTIONS`)

## 6. Rendimiento

### Pruebas de Carga
- [ ] 5 usuarios simultáneos: respuesta <10s cada uno
- [ ] 10 usuarios simultáneos: respuesta <15s cada uno
- [ ] 100 solicitudes/sec: error rate <1%
- [ ] Memoria estable (no aumenta indefinidamente)
- [ ] CPU picos manejables (<90%)

### Tiempos de Transcripción
- [ ] 10 segundos de audio: <3 segundos procesamiento
- [ ] 1 minuto de audio: <10 segundos procesamiento
- [ ] 5 minutos de audio: <60 segundos procesamiento

### Recursos del Sistema
- [ ] Uso de memoria por proceso <500MB
- [ ] Uso de CPU por proceso <50% en promedio
- [ ] Archivos temporales de audio limpiados después de procesar
- [ ] Conexiones de red cerradas adecuadamente

### Escalabilidad
- [ ] Horizontal scaling posible (múltiples instancias backend)
- [ ] Load balancer configuración
- [ ] Base de datos/cache compartida (si aplica)

## 7. Documentación

### Para Usuarios
- [ ] Instrucciones claras de uso
- [ ] FAQ de problemas comunes
- [ ] Política de privacidad (tratamiento de audio)

### Para Desarrolladores
- [ ] API documentada (OpenAPI/Swagger)
- [ ] Guía de despliegue
- [ ] Guía de troubleshooting

### Para Operaciones
- [ ] Monitoreo y alertas configuradas
- [ ] Plan de recuperación ante desastres
- [ ] Backup de configuraciones

---

## Resultado Final

**Total Verificaciones:** 0/XXX  
**Críticos Fallidos:** 0  
**Mayores Fallidos:** 0  
**Menores Fallidos:** 0  

**Estado General:** 
- [ ] ✅ PASS - Todo funcional
- [ ] ⚠️ PASS_WITH_NOTES - Problemas no críticos
- [ ] ❌ FAIL - Problemas críticos

**Comentarios Finales:**

---

*Checklist actualizado: 2026-03-25*  
*Responsable: Tester*