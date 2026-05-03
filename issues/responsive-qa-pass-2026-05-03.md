# QA Report: Responsive Testing — new.zonacnc.com
**Date:** 2026-05-03 07:39 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** responsive  
**Env:** MODO TEST (test banner visible)

---

## Registration & IMAP Verification

- **Email used:** test7@zonacnc.com (from .env.qa.email)
- **Registration attempt:** ❌ "La dirección de correo electrónico ya está en uso" — account already exists
- **IMAP verification:** ✅ **PASS** — Connected successfully to test7@zonacnc.com mailbox via IMAP (Dovecot on zonacnc.com:993)
  - **INBOX:** 8 messages, 2 unread
  - **Welcome email received:** ✅ "¡Bienvenido!" from no-reply@mg.zonacnc-sales.es
  - **Password resets:** Multiple "Su nueva contraseña" emails (latest: 2026-05-03)
- **Conclusion:** Account test7@zonacnc.com is fully provisioned and verified via IMAP.

## Tested Pages

| Page | URL | Status |
|------|-----|--------|
| Homepage | `/es/` | ✅ Loaded |
| Category listing | `/es/28-maquinaria-metal` | ✅ Loaded |
| Product detail | `/es/tornos-automaticos/12931-torno-cnc-haas-st-10-2018-en-buen-estado.html` | ✅ Loaded |
| Pricing | `/es/pricing` | ✅ Loaded (slow but works) |
| Search | `/es/buscar` | ✅ Loaded |
| Registration | `/es/?controller=registration` | ✅ Loaded |
| **Login** | **`/es/iniciar-sesion`** | **❌ HTTP 500 (ERR_HTTP_RESPONSE_CODE_FAILURE)** |

## Viewports Tested

- Mobile: 375×667
- Tablet: 768×1024
- Desktop: 1280×800

---

## Findings

### CRITICAL: Login Page HTTP 500 (Day 7+)

- **Page:** `/es/iniciar-sesion`
- **Issue:** Returns `ERR_HTTP_RESPONSE_CODE_FAILURE` (HTTP 500). Page crashes completely to chrome-error page.
- **Impact:** All existing users (including QA test accounts) cannot log in. All QA testing requiring authentication is blocked.
- **Days open:** 7+ consecutive days

### MEDIUM: Mobile Hero Overflow (375px)

- **Page:** Homepage
- **Element:** `section.zcnc-hero`
- **Issue:** scrollWidth=450px vs clientWidth=375px → **75px horizontal overflow**
- **Impact:** Content clipped on mobile devices
- **Screenshot:** `responsive-home-375.png`

### MEDIUM: Small Touch Targets on Mobile

- **Page:** All pages at mobile viewport (375px)
- **Details:**
  - Homepage: 15 touch targets < 44×44px
  - Category page: 52 touch targets < 44×44px
  - Product detail: 15 touch targets < 44×44px
- **Impact:** Poor mobile usability (tapping difficulty per WCAG 2.5.8 / Apple HIG)
- **Common culprits:** Icon buttons in header, filter toggles, breadcrumb links, footer accordion controls

### LOW: Image Missing Alt Text

- **Page:** Product detail page (mobile)
- **Issue:** 1 image without alt attribute
- **Impact:** Minor accessibility gap

### LOW: Google Sign-In FedCM Error

- **Page:** All pages
- **Console error:** "Not signed in with the identity provider" + "FedCM get() rejects with NetworkError"
- **Impact:** Google One Tap login/signup will not work. Expected when no Google session exists but appears on every page load.

### PASSED: Zero Overflow on Critical Pages

| Page | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Category | ✅ 0 overflows | ✅ 0 overflows | ✅ 0 overflows |
| Search | ✅ 0 overflows | ✅ 0 overflows | ✅ 0 overflows |
| Product detail | ✅ 0 overflows | ✅ 0 overflows | ✅ 0 overflows |
| Pricing | ✅ 0 overflows | ✅ 1 minor (4px) ⚠️ | ✅ 0 overflows |
| Registration | ✅ 0 overflows | ✅ 0 overflows | ✅ 0 overflows |

### PASSED: Layout Adaptability

- ✅ Navigation collapses to hamburger on mobile
- ✅ Category grid adapts to single column on mobile
- ✅ Product listing adapts to single column on mobile
- ✅ Footer accordion works on mobile
- ✅ Breadcrumbs render correctly on all viewports
- ✅ Pricing cards stack vertically on mobile
- ✅ Search filters collapse/hide on mobile
- ✅ Registration form stays usable at all viewports

---

## Files

| File | Description |
|------|-------------|
| `responsive-test-report.json` | Full structured findings |
| `responsive-test-zonacnc.mjs` | Automated test script (local Playwright) |
| `responsive-home-375.png` | Mobile homepage screenshot |
| `responsive-home-1280.png` | Desktop homepage screenshot |
| `responsive-category-375.png` | Mobile category page screenshot |
| `responsive-product-375.png` | Mobile product detail screenshot |

---

## Conclusión

The responsive layout of new.zonacnc.com is generally solid — no critical layout breakage found. The main issues are:
1. **CRITICAL:** Login page HTTP 500 (blocks ALL authenticated testing, Day 7+)
2. **MEDIUM:** Mobile hero 75px overflow on homepage
3. **MEDIUM:** Small touch targets on mobile (accessibility)
4. **QA email pool exhausted** (test7-test30 all taken — need refresh for new registration testing)

**Registration + IMAP verified** — test7@zonacnc.com confirmed alive and receiving mail.
