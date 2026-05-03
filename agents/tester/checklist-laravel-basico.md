# Checklist Testing Laravel Básico - ContentoAI

**Fecha:** 2026-03-20  
**Responsable:** Tester  
**Estado:** PENDIENTE

## URLs a verificar

### 1. Homepage Laravel
- **URL:** `https://cntai.cenarbe.com/`
- **Verificaciones:**
  - [ ] HTTP 200 OK
  - [ ] No errores PHP en logs / pantalla
  - [ ] No errores JavaScript en consola
  - [ ] Contenido esperado visible (título, descripción, botones)
  - [ ] Enlaces de navegación funcionan
  - [ ] Tiempo de carga < 3 segundos
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] SEO básico (meta tags, título)

### 2. Demo IA
- **URL:** `https://cntai.cenarbe.com/demo`
- **Verificaciones:**
  - [ ] HTTP 200 OK
  - [ ] Formulario de demo visible
  - [ ] Campos de entrada funcionan (texto, selección)
  - [ ] Botón de generación de contenido es clickeable
  - [ ] Respuesta de IA simulada (mocked) se muestra
  - [ ] No errores en consola al interactuar
  - [ ] Validación de campos (si aplica)
  - [ ] Mensajes de error claros

### 3. Formulario Waitlist
- **URL:** `https://cntai.cenarbe.com/waitlist`
- **Verificaciones:**
  - [ ] HTTP 200 OK
  - [ ] Formulario con campos: nombre, email, empresa (si aplica)
  - [ ] Validación frontend (email válido, campos requeridos)
  - [ ] Envío de formulario funciona (POST a endpoint correcto)
  - [ ] Mensaje de éxito/confirmación tras envío
  - [ ] No exposición de datos sensibles en respuesta
  - [ ] Redirección o feedback adecuado

### 4. Panel Admin (si existe)
- **URL:** `https://cntai.cenarbe.com/admin`
- **Verificaciones:**
  - [ ] HTTP 200 OK o redirección a login (según configuración)
  - [ ] Login admin funciona (credenciales válidas)
  - [ ] Dashboard admin carga correctamente
  - [ ] Navegación entre secciones admin
  - [ ] CRUD básico (si aplica)
  - [ ] Protección de rutas (no acceso sin autenticación)

## Verificaciones generales por URL

### HTTP/HTTPS
- [ ] Certificado SSL válido (HTTPS)
- [ ] No redirecciones rotas
- [ ] No errores 4xx/5xx en recursos estáticos (CSS, JS, imágenes)

### Consola del navegador
- [ ] Sin errores JavaScript (console.error)
- [ ] Sin warnings críticos
- [ ] Network: recursos cargados completamente (no 404)

### Contenido
- [ ] Textos legibles (no placeholders)
- [ ] Imágenes cargadas (no broken images)
- [ ] Estilos CSS aplicados correctamente
- [ ] Fuentes cargadas

### Formularios
- [ ] Todos los campos son editables
- [ ] Validación client-side funciona
- [ ] Submit no produce error 500
- [ ] Respuesta del servidor adecuada (JSON/HTML)

## Criterios de Aceptación

**PASS:** Todas las verificaciones marcadas como OK  
**FAIL:** Una o más verificaciones críticas fallan (HTTP error, consola errors, formularios no funcionan)  
**PASS_WITH_NOTES:** Verificaciones menores fallan (ej. warning en consola, tiempo de carga >3s pero <5s)

## Evidencias
- Capturas de pantalla de cada página
- Logs de consola del navegador
- Resultados de curl/HTTP para cada URL

## Notas
Este checklist es para testing básico inmediatamente después del deploy. Se debe ejecutar tan pronto como el deploy esté completo y el sitio esté accesible.

## Próximos pasos
1. Ejecutar checklist manualmente o mediante script
2. Registrar resultados en reporte
3. Notificar a coordinator con resultado (PASS/FAIL)
4. Proceder con testing de optimizaciones si PASS