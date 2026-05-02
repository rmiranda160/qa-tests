# IMPLEMENTACIÓN REGLAS MIRANDA PARA TESTING

**Fecha:** 2026-03-20  
**Autor:** Tester  
**Origen:** Instrucción directa de Miranda (CEO)

## 📋 REGLA OBLIGATORIA

> **"Siempre que haya un botón o una acción en el código, se debe comprobar si se encuentra desarrollada la funcionalidad."**

## 🎯 OBJETIVO

Garantizar que **cada botón/acción** en las aplicaciones tenga funcionalidad desarrollada, verificando:
- Existencia en DOM
- Visibilidad y clickeabilidad
- Ejecución de funcionalidad esperada
- Documentación de resultados

## 🔍 METODOLOGÍA DE VERIFICACIÓN

### **1. Para cada botón/acción encontrado:**

| Verificación | Método | Criterio PASS |
|--------------|---------|---------------|
| **Existe en DOM** | `await page.$(selector)` | Elemento encontrado |
| **Es visible** | `await element.isVisible()` | `true` |
| **No está disabled** | `await element.isDisabled()` | `false` |
| **Tiene área clickeable** | `await element.boundingBox()` | `width > 0 && height > 0` |
| **Ejecuta funcionalidad** | Click + monitoreo cambios | Cambio detectable (URL, contenido, modal) |

### **2. Tipos de acciones a verificar:**

| Tipo | Ejemplos | Verificación específica |
|------|----------|-------------------------|
| **Botones navegación** | Login, Registro, Carrito | Cambio de URL |
| **Botones formulario** | Buscar, Enviar, Submit | Envío datos, respuesta |
| **Botones modales** | Detalles, Reservar, Ver más | Apertura modal, contenido |
| **Enlaces funcionales** | WhatsApp, Email, Teléfono | Acción externa |
| **Acciones CRUD** | Editar, Eliminar, Crear | Cambio estado datos |

### **3. Documentación requerida:**

Para cada botón/acción verificado:
```
🔍 [NOMBRE_BOTÓN]
✅ PASS / ❌ FAIL
📌 Selector: [selector]
📝 Issues: [problemas encontrados]
📸 Evidencia: [screenshot/log]
```

## 🛠️ HERRAMIENTAS IMPLEMENTADAS

### **1. Script automatizado: `button-action-verifier.js`**
```bash
node button-action-verifier.js <url> [--output report.json]
```
- Identifica automáticamente botones/acciones
- Verifica cada uno individualmente
- Genera reporte JSON con resultados

### **2. Test específico: `test-miranda-rule.js`**
- Verifica botones críticos predefinidos
- Más control sobre selectores específicos
- Reporte ejecutivo claro

### **3. Integración en testing continuo:**
```javascript
// En scripts existentes, añadir:
const MirandaVerifier = require('./button-action-verifier');
await new MirandaVerifier(url).run();
```

## 📊 RESULTADOS INICIALES (Cenarbe Bike Rental)

### **Verificación realizada:** 2026-03-20 16:49 UTC
- **Total botones verificados:** 8
- **✅ Con funcionalidad desarrollada:** 5/8 (62.5%)
- **⚠️ Con problemas:** 1/8 (12.5%)
- **❌ Selectores incorrectos:** 2/8 (25%)

### **Hallazgos específicos:**

| Botón | Estado | Observación |
|-------|--------|-------------|
| **Login** | ✅ PASS | Redirige a `/login.php` |
| **Registro** | ✅ PASS | Redirige a `/register.php` |
| **Buscar Disponibilidad** | ⚠️ ISSUE | Click no produce cambio detectable (¿modal?) |
| **Ver Bicicletas** | ✅ PASS | Redirige a `/bicicletas.php` |
| **Explorar Rutas** | ✅ PASS | Redirige a `/rutas.php` |
| **Carrito** | ✅ PASS | Redirige a `/carrito.php` |

### **Problema identificado:**
- **Botón "Buscar Disponibilidad"**: Requiere investigación adicional
  - ¿Muestra modal con resultados?
  - ¿Hace búsqueda AJAX?
  - ¿Requiere datos específicos en formulario?

## 🔄 INTEGRACIÓN EN FLUJO DE TRABAJO

### **Para nuevos desarrollos:**
1. **Desarrollador** implementa botón/acción
2. **Tester** verifica funcionalidad inmediatamente
3. **Documenta** resultado PASS/FAIL
4. **Reporta** problemas antes de deploy

### **Para testing continuo:**
1. **Cada ciclo testing** incluye verificación Miranda
2. **Monitorear** botones críticos (Login, Reservas, Perfil)
3. **Alertar** si funcionalidad se rompe
4. **Actualizar** reportes automáticamente

