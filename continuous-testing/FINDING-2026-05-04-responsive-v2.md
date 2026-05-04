# CRON QA: tester-responsive — 2026-05-04 01:42 UTC

**Focus:** responsive  
**Duration:** ~25 min  
**Scope:** new.zonacnc.com — Responsive layout, page availability, i18n routing  
**Accounts available:** test7–test30@zonacnc.com  
**Method:** MCP browser (pwmcp-zonacnc) — 3 viewports (390×844, 768×1024, 1440×900)

---

## Pages Tested

| Página | URL | Desktop | Tablet | Mobile |
|--------|-----|---------|--------|--------|
| Home (ES) | `/es/` | ✅ | ✅ | ✅ |
| Home (EN) | `/en/` | ✅ | ✅ | ✅ |
| Cat: Tornos (ES) | `/es/15-tornos` | ✅ | ✅ | ✅ |
| Cat: Tornos (EN) | `/en/15-lathes` | ✅ | ✅ | ✅ |
| Buscar (ES) | `/es/buscar` | ✅ | ✅ | ✅ |
| Search (EN) | `/en/search` | ✅ | ✅ | ✅ |
| Login | `/es/iniciar-sesion` | ✅ | ✅ | ✅ |
| Contacto (ES) | `/es/contactenos` | ✅ | ✅ | ✅ |
| Contact (EN) | `/en/contact-us` | ✅ | ✅ | ✅ |
| Pricing (ES) | `/es/module/zonacncplans/pricing` | ✅ | ✅ | ✅ |
| How it works (ES) | `/es/content/4-como-funciona` | ✅ | ✅ | ✅ |
| Create ad (ES) | `/es/module/zonacncproductadd/ads` | ✅ | ✅ | ✅ |
| Product detail (ES) | `/es/tornos-automaticos/12969-...` | ❌ **500** | ❌ | ❌ |
| Product detail (EN) | `/en/automatic-lathes/12969-...` | ❌ **500** | ❌ | ❌ |
| Brand page (ES) | `/es/marca/5-haas` | ❌ **500** | ❌ | ❌ |
| Fabricantes (ES) | `/fabricantes` | ❌ **500** | ❌ | ❌ |
| Manufacturers (EN) | `/en/manufacturers` | ❌ **500** | ❌ | ❌ |
| How it works (EN) | `/en/content/4-how-it-works` | ⚠️ **redirect** | ⚠️ | ⚠️ |
| Legal notice (EN) | `/en/content/7-legal-notice` | ⚠️ **redirect** | ⚠️ | ⚠️ |
| Terms (EN) | `/en/content/3-terms-and-...` | ⚠️ **redirect** | ⚠️ | ⚠️ |

---

## Findings Summary

| # | Severity | Finding | Page | Status |
|---|----------|---------|------|--------|
| 1 | 🔴 CRITICAL | **Product public page returns HTTP 500** (persists) | All product detail pages | **UNFIXED** |
| 2 | 🔴 CRITICAL | **Brand/manufacturer pages return HTTP 500** | `/fabricantes`, `/en/manufacturers`, `/es/marca/5-haas` | **NEW** |
| 3 | 🔴 HIGH | **Mobile hamburger menu toggle invisible** (0×0) — WCAG 2.1.1, 2.4.3, 2.5.5 | All pages (mobile) | **PERSISTS** |
| 4 | 🟠 HIGH | **EN content page URLs redirect to Spanish slugs** — i18n routing broken for how-it-works, legal-notice, terms | `/en/content/{4,7,3}` | **NEW** |
| 5 | 🟠 HIGH | **EN product detail 500 persists from prev run** | EN product pages | **UNFIXED** |
| 6 | 🔵 LOW | **EN category page shows Spanish title "Tornos"** | `/en/15-lathes` | **UNFIXED** |
| 7 | 🔵 LOW | **EN Create Ad page has generic title "zonacnc.com"** | `/es/module/zonacncproductadd/ads` | **NEW** |
| 8 | 🟢 FIXED | **EN `/search` now works correctly** | `/en/search` | **✅ RESOLVED** |
| 9 | ✅ PASS | **No horizontal overflow** on any page at any viewport | All tested | ✅ |
| 10 | ✅ PASS | **Footer collapsible sections** work on mobile | All pages | ✅ |
| 11 | ✅ PASS | **Cookie consent dialog** present and functional | All pages | ✅ |
| 12 | ✅ PASS | **Console errors** — only known Google Identity/FedCM (non-blocking) | All pages | ✅ |

---

## Finding Details

### 🔴 CRITICAL #1: Product detail pages return HTTP 500 (ALL products) — PERSISTS

**Description:** Every product detail page tested returns HTTP 500 Internal Server Error. Affects both ES and EN URLs, all product types. Previously reported and documented in multiple CRON runs. Fix branch exists but has not been deployed.

**Evidence:**
- `https://new.zonacnc.com/es/tornos-automaticos/12969-torno-cnc-haas-st-10.html` → **HTTP 500**
- `https://new.zonacnc.com/en/automatic-lathes/12969-cnc-lathe-haas-st-10.html` → **HTTP 500**
- Status unchanged since previous CRON runs

### 🔴 CRITICAL #2: Brand/manufacturer pages return HTTP 500 — NEW

