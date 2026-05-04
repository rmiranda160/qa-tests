# 🔴 CRITICAL: Brand/manufacturer pages HTTP 500 + EN i18n routing issues persist (2026-05-04)

**Date:** 2026-05-04 02:29 UTC  
**Found by:** CRON_QA tester-responsive  
**Environment:** new.zonacnc.com (Production-like test mode)  
**Test account:** test25@zonacnc.com  

---

## Critical Findings (Unresolved)

### 1. 🔴 Brand/manufacturer listing pages HTTP 500 — NEW (reported 2026-05-04)
All tested brand and manufacturer listing pages return HTTP 500:
- `https://new.zonacnc.com/es/marca/5-haas` → **HTTP 500**
- `https://new.zonacnc.com/es/marca/35-amada` → **HTTP 500**
- `https://new.zonacnc.com/es/marca/29-mazak` → **HTTP 500**
- Alternate URLs (`/fabricantes`, `/en/manufacturers`, `/es/brand/5-haas`) return **404**

### 2. 🔴 Product detail pages HTTP 500 — PERSISTS (multiple days)
All product detail pages continue to return HTTP 500:
- `https://new.zonacnc.com/es/tornos-automaticos/12969-torno-cnc-haas-st-10.html` → **HTTP 500**

### 3. 🔴 Mobile hamburger menu toggle invisible — PERSISTS
- `button.menu-toggle` (aria-label="Abrir menú móvil") has **0×0px dimensions**
- Offcanvas `#mobileMenu` exists but has no visible trigger
- WCAG violations: 2.1.1 (Keyboard), 2.4.3 (Focus Order), 2.5.5 (Target Size)

### 4. 🟠 EN content page URLs redirect to Spanish slugs — PERSISTS
| Intended URL | Resolves to | Title |
|-------------|-------------|-------|
| `/en/content/4-how-it-works` | `/en/content/4-como-funciona` | "About us" |
| `/en/content/7-legal-notice` | `/en/content/7-aviso-legal` | "Aviso legal" (Spanish) |
| `/en/content/3-terms-and-conditions-of-use` | `/en/content/3-terminos-y-condiciones-de-uso` | "Términos y condiciones" (Spanish) |

### 5. 🟠 EN category page shows Spanish title
- `/en/15-lathes` → Title: `"Tornos"` (should be "Lathes")

## Previously Reported, Still Open

- [#68](https://github.com/rmiranda160/qa-tests/issues/68) — Site outage pattern (HTTP 500)
- Product detail pages 500 (first reported days ago, still unfixed)
- Mobile menu toggle invisible (first reported ~02:00 UTC 2026-05-04)

## Evidence

- **Snapshot:** MCP browser reported `ERR_HTTP_RESPONSE_CODE_FAILURE` for both brand and product detail pages
- **curl:** HTTP 500 confirmed for all brand pages
- **Mobile menu check:** `getBoundingClientRect()` returns {width: 0, height: 0} for menu-toggle button
- **EN routing:** `curl -L` confirms redirects to Spanish slug paths
