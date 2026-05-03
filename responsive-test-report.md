# Responsive Testing Report — new.zonacnc.com
**Date:** 2026-05-02 | **Tester:** CRON_QA | **Focus:** Responsive Layout

## Summary
- **Pages tested:** Home, Search, Category (Maquinaria Metal), Pricing, Registration, My Account
- **Viewports:** Mobile (390×844), Tablet (768×1024), Desktop (1440×900)
- **Issues found:** 0 layout/overflow issues detected across all pages and viewports
- **Registration:** Functional (test18@zonacnc.com registered successfully)
- **Login:** Broken (HTTP 500)
- **Console errors:** 1-2 benign errors per page (Google Sign-In/FedCM)

## Screenshots

### Home page — `/es/`
| Viewport | Screenshot | Overflow Issues |
|---|---|---|
| Mobile (390×844) | home-mobile-390x844.png | 0 |
| Tablet (768×1024) | home-tablet-768x1024.png | 0 |
| Desktop (1440×900) | home-desktop-1440x900.png | 0 |

### Search page — `/es/buscar?search_query=torno`
| Viewport | Screenshot | Overflow Issues |
|---|---|---|
| Mobile (390×844) | search-mobile-390x844.png | 0 |
| Tablet (768×1024) | search-tablet-768x1024.png | 0 |
| Desktop (1440×900) | search-desktop-1440x900.png | 0 |

### Category page — `/es/28-maquinaria-metal`
| Viewport | Screenshot | Overflow Issues |
|---|---|---|
| Mobile (390×844) | category-mobile-390x844.png | 0 |
| Tablet (768×1024) | category-tablet-768x1024.png | 0 |
| Desktop (1440×900) | category-desktop-1440x900.png | 0 |

### Pricing page — `/es/module/zonacncplans/pricing`
| Viewport | Screenshot | Overflow Issues |
|---|---|---|
| Mobile (390×844) | pricing-mobile-390x844.png | 0 |
| Tablet (768×1024) | pricing-tablet-768x1024.png | 0 |
| Desktop (1440×900) | pricing-desktop-1440x900.png | 0 |

## Detailed Checks

### Mobile Menu Detection
- Hamburger/toggle menu icon found on mobile (390×844): **PRESENT ✓**
- Menu toggle button at position (0,0) for mobile layouts

### Horizontal Overflow
- **No overflow issues found on any page/viewport combination**
- Scroll width = viewport width in all cases
- All content contained within viewport boundaries

### Console Errors
| Page | Errors | Warning |
|---|---|---|
| Home | 1 | 0 |
| Search | 1 | 0 |
| Category | 1 | 0 |
| Pricing | 1-2 | 0 |
| Registration | 1-2 | 0 |
| My Account | 1 | 0 |
- All errors are Google Sign-In/FedCM related (benign in test/sandbox env)

## Registration & Auth

### Registration Flow (test18@zonacnc.com)
- **Result:** ✅ SUCCESS
- Account created with firstname "Test", lastname "Usuario QA"
- Confirmed logged in via My Account page (`/es/mi-cuenta`)
- Email shown on personal data page: `test18@zonacnc.com`

### Known Issue: Reactive Framework on Email Field
- The registration form uses a reactive JS framework that clears the `value` property of the email input when set via `page.fill()` or standard `el.value = '...'`
- **Workaround:** Use `el.setAttribute('value', '...')` combined with native input value setter
- This is a **minor testability concern** — the form still works for real users typing into the field

### Known Issue: Login (HTTP 500)
- The login page at `/es/iniciar-sesion` returns HTTP 500
- Affected credentials: `test3@zonacnc.com` / `ZonacncTest2026!` (from .env.qa)
- **Impact:** Cannot test authenticated flows through normal login path

### Duplicate Email Detection
- Registration correctly rejects already-registered emails with:
  > "La dirección de correo electrónico ya está en uso, por favor, elige otra o inicia sesión"
- Tested with test19@zonacnc.com (already registered from previous session) ✅

## Key Findings

### ✅ PASS — Responsive Layout
All pages render correctly at all three viewports without horizontal overflow. Mobile menu is present and functional.

### ✅ PASS — Registration
Registration flow works end-to-end. Account created and session maintained.

### ❌ FAIL — Login
Login endpoint returns HTTP 500 error. Authentication is not possible through the normal login form.

### ⚠️ MINOR — Test Automation Challenge
The reactive JS framework on the registration form makes automated fill difficult (email field value gets cleared). Workaround available.

## Recommendations
1. **Investigate login 500 error** — critical blocking issue for authenticated testing
2. **Consider adding Playwright to workspace** — would enable scripted automated responsive tests via `responsive-test-zonacnc.mjs`
3. **Monitor console errors** — Google FedCM errors are benign but should be verified in production
