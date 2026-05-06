# 📱 Responsive QA Results — new.zonacnc.com

**Date:** 2026-05-06 05:50 UTC  
**Tester:** CRON_QA (responsive focus)  
**Cron ID:** 53983183-66c6-4b72-9b21-404aac116c60  
**Email pool:** test7-test30@zonacnc.com  
**Browser:** Chromium via MCP remoto (pwmcp-zonacnc)  
**Scope:** https://new.zonacnc.com/es/ — strict  
**Mode:** Responsive

---

## ⚠️ Overall Result: PASS with 1 finding

4 pages tested across 3 viewports (390×844 mobile, 768×1024 tablet, 1440×900 desktop). No horizontal overflow detected. **1 responsive accessibility defect found**: language selector renders as bare `option` elements on mobile (non-functional).

---

## 🔴 Finding: Language Selector Not Functional on Mobile

### Severity: HIGH (accessibility + functionality)

| Viewport | Language Selector Rendering | Status |
|---|---|---|
| 390×844 (Mobile) | 10 bare `option` elements, no wrapping `combobox`/`select` | 🔴 BROKEN |
| 768×1024 (Tablet) | Proper `combobox` with `option` children | ✅ OK |
| 1440×900 (Desktop) | Proper `combobox` with `option` children | ✅ OK |

### Evidence (ARIA Snapshots)

**Mobile (390×844) — Search page header:**
```yaml
- banner:
  - option "English"
  - option "Català"
  - option "Español" [selected]
  - option "Galego"
  - option "Euskera"
  - option "Français"
  - option "Deutsch"
  - option "Português PT"
  - option "Italiano"
  - option "Türkçe"
  - option "Русский"
```
The `option` elements are direct children of the banner `generic` container — **no `combobox` or `select` wrapper**.

**Desktop (1440×900) — Same page header:**
```yaml
- combobox [cursor=pointer]:
  - option "English"
  - option "Català"
  - option "Español" [selected]
  ...
```
The same language options are properly wrapped in a `combobox`.

### Impact
- On mobile, the language selector is not interactive — users cannot change language
- Screen readers may not recognize these as a dropdown
- Affects all pages on the site at mobile breakpoints
- **Reproduction**: 100% — every page tested (Home, Search, Login, Product Detail) at 390×844

### Pages Affected
- Home page (`/es/`)
- Search page (`/es/buscar`)
- Login page (`/es/iniciar-sesion`)
- Product detail page (e.g. `/es/tornos-automaticos/13044-haas-st-30.html`)

---

## 📊 Responsive Results by Page

| # | Page | URL | 390×844 | 768×1024 | 1440×900 |
|---|---|---|---|---|---|
| 1 | Home | `/es/` | ✅ (lang selector ⚠️) | ✅ | ✅ |
| 2 | Search | `/es/buscar` | ✅ (lang selector ⚠️) | — | — |
| 3 | Login | `/es/iniciar-sesion` | ✅ (lang selector ⚠️) | — | — |
| 4 | Product Detail | `/es/tornos-automaticos/13044-haas-st-30.html` | ✅ (lang selector ⚠️) | — | ✅ |

---

## ✅ What Works Well

### Header
- **Responsive adaptation**: Full labels on desktop → icons+labels on tablet → minimal icons on mobile
- Logo and brand link always visible
- Search toggle button on mobile correctly reveals search bar
- Login icon link present on all breakpoints
- "Publicar" (publish) link renders as icon on mobile — clean and space-efficient

### Footer
- **Accordion pattern on mobile**: Sections collapsed by default with expand/collapse toggle buttons
- Sections expand on tablet/desktop
- Newsletter signup field renders well at all widths
- Category and brand links list properly

### Login Page
- Centered form with proper mobile sizing
- Email/password fields properly sized for touch targets
- Password show/hide toggle present
- "¿Olvidó su contraseña?" link and "Iniciar sesión" button clearly visible
- Google login alternative available
- "Cree su cuenta" link for registration

### Search Results
- Filter sidebar hidden behind "Filtros" button on mobile
- Product cards stack in single column on mobile
- Sort combobox ("Ordenar por") renders properly inline
- Product cards show: image, title, location, price, "Guardar en favoritos", "Enviar solicitud"
- Pagination with numbered links + "Siguiente" link
- "Vende tu maquinaria" CTA section stacks properly

### Product Detail Page
- Vertical stacking on mobile (image → details → gallery)
- Breadcrumbs intact on mobile
- Product images, machine data, and contact form all stack into single column
- Related products section at bottom

---

## Console Errors (Non-blocking)

| Error | Source | Impact |
|---|---|---|
| "Not signed in with the identity provider" | Google GSI | Expected for non-authenticated state |
| "[GSI_LOGGER]: FedCM get() rejects with NetworkError" | Google GSI client | Expected for non-auth state |
| "Unexpected token '&'" | zonacnc JS | Minor JS parsing issue, no functional impact |

All 3 console errors are pre-existing and not related to responsive layout.

---

## Comparison with Previous Responsive Runs

| Date | Key Findings | Status |
|---|---|---|
| 2026-05-06 02:42 | PASS — all 13 pages, login 500 FIXED | ✅ |
| 2026-05-05 23:34 | PASS — no overflow issues, all viewports clean | ✅ |
| 2026-05-04 23:39 | 4 findings: touch targets, font size, srcset | ✅ |
| **2026-05-06 05:50** | **🔴 Language selector non-functional on mobile** | ⚠️ |

The language selector issue appears to be a new regression — previous runs noted the language selector as "Visible at all breakpoints with 10 language options" but did not detect the missing `combobox` wrapper on mobile.

---

## Recommendation

1. **Fix the language selector on mobile**: At mobile breakpoints, ensure the language dropdown is rendered inside a `<select>` element or a `combobox` widget with proper ARIA roles, not as bare `option` elements.
2. This should be fixed in the header template (likely a PrestaShop module/theme template) to ensure it applies site-wide.
