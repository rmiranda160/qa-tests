# Suite de Testing - OpenClaw Voice

## Objetivo
Verificar que el sistema OpenClaw Voice funciona completamente, cubriendo infraestructura, backend, frontend, integración, seguridad y rendimiento.

## Contexto
- **Usuario reporta:** "no puede enviar voz"
- **Backend en implementación:** Sam/Bill
- **IP de producción:** 217.182.244.180
- **Puertos expuestos:** 3002 (HTTP), 3443 (HTTPS), 3080 (redirección), 18789 (Gateway)
- **STT Model:** base (CPU)

## Áreas de Testing

### 1. Infraestructura
- Contenedores Docker (backend, nginx)
- Puertos abiertos (3002, 3443, backend interno)
- Conexión con Gateway (18789)
- Variables de entorno configuradas
- Salud de servicios (systemd/docker health)

### 2. Backend
- Health check endpoint (`/health`)
- API de transcripción (`/api/transcribe`)
- WebSocket/SSE para comunicación en tiempo real
- Procesamiento de formatos de audio (webm, wav, mp3, ogg)
- Integración con Gateway STT (plugin de speech-to-text)
- Manejo de errores y códigos de respuesta

### 3. Frontend
- Compatibilidad del navegador (Chrome, Firefox, Safari)
- Acceso al micrófono (`navigator.mediaDevices.getUserMedia`)
- Captura de audio en tiempo real
- Visualizador de audio funcional
- Envío de audio al backend
- Recepción de transcripciones (actualización en tiempo real)
- Interfaz de usuario intuitiva y responsiva

### 4. Integración
- Flujo completo: Micrófono → Frontend → Backend → Gateway → Transcripción
- Tiempos de respuesta (latencia aceptable <5s para transcripción)
- Calidad de transcripción (precisión >80% en audio claro)
- Manejo de errores (micrófono no disponible, Gateway caído, red lenta)
- Reconexión automática después de pérdida de red

### 5. Seguridad
- HTTPS funcionando correctamente (3443) con certificado válido
- Headers de seguridad presentes (HSTS, CSP, X-Content-Type-Options, etc.)
- Validación de entrada (audio, formatos, tamaño máximo)
- Protección contra inyecciones (SQL, comandos)
- Autenticación/autorización si aplica
- CORS configurado adecuadamente

### 6. Rendimiento
- Grabaciones largas (hasta 5 minutos)
- Múltiples usuarios simultáneos (5+)
- Uso de memoria/CPU (dentro de límites)
- Tiempos de transcripción bajo carga
- Escalabilidad horizontal (si aplica)

## Herramientas y Métodos

### Automatización
- `curl`/`wget` para pruebas de API
- Scripts de shell para infraestructura (`infrastructure_test.sh`)
- Navegador automatizado (Puppeteer/Playwright) (`frontend_test.js`)
- Herramientas de análisis de red (`netcat`, `nmap`, `ss`)
- Monitoreo de recursos (`docker stats`, `htop`)
- Generación de audio de prueba (`sox`, `ffmpeg`)

### Métricas
- **Latencia:** Tiempo desde inicio de grabación hasta recepción de transcripción
- **Precisión:** Comparación con texto esperado (WER - Word Error Rate)
- **Disponibilidad:** Porcentaje de tiempo operativo
- **Rendimiento:** Solicitudes por segundo, uso de recursos

## Escenarios de Prueba

### Escenario Feliz (Happy Path)
1. Usuario accede a `http://217.182.244.180:3002` (o HTTPS)
2. Permite acceso al micrófono
3. Haz clic en "Iniciar Voz"
4. Graba mensaje de voz claro (10 segundos)
5. Detiene grabación
6. Recibe transcripción en <5 segundos
7. Transcripción es precisa (>80% accuracy)

