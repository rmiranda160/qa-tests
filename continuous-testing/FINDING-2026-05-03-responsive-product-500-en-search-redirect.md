# CRON QA: tester-responsive — 2026-05-03 22:01 UTC

**Focus:** responsive  
**Duration:** ~20 min  
**Scope:** new.zonacnc.com — Responsive layout, page availability, EN routing  
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
| Login | `/es/iniciar-sesion` | ✅ | ✅ | ✅ |
| Contacto (ES) | `/es/contactenos` | ✅ | ✅ | ✅ |
| Contact (EN) | `/en/contact-us` | ✅ | ✅ | ✅ |
| Pricing | `/es/module/zonacncplans/pricing` | ✅ | ✅ | ✅ |
| Search (EN) | `/en/search` | ⚠️ **redirect → /** | ⚠️ | ⚠️ |
| Product detail (ES) | `/es/tornos-automaticos/12969-...` | ❌ **500** | ❌ | ❌ |
| Product detail (ES) | `/es/.../12965-...` | ❌ **500** | ❌ | ❌ |
| Product detail (EN) | `/en/automatic-lathes/12969-...` | ❌ **500** | ❌ | ❌ |

---

## Findings Summary

| # | Severity | Finding | Page | Status |
|---|----------|---------|------|--------|
| 1 | 🔴 CRITICAL | **Product public page returns HTTP 500** (persists from previous run) | All product detail pages | **UNFIXED** |
| 2 | 🟠 HIGH | **EN `/search` route redirects to homepage** instead of showing search results | `/en/search` | **NEW** |
| 3 | 🔵 LOW | **EN category page title shows Spanish** `"Tornos"` instead of English `"Lathes"` | `/en/15-lathes` | **NEW** |
| 4 | ✅ PASS | **No horizontal overflow** on any page at any viewport | All tested | ✅ |
| 5 | ✅ PASS | **Mobile nav (hamburger)** works correctly | Homepage | ✅ |
| 6 | ✅ PASS | **Footer collapsible sections** work on mobile | All pages | ✅ |
| 7 | ✅ PASS | **Cookie consent dialog** present and functional | All pages | ✅ |
| 8 | ✅ PASS | **Console errors** — only known Google Identity/FedCM (non-blocking) | All pages | ✅ |

---

## Finding Details

### 🔴 CRITICAL #1: Product detail pages return HTTP 500 (ALL products)

**Description:** Every product detail page tested returns HTTP 500 Internal Server Error. This affects both ES and EN URLs, QA test products and real products alike.

**Status:** This was previously reported in the 21:00 UTC CRON QA run. The finding was documented in commit `4b5b6bc` on branch `fix/product-page-500-ad-email-missing-20260503` but **not deployed to production** — the 500 error persists.

**Evidence (confirmed 22:04 UTC):**
- `https://new.zonacnc.com/es/tornos-automaticos/12969-torno-cnc-haas-st-10.html` → **HTTP 500**
- `https://new.zonacnc.com/es/tornos-automaticos/12968-torno-cnc-haas-qa-test-i18n-001.html` → **HTTP 500**
- `https://new.zonacnc.com/es/tornos-automaticos/12965-torno-cnc-haas-st-20y-2019.html` → **HTTP 500**
- `https://new.zonacnc.com/es/centros-de-mecanizado-multifuncion/12934-gildemeister-ctx-510.html` → **HTTP 500**
- `https://new.zonacnc.com/en/automatic-lathes/12969-cnc-lathe-haas-st-10.html` → **HTTP 500**

**Impact:** CRITICAL. All product pages are broken. Buyers cannot view any product details. Marketplace is effectively non-functional for browsing.

### 🟠 HIGH #2: EN `/search` route redirects to homepage

**Description:** Navigating to `/en/search` redirects to `/en/` (homepage) instead of showing search results. The ES equivalent `/es/buscar` works correctly and loads the search/browse page.

**Evidence:**
- URL: `https://new.zonacnc.com/en/search` → final URL: `https://new.zonacnc.com/en/` (HTTP 302/301 redirect)
- ES equivalent: `https://new.zonacnc.com/es/buscar` → loads search page correctly (HTTP 200)

**Impact:** English users cannot navigate to the search/browse page via URL. They must use the home page search bar or navigate through categories.

### 🔵 LOW #3: EN category page shows Spanish title "Tornos"

**Description:** The English version of the Tornos (Lathes) category page at `/en/15-lathes` displays the HTML `<title>` as `"Tornos"` instead of a properly translated English title like `"Lathes"` or `"Lathes for Sale — CNC, Parallel and Automatic | ZonaCNC"`.

**Evidence:**
- URL: `https://new.zonacnc.com/en/15-lathes`
- Page `<title>`: `"Tornos"` (Spanish)
- Expected: English translation

**Impact:** Minor SEO and UX issue. English users see Spanish text in the browser tab title.

---

## Responsive Test Results

| Viewport | Pages tested | Overflow found | Issues |
|----------|-------------|----------------|--------|
| **Mobile** (390×844) | 9 | 0 ❌ | ✅ All layouts fit viewport |
| **Tablet** (768×1024) | 9 | 0 ❌ | ✅ Top nav becomes compact but usable. Full desktop nav visible. |
| **Desktop** (1440×900) | 9 | 0 ❌ | ✅ Full layout renders correctly |

### Key responsive observations:
- **Mobile:**
  - Hamburger menu (categories) works: opens drawer with category tree
  - Search has expandable input (magnifying glass icon → search bar)
  - Footer sections are collapsible (Marketplace, Legal, Nuestra empresa)
  - "Vender máquina" link visible in top bar
  - Language selector available (globe/flag icon)
  - No horizontal scrollbars detected
- **Tablet:**
  - Top bar with "Contacte con nosotros", "Vendedores", "Tarifas" visible
  - Full navigation visible (no hamburger needed for primary nav)
  - Search bar visible in header
  - Language selector available
- **Desktop:**
  - Full layout renders correctly
  - All navigation elements visible
  - Product grid displays in 3-column layout

---

## Email Verification

Since the product detail pages are broken and no user-facing action was performed that triggers transactional emails, no new emails were generated during this test cycle.

**(Emails were NOT verified via IMAP this cycle — no actions triggered email sends.)**

---

## Recommendations

1. **🔴 IMMEDIATE:** Fix and deploy the product detail page 500 error. This blocks all buyer-side functionality.
2. **🟠 HIGH:** Add `/en/search` route to the English routing configuration, or ensure it maps correctly to the search controller.
3. **🔵 LOW:** Update English category page meta titles to use translated strings.

---

## Workflow Status

| Step | Status |
|------|--------|
| Testing | ✅ Complete (3 viewports × 9+ pages) |
| Finding doc | ✅ This file |
| Branch | 🔄 To be created |
| Commit | 🔄 Pending |
| PR | 🔄 Pending |
| Issue | 🔄 Pending |
