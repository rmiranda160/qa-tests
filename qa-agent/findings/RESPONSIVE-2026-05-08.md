# QA Responsive — new.zonacnc.com — 2026-05-08

**Fecha:** 2026-05-08 14:43–18:27 UTC (2 ejecuciones)
**Trigger:** cron tester-responsive (CRON_QA focus_area=responsive)
**URL:** https://new.zonacnc.com
**Método:** Análisis de código fuente HTML/CSS (Playwright WS remoto caído — `ws://51.254.244.216:3000/` ECONNREFUSED; Chromium local sin dependencias de sistema)

---

## Resumen: ⚠️ CONDICIONAL (sitio en mantenimiento)

**Ejecución 1 (14:43 UTC):** Sitio operativo (200). Análisis completo de home, publicar y producto. ✅ APROBADO — implementación responsive sólida.

**Ejecución 2 (18:22 UTC):** Sitio en **modo mantenimiento (503)**. Solo testeable la página de mantenimiento. ⚠️ Se detectaron 4 issues de accesibilidad/SEO en la página de mantenimiento (lang vacío, title vacío, favicon roto, logo lazy LCP).

La implementación responsive del tema Hummingbird + módulos zonacnc es **sólida**: 28+ breakpoints, navegación móvil adaptativa, touch targets WCAG, flexbox/grid responsive.

---

## Viewports analizados (por código fuente)

| Viewport | Ancho | Breakpoints CSS detectados |
|----------|-------|---------------------------|
| Mobile | 375px | ≤359px, ≤400px, ≤480px, ≤575px, ≤600px, ≤640px, ≤767px, ≤768px |
| Tablet | 768px | 768–991px, ≤991px, ≤1023px, ≤1024px |
| Desktop | 1440px | ≥992px, ≥1200px |

---

## Checklist Responsive

### 1. Meta viewport ✅
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Presente en todas las páginas analizadas (`/`, `/es/publicar`, `/es/2-tornos-cnc`).

### 2. Media Queries ✅
Se detectaron **28+ breakpoints distintos** en el CSS inline y theme:
- **Mobile-first:** 359px, 400px, 480px, 575px, 600px, 640px, 767px, 768px
- **Tablet:** 768px–991px, 768px–1199px, 991px, 1023px, 1024px
- **Desktop:** 992px+, 1200px+
- **Extra:** `prefers-reduced-motion`, `hover:hover`, `hover:none and pointer:coarse`

### 3. Navegación móvil ✅
- Módulo `zonacncmobilenav` v1.0.10 activo solo ≤991px
- Topbar fijo + drawer dual (hamburguesa + search)
- Tema oscuro custom con CSS variables (`--zcmn-*`)
- Altura topbar: 60px, row: 52px, drawer width: min(320px, 86vw)
- Z-index layering: overlay 9090, drawer 9100, topbar 9080

### 4. Mega-menú responsive ✅
El mega-menú de categorías implementa **3 breakpoints distintos**:
- **Desktop (≥992px):** `min-width: 800px`, 2 paneles (left 280px + right grid 3 cols)
- **Tablet (≤991px):** `min-width: min(100vw - 2rem, 700px)`, single column, left=full width
- **Mobile (≤768px):** Fixed full-width, `min-width:0`, single column grid, solo icono (sin texto)

### 5. Touch targets ✅
- Botón "Vender" mobile: `min-height:44px; min-width:44px`
- Menu toggle: `min-width:44px; min-height:44px`
- Se ajustan a las WCAG 2.5.5 (Target Size)

### 6. Overflow prevention ✅
```css
body { overflow-x: hidden; }
.page-content--home { overflow-x: hidden; }
```
El scroll horizontal está prevenido a nivel body.

### 7. Flexbox / Grid adaptable ✅
- Uso extensivo de `flex-wrap: wrap` en header y contenidos
- `.zcnc-topnav`: `flex-wrap: nowrap` (correcto para nav horizontal que se oculta/adapta)
- Mega-menú right panel: `grid-template-columns` cambia 3→2→1 según viewport

### 8. Imágenes ✅ / ⚠️
- ✅ `loading="lazy"` en todas las imágenes de producto
- ✅ `width` y `height` explícitos en imágenes de producto (250×250)
- ⚠️ **No se detecta `srcset` ni `<picture>`** — las imágenes no usan responsive images para diferentes densidades/resoluciones. Esto es una **mejora pendiente** (no crítica, Prioridad Baja).

### 9. Idiomas / hreflang ✅
- 11 alternates hreflang correctamente configurados (es, en, ca, gl, eu, fr, de, pt, it, tr, ru)
- Redirección automática a `/es/` por geolocalización

