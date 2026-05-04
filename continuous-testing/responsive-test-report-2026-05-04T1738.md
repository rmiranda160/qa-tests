# Responsive QA Test Report — new.zonacnc.com
**Date:** 2026-05-04 17:36–17:44 UTC  
**Cron ID:** 53983183-66c6-4b72-9b21-404aac116c60  
**Tester:** MCP Browser (pwmcp-zonacnc)  
**Scope:** new.zonacnc.com (Spanish `/es/` locale)  
**Verdict:** ⚠️ PASS with issues (3 findings)

---

## Test Matrix

| # | Page | URL | Mobile (390×844) | Tablet (768×1024) | Desktop (1440×900) |
|---|------|-----|:---:|:---:|:---:|
| 1 | Homepage | `/es/` | ✅ | ✅ | ✅ |
| 2 | Product | `/es/tornos/13004-torno-cnc-haas-st-20-2019.html` | ✅ | ✅ | ✅ |
| 3 | Search | `/es/buscar` | ✅ | ✅ | ✅ |
| 4 | Login | `/es/iniciar-sesion` | ✅ | ✅ | ✅ |
| 5 | Contact | `/es/contactenos` | ✅ | ✅ | ✅ |
| 6 | Register (query) | `/es/?controller=registration` | ✅ | ✅ | ✅ |
| 7 | Register (friendly) | `/es/registro` | ❌ 404 | ❌ 404 | ❌ 404 |

**Total:** 7 pages × 3 viewports = 21 checks

---

## Findings

### 🔴 FINDING-1: `/es/registro` returns 404 — friendly URL broken
- **Severity:** HIGH
- **Page:** `/es/registro`
- **Evidence:** Navigating to the friendly URL `https://new.zonacnc.com/es/registro` returns HTTP 404 with "Error 404" page title at all viewport sizes.
- **Impact:** 
  - SEO: Search engines index the 404 instead of the registration page
  - UX: Users following links to `/es/registro` see a dead page
  - Cross-linking: Login page links to `?controller=registration` properly, but if any external/cached link uses `/es/registro` it breaks
- **Expected:** `/es/registro` should redirect to or serve the same content as `/?controller=registration`
- **Screenshots:** `responsive-register-404-mobile-2026-05-04T1738.png`

### 🟡 FINDING-2: Registration page has generic page title
- **Severity:** MEDIUM
- **Page:** `/es/?controller=registration`
- **Evidence:** Page title is just "zonacnc.com" instead of a descriptive title like "Crear una cuenta — ZonaCNC Marketplace"
- **Impact:** Poor SEO, confusing browser tab label
- **Compare:** Login page has proper title "Iniciar Sesión — ZonaCNC Marketplace de Maquinaria"

### 🟡 FINDING-3: Touch targets below WCAG 44×44px minimum on mobile
- **Severity:** MEDIUM
- **Page:** `/es/iniciar-sesion` (representative; likely all pages affected)
- **Evidence:** At 390px viewport, 53 interactive elements have width or height below 44px:
  - "Iniciar sesión" submit button: 366×38px (height fails)
  - "Cree su cuenta" link: 366×38px (height fails)
  - "Cancelar" button: 93×38px (height fails)
  - Footer section toggle buttons: 24×26px (both dimensions fail)
  - Language select: 153×38px (height fails)
  - "Contacte con nosotros" link: 172×20px (height fails)
  - Form inputs: 38px height (fails)
- **WCAG 2.5.8:** Target Size (Minimum) requires 24×24px; Enhanced (AAA) requires 44×44px
- **Impact:** Difficult for users with motor impairments or on touch devices to accurately tap interactive elements

---

## Console Errors

| Type | Count | Source | Severity |
|------|-------|--------|----------|
| Google FedCM get() rejects | 10+ | `accounts.google.com/gsi/client` | LOW (3rd-party) |
| Not signed in with identity provider | 10+ | All pages (inline) | LOW (3rd-party) |
| `Unexpected token '&'` | 10+ | Various pages | MEDIUM (JS parse error) |
| 404 on `/es/registro` | 1 | Registration page | HIGH |

**Note:** Google Sign-In errors are expected in test environments with no Google account signed in. The `Unexpected token '&'` JS parse errors may indicate a template/encoding bug worth investigating.

---

## Responsive Behavior Summary

### ✅ Passes
- **No horizontal overflow** on any tested page at any viewport (body scrollWidth = innerWidth)
- **Viewport meta tag** correctly set to `width=device-width, initial-scale=1` on all pages
- **Layout adaptation:** Navigation collapses appropriately, search bar adapts, footer sections collapse into accordions
- **Form elements:** Text inputs, selects, and buttons span full width on mobile (good)
- **Content reflow:** Product page images/text reflow correctly between viewports
- **Cookie consent dialog** renders correctly at all sizes
- **⚠️ MODO TEST** banner visible on all pages (correct for test environment)

### ⚠️ Improvement Areas
- Touch target heights consistently at 38px (below 44px WCAG AAA and below common 48px Material Design guideline)
- Footer toggle buttons (24×26px) are extremely small targets
- Language select dropdown height (38px) could be increased

---

## Methodology
1. Navigated to each page via MCP browser (Playwright-based, `pwmcp-zonacnc`)
2. Resized viewport to mobile (390×844), tablet (768×1024), desktop (1440×900)
3. Captured full-page screenshots at each viewport
4. Captured accessibility snapshots for structure analysis
5. Ran JavaScript overflow detection (`body.scrollWidth > window.innerWidth`)
6. Checked touch target sizes via `getBoundingClientRect()` against WCAG 44×44px
7. Collected all console errors across the session

---

## Next Steps
1. **Fix `/es/registro` routing** — add URL rewrite or redirect from `/es/registro` to `/?controller=registration`
2. **Add descriptive title** to registration page template
3. **Increase touch target heights** from 38px to 44px+ for mobile form elements (buttons, inputs, selects)
4. **Investigate** `Unexpected token '&'` JS errors in templates
