# CHECKLIST SISTEMA CONVERSACIÓN VOZ↔VOZ
## Versión: 1.0.0
## Fecha: $(date)

---

## INFRAESTRUCTURA

### Docker y Contenedores
- [ ] Piper TTS contenedor corriendo (`docker ps | grep piper-tts`)
- [ ] Volúmenes Docker montados correctamente
- [ ] Logs de contenedor sin errores críticos

### Backend Extendido
- [ ] Backend accesible en puerto 3001
- [ ] Servicio STT integrado y funcionando
- [ ] Base de datos/conexiones activas
- [ ] Variables de entorno configuradas

### Nginx Proxy
- [ ] Nginx corriendo en puerto 3002
- [ ] Configuración CORS correcta
- [ ] WebSocket support habilitado (si aplica)
- [ ] SSL/TLS configurado (si aplica)

### Puertos y Red
- [ ] Puerto 5500 (Piper TTS) accesible
- [ ] Puerto 3001 (backend) accesible
- [ ] Puerto 3002 (proxy) accesible
- [ ] Firewall permite tráfico en puertos necesarios

---

## ENDPOINTS

### Health Checks
- [ ] GET http://localhost:3001/health → 200 OK + JSON válido
- [ ] GET http://localhost:3002/api/tts/health → 200 OK + JSON válido
- [ ] GET http://localhost:5500/health → 200 OK (si expone)

### Endpoints Funcionales
- [ ] POST /api/conversation (backend) → JSON válido con estructura esperada
- [ ] POST /api/tts (TTS) → Audio WAV/MP3 válido
- [ ] POST /api/stt (si existe) → Texto reconocido

### Headers y CORS
- [ ] CORS headers presentes en respuestas
- [ ] Content-Type correcto (application/json, audio/wav)
- [ ] Options preflight funcionando

---

## FLUJO COMPLETO

### Grabación de Audio
- [ ] Micrófono del navegador accesible
- [ ] Permisos de micrófono solicitados correctamente
- [ ] Grabación inicia al pulsar botón
- [ ] Grabación para automáticamente después de X segundos
- [ ] Visualización de onda de audio en tiempo real
- [ ] Audio grabado en formato WebM/Opus

### STT (Speech-to-Text)
- [ ] Audio enviado a backend
- [ ] STT procesa audio en < 3 segundos
- [ ] Texto reconocido con precisión aceptable (>85%)
- [ ] Manejo de errores si audio no es reconocible
- [ ] Soporte para múltiples idiomas (es, en)

### Procesamiento de Respuesta
- [ ] Lógica de conversación genera respuesta coherente
- [ ] Respuesta en formato texto claro
- [ ] Contexto de conversación mantenido entre turnos
- [ ] Manejo de preguntas sin respuesta (fallback)

### TTS (Text-to-Speech)
- [ ] Texto convertido a audio en < 5 segundos
- [ ] Audio generado en formato compatible (WAV/MP3)
- [ ] Calidad de voz clara y natural
- [ ] Soporte para voces en diferentes idiomas

### Reproducción de Audio
- [ ] Audio descargado automáticamente
- [ ] Reproducción automática al recibir respuesta
- [ ] Controles de pausa/reproducción funcionan
- [ ] Visualización de progreso de reproducción
- [ ] Volumen ajustable y mute funcionan

---

## INTERFAZ USUARIO

### Elementos Visuales
- [ ] Botón de grabación claro e intuitivo (icono + texto)
- [ ] Estados visibles: grabando, procesando, reproduciendo
- [ ] Indicador visual de nivel de audio en grabación
- [ ] Spinner/loader durante procesamiento
- [ ] Historial de conversación muestra mensajes claramente
- [ ] Timestamps en mensajes del historial
- [ ] Identificación de usuario vs sistema en historial

### Controles
- [ ] Botón de grabación cambia de estado visualmente
- [ ] Botón de parada de grabación (si existe)
- [ ] Controles de volumen funcionan
- [ ] Botón de mute funciona
- [ ] Botón de repetir último audio funciona
- [ ] Botón de limpiar historial funciona

### Feedback al Usuario
- [ ] Mensajes de error amigables y comprensibles
- [ ] Indicación de conexión perdida/reconexión
- [ ] Tiempo estimado de procesamiento mostrado
- [ ] Confirmación de audio grabado (duración, tamaño)

---

## CALIDAD

### Latencia
- [ ] STT < 3 segundos (de audio enviado a texto recibido)
- [ ] TTS < 5 segundos (de texto enviado a audio recibido)
- [ ] Total < 10 segundos (de grabación a reproducción)
- [ ] Tiempo de red medido y dentro de límites

### Calidad de Audio
- [ ] Audio de entrada claro (sin ruido excesivo)
- [ ] Audio de salida claro y comprensible
- [ ] Volumen consistente entre respuestas
- [ ] Formato compatible con navegadores principales

### Robustez
- [ ] Reconexión automática si backend cae
- [ ] Fallback a texto si TTS falla
- [ ] Timeouts manejados elegantemente
- [ ] Queue de procesamiento evita pérdida de mensajes
- [ ] Persistencia de historial en refresh de página

### Manejo de Errores
- [ ] Error de micrófono manejado (permiso denegado)
- [ ] Error de red manejado (offline, timeout)
- [ ] Error de backend manejado (500, 404)
- [ ] Error de formato de audio manejado
- [ ] Error de STT (audio no reconocible) manejado

---

## COMPATIBILIDAD

### Navegadores Desktop
- [ ] Chrome última versión
- [ ] Edge última versión
- [ ] Firefox última versión
- [ ] Safari (si aplica)

### Dispositivos Móviles
- [ ] Responsive design en móviles
- [ ] Touch interactions funcionan
- [ ] iOS Safari compatible
- [ ] Android Chrome compatible

### Accesibilidad
- [ ] Soporte para lectores de pantalla
- [ ] Navegación por teclado
- [ ] Contraste de colores adecuado
- [ ] Textos alternativos para iconos

---

## SEGURIDAD

- [ ] No almacenamiento de audio sin consentimiento
- [ ] Comunicaciones HTTPS (en producción)
- [ ] Validación de entrada en backend
- [ ] Rate limiting en endpoints críticos
- [ ] Headers de seguridad (CSP, XSS protection)

---

## NOTAS DEL TESTER

### Configuración de Prueba
- Navegador utilizado: ________________
- Dispositivo: ________________
- Sistema operativo: ________________
- Micrófono utilizado: ________________
- Auriculares/Altavoces: ________________

### Observaciones
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## FIRMA
- Tester: ________________
- Fecha: ________________
- Resultado Final: [ ] PASS [ ] PASS WITH NOTES [ ] FAIL