### 10. Performance headers ✅
- `strict-transport-security: max-age=31536000; includeSubDomains`
- `x-frame-options: SAMEORIGIN`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: geolocation=(self), microphone=(), camera=(), payment=(self)`

---

## Findings

### Sin issues críticos ni bloqueantes

| Severidad | Descripción | Estado |
|-----------|-------------|--------|
| 🔵 Low | Imágenes sin `srcset`/`sizes` — no responsive images | Mejora pendiente |
| 🔵 Low | Fuente 12px en elemento (mega-menú `z-index` inline) | Cosmético, no afecta legibilidad |
| 🔵 Low | Playwright WS endpoint (`ws://51.254.244.216:3000/`) no disponible | Infra — impide screenshots automatizados |

---

## Páginas verificadas

| URL | Status | Viewport meta | Media queries | Mobile nav |
|-----|--------|---------------|---------------|------------|
| `/` (home) | 200→/es/ | ✅ | ✅ | ✅ |
| `/es/publicar` | 200 | ✅ | ✅ | ✅ |
| `/es/2-tornos-cnc` | 200 | ✅ | ✅ | ✅ |

---

## Conclusión

**new.zonacnc.com pasa las pruebas responsive de código fuente.** La implementación cubre adecuadamente mobile (359px+), tablet y desktop con 28+ breakpoints, navegación adaptativa dedicada, touch targets WCAG-compliant, y prevención de overflow horizontal. La única mejora recomendada es implementar `srcset` para servir imágenes optimizadas por resolución de pantalla.

⚠️ **Nota:** No se pudieron tomar screenshots reales porque el endpoint Playwright remoto (`ws://51.254.244.216:3000/`) está caído y el sandbox no tiene Chromium funcional (faltan libnspr4, libnss3, libatk, etc. — sin root para instalarlas). Se recomienda restaurar el servicio `pwmcp-zonacnc` para la próxima ejecución del cron.

---

## 🔴 Segunda ejecución (18:22 UTC) — Sitio en MANTENIMIENTO

El sitio pasó a modo mantenimiento (HTTP 503) entre las dos ejecuciones. La página de mantenimiento es funcionalmente responsive pero tiene bugs de accesibilidad.

### Análisis de la página de mantenimiento

**URLs testeadas:**
| URL | Status |
|-----|--------|
| `https://new.zonacnc.com` | 301 → `/es/` |
| `https://new.zonacnc.com/es/` | **503** Maintenance |
| `https://new.zonacnc.com/?zcnc_debug=1` | 301 → 503 (no bypassa) |

**Estructura HTML mantenimiento:**
```html
<div id="layout-error" class="layout-error">
  <header class="page-header">
    <img class="error__logo" src="...logo-1776964831.jpg" width="1084" height="235" loading="lazy">
    <h1 class="error__title">Estaremos de vuelta en breve.</h1>
  </header>
  <section class="page-content page-content--maintenance">
    <p>We are currently updating our shop...</p>
  </section>
</div>
```

**CSS responsive del mantenimiento:**
- `.error__logo { max-width:100%; height:auto; width:auto; max-height:12rem }` — ✅ Responsive override
- `.layout-error { max-width: calc(100% - 2rem); width: 34rem }` — ✅ Adapta a mobile
- `.error__title { font-size: 1.5rem; font-weight: 600 }` — ✅ Legible
- Bootstrap 5 completo cargado con 6 breakpoints

### Issues encontrados en página de mantenimiento

| # | Severidad | Issue | WCAG | Ubicación |
|---|-----------|-------|------|-----------|
| 1 | 🟡 Medium | `<html lang="">` vacío — debe ser `lang="es"` | 3.1.1 (A) | `maintenance.tpl` |
| 2 | 🟡 Medium | `<title></title>` vacío — sin título de página | 2.4.2 (A) | `maintenance.tpl` |
| 3 | 🔵 Low | `/favicon.ico` → 503 en mantenimiento | — | Nginx/PHP |
| 4 | 🔵 Low | Logo con `loading="lazy"` above-the-fold | — | `maintenance.tpl` |

### Recomendaciones para maintenance.tpl

```smarty
{* En themes/hummingbird/templates/_partials/maintenance.tpl *}
<html lang="{$language.iso_code}">  {* Fix: lang vacío *}
  <head>
    <title>{$shop.name} — {l s='Under maintenance' d='Shop.Theme.Global'}</title>  {* Fix: title vacío *}
    ...
    <img class="error__logo" src="{$shop.logo}" alt="{$shop.name}" loading="eager">  {* Fix: quitar lazy del logo *}
```
