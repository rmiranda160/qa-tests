# ESCENARIOS PRUEBA USUARIO REAL
## Sistema de Conversación Voz↔Voz
## Versión: MVP 1.0

---

## OBJETIVO
Validar la experiencia de usuario real del sistema de conversación voz↔voz en condiciones reales de uso.

## METODOLOGÍA
- Cada escenario debe ser ejecutado por al menos 2 testers diferentes
- Registrar tiempos, problemas y observaciones
- Usar dispositivos y navegadores variados
- Simular condiciones de red reales (WiFi, 4G, conexión lenta)

---

## ESCENARIO 1: CONVERSACIÓN BÁSICA - "HOLA MUNDO"

### Objetivo
Verificar que un usuario nuevo pueda tener una conversación básica sin problemas.

### Pasos
1. **Acceso inicial**
   - Navegar a `https://dominio:3443/voice-conversation.html`
   - Aceptar permisos de micrófono si se solicitan
   - Verificar que la interfaz carga completamente

2. **Primera interacción**
   - Identificar botón principal "Hablar ahora" / "Presiona para hablar"
   - Hacer clic/tocar el botón
   - Verificar cambio visual (color, icono, texto)
   - Escuchar tono de inicio de grabación (si existe)

3. **Grabación de mensaje**
   - Decir claramente: "Hola, ¿cómo estás?"
   - Esperar 2-3 segundos después de hablar
   - Soltar botón / esperar finalización automática
   - Verificar indicador "Procesando..." / spinner

4. **Recepción de respuesta**
   - Esperar respuesta de voz (tiempo máximo 15 segundos)
   - Verificar que audio se reproduce automáticamente
   - Escuchar claridad y naturalidad de voz
   - Verificar que texto aparece en historial

5. **Verificaciones post-conversación**
   - Historial muestra:
     - Mensaje usuario: "Hola, ¿cómo estás?" (o transcripción)
     - Mensaje sistema: Respuesta textual
   - Timestamps visibles
   - Iconos diferenciados usuario/sistema

### Criterios de Éxito
- ✅ Audio grabado correctamente
- ✅ Respuesta recibida en < 10 segundos
- ✅ Audio de respuesta claro y comprensible
- ✅ Historial actualizado correctamente
- ✅ Usuario entiende qué está pasando en cada paso

---

## ESCENARIO 2: CONVERSACIÓN MÚLTIPLE - CONTEXTO MANTENIDO

### Objetivo
Verificar que el sistema mantiene contexto entre múltiples turnos de conversación.

### Pasos
1. **Iniciar como Escenario 1**
   - Realizar conversación básica exitosa

2. **Segundo turno inmediato**
   - Después de respuesta, esperar 2 segundos
   - Pulsar botón de nuevo
   - Decir: "¿Qué hora es?"
   - Soltar botón

3. **Verificar contexto**
   - Respuesta debe hacer referencia a conversación anterior o ser coherente
   - Ejemplo aceptable: "Son las 15:30. ¿En qué más puedo ayudarte?"
   - Historial debe mostrar 4 mensajes (2 usuario, 2 sistema)

4. **Tercer turno con cambio de tema**
   - Esperar 3 segundos
   - Pulsar botón
   - Decir: "Háblame sobre el clima"
   - Verificar respuesta relacionada con clima

### Criterios de Éxito
- ✅ Sistema responde coherentemente a cada turno
- ✅ Historial mantiene orden cronológico
- ✅ No hay mezcla de contextos entre conversaciones
- ✅ Transiciones fluidas entre estados

---

## ESCENARIO 3: MANEJO DE ERRORES - RESILIENCIA

### Objetivo
Verificar que el sistema maneja errores elegantly y proporciona feedback útil.

### Subescenario 3A: Error de Micrófono
1. **Simular denegación de permisos**
   - En navegador, bloquear permisos de micrófono
   - Recargar página
   - Intentar grabar

2. **Verificar manejo**
   - Mensaje claro: "Se necesita acceso al micrófono"
   - Instrucciones para habilitar permisos
   - Botón para reintentar

### Subescenario 3B: Servicio TTS Caído
1. **Detener servicio TTS temporalmente**
   - `docker stop piper-tts`
   - Intentar conversación

2. **Verificar fallback**
   - Sistema debe mostrar respuesta en texto
   - Mensaje: "No puedo generar audio ahora, pero aquí está la respuesta: ..."
   - Icono indicando texto vs audio

3. **Recuperación**
   - `docker start piper-tts`
   - Intentar nueva conversación
   - Verificar que audio vuelve a funcionar

### Subescenario 3C: Conexión Lenta/Perdida
1. **Simular red lenta (DevTools → Network → Throttling)**
   - 3G velocidad (700kbps)
   - Intentar conversación
   - Verificar timeouts manejados