### **Para correcciones:**
1. **Identificar** botón/acción roto
2. **Priorizar** según criticidad
3. **Verificar** después de corrección
4. **Confirmar** funcionalidad restaurada

## 📈 MÉTRICAS DE CUMPLIMIENTO

| Métrica | Objetivo | Frecuencia |
|---------|----------|------------|
| **% botones funcionales** | >95% | Diaria |
| **Tiempo detección issues** | <30 min | Por incidente |
| **Coverage botones críticos** | 100% | Semanal |
| **Regresiones detectadas** | <5% | Mensual |

## 🚨 PROCEDIMIENTO PARA ISSUES

### **Si botón NO FUNCIONAL:**
1. **Gravedad ALTA** si afecta flujo crítico (Login, Reserva, Pago)
2. **Gravedad MEDIA** si afecta funcionalidad secundaria
3. **Gravedad BAJA** si es cosmético o poco usado

### **Acciones según gravedad:**
- **ALTA:** Notificación inmediata CEO, corrección <2h
- **MEDIA:** Notificación coordinator, corrección <24h
- **BAJA:** Documentar, corregir en siguiente sprint

## 📝 CHECKLIST VERIFICACIÓN

### **Para cada botón/acción nuevo:**
- [ ] Selector único y estable
- [ ] Texto/icono descriptivo
- [ ] Estado hover/focus visible
- [ ] Funcionalidad implementada
- [ ] Testing automatizado creado
- [ ] Documentado en TESTS.md del proyecto

### **Para cada cambio existente:**
- [ ] Verificar no romper funcionalidad existente
- [ ] Actualizar testing si selector cambia
- [ ] Comprobar edge cases
- [ ] Validar en todos dispositivos

## 🔗 INTEGRACIÓN CON PROYECTOS

### **Proyecto Cenarbe Bike Rental:**
- **Botones críticos:** Login, Registro, Reservar, Carrito, Perfil
- **Frecuencia verificación:** Cada ciclo testing (15 min)
- **Alertas:** Telegram CEO si botón crítico falla

### **Proyecto ContentoAI:**
- **Botones críticos:** Generar texto, Copiar, Demo
- **Frecuencia:** Cada ciclo testing
- **Validación:** Output correcto, funcionalidad IA

### **Proyecto Dashboard:**
- **Botones críticos:** Refresh, Filtros, Interacciones gráficos
- **Frecuencia:** Cada actualización datos
- **Validación:** Actualización datos, respuesta UI

## 🎓 CAPACITACIÓN EQUIPO

### **Para testers:**
1. Entender regla Miranda y su importancia
2. Usar herramientas automatizadas
3. Documentar resultados claramente
4. Reportar issues proactivamente

### **Para desarrolladores:**
1. Implementar botones con testing en mente
2. Usar selectores estables
3. Probar funcionalidad antes de push
4. Colaborar con testers en verificación

## 📅 PLAN DE IMPLEMENTACIÓN

### **Fase 1 (Inmediata):** ✅ COMPLETADO
- [x] Documentar regla Miranda
- [x] Crear herramientas básicas
- [x] Verificar Cenarbe Bike Rental
- [x] Generar reporte inicial

### **Fase 2 (24h):**
- [ ] Integrar en testing continuo Cenarbe
- [ ] Verificar ContentoAI y Villa Zocotin
- [ ] Crear dashboard métricas cumplimiento
- [ ] Capacitar equipo vía documentación

### **Fase 3 (1 semana):**
- [ ] Automatización completa en 3 proyectos
- [ ] Alertas integradas con sistema existente
- [ ] Reportes automáticos CEO
- [ ] Retroalimentación equipo optimización

## 📞 CONTACTO Y SOPORTE

- **Responsable implementación:** Tester
- **Soporte técnico:** Coordinator
- **Aprobación final:** Miranda (CEO)
- **Canal comunicación:** Telegram grupo CEO

---

## ✅ CONCLUSIÓN

La **Regla Miranda** eleva el estándar de calidad al requerir verificación sistemática de cada botón/acción. Su implementación garantiza:

1. **Funcionalidad completa:** Cada botón hace lo esperado
2. **Calidad consistente:** Mismo estándar en todas aplicaciones
3. **Detección temprana:** Issues encontrados antes usuarios
4. **Documentación clara:** Evidencia de cumplimiento

**Próximo paso:** Integrar verificación en próximo ciclo testing de Cenarbe Bike Rental y expandir a ContentoAI.

---
*Documento vivo - Actualizar con lecciones aprendidas y mejoras proceso*
*Última actualización: 2026-03-20 16:50 UTC*