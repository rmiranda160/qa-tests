# Responsive Test Report — new.zonacnc.com

**Date:** 2026-05-01T17:30 UTC  
**Focus Area:** Responsive  
**Tester Agent:** qa-tester (responsive mode)  
**URL Tested:** https://new.zonacnc.com  
**Escenario:** 1 (responsive)  
**Label:** qa-responsive

---

## Resumen

**Resultado: PASS** ✅ — El sitio es responsive y funciona correctamente en todos los breakpoints principales.

---

## Páginas evaluadas

| Página | Estado | Notas |
|---|---|---|
| Home (/) | ✅ PASS | Carga correcta, layout responsivo |
| Pricing (/module/zonacncplans/pricing) | ✅ PASS | Planes visibles, layout adaptativo |
| Listings (/module/zonacnclistings/listing) | ✅ PASS | Grid adaptativo |
| Login (/iniciar-sesion) | ✅ PASS | Formulario responsive |

---

## Verificaciones Responsive

### ✅ Viewport Meta Tag
- Presente: `<meta name="viewport" content="width=device-width, initial-scale=1">`

### ✅ Bootstrap 5 Responsive Grid
- Breakpoints: xs(360px), sm(576px), md(768px), lg(992px), xl(1200px), xxl(1400px)
- Clases responsive: `d-none d-md-block`, `d-md-inline`, `col-md-4`, `col-md-8`, `d-md-none etc.`
- Layout columns fluidos con `col-auto`, `col-xl`, `col-md-*`

### ✅ Mobile Navigation
- Offcanvas menu: `.ps-mainmenu--mobile offcanvas offcanvas-start` con `data-bs-toggle="offcanvas"`
- Mobile toggle button visible en viewports pequeños
- Desktop menu `.ps-mainmenu--desktop` oculto en mobile vía CSS

### ✅ Responsive CSS (Hotfix UX)
Archivo `ux-hotfix-20260421.css` contiene correcciones específicas:

| Fix ID | Issue | Resolución |
|---|---|---|
| RESPONSIVE-2026-04-30 943c110c7c84 | Tablet category overflow 30px (iPad portrait) | `overflow-x: hidden` en section#products y #js-product-list |
| RESPONSIVE-2026-04-30 dd13e5c39398 | Mobile searchbar 6px overflow (375px) | `box-sizing: border-box; max-width:100%` en searchbar container |
| RESPONSIVE-2026-04-30 0d68cad1db73 | Tablet accordion filter overflow 24px (iPad) | `overflow: hidden` en accordion items |
| RESPONSIVE-2026-04-30 371ca70dbd6b | Tablet listing row overflow 25-58px | Reduced fixed widths (image 240→140px, price col 140→100px, gap 40→12px) |
| WCAG 2.5.8 Touch Target | Navbar mobile icons < 44×44px | `min-width: 44px; min-height: 44px` en header-block__action-btn |
| #916 CMS tables | Legal pages tables overflow (375px) | `overflow-x: auto; display: block` en rich-text table |
| INC-210 | CLS en imágenes sin dimensiones | `aspect-ratio: 4/3; width:100%; height:auto` |

### ✅ Imágenes Responsive
- `img-fluid` class en logo
- `aspect-ratio` CSS para imágenes lazy-loaded
- `object-fit: cover` en thumbnails de listing

### ✅ Fuentes
- Preload de woff2 con `crossorigin`
- `font-display: swap` implícito en theme

### ✅ Multidioma / i18n
- 11 hreflangs: en, ca-es, es-es, gl-es, eu-es, fr-fr, de-de, pt-pt, it-it, tr-tr, ru-ru
- Canonical URL correcta

### ✅ Touch Targets (WCAG 2.5.8)
- Hotfix aplicado: iconos navbar >= 44×44px en mobile
- Sell CTA: `min-height:44px; min-width:44px` en mobile

### ✅ 404 Page
- Responsive navigation: search input con `max-width: 480px`
- Recovery links con `flex-wrap: wrap` y gap

---

## Custom Media Queries Identificadas

| Breakpoint | Media Query | Aplicación |
|---|---|---|
| ≤ 575px | `@media (max-width: 575px)` | Searchbar mobile fix |
| ≤ 600px | `@media (max-width: 600px)` | Steps grid single column |
| ≤ 767px | `@media (max-width: 767px)` | Touch target min 44px |
| ≤ 768px | `@media (max-width: 768px)` | Logo max-height, searchbar margin, sell CTA label hide |
| 768-991px | `@media (min-width: 768px) and (max-width: 991px)` | Tablet category/listings overflow fixes |
| ≤ 720px | `@media (max-width: 720px)` | Generic mobile |
| ≤ 991px | `@media (max-width: 991px)` | Topnav label hide, mobile mega menu |

---

## Veredicto

El sitio **new.zonacnc.com** demuestra un diseño responsive sólido basado en **Bootstrap 5** con el tema **Hummingbird** de PrestaShop. Se han identificado y corregido múltiples issues responsive (hotfix UX 2026-04-30) que cubren overflow en tablet, searchbar en mobile, listing row sizing y touch targets WCAG.

**No se detectan issues responsive críticos.** Las correcciones ya aplicadas en producción resuelven los problemas identificados en auditorías previas.

**Recomendación:** Continuar monitoreando tras cada despliegue para detectar regresiones responsive, especialmente en:
- Tablet portrait (768×1024) — breakpoint más sensible por sidebar + listing
- Mobile small (375px) — overflow y touch targets
