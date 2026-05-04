# CRON QA: tester-responsive — 2026-05-04 02:29 UTC

**Focus:** responsive  
**Duration:** ~20 min  
**Scope:** new.zonacnc.com — Responsive layout, page availability, i18n routing, email templates  
**Account:** test25@zonacnc.com (IMAP verified)  
**Method:** MCP browser (pwmcp-zonacnc) — 3 viewports (390×844, 768×1024, 1440×900)  

---

## Pages Tested (Mobile 390×844, Tablet 768×1024, Desktop 1440×900)

| Página | URL | Desktop | Tablet | Mobile | Overflow |
|--------|-----|---------|--------|--------|:--------:|
| Home (ES) | `/es/` | ✅ | ✅ | ✅ | 0 ❌ |
| Login | `/es/iniciar-sesion` | ✅ | ✅ | ✅ | 0 ❌ |
| Pricing | `/es/pricing` | ✅ | ✅ | ✅ | 0 ❌ |
| Product Listing (Tornos) | `/es/15-tornos` | ✅ | ✅ | ✅ | 0 ❌ |
| Sellers | `/es/vendedores` | ✅ | ✅ | ✅ | 0 ❌ |
| Brand page (ES) | `/es/marca/5-haas` | ❌ **500** | ❌ | ❌ | — |
| Product detail (ES) | `/es/tornos-automaticos/12969-...` | ❌ **500** | ❌ | ❌ | — |
| En content pages | `/en/content/{4,7,3}` | ⚠️ **redirect** | ⚠️ | ⚠️ | — |
| EN category | `/en/15-lathes` | ⚠️ **wrong title** | ⚠️ | ⚠️ | — |
| EN search | `/en/search` | ✅ FIXED | ✅ | ✅ | — |

---

## Findings Summary

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | 🔴 CRITICAL | **Brand/manufacturer listing pages return HTTP 500** — `/es/marca/5-haas`, `/fabricantes`, `/en/manufacturers` | **PERSISTS** |
| 2 | 🔴 CRITICAL | **Product detail pages HTTP 500** (ALL products, ES+EN) | **PERSISTS** |
| 3 | 🔴 HIGH | **Mobile hamburger menu toggle invisible** (0×0px on mobile) — WCAG 2.1.1, 2.4.3, 2.5.5 | **PERSISTS** |
| 4 | 🟠 HIGH | **EN content page URLs redirect to Spanish slugs** — i18n routing broken for how-it-works, legal-notice, terms | **PERSISTS** |
| 5 | 🟠 HIGH | **EN category page shows Spanish title "Tornos"** instead of "Lathes" | **PERSISTS** |
| 6 | 🔵 LOW | **EN Create Ad page has generic title "zonacnc.com"** | **PERSISTS** |
| 7 | 🟢 FIXED | **EN `/search` now works correctly** (was broken, now ✅) | **✅ RESOLVED** |
| 8 | ✅ PASS | **No horizontal overflow** on any tested page at any viewport | ✅ |
| 9 | ✅ PASS | **Footer collapsible sections** work on mobile | ✅ |
| 10 | ✅ PASS | **Cookie consent dialog** present and functional | ✅ |
| 11 | ✅ PASS | **Console errors** — only known Google Identity/FedCM (non-blocking) | ✅ |

---

## Finding Details

### 🔴 CRITICAL #1: Brand/manufacturer pages HTTP 500 — PERSISTS

**Description:** All brand/manufacturer listing pages return HTTP 500 Internal Server Error. This blocks buyers from browsing suppliers by brand.

**Evidence:**
- `https://new.zonacnc.com/es/marca/5-haas` → **ERR_HTTP_RESPONSE_CODE_FAILURE** (HTTP 500)
- `https://new.zonacnc.com/es/marca/35-amada` → **HTTP 500** (curl confirmed)
- `https://new.zonacnc.com/es/marca/29-mazak` → **HTTP 500** (curl confirmed)
- Alternate URLs (`/fabricantes`, `/en/manufacturers`, `/es/brand/5-haas`) return **404**

**Impact:** CRITICAL. Buyers cannot browse by brand. Manufacturer directory non-functional.

### 🔴 CRITICAL #2: Product detail pages HTTP 500 — PERSISTS

**Description:** Every product detail page tested returns HTTP 500 internal server error, affecting both ES and EN URLs, all product types.

**Evidence:**
- `https://new.zonacnc.com/es/tornos-automaticos/12969-torno-cnc-haas-st-10.html` → **ERR_HTTP_RESPONSE_CODE_FAILURE**
- Status persistent across multiple CRON QA runs over days