2. **Simular offline**
   - Poner navegador offline después de empezar grabación
   - Verificar mensaje de reconexión
   - Restaurar conexión → reconexión automática

### Criterios de Éxito
- ✅ Errores no causan crashes de interfaz
- ✅ Mensajes de error útiles y amigables
- ✅ Fallbacks funcionales (texto si audio falla)
- ✅ Recuperación automática cuando posible

---

## ESCENARIO 4: PERFORMANCE - LÍMITES Y ESTRÉS

### Objetivo
Verificar rendimiento bajo condiciones de carga y uso extensivo.

### Subescenario 4A: Audio Largo
1. **Grabación extensa**
   - Pulsar botón
   - Hablar continuamente por 8-9 segundos
   - Soltar botón
   - Verificar que sistema procesa audio largo

2. **Verificaciones**
   - STT debe procesar audio completo
   - Respuesta debe ser coherente con contenido largo
   - Tiempo total < 15 segundos para audio de 9 segundos

### Subescenario 4B: Múltiples Solicitudes Rápidas
1. **Ráfaga de mensajes**
   - Enviar 3 mensajes en rápida sucesión (esperar respuesta antes del siguiente)
   - Registrar tiempos de cada ciclo

2. **Verificar cola**
   - Sistema debe procesar en orden
   - No debe mezclar respuestas
   - Historial debe reflejar orden correcto

### Subescenario 4C: Uso Prolongado
1. **Sesión de 5 minutos**
   - Mantener conversación activa por 5 minutos
   - 8-10 intercambios variados
   - Verificar estabilidad de memoria/rendimiento

### Criterios de Éxito
- ✅ Sistema maneja audio largo sin timeout
- ✅ Múltiples solicitudes procesadas correctamente
- ✅ Sin degradación de performance en sesión prolongada
- ✅ Uso de memoria estable

---

## ESCENARIO 5: USABILIDAD - EXPERIENCIA COMPLETA

### Objetivo
Evaluar experiencia de usuario en condiciones reales de uso.

### Subescenario 5A: Dispositivo Móvil
1. **Smartphone (iOS/Android)**
   - Acceder desde navegador móvil
   - Verificar diseño responsive
   - Touch interactions: botón grabación, scroll historial
   - Rotación de pantalla mantiene estado

2. **Verificaciones específicas móvil**
   - Keyboard no aparece innecesariamente
   - Elementos tocables tienen tamaño suficiente
   - Scroll suave del historial

### Subescenario 5B: Condiciones de Audio Reales
1. **Entorno con ruido**
   - Probar con ruido ambiental moderado
   - Verificar que STT aún funciona aceptablemente

2. **Volumen variable**
   - Hablar muy suave → sistema debe detectar
   - Hablar muy fuerte → sin distorsión
   - Auriculares vs altavoces

### Subescenario 5C: Usuario Novato
1. **Primera vez sin instrucciones**
   - Dar dispositivo a usuario no técnico
   - Observar si puede iniciar conversación sin ayuda
   - Medir tiempo hasta primera interacción exitosa

### Criterios de Éxito
- ✅ Interfaz intuitiva para usuario novato
- ✅ Funciona correctamente en móvil
- ✅ Robusto ante condiciones reales de audio
- ✅ Experiencia general positiva

---

## PLANTILLA DE REGISTRO

### Para cada escenario
```
Tester: ______________
Fecha: ______________
Hora: ______________
Dispositivo: ______________
Navegador: ______________
Conexión: ______________

Pasos ejecutados:
1.
2.
3.

Resultados:
- Tiempo grabación→respuesta: ______ segundos
- Calidad audio recibido: [1-5]
- Claridad interfaz: [1-5]
- Problemas encontrados:

Calificación general: [1-10]
```

---

## INSTRUCCIONES PARA TESTERS

1. **Preparación**
   - Asegurar micrófono funcionando
   - Verificar altavoces/auriculares
   - Tener cronómetro a mano

2. **Durante prueba**
   - Registrar tiempos exactos
   - Capturar screenshots de problemas
   - Anotar comportamientos inesperados

3. **Post-prueba**
   - Completar plantilla de registro
   - Archivar evidencias (screenshots, logs)
   - Reportar bugs con pasos reproducibles

---

## PRIORIDAD DE ESCENARIOS
1. Escenario 1 (Crítico) - Conversación básica debe funcionar
2. Escenario 3 (Alta) - Manejo de errores robusto
3. Escenario 2 (Media) - Conversación múltiple
4. Escenario 4 (Media) - Performance
5. Escenario 5 (Baja) - Usabilidad avanzada