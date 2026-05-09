# QA Responsive — 2026-05-09 00:15 UTC

**Sitio**: https://new.zonacnc.com
**Modo**: Headless HTTP audit (MCP remoto DOWN, browser local sin libs sistema)
**Viewports testeados**: Mobile (390×844 UA iPhone), Tablet (768×1024 UA iPad), Desktop (1440×900 UA Chrome)
**Páginas testeadas**: 
- /es/ homepage ✅
- /es/pricing ✅
- /en/ homepage ✅
- /en/pricing ✅
- /fr/ homepage ✅
- /de/ homepage ✅

**MCP remoto pwmcp-zonacnc**: ❌ DOWN (ECONNREFUSED en 51.254.244.216:3000, 3er día consecutivo)
**Browser local Chromium**: ❌ No disponible (missing libnspr4.so, libnss3.so, etc. — sandbox sin permisos apt)
**Browser local Firefox**: ❌ Versión 1509 instalada, Playwright requiere 1511 — npx playwright install no completa por missing system deps

---

## Resumen

| ID | Severidad | Páginas | Descripción |
|----|-----------|---------|-------------|
| RESP-001 | Low | Todas las homepages | 9 imágenes sin `srcset` — no se sirven tamaños adaptativos |
| RESP-002 | Info | N/A | MCP remoto DOWN (3er día) — bloquea tests browser real (menús, overlays, overflow real) |
| RESP-003 | Info | N/A | Sandbox sin browsers funcionales — sin fallback local para Playwright |

---

## Detalle

### RESP-001 — Imágenes sin srcset [Low, Recurrente]

**Impacto**: 9 imágenes en cada homepage (/es/, /en/, /fr/, /de/) se sirven sin atributo `srcset`. Dispositivos móviles descargan la imagen a resolución desktop, desperdiciando ancho de banda (~30-70% más datos).

**Evidencia**: 
- `/es/`: 0/9 imágenes con srcset
- `/en/`: 0/9 imágenes con srcset  
- `/fr/`: 0/9 imágenes con srcset
- `/de/`: 0/9 imágenes con srcset

**Root cause probable**: Las imágenes de producto/listado en el tema Hummingbird no generan variantes responsive. PrestaShop soporta `srcset` nativo desde PS 1.7, requiere configuración de formatos de imagen en BO → Design → Image Settings.

**Fix sugerido**: Configurar tamaños responsive en BO y/o modificar templates para incluir `{url}` con los tamaños adecuados vía `ImageManager::getSrcSet()`.

**Historial**: Reportado en QA anteriores como RESP-001 recurrente.

### RESP-002 — MCP remoto DOWN [Info, Blocker parcial]

Mismo F8 [P1] de QAs anteriores. Sin MCP no se puede ejecutar Playwright real para verificar:
- Overflows reales de elementos (`scrollWidth > clientWidth`)
- Interacción con menú hamburger (F1 de QA responsive anterior: sticky topbar intercepta clicks)
- Hero overflow interno (F2 anterior)
- Comportamiento real de overlays/sticky elements
- Touch targets reales (<44px)

### RESP-003 — Sin fallback browser local [Info]

Sandbox no tiene Chromium funcional (faltan libs sistema: libnspr4, libnss3, etc.) y no se puede instalar vía apt (sin permisos). Firefox instalado en versión 1509 pero Playwright instalado requiere 1511.

---

## CSS Responsive — Análisis positivo ✅

### Media Queries
- **54 media queries** detectadas en **4 de 7 hojas CSS**
- **Breakpoints**: [400, 480, 575, 600, 640, 767, 768, 991, 992, 1023, 1024, 1200]px
- Breakpoints esenciales **768** y **1024** presentes ✅
- Bootstrap responsive grid activo (col-sm-*, col-md-*, col-lg-*, col-xl-*)
- Utilidades responsive detectadas (d-none/d-block condicionales)
- Solo 3 CSS sin media queries

### Meta Viewport
- `width=device-width, initial-scale=1` presente en TODAS las páginas testeadas ✅

### Menú Móvil
- Hamburger toggle (`zcmn-hamburger`, `menu-toggle btn btn-link`) detectado en HTML de todas las versiones
- Offcanvas menu (`ps-mainmenu--mobile offcanvas`) presente
- `aria-label="Abrir menú móvil"` correcto

### Datos Estructurados
- 3 bloques JSON-LD en todas las homepages ✅

### Títulos y Meta
- Title > 10 chars en todas las páginas ✅
- Meta description > 20 chars en todas las páginas ✅

---

## Páginas — Estado HTTP

| Página | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| /es/ | 200 (244KB) | 200 (244KB) | 200 (244KB) |
| /es/pricing | 200 (239KB) | 200 (239KB) | 200 (239KB) |
| /en/ | 200 (244KB) | 200 (244KB) | 200 (244KB) |
| /en/pricing | 200 (234KB) | 200 (234KB) | 200 (234KB) |
| /fr/ | 200 (244KB) | 200 (244KB) | 200 (244KB) |
| /de/ | 200 (242KB) | 200 (242KB) | 200 (242KB) |

---

## Limitaciones de este QA

1. **Sin browser real**: No se pudieron verificar overflows reales, interacciones táctiles, ni comportamiento de sticky elements
2. **Sin screenshots**: El modo headless HTTP no captura renders visuales
3. **URLs de categoría/producto**: Las URLs `/es/content/category/2-fresadoras` y `/es/content/148-centro-mecanizado-cnc` devuelven 302→404 (formato antiguo de PS). Las URLs friendly sí funcionan correctamente
4. **Sin test de pricing modals**: Los modales requieren interacción JS

---

## Recomendaciones

1. **RESP-001**: Implementar `srcset` en imágenes de producto/listado — configurar formatos de imagen responsive en BO PS
2. **URGENTE**: Restaurar MCP pwmcp-zonacnc para desbloquear testeo browser real
3. **Sandbox**: Instalar dependencias de sistema (libnspr4, libnss3, etc.) para habilitar Chromium como fallback
4. **Próximo QA responsive con browser**: Re-testear F1 (sticky topbar bloquea hamburger), F2 (hero overflow), y verificar touch targets

---

## Enlaces

- [[zonacnc-qa-loop]] — loop QA automatizado
- [[qa-cron-2026-05-09-stripe-billing-mcp-down-persists]] — MCP DOWN desde May 8
- [[qa-cron-2026-05-08-i18n]] — QA i18n anterior
- [[RESPONSIVE-2026-05-08-run3]] — QA responsive anterior (2026-05-08)
