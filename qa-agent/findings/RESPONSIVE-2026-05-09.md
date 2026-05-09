# QA Responsive — 2026-05-09 02:19 UTC (CRON run)

**Sitio**: https://new.zonacnc.com
**Modo**: Headless HTTP audit v2 (MCP remoto DOWN, browser local sin libs sistema)
**Viewports testeados**: Mobile (390×844 UA iPhone), Tablet (768×1024 UA iPad), Desktop (1440×900 UA Chrome)
**Páginas testeadas (9 total)**: 
- /es/ homepage ✅ (HTTP 200, 244KB)
- /es/pricing ✅ (HTTP 200, 238KB)
- /es/15-tornos ✅ (HTTP 200, 633KB)
- /es/16-fresadoras ✅ (HTTP 200, 604KB)
- /es/maquinaria-metal/...html (producto) ✅ (HTTP 200, 282KB)
- /en/ homepage ✅ (HTTP 200, 240KB)
- /en/pricing ✅ (HTTP 200, 234KB)
- /fr/ homepage ✅ (HTTP 200, 244KB)
- /de/ homepage ✅ (HTTP 200, 242KB)

**MCP remoto pwmcp-zonacnc**: ❌ DOWN (ECONNREFUSED en 51.254.244.216:3000, 5º día consecutivo)
**Browser local**: ❌ No disponible (sandbox sin libs sistema)

---

## Resumen

| ID | Severidad | Páginas | Descripción |
|----|-----------|---------|-------------|
| RESP-001 | P3 | Homepages (×4 idiomas) | 9 imágenes sin `srcset` — no se sirven tamaños adaptativos |
| RESP-004 | P3 | Categorías (/es/15-tornos, /es/16-fresadoras) | 41-42 imágenes de producto sin `srcset` |
| RESP-005 | P3 | Producto individual | 6 imágenes sin `srcset` |
| RESP-002 | P1 | N/A | MCP remoto DOWN (5º día) — bloquea tests browser real (menús, overlays, overflow real, screenshots) |

---

## Detalle

### RESP-001 — Imágenes sin srcset en homepages [P3, Recurrente]

**Impacto**: 9 imágenes en cada homepage (/es/, /en/, /fr/, /de/) se sirven sin atributo `srcset`. Dispositivos móviles descargan la imagen a resolución desktop, desperdiciando ancho de banda (~30-70% más datos).

**Evidencia**: 
- `/es/`: 0/9 imágenes con srcset
- `/en/`: 0/9 imágenes con srcset  
- `/fr/`: 0/9 imágenes con srcset
- `/de/`: 0/9 imágenes con srcset
- 3 viewports × 4 homepages = **12 occurrences** en el report

**Root cause probable**: Las imágenes de producto/listado en el tema Hummingbird no generan variantes responsive. PrestaShop soporta `srcset` nativo desde PS 1.7, requiere configuración de formatos de imagen en BO → Design → Image Settings. No hay elementos `<picture>` en ninguna página.

**Fix sugerido**: Configurar tamaños responsive en BO y/o modificar templates para incluir `{url}` con los tamaños adecuados vía `ImageManager::getSrcSet()`.

### RESP-004 — Imágenes sin srcset en páginas de categoría [P3, Nuevo]

**Impacto**: 41-42 imágenes de producto por página de categoría sin `srcset`. Impacto significativo en móvil: ~600KB de página con imágenes sin optimizar.

**Evidencia**:
- `/es/15-tornos`: 0/42 imágenes con srcset (647KB de página)
- `/es/16-fresadoras`: 0/41 imágenes con srcset (618KB de página)
- 3 viewports × 2 categorías = **6 occurrences**

**Root cause**: Misma que RESP-001 — el listado de productos en categorías no usa `srcset`.

### RESP-005 — Imágenes sin srcset en página de producto [P3, Nuevo]

**Evidencia**: `/es/maquinaria-metal/...html`: 0/6 imágenes con srcset (288KB de página)

**Total consolidado**: **0 imágenes con srcset en todo el sitio**. 6 imágenes con `loading="lazy"` (positivo), pero sin variantes responsive.

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

## Páginas — Estado HTTP (9 páginas × 3 viewports)

| Página | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| /es/ | 200 (244KB) | 200 (244KB) | 200 (244KB) |
| /es/pricing | 200 (238KB) | 200 (238KB) | 200 (238KB) |
| /es/15-tornos | 200 (633KB) | 200 (633KB) | 200 (633KB) |
| /es/16-fresadoras | 200 (604KB) | 200 (604KB) | 200 (604KB) |
| /es/...producto | 200 (282KB) | 200 (283KB) | 200 (282KB) |
| /en/ | 200 (240KB) | 200 (240KB) | 200 (240KB) |
| /en/pricing | 200 (234KB) | 200 (234KB) | 200 (234KB) |
| /fr/ | 200 (244KB) | 200 (244KB) | 200 (244KB) |
| /de/ | 200 (242KB) | 200 (242KB) | 200 (242KB) |

✅ **27/27 HTTP checks OK** — todas las páginas sirven correctamente en todos los viewports.

---

## Limitaciones de este QA

1. **Sin browser real**: No se pudieron verificar overflows reales, interacciones táctiles, ni comportamiento de sticky elements
2. **Sin screenshots**: El modo headless HTTP no captura renders visuales
3. **URLs de categoría/producto**: Las URLs `/es/content/category/2-fresadoras` y `/es/content/148-centro-mecanizado-cnc` devuelven 302→404 (formato antiguo de PS). Las URLs friendly sí funcionan correctamente
4. **Sin test de pricing modals**: Los modales requieren interacción JS

---

## Áreas verificadas OK ✅

- **HTML lang** correcto en todas las páginas: es-ES, en-US, fr-FR, de-DE
- **Viewport meta** `width=device-width, initial-scale=1` en todas las páginas
- **Menú móvil** hamburger/offcanvas detectado en todas las páginas
- **CSS Media Queries**: 54 MQs en 4/7 archivos, breakpoints [400, 480, 575, 600, 640, 767, 768, 991, 992, 1023, 1024, 1200]px
- **Bootstrap responsive grid** activo (col-sm-*, col-md-*, col-lg-*, col-xl-*)
- **Utilidades display responsive** (d-none/d-block/d-flex condicionales)
- **Sin overflow risk** detectado en elementos con width fijo >390px
- **JSON-LD**: 3 bloques en cada homepage
- **Lazy loading**: `loading="lazy"` en 6 imágenes de homepage
- **Breakpoints esenciales**: 768px y 1024px presentes ✅

## Recomendaciones

1. **RESP-001/004/005**: Implementar `srcset` en imágenes de producto/listado/categoría — configurar formatos de imagen responsive en BO PS
2. **URGENTE (5º día)**: Restaurar MCP pwmcp-zonacnc para desbloquear testeo browser real (screenshots, touch targets, overflow real, sticky interactions)
3. **Sandbox**: Instalar dependencias de sistema (libnspr4, libnss3, etc.) para habilitar Chromium como fallback local
4. **Próximo QA responsive con browser**: Re-testear F1 (sticky topbar bloquea hamburger), F2 (hero overflow), y verificar touch targets

---

## Enlaces

- [[zonacnc-qa-loop]] — loop QA automatizado
- [[qa-cron-2026-05-09-stripe-billing-mcp-down-persists]] — MCP DOWN desde May 8
- [[qa-cron-2026-05-08-i18n]] — QA i18n anterior
- [[RESPONSIVE-2026-05-08-run3]] — QA responsive anterior (2026-05-08)
