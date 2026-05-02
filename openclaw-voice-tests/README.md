# OpenClaw Voice - Suite de Testing

Suite completa de pruebas para verificar funcionalidad de voz (STT - Speech-to-Text) en OpenClaw.

## Estructura

```
openclaw-voice-tests/
├── README.md                          # Este archivo
├── voice_testing_suite.md             # Documento principal de estrategia
├── checklist_voice.md                 # Checklist detallado de verificación
├── criteria_acceptance.md             # Criterios de aceptación
├── scripts/                           # Scripts automatizados
│   ├── infrastructure_test.sh         # Pruebas de infraestructura
│   ├── backend_test.sh                # Pruebas de backend (API)
│   ├── frontend_test.sh               # Pruebas frontend light (bash)
│   ├── frontend_test.js               # Pruebas frontend con Puppeteer
│   ├── integration_test.py            # Pruebas de integración (Python)
│   ├── security_test.sh               # Pruebas de seguridad
│   └── performance_test.sh            # Pruebas de rendimiento
├── templates/                         # Plantillas de reportes
│   ├── report_template.md             # Plantilla de reporte completo
│   └── bug_report.md                  # Plantilla de bug report
├── test-data/                         # Datos de prueba (audio, etc.)
└── screenshots/                       # Capturas de pantalla (generadas)
```

## Requisitos Previos

### Herramientas necesarias
- **Bash**: Shell para scripts básicos
- **curl**: Cliente HTTP para pruebas de API
- **jq**: Procesamiento JSON (recomendado)
- **nc** (netcat): Pruebas de puertos
- **docker**: Para verificar contenedores (opcional)
- **Node.js** (v16+): Para pruebas frontend con Puppeteer
- **Python 3** (3.8+): Para pruebas de integración
- **sox** o **ffmpeg**: Generación de audio de prueba

### Instalación rápida (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y curl jq netcat docker.io nodejs python3 python3-pip sox ffmpeg
pip3 install requests
npm install puppeteer  # dentro del directorio scripts/ si se usa frontend_test.js
```

## Configuración

1. Clonar o copiar esta suite en el entorno de testing.
2. Configurar variables de entorno:
   ```bash
   export OPENCLAW_IP="217.182.244.180"
   export HTTP_PORT="3002"
   export HTTPS_PORT="3443"
   export USE_HTTPS="false"  # o "true" para HTTPS
   ```
3. Ajustar parámetros según necesidad en los scripts.

## Uso

### Ejecución completa (recomendado para testing inicial)
```bash
cd openclaw-voice-tests
chmod +x scripts/*.sh scripts/*.py

# Ejecutar en orden
./scripts/infrastructure_test.sh
./scripts/backend_test.sh
./scripts/security_test.sh
./scripts/frontend_test.sh
python3 scripts/integration_test.py
./scripts/performance_test.sh
```

### Ejecución selectiva
```bash
# Solo infraestructura
./scripts/infrastructure_test.sh

# Solo backend
./scripts/backend_test.sh

# Solo frontend (bash light)
./scripts/frontend_test.sh

# Frontend con navegador real (requiere Node.js y Puppeteer)
node scripts/frontend_test.js

# Solo seguridad
./scripts/security_test.sh

# Solo rendimiento
./scripts/performance_test.sh

# Integración completa
python3 scripts/integration_test.py
```

### Generación de reporte
1. Ejecutar todas las pruebas
2. Recopilar salidas en un directorio de logs
3. Usar plantilla `templates/report_template.md` para crear reporte manualmente

Actualmente no hay script automatizado de consolidación; se planea agregar `generate_report.sh`.

## Interpretación de Resultados

### Códigos de salida
- **0**: Todas las pruebas pasaron
- **1**: Al menos una prueba falló
- **2**: Error en configuración o dependencias

### Niveles de severidad
- **CRÍTICO**: Bloquea funcionalidad principal. Debe resolverse antes de release.
- **MAYOR**: Afecta experiencia de usuario significativamente. Debe resolverse pronto.
- **MENOR**: Cosmético o mejora. Puede posponerse.

## Checklist Rápido

Antes de considerar el sistema listo para producción, verificar:

- [ ] Frontend carga en `http://IP:3002`
- [ ] Botón "Iniciar Voz" funciona
- [ ] Permiso de micrófono solicitado
- [ ] Audio se envía al backend (`/api/transcribe`)
- [ ] Transcripción devuelta en <10 segundos
- [ ] Texto es razonablemente preciso
- [ ] HTTPS funciona en puerto 3443
- [ ] No hay errores en consola JavaScript

## Solución de Problemas

### Scripts no ejecutables
```bash
chmod +x scripts/*.sh
```

### Dependencias faltantes
Instalar según lista anterior.

### Puppeteer no se instala
```bash
cd scripts && npm init -y && npm install puppeteer
```

### Certificado self-signed
Los scripts usan `-k` en curl para ignorar certificados inválidos. En producción, usar certificado válido.

### Gateway no responde
Verificar que el servicio OpenClaw Gateway esté corriendo en puerto 18789.

## Colaboración

- **Tester**: Ejecuta pruebas, reporta bugs, actualiza checklist
- **Desarrollador (Sam/Bill)**: Implementa fixes, verifica criterios
- **Coordinator**: Integra resultados, comunica estado

## Mejoras Futuras

1. **Automatización CI/CD**: Integrar con GitHub Actions/GitLab CI
2. **Dashboard de métricas**: Visualización de resultados de testing
3. **Pruebas de compatibilidad**: Más navegadores y dispositivos
4. **Pruebas de accesibilidad**: WCAG compliance
5. **Monitoreo en tiempo real**: Alertas de degradación

## Contacto

- **Responsable testing**: Tester (OpenClaw)
- **Documentación**: Actualizar según cambios en sistema

---
*Última actualización: 2026-03-25*  
*Versión suite: 1.0.0*