**Description:** All tested brand and manufacturer listing pages return HTTP error (500 or ERR_HTTP_RESPONSE_CODE_FAILURE). This blocks buyers from browsing by brand and sellers from being discovered.

**Evidence:**
- `https://new.zonacnc.com/fabricantes` → **HTTP error**
- `https://new.zonacnc.com/en/manufacturers` → **HTTP error**
- `https://new.zonacnc.com/es/marca/5-haas` → **HTTP error**

**Impact:** CRITICAL. Buyers cannot browse suppliers by brand. Manufacturer directory is completely non-functional.

### 🔴 HIGH #3: Mobile hamburger menu toggle invisible — PERSISTS

**Description:** The `button.menu-toggle` (aria-label="Abrir menú móvil") renders at 0×0px on mobile because it is nested inside `.ps-mainmenu--desktop` which has `display: none` on mobile. The offcanvas `#mobileMenu` exists but has no visible trigger. Previously reported in the 00:45 UTC CRON run.

**Evidence:**
```javascript
// Confirmed at 01:43 UTC
menuToggleRect: { x: 0, y: 0, width: 0, height: 0 }
desktopMenuDisplay: "none"  // hides toggle button
mobileMenuDisplay: "flex"   // offcanvas exists but has no trigger
```

### 🟠 HIGH #4: EN content page URLs redirect to Spanish slugs — NEW

**Description:** English content page URLs with English-friendly slugs redirect to Spanish slug paths, breaking i18n URL structure. The page content then displays in mixed/inconsistent language.

**Evidence:**
| Intended URL | Resolves to | Title shown |
|---|---|---|
| `/en/content/4-how-it-works` | `/en/content/4-como-funciona` | "About us" |
| `/en/content/7-legal-notice` | `/en/content/7-aviso-legal` | "Aviso legal · ZonaCNC" (Spanish) |
| `/en/content/3-terms-and-conditions-of-use` | `/en/content/3-terminos-y-condiciones-de-uso` | "Términos y condiciones · ZonaCNC" (Spanish) |

**Impact:** HIGH. English users see Spanish URLs and content titles. SEO duplicate content risk. i18n URL routing is broken for content pages.

### 🟠 HIGH #5: EN product detail 500 persists — UNFIXED

Same as finding #1 — affects English product URLs identically.

### 🔵 LOW #6: EN category page title shows "Tornos" instead of "Lathes" — UNFIXED

**Evidence:** `/en/15-lathes` → Page `<title>`: `"Tornos"` (Spanish)

### 🔵 LOW #7: EN Create Ad page shows generic title "zonacnc.com" — NEW

**Description:** The create ad page at `/es/module/zonacncproductadd/ads` (and likely `/en/module/...`) has page title "zonacnc.com" instead of a descriptive title like "Publicar anuncio | ZonaCNC" or equivalent.

**Evidence:** Title "zonacnc.com" is the fallback/generic site name.

### 🟢 FIXED: EN `/search` now works correctly

**Description:** Previously reported as redirecting to `/en/`, the EN search page at `/en/search` now loads correctly with proper title "Used and new industrial machinery | ZonaCNC" and shows 18 product results. URL stays at `/en/search` (no redirect).

---

## Responsive Test Results

| Viewport | Pages tested | Overflow found | Issues |
|----------|-------------|----------------|--------|
| **Mobile** (390×844) | 12+ | 0 ❌ | ✅ All layouts fit viewport |
| **Tablet** (768×1024) | 12+ | 0 ❌ | ✅ Layout adapts. Top nav switches to compact mode (Categorías + Vender máquina) |
| **Desktop** (1440×900) | 12+ | 0 ❌ | ✅ Full layout renders correctly with proper nav links |

### Key responsive observations:
- **Mobile:** Header shows logo, language selector, search toggle icon, login icon, "sell" icon. No hamburger menu trigger visible. Footer accordions work (Marketplace, Legal, Nuestra empresa, Su cuenta).
- **Tablet:** Similar to mobile - compact header with minimal nav items.
- **Desktop:** Full navigation visible with links: Inicio, Categorías, Vender máquina, Cómo funciona, Planes, Vendedores, FAQs.

---

## Email Verification

No user-facing actions were performed that trigger transactional emails (no ad creation, no contact forms submitted, no registration). All test infrastructure pages loaded but no form submissions were made.

---

## Recommendations

1. **🔴 IMMEDIATE:** Fix and deploy the product detail page 500 error. This blocks buyer-side functionality.
2. **🔴 IMMEDIATE:** Fix the brand/manufacturer listing page 500 error. Buyers need brand filtering.
3. **🔴 HIGH:** Fix mobile hamburger menu toggle visibility so mobile users can access navigation.
4. **🟠 HIGH:** Configure proper i18n URL routing for English content pages (how-it-works, legal-notice, terms-and-conditions).
5. **🔵 LOW:** Update EN category page meta titles to use translated strings.
6. **🔵 LOW:** Set descriptive page titles on the create-ad and similar module pages.

---

## Workflow Status

| Step | Status |
|------|--------|
| Testing | ✅ Complete (3 viewports × 12+ pages) |
| Finding doc | ✅ This file |
| Branch | 🔄 To be created |
| Commit | 🔄 Pending |
| PR | 🔄 Pending |
| Issue | 🔄 Pending |
