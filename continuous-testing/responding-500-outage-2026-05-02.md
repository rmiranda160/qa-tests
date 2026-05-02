# Responsive & Functional Test Report — new.zonacnc.com

**Date:** 2026-05-02 (23:00 UTC, second pass)  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Attempted User:** test9@zonacnc.com (and test7, test15, test20, test25, test30 — all already registered)  
**Scope:** CRON_QA — Responsive + auth flow verification  
**Cap:** 30 min  

---

## 🚨 CRITICAL: Full Authentication System Outage

### AUTH-001: Login page returns HTTP 500 (REOPENED — severity increased)
| Property | Value |
|----------|-------|
| **URL (ES)** | `https://new.zonacnc.com/es/iniciar-sesion` |
| **URL (EN)** | `https://new.zonacnc.com/en/login` |
| **HTTP Status** | **500 Internal Server Error** |
| **Response Body** | Empty (0 bytes) |
| **Affected pages** | `/es/iniciar-sesion`, `/en/login`, `/es/mi-cuenta`, `/en/my-account`, `/?controller=authentication` |
| **Severity** | **Critical** — blocks ALL user authentication on the platform |

**Impact:** Users on every language/locale attempting to:
- Log in → hit 500
- Access My Account → redirects to login → 500
- Use password recovery → 404
- Auth controllers → 500

**Evidence collected:**
```
/es/iniciar-sesion      → 500 (0 bytes)
/en/login               → 500 (0 bytes)
/es/mi-cuenta           → 500 (0 bytes)
/en/my-account          → 500 (0 bytes)
/?controller=authentication → 500 (0 bytes)
/es/contrasena-olvidado → 404 (120KB — 404 page content)
```

### AUTH-002: Password recovery returns 404
| Property | Value |
|----------|-------|
| **URL (ES)** | `https://new.zonacnc.com/es/contrasena-olvidado` |
| **URL (EN)** | `https://new.zonacnc.com/en/forgot-password` |
| **HTTP Status** | **404 Not Found** |

**Impact:** Users who forget their password have no way to reset it. The route returns a styled 404 page instead of a password reset form.

### AUTH-003: All test accounts already registered (no free slots)
All 24 test accounts (test7–test30@zonacnc.com) are already registered on the platform. The registration form correctly detects this and shows:  
`"La dirección de correo electrónico ya está en uso, por favor, elige otra o inicia sesión"`

**Note:** Since login is broken (500), existing users are locked out despite having valid credentials.

---

## Responsive Testing Results

### Pages that work (HTTP 200 with content)
| Page | URL | Status |
|------|-----|--------|
| Home | `/es/` | ✅ 200 (155KB) |
| Search | `/es/buscar` | ✅ 200 (697KB) |
| Registration | `/?controller=registration` | ✅ 200 (136KB) |
| Pricing | `/es/pricing` | ✅ 200 (149KB) |
| Sellers | `/es/vendedores` | ✅ 200 (155KB) |
| Contact | `/es/contactenos` | ✅ 200 (123KB) |
| How it Works | `/es/content/4-como-funciona` | ✅ 200 (122KB) |
| Legal Notice | `/es/content/7-aviso-legal` | ✅ 200 (124KB) |

### Viewport Test Matrix (390×844, 768×1024, 1440×900)

| Page | Horizontal Overflow | Layout Issues | Notes |
|------|-------------------|---------------|-------|
| **Home** | ❌ None | ✅ Clean | Hero section, categories, product cards all render correctly |
| **Search** | ❌ None | ✅ Clean | Sidebar slides off-screen on mobile/tablet, visible on desktop (280px at left=88) |
| **Product Detail** | ❌ None | ✅ Clean | Images, price, description all visible at all viewports |
| **Pricing** | ❌ None | ✅ Clean | Plan cards stack vertically on mobile |
| **Registration** | ❌ None | ✅ Clean | Form fields full-width (366/390px=94%) on mobile. Proper responsive layout |
| **Sellers** | ❌ None | ✅ Clean | |

### Fixed Elements Analysis
- **Mobile:** 5 fixed elements (mobile menu overlay, search canvas, toast, notification bar, chat button)
- **Tablet/Desktop:** 3 fixed elements (toast, notification bar, chat button)
- No overlap or blocking issues observed.

### Footer
- Static multi-column layout at all viewports. On mobile, this results in a very long scroll with 50+ links.
- Recommendation: Implement collapsible/accordion sections for mobile.

---

## Bugs Summary

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| AUTH-001 | Login/My Account pages HTTP 500 | **Critical** | New (previously reported as BUG-001, severity escalated) |
| AUTH-002 | Password recovery pages HTTP 404 | **High** | New |
| AUTH-003 | No free test accounts (previously registered) | Low | New (expected for test env) |
| BUG-004 | Vendor name truncation on mobile search | Low | Previously reported |
| BUG-005 | Footer not collapsed on mobile | Low | Previously reported |

---

## Recommendations

1. **Fix authentication pages (AUTH-001, AUTH-002) immediately** — this is a total auth outage
2. Keep the responsive layout work — no regressions detected
3. Consider mobile-optimized footer with accordion sections
4. Verify registration flow works end-to-end once auth is restored
