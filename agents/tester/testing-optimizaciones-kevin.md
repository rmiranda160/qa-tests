# Testing Optimizaciones Kevin - ContentoAI

**Fecha:** 2026-03-20  
**Responsable:** Tester  
**Estado:** PENDIENTE

## Objetivo
Verificar que las optimizaciones implementadas por Kevin funcionan correctamente y no rompen funcionalidad existente.

## Optimizaciones a verificar

### 1. Minificación CSS/JS
- **Archivo CSS:** `style.css` minificado (~8KB)
- **Archivo JS:** `script.js` minificado (~3.5KB)
- **Verificaciones:**
  - [ ] Los archivos existen en la ruta esperada (public/css/style.min.css, public/js/script.min.js)
  - [ ] Tamaño de archivo dentro de rangos esperados (CSS ~8KB, JS ~3.5KB)
  - [ ] Contenido minificado (sin espacios innecesarios, comentarios removidos)
  - [ ] No se pierden reglas CSS ni funciones JS
  - [ ] Los archivos son servidos con Content-Type correcto
  - [ ] Cache headers configurados (Cache-Control, ETag)

### 2. Lazy Loading Imágenes
- **Imágenes afectadas:** Imágenes de testimonios/secciones que no están en viewport inicial
- **Verificaciones:**
  - [ ] Atributo `loading="lazy"` presente en imágenes de testimonios
  - [ ] Atributo `data-src` o `srcset` si se usa lazy loading avanzado
  - [ ] Las imágenes cargan al hacer scroll (verificar network requests)
  - [ ] Fallback para navegadores sin soporte (noscript/img src)
  - [ ] No afecta CLS (Cumulative Layout Shift) excesivo

### 3. Preconnect CDNs
- **CDNs a verificar:**
  - `cloudflare.com`
  - `jsdelivr.net`
  - `randomuser.me`
- **Verificaciones:**
  - [ ] Tags `<link rel="preconnect" href="https://cdn.cloudflare.com">` presentes en `<head>`
  - [ ] Tags `<link rel="dns-prefetch">` para CDNs adicionales
  - [ ] Los preconnects están antes de los recursos dependientes
  - [ ] No hay preconnects rotos (dominios incorrectos)

### 4. Performance Testing
- **Métricas a comparar (antes/después):**
  - Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
  - Tiempo de carga (Load, LCP, FCP, CLS, TBT)
  - Requests totales y tamaño de página
- **Herramientas:**
  - Lighthouse CLI / DevTools
  - WebPageTest
  - Playwright performance metrics

## Checklist de Verificación

### Pasos a ejecutar

#### 1. Verificación minificación
```bash
# Obtener tamaño de archivos
curl -sI https://cntai.cenarbe.com/css/style.min.css | grep -i content-length
curl -sI https://cntai.cenarbe.com/js/script.min.js | grep -i content-length

# Descargar y verificar contenido
curl -s https://cntai.cenarbe.com/css/style.min.css | head -20
```

#### 2. Verificación lazy loading
- Inspeccionar HTML de página de testimonios
- Usar DevTools para ver network requests al scroll
- Verificar que imágenes tienen `loading="lazy"`

#### 3. Verificación preconnect
- Ver código fuente de homepage (`view-source:https://cntai.cenarbe.com`)
- Buscar `rel="preconnect"` y `rel="dns-prefetch"`

#### 4. Performance testing
- Ejecutar Lighthouse desde Chrome DevTools
- Guardar resultados JSON
- Comparar con baseline anterior (si existe)

## Script de Verificación Automatizada

Se incluye script `verify-optimizations.js` que realiza verificaciones básicas.

## Criterios de Aceptación

**PASS:**
- Todos los archivos minificados existen y tienen tamaño esperado
- Lazy loading implementado en al menos imágenes de testimonios
- Preconnect tags presentes para los 3 CDNs
- Lighthouse performance score >= 80 (o mejora respecto baseline)
- No regresiones en funcionalidad (smoke tests pasan)

**FAIL:**
- Alguna optimización no implementada
- Tamaños de archivo exceden límites (>10KB CSS, >5KB JS)
- Lazy loading ausente o roto
- Performance score < 70

**PASS_WITH_NOTES:**
- Optimizaciones implementadas pero con issues menores (ej. un CDN sin preconnect)
- Performance score entre 70-79

## Evidencias Requeridas
- Screenshots de DevTools Network tab mostrando lazy loading
- Captura de código fuente con preconnect tags
- Lighthouse report PDF/JSON
- Tamaños de archivo (output de comandos)

## Timeline
- **Inmediatamente después** de implementar optimizaciones
- Ejecutar smoke tests primero para asegurar funcionalidad básica
- Luego ejecutar verificaciones de optimización
- Finalizar con regression testing

## Notas
Coordinación con Kevin para definir baseline y criterios exactos de éxito.