### 🔴 HIGH #3: Mobile hamburger menu toggle invisible — PERSISTS

**Description:** Button `menu-toggle.btn.btn-link` (aria-label="Abrir menú móvil") renders at 0×0px. The offcanvas `#mobileMenu` exists with `display: flex` but has no visible trigger.

**Evidence (at 390×844):**
```javascript
menuToggleRect: { x: 0, y: 0, width: 0, height: 0 }
mobileMenuDisplay: "flex"    // offcanvas exists
menuToggleVisible: false     // but trigger is invisible
```

**Impact:** Mobile users cannot access site navigation (categorías, vender, cómo funciona, etc.). WCAG violations: Keyboard (2.1.1), Focus Order (2.4.3), Target Size (2.5.5).

### 🟠 HIGH #4: EN content page URLs redirect to Spanish slugs — PERSISTS

**Description:** English content page URLs redirect to Spanish slug paths.

| Intended URL | Resolves to | Title shown |
|---|---|---|
| `/en/content/4-how-it-works` | `/en/content/4-como-funciona` | "About us" |
| `/en/content/7-legal-notice` | `/en/content/7-aviso-legal` | "Aviso legal · ZonaCNC" (Spanish) |
| `/en/content/3-terms-and-conditions-of-use` | `/en/content/3-terminos-y-condiciones-de-uso` | "Términos y condiciones · ZonaCNC" (Spanish) |

### 🟠 HIGH #5: EN category page shows Spanish title — PERSISTS

**Evidence:** `/en/15-lathes` → Page `<title>`: `"Tornos"` (Spanish), should be "Lathes" or equivalent English.

### 🔵 LOW #6: EN Create Ad page generic title — PERSISTS

**Evidence:** `/en/module/zonacncproductadd/ads` → Title: "zonacnc.com" (generic fallback)

### 🟢 FIXED: EN `/search` now works

Previously broken, the English search page at `/en/search` now loads correctly with HTTP 200.

---

## Email IMAP Verification (test25@zonacnc.com)

| # | Subject | Language | Status |
|---|---------|----------|--------|
| 1 | ¡Bienvenido! (Welcome) | Spanish | ✅ Correct translation |
| 2 | ¡Bienvenido! (Welcome) | Spanish | ✅ Correct translation |
| 3 | Password query confirmation | English | ⚠️ English email sent (mixed language) |
| 4 | Your new password | English | ⚠️ English email sent (mixed language) |
| 5 | Confirmación de contraseña | Spanish | ✅ Correct translation, proper MJML responsive template |

**Email structure:** multipart/alternative (text/plain qp + text/html qp)  
**Sender:** no-reply@mg.zonacnc-sales.es  
**Template framework:** MJML (responsive HTML emails)  
**Translation quality:** Spanish templates ✅ correct; English templates present but mixed

---

## Responsive Layout Results

| Viewport | Pages | Overflow | Layout |
|----------|-------|:--------:|:------:|
| Mobile (390×844) | 6 pages | 0px ❌ | ✅ Fits viewport correctly |
| Tablet (768×1024) | 6 pages | 0px ❌ | ✅ Adapts layout |
| Desktop (1440×900) | 6 pages | 0px ❌ | ✅ Full nav visible |

### Mobile Observations
- Header shows: logo, language selector, search icon, login icon, sell icon
- ❌ **No hamburger menu trigger visible** (0×0px) — users can't navigate
- Footer accordions: ✅ Legal, Marketplace, Nuestra empresa, Su cuenta — all collapsible
- Cookie consent: ✅ Present

### Tablet Observations
- Similar compact header as mobile
- No full navigation visible (still needs hamburger)

### Desktop Observations
- Full navigation: Inicio, Categorías, Vender máquina, Cómo funciona, Planes, Vendedores, FAQs
- Search bar visible directly

---

## Recommendations

1. **🔴 IMMEDIATE:** Fix brand/manufacturer listing pages (`/es/marca/*`, `/fabricantes`, `/en/manufacturers`)
2. **🔴 IMMEDIATE:** Fix product detail pages HTTP 500 (blocks buyer journey)
3. **🔴 HIGH:** Fix mobile hamburger menu toggle visibility (`button.menu-toggle` has 0×0)
4. **🟠 HIGH:** Configure proper i18n URL routing for EN content pages
5. **🔵 LOW:** Update EN category page `<title>` with translated strings
6. **🔵 LOW:** Set descriptive page titles on module pages (create-ad, etc.)
