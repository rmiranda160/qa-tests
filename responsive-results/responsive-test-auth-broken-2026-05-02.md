# Responsive QA Report — new.zonacnc.com
**Date:** 2026-05-02 22:23 UTC  
**Focus:** Responsive  
**Browser:** Chromium (MCP remote pwmcp-zonacnc)  
**Status:** ❌ FAIL — Critical auth issue blocks registration

---

## 🔴 CRITICAL: Login Page Returns HTTP 500

| Test | Result | Details |
|------|--------|---------|
| `/es/iniciar-sesion` | ❌ 500 Internal Server Error | Login page completely broken |
| `/es/registro` | ❌ 404 Not Found | Registration path missing |
| `/es/register` | ❌ 404 Not Found | Registration path missing |
| `/es/crear-cuenta` | ❌ 404 Not Found | Registration path missing |
| `/es/mi-cuenta` | ❌ HTTP error | Auth-protected page fails |

**Impact:** The entire user authentication flow is broken. New users cannot register, existing users cannot log in. This blocks:
- Account creation (registration)
- Publishing machine listings ("Vender máquina" / "Empezar gratis")
- Access to protected pages
- User session management

**Console errors observed:**
- `Provider's accounts list is empty.` (homepage)
- `Not signed in with the identity provider.` (when visiting broken auth pages)

---

## 📱 Responsive Testing Results

### Viewport: Mobile (390×844)

| Test | Result | Notes |
|------|--------|-------|
| Horizontal overflow | ✅ Pass | docWidth = 390 = viewportWidth |
| Header-top hidden | ✅ Pass | `d-none d-md-block` → `display: none` |
| Mobile search bar visible | ✅ Pass | `ps-searchbar--mobile` → `display: flex` |
| Sidebar slide-out | ✅ Pass | `position: fixed; left: -320px` (off-screen until triggered) |
| Touch targets < 44px | ⚠️ 16 small targets | Some links/buttons may be hard to tap |
| Footer accordion | ✅ Pass | 5 collapsible sections available |
| Machine cards width | ✅ Pass | Full-width cards at ~334-366px |
| Pricing page | ✅ Pass | Cards at 334px, no overflow |

### Viewport: Tablet (768×1024)

| Test | Result | Notes |
|------|--------|-------|
| Horizontal overflow | ✅ Pass | docWidth = 768 = viewportWidth |
| Header-top visible | ✅ Pass | `display: block` |
| Mobile search hidden | ✅ Pass | `display: none` |
| Desktop nav hidden | ✅ Pass | `d-xl-block` → `display: none` at 768px |
| Login button 40px | ⚠️ Borderline | 40px height vs recommended 44px min |
| Sidebar visible inline | ✅ Pass | Static sidebar shown inline |

### Viewport: Desktop (1440×900)

| Test | Result | Notes |
|------|--------|-------|
| Horizontal overflow | ✅ Pass | |
| Header-top visible | ✅ Pass | Full top navigation bar shown |
| Categories mega menu | ✅ Pass | Full desktop navigation |
| Search bar | ✅ Pass | Full inline search |

---

## ⚠️ Secondary Findings

1. **Small touch targets on mobile (16 on homepage, 27 on search page)** — Several interactive elements are below the 44×44px WCAG minimum for touch targets. This affects mobile usability.

2. **Inconsistent product card widths on Tornos page** — At 390px viewport, cards display at varying widths (138px, 234px) which may indicate a grid layout issue with leftover space or uneven card sizing.

3. **Console errors** — Two console errors detected:
   - `Provider's accounts list is empty.` — Possibly missing provider configuration
   - `Not signed in with the identity provider.` — Identity provider issue when auth pages fail

---

## Summary

**The login page (`/es/iniciar-sesion`) returns HTTP 500, making it impossible to register or authenticate.** This is a P0 (critical) issue that blocks the entire user flow. Without fixing the login page, no responsive testing of authenticated pages is possible.

The responsive layout itself appears well-implemented with proper Bootstrap breakpoint classes, slide-out mobile sidebar, and no horizontal overflow at tested viewports. Minor touch target issues exist but are secondary to the critical auth failure.