### Escenarios de Error
1. **Micrófono no disponible:** Sistema muestra mensaje adecuado
2. **Gateway no responde:** Backend maneja error y notifica al usuario
3. **Audio de mala calidad (ruido):** Sistema intenta transcribir, maneja baja confianza
4. **Tiempo de grabación excesivo (>5min):** Sistema detiene automáticamente o rechaza
5. **Formato de audio no soportado:** Sistema rechaza con mensaje claro
6. **Red caída durante transmisión:** Sistema reintenta o informa error

### Escenarios de Carga
1. **5 usuarios simultáneos:** Cada uno graba 30 segundos de audio
2. **Grabación larga:** 1 usuario graba 3 minutos continuos
3. **Reconexión:** Simular pérdida de red y recuperación
4. **Pico de solicitudes:** 10 transcripciones concurrentes

## Checklist de Verificación

Ver archivo `checklist_voice.md` para checklist detallado con estados.

## Scripts Automatizados

Cada script incluye:
- Configuración (IPs, puertos, rutas)
- Pruebas específicas
- Salida en formato legible (JSON/texto)
- Códigos de salida (0=éxito, ≠0=fallo)

### `scripts/infrastructure_test.sh`
- Verifica contenedores Docker
- Escanea puertos abiertos
- Prueba conectividad con Gateway
- Valida variables de entorno

### `scripts/backend_test.sh`
- Health check
- Envío de audio de prueba (formatos soportados)
- Prueba WebSocket/SSE
- Verifica integración STT

### `scripts/frontend_test.js`
- Pruebas de compatibilidad de navegador
- Acceso a micrófono (simulado)
- Interacción con UI
- Verificación de flujo de transcripción

### `scripts/integration_test.py`
- Flujo completo end-to-end
- Medición de latencia
- Evaluación de calidad (WER)
- Pruebas de resiliencia

### `scripts/security_test.sh`
- Verificación de HTTPS/TLS
- Headers de seguridad
- Validación de entrada
- Pruebas de inyección básicas

### `scripts/performance_test.sh`
- Pruebas de carga (con herramientas como `ab`, `siege`)
- Monitoreo de recursos
- Pruebas de estrés

## Plantillas de Reportes

### `templates/report_template.md`
- Resumen ejecutivo
- Resultados por área
- Problemas identificados (críticos, mayores, menores)
- Recomendaciones
- Evidencia (logs, capturas, métricas)

### `templates/bug_report.md`
- Descripción
- Pasos para reproducir
- Comportamiento esperado vs actual
- Severidad
- Ambiente
- Evidencia

## Criterios de Aceptación

Ver archivo `criteria_acceptance.md` para definición de criterios de aceptación que deben cumplirse para considerar el sistema como "funcional completamente".

## Ejecución

### Requisitos Previos
- Acceso SSH al host (para infraestructura)
- Docker instalado
- Node.js (para pruebas frontend)
- Python 3 (para pruebas de integración)
- Herramientas de línea de comandos (`curl`, `jq`, `nc`, `ffmpeg`)

### Pasos
1. Clonar repositorio de testing
2. Configurar variables de entorno (`export OPENCLAW_IP=217.182.244.180`)
3. Ejecutar scripts en orden:
   ```bash
   cd openclaw-voice-tests
   ./scripts/infrastructure_test.sh
   ./scripts/backend_test.sh
   ./scripts/security_test.sh
   ./scripts/frontend_test.js
   ./scripts/integration_test.py
   ./scripts/performance_test.sh
   ```
4. Generar reporte consolidado:
   ```bash
   ./generate_report.sh
   ```

## Colaboración
- **Sam/Bill:** Implementación del sistema
- **Tester:** Preparación y ejecución de pruebas
- **Coordinator:** Integración de resultados y comunicación con stakeholders

## Entrega Esperada
1. ✅ Suite de testing lista para ejecutar
2. ✅ Scripts automatizados de verificación
3. ✅ Plantilla de reportes
4. ✅ Criterios de aceptación claros

## Referencias
- Documentación de OpenClaw Gateway
- Especificaciones de STT (Speech-to-Text)
- Estándares de seguridad OWASP
- Mejores prácticas de testing de voz

---
*Última actualización: 2026-03-25*
*Responsable: Tester*
*Estado: En desarrollo*