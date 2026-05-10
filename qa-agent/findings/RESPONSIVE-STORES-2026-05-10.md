# QA Responsive — Stores + Prices Drop + Sitemap — 2026-05-10 17:57 UTC

**Sitio**: https://new.zonacnc.com
**Cron ID**: `53983183-66c6-4b72-9b21-404aac116c60`
**Metodología**: curl + UA simulation (iPhone Safari iOS 17, Chrome 145 Windows)
**MCP**: DOWN (ECONNREFUSED)
**Páginas testeadas**: 17 (Stores, Prices Drop, Sitemap, Supplier, Homepages ×4 idiomas)
**Resultado**: ❌ FAIL — 10/17 páginas devuelven 404 (59% rotas)

---

## Resumen

| ID | Severidad | Páginas | Descripción |
|----|-----------|---------|-------------|
| F1 | P2 | Stores (×4) | Todas las páginas de Tiendas 404: ES/EN/FR/DE |
| F2 | P2 | Prices Drop (×3) | REGRESSION: `/es/bajamos-precios` era 200→ahora 404. FR/DE también 404. |
| F3 | P3 | Prices Drop EN | `/en/prices-drop` muestra title/H1 "New products" en vez de "Prices drop" |
| F4 | P2 | Sitemap FR | `/fr/plan-de-site` → 404. ES/EN/DE 200 OK |
| F5 | P3 | Sitemap ES/EN/DE | Sin infraestructura responsive: no viewport, no BS grid, no menú mobile |
| F6 | P3 | Supplier ES | `/es/fabricante/1-zonacnc` → 404 |

---

## Detalle

### F1 — Stores pages 404 en los 4 idiomas [P2] 🆕

**URLs afectadas**: `/es/tiendas`, `/en/stores`, `/fr/magasins`, `/de/geschaefte`
**HTTP**: Todas 404
**Alternativas probadas**: `/es/stores`, `/en/tiendas`, `/en/store`, `/es/nuestras-tiendas` → todas 404
**Impacto**: Funcionalidad core de PS (localizador de tiendas) completamente bloqueada. Las páginas 404 tienen infraestructura responsive completa (18 offcanvas, 7 hamburger, 12 hreflang, 303 ARIA en ES).
**Posible causa**: Módulo/feature de Stores no habilitado en BO o friendly URLs no configuradas.

### F2 — Prices Drop ES regression + FR/DE 404 [P2] ⚠️ REGRESSION

**URLs**:
- `/es/bajamos-precios` → **404** (era 200 OK el 2026-05-09 03:21 UTC — REGRESSION)
- `/en/prices-drop` → 200 OK ✅
- `/fr/prix-en-baisse` → **404**
- `/de/preisnachlass` → **404**

**Alternativas probadas**: `/es/prices-drop`, `/es/ofertas`, `/fr/prices-drop`, `/de/prices-drop` → todas 404
**Impacto**: Usuarios de ES/FR/DE no pueden ver productos con descuento. Solo EN funcional.
**Posible causa**: Reconfiguración de friendly URLs del controlador prices-drop.

### F3 — Prices Drop EN muestra título incorrecto [P3] 🆕

**URL**: `/en/prices-drop` (única que devuelve 200)
**Title**: `<title>New products</title>` (debería ser "Prices drop")
**H1**: `<h1>New products</h1>` (debería ser "Prices drop")
**Impacto**: SEO y UX incorrectos. Los usuarios en EN ven etiquetas de "New products" en una URL de precios rebajados.
**Posible causa**: Strings de new-products reutilizados como fallback en el controlador de prices-drop.

### F4 — Sitemap FR 404 [P2] 🆕

**URL**: `/fr/plan-de-site` → 404
**ES/EN/DE**: 200 OK (`/es/mapa-del-sitio`, `/en/sitemap`, `/de/sitemap`)
**Posible causa**: Falta entrada de friendly URL para sitemap en francés.

### F5 — Sitemap ES/EN/DE sin infraestructura responsive [P3] 🆕

**URLs 200 OK**: `/es/mapa-del-sitio`, `/en/sitemap`, `/de/sitemap`
**Problemas**:
- ❌ Sin meta viewport (`name="viewport"`)
- ❌ Sin Bootstrap grid columns
- ❌ Sin offcanvas/hamburger menu
- ❌ Sin hreflang alternate links
- Tamaños: 1.25MB (ES), 1.25MB (EN), 1.27MB (DE)
- ARIA inconsistente: ES=292, EN=1, DE=0
**Impacto**: Páginas no navegables en mobile, sin header/footer del theme.
**Posible causa**: Controlador de sitemap no extiende el layout del theme principal.

### F6 — Supplier detail page 404 [P3] 🆕

**URL**: `/es/fabricante/1-zonacnc` → 404
**Alternativa**: `/es/brand/1-zonacnc` → 404
**Nota**: La página de listado de fabricantes (`/es/fabricantes`) sí devuelve 200 OK (confirmado en test previo).
**Posible causa**: Fabricante ID=1 sin productos activos o friendly URL mal configurada.

---

## Infraestructura CSS responsive

- **286 media queries** en 6 archivos CSS
- `theme-74ef8b52.css`: 266 MQ (principal)
- `listings.css`: 14 MQ
- `mobile-nav.css`: 3 MQ
- `consent.css`, `widget.css`, `savedsearch.css`: 1 MQ c/u
- **Infraestructura sólida** — los problemas son de contenido/URL, no de CSS

## Páginas OK ✅

- Homepages ES/EN/FR/DE: 200 OK, viewport meta, 7 BS cols, 18 offcanvas, 7 hamburger, 12 hreflang, 208-310 ARIA
- Mobile = Desktop body: IDÉNTICO en todas las páginas (SSR consistente)
- Páginas 404: Infraestructura responsive completa

---

## Comparación con tests anteriores

| Test | Fecha | Resultado |
|------|-------|-----------|
| Pricedrops ES | 2026-05-09 03:21 | ✅ 200 OK |
| Pricedrops ES | 2026-05-10 17:57 | ❌ 404 (REGRESSION) |
| Stores (todas) | Nunca testeado | ❌ 404 (nuevo) |
| Sitemap responsive | Nunca testeado | ❌ Sin infra (nuevo) |

---

## Conclusión

**Resultado global**: ❌ FAIL — 6 findings (3 P2, 3 P3), 1 regresión confirmada.
**Impacto**: Funcionalidades completas bloqueadas (Stores, Prices Drop) + infraestructura responsive ausente en Sitemaps.
**Recomendación**: 
1. Habilitar Stores en BO o corregir friendly URLs (P2, bloqueante)
2. Investigar regresión de Prices Drop ES (era 200, ahora 404)
3. Corregir strings EN de Prices Drop
4. Añadir sitemap FR
5. Extender layout del theme en sitemap controller
