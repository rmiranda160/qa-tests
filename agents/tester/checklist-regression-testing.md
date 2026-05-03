# Checklist Regression Testing - ContentoAI

**Fecha:** 2026-03-20  
**Responsable:** Tester  
**Estado:** PENDIENTE

## Objetivo
Verificar que las optimizaciones implementadas **NO ROMPEN** funcionalidad existente. Enfocado en flujos críticos de usuario.

## Flujos Críticos a Verificar

### 1. Demo IA
- **URL:** `https://cntai.cenarbe.com/demo`
- **Verificaciones:**
  - [ ] Página carga sin errores
  - [ ] Campo de entrada de texto es editable
  - [ ] Botón "Generar" es clickeable y no está disabled
  - [ ] Al hacer click, se muestra indicador de carga (si aplica)
  - [ ] Respuesta de IA se muestra (aunque sea mocked)
  - [ ] No errores en consola durante el flujo
  - [ ] Tiempo de respuesta < 5 segundos (simulado)
  - [ ] Botón "Copiar" o "Descargar" funciona (si existe)
  - [ ] Responsive: funciona en móvil y tablet

### 2. Formulario Waitlist
- **URL:** `https://cntai.cenarbe.com/waitlist`
- **Verificaciones:**
  - [ ] Campos: nombre, email, empresa (si aplica) visibles y editables
  - [ ] Validación frontend: email requerido y formato válido
  - [ ] Botón "Enviar" o "Join Waitlist" clickeable
  - [ ] Envío de formulario produce feedback (éxito/error)
  - [ ] No se permite envío múltiple (botón se deshabilita durante envío)
  - [ ] Mensaje de éxito incluye confirmación
  - [ ] Redirección a página de gracias (si aplica)
  - [ ] Cookies o localStorage no se corrompen

### 3. Estilos Consistentes (No Broken CSS)
- **Páginas a verificar:** Homepage, Demo, Waitlist, Admin (si existe)
- **Verificaciones:**
  - [ ] Fuentes cargadas correctamente (no fallback a serif)
  - [ ] Colores de marca aplicados (primario, secundario)
  - [ ] Espaciados consistentes (márgenes, paddings)
  - [ ] Botones con estilo uniforme (border-radius, shadow, hover)
  - [ ] Navbar/footer mantienen posición y estilo
  - [ ] No elementos superpuestos o desbordados
  - [ ] Imágenes con proporciones correctas (no stretch)
  - [ ] Grids y flexbox alineados

### 4. JavaScript Interactivo
- **Funcionalidades JS:**
  - [ ] Menús desplegables (hover/click) funcionan
  - [ ] Modales (popups) abren/cierran correctamente
  - [ ] Acordeones (FAQ) expanden/colapsan
  - [ ] Carruseles (sliders) avanzan automático/manual
  - [ ] Validaciones de formularios en tiempo real
  - [ ] Lazy loading de imágenes (carga al scroll)
  - [ ] Smooth scroll para anclas internas
  - [ ] Detección de navegador/viewport (clases CSS)

### 5. Regla Miranda: Verificación de Botones/Acciones
**Cada botón o acción debe tener funcionalidad desarrollada.**  
Lista de botones/acciones a verificar:

#### Homepage
- [ ] Botón "Try Demo" (enlace a /demo)
- [ ] Botón "Join Waitlist" (enlace a /waitlist)
- [ ] Botón "Learn More" (scroll o página)
- [ ] Botón "Login/Admin" (si existe)
- [ ] Enlaces sociales (Facebook, Twitter, LinkedIn)
- [ ] Botón "Scroll to top" (si existe)

#### Demo Page
- [ ] Botón "Generate Content"
- [ ] Botón "Clear" o "Reset"
- [ ] Botón "Copy to Clipboard"
- [ ] Botón "Download as PDF/TXT"
- [ ] Selectores de tono/estilo (dropdowns, radio buttons)

#### Waitlist Page
- [ ] Botón "Submit"
- [ ] Botón "Cancel" o "Back"
- [ ] Link "Privacy Policy" (modal o página)

#### Admin Page (si existe)
- [ ] Botón "Login"
- [ ] Botón "Logout"
- [ ] Botones CRUD (Add, Edit, Delete)
- [ ] Botón "Save Changes"
- [ ] Botón "Filter/Search"

**Cada verificación debe incluir:**
- [ ] Botón existe en DOM y es visible
- [ ] Es clickeable (no disabled, no opacity:0)
- [ ] Ejecuta funcionalidad esperada (navegación, acción, modal)
- [ ] No produce errores en consola
- [ ] Feedback visual al interactuar (hover, active)

### 6. Coherencia UI (Botones → Contenido Correcto)
- [ ] Botón "Demo" lleva a página de demo (no a waitlist)
- [ ] Botón "Waitlist" lleva a formulario waitlist
- [ ] Botón "Home" lleva a homepage
- [ ] Botón "Contact" muestra información de contacto
- [ ] Botones de acción muestran contenido correspondiente

### 7. Datos de Prueba Generados
- [ ] Crear usuario de prueba para waitlist (nombre, email)
- [ ] Generar contenido de prueba para demo (textos variados)
- [ ] Verificar que datos no persisten en producción (cleanup)
- [ ] No usar datos reales de usuarios

## Métodos de Verificación

### Manual
- Navegación en Chrome/Firefox
- Inspección de elementos (DevTools)
- Consola de errores
- Network tab para requests

### Automatizado
- Script Playwright `contentoai-laravel.spec.js`
- Script de verificación de botones `button-action-verifier.js`
- Lighthouse para performance

## Criterios de Aceptación

**PASS:** Todos los flujos críticos funcionan, estilos consistentes, JS interactivo funciona, todos los botones tienen funcionalidad.  
**FAIL:** Algún flujo crítico roto, CSS broken, botón sin funcionalidad, error de JS que bloquea interacción.  
**PASS_WITH_NOTES:** Issues menores (ej. hover effect no perfecto, error de consola no crítico).

## Evidencias
- Screenshots de cada página después de optimizaciones
- Video de flujo de usuario (opcional)
- Logs de consola (sin errores)
- Reporte de verificación de botones (JSON)

## Acciones si Fallo
1. Documentar exactamente qué falla
2. Capturar screenshot y consola
3. Notificar inmediatamente a Kevin y coordinator
4. Revertir optimizaciones si bloquean funcionalidad crítica
5. Plan de rollback: restaurar versiones anteriores de CSS/JS

## Timeline
Ejecutar **inmediatamente después** de implementar optimizaciones y antes de marcar deploy como estable.