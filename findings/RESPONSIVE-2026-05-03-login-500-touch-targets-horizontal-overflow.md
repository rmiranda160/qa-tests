---
# RESPONSIVE Finding: Login 500 + Touch Targets + Horizontal Overflow

**Date:** 2026-05-03 08:19 UTC  
**Tester:** tester (MCP remote pwmcp-zonacnc)  
**Target:** new.zonacnc.com  
**Focus:** responsive  
**Duration:** ~10 min  
**Escenario:** 1/1

## Pages Tested

| Page | Status | Notes |
|------|--------|-------|
| Home (`/es/`) | ✅ Carga OK | Mobile/Tablet/Desktop |
| Registration (`/?controller=registration`) | ✅ Carga OK | Mobile (390px) |
| Category (Tornos `/es/15-tornos`) | ✅ Carga OK | Mobile (390px) |
| Product Detail (`/.../12934-gildemeister-ctx-510.html`) | ✅ Carga OK | Mobile (390px) |
| Login (`/es/iniciar-sesion`) | ❌ **HTTP 500** | Día 7+ consecutivo |
| My Account (`/es/mi-cuenta`) | ❌ **HTTP 500** | Día 7+ consecutivo |

## Viewports Tested

| Viewport | Size | Result |
|----------|------|--------|
| Mobile | 390×844 | ❌ Issues found |
| Tablet | 768×1024 | ✅ Clean |
| Desktop | 1280×800 | ✅ Clean |

---

## Critical Issues Found

### 1. Login Page HTTP 500 (PERSISTENTE — Día 7+)

- **URL:** `https://new.zonacnc.com/es/iniciar-sesion`
- **Error:** `net::ERR_HTTP_RESPONSE_CODE_FAILURE` (Server 500)
- **Also affected:** `/es/mi-cuenta` returns same error
- **Impact:** Total block on user authentication flow (login, account access)
- **Blocking:** Registration is possible but all test emails (test7-test30@zonacnc.com) are already in use; without login, no logged-in flows can be tested

### 2. Horizontal Overflow on Product Detail Page (Mobile)

- **URL:** Product detail page at 390px viewport
- **Document width:** 511px vs **viewport width:** 390px (121px overflow!)
- **Causes:** Elements extend beyond the viewport, requiring horizontal scrolling
- **Impact:** Poor mobile UX; users must scroll horizontally to see content

### 3. Small Touch Targets on Mobile (All Pages)

- **Homepage (390px):** 50 elements with dimensions < 44×44px
  - "Categorías" link: 61×37px (height < 44px)
  - "Cerrar" button: 40×40px (both dimensions < 44px)
  - "Contacte con nosotros": 172×20px (height < 44px)
  - Navigation links: ~37px height consistently
- **Category page (390px):** 108 small touch targets
- **Product page (390px):**
  - "Contacte con nosotros" header link: 172×24px
  - "Contacte con nosotros" footer link: 172×20px
  - "Contactar para ver máquina": 106×18px
- **WCAG violation:** Success Criterion 2.5.5 (Target Size) — minimum 44×44px

### 4. Small Font Sizes on Mobile

- **Homepage (390px):** 26 elements with font-size < 12px
- Navigation items using icon font characters (▸) at 11.2px
- **Readability concern:** Affects navigation and secondary UI elements

### 5. Password Strength Validator UI Bug

- **Page:** Registration form
- **Issue:** Password strength meter clears the field value when the score is below "Fuerte" (Strong) requirement
  - Passwords like `QATest8_2026!StrongP@ssword#1` (26 chars, mixed case + numbers + special) were rejected
  - Field is silently cleared when validation fails
  - No clear guidance on what constitutes "Fuerte" (minimum length, character requirements)
- **Impact:** User confusion; password is typed but silently deleted

### 6. QA Email Pool Exhausted

- All test7-test30@zonacnc.com emails are already registered
- No fresh emails available for new account creation
- `.env.qa.email` needs expansion beyond test30

---

## Recommendations

1. **Fix login 500 error** — Highest priority, blocks all authenticated flows (Day 7+)
2. **Fix horizontal overflow** on product detail pages at mobile widths
3. **Increase touch target sizes** to minimum 44×44px on mobile for interactive elements
4. **Increase base font size** on mobile to minimum 12px (WCAG AA recommendation: 16px for body text)
5. **Fix password strength UI** — don't silently clear field; provide clear requirements; or show incremental feedback
6. **Refresh QA email pool** with test31+@zonacnc.com
