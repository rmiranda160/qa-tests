# SUITE DE TESTING - SISTEMA CONVERSACIÓN VOZ↔VOZ

## OBJETIVO
Proveer herramientas y procesos para validar end-to-end el sistema de conversación voz↔voz implementado por el equipo.

## ESTRUCTURA

```
voice-conversation-testing/
├── README.md                         # Este archivo
├── scripts/
│   ├── bash/
│   │   └── test-tts-infrastructure.sh    # Pruebas infraestructura
│   └── node/
│       ├── package.json              # Dependencias Node.js
│       └── test-conversation-flow.js # Pruebas flujo completo
├── checklists/
│   └── checklist-voice-conversation.md  # Checklist manual exhaustivo
├── plans/
│   └── user-testing-scenarios.md    # Escenarios prueba usuario real
├── templates/
│   └── report-template.md           # Template reporte profesional
└── results/                         # Resultados de pruebas (generado)
```

## USO RÁPIDO

### 1. Pruebas de Infraestructura (Bash)
```bash
cd voice-conversation-testing/scripts/bash
./test-tts-infrastructure.sh
```

### 2. Pruebas de Flujo Completo (Node.js)
```bash
cd voice-conversation-testing/scripts/node
npm install  # Instalar axios
node test-conversation-flow.js
```

### 3. Checklist Manual
Revisar `checklists/checklist-voice-conversation.md` y marcar items verificados.

### 4. Escenarios Usuario Real
Ejecutar escenarios descritos en `plans/user-testing-scenarios.md`.

### 5. Generar Reporte
Usar `templates/report-template.md` como base para reportes finales.

## DEPENDENCIAS

- **Bash Script:**
  - Docker CLI
  - curl
  - base64

- **Node.js Script:**
  - Node.js >= 14.0.0
  - axios (instalado via `npm install`)

## FLUJO DE TESTING RECOMENDADO

### Fase 1: Infraestructura (Pre-despliegue)
1. Ejecutar script bash de infraestructura
2. Verificar todos los componentes están operativos
3. Corregir problemas antes de continuar

### Fase 2: Funcionalidad Básica (Post-despliegue)
1. Ejecutar script Node.js de flujo completo
2. Verificar latencias dentro de límites
3. Validar estructura de respuestas

### Fase 3: Testing Manual Exhaustivo
1. Completar checklist manual
2. Ejecutar escenarios de usuario real
3. Probar en múltiples navegadores/dispositivos

### Fase 4: Reporte y Retroalimentación
1. Completar template de reporte
2. Priorizar problemas encontrados
3. Entregar recomendaciones al equipo

## MÉTRICAS CRÍTICAS

| Proceso | Límite Aceptable | Límite Ideal |
|---------|------------------|--------------|
| STT (audio → texto) | < 5 segundos | < 3 segundos |
| TTS (texto → audio) | < 8 segundos | < 5 segundos |
| Total (grabación → reproducción) | < 15 segundos | < 10 segundos |
| Precisión STT | > 80% | > 90% |
| Disponibilidad sistema | > 95% | > 99% |

## MANEJO DE ERRORES

El sistema debe manejar elegantemente:
- Permisos de micrófono denegados
- Servicios backend no disponibles
- Conexión de red lenta/perdida
- Audio no reconocible por STT
- Timeouts en procesamiento

## COMPATIBILIDAD MÍNIMA

### Navegadores Desktop
- Chrome 90+
- Firefox 88+
- Edge 90+

### Dispositivos Móviles
- iOS Safari 14+
- Android Chrome 90+

## INTEGRACIÓN CON CI/CD

### Ejemplo GitHub Actions
```yaml
name: Voice Conversation Tests
on: [push, pull_request]

jobs:
  test-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run infrastructure tests
        run: ./voice-conversation-testing/scripts/bash/test-tts-infrastructure.sh

  test-functionality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci --prefix voice-conversation-testing/scripts/node
      - name: Run functional tests
        run: node voice-conversation-testing/scripts/node/test-conversation-flow.js
```

## RESPONSABILIDADES DEL TESTER

1. **Verificación sistemática** - Seguir checklist completo
2. **Registro detallado** - Documentar resultados y problemas
3. **Pruebas realistas** - Simular condiciones de usuario real
4. **Comunicación proactiva** - Reportar problemas críticos inmediatamente
5. **Validación de fixes** - Verificar correcciones antes de marcar como resuelto

## CONTACTO Y SOPORTE

- **Desarrollo Backend (Piper TTS):** Sam/Bill
- **Desarrollo Frontend (Interfaz):** Kevin
- **Coordinación Testing:** [Tester asignado]

## HISTORIAL DE VERSIONES

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-03-25 | Versión inicial de la suite de testing |

---

**Nota:** Esta suite debe evolucionar junto con el sistema. Actualizar checklists y scripts cuando se añadan nuevas funcionalidades.