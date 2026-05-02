# Responsive Test Report — new.zonacnc.com

**Date:** 2026-05-02 (20:55 UTC)  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**User:** test26@zonacnc.com  
**Scope:** Homepage ESPAÑA — mobile, tablet, desktop  
**Scenario:** CRON_QA responsive testing

---

## Summary

| Metric | Result |
|--------|--------|
| Pages tested | 4 (Home, Search, Category, Pricing) |
| Viewports tested | 3 (390×844, 768×1024, 1280×800) |
| Element overflow issues | **1** — `.zcnc-hero` content clipped on all viewports |
| Text overflow (real) | **2** — Vendor name ellipsis on mobile; sidebar category truncation |
| HTTP 500 error | **1** — Login page `/es/iniciar-sesion` still returns 500 |
| Console errors | None blocking |
| Registration | ✅ test26@zonacnc.com registered & logged in successfully |

---

## Test Matrix

### Mobile (390×844)

| Page | URL | Overflow | Notes |
|------|-----|----------|-------|
| Home | `/es/` | ⚠️ `.zcnc-hero` scrollWidth 468 > 390 (diff 78px, hidden) | Sidebar categories truncated with ellipsis |
| Search | `/es/buscar?search_query=torno` | ✅ Clean | Vendor name "VELETA COMERCIALIZACION Y SERVICIOS SLU" truncated (ellipsis, scrollWidth 272 > 160) |
| Category | `/es/15-tornos` | ✅ Clean | No structural overflow |
| Pricing | `/es/pricing` | ✅ Clean | Clean mobile layout |

### Tablet (768×1024)

| Page | URL | Overflow | Notes |
|------|-----|----------|-------|
| Home | `/es/` | ⚠️ `.zcnc-hero` scrollWidth 922 > 768 (diff 154px, hidden) | |
| Search | `/es/buscar` | ✅ Clean | |
| Category | `/es/15-tornos` | ⚠️ Product descriptions clipped in grid cells | P elements overflow with hidden |
| Pricing | `/es/pricing` | ✅ Clean | |

### Desktop (1280×800)

| Page | URL | Overflow | Notes |
|------|-----|----------|-------|
| Home | `/es/` | ⚠️ `.zcnc-hero` scrollWidth 1536 > 1280 (diff 256px, hidden) | Sidebar category names truncated (ellipsis) |
| Search | `/es/buscar` | ✅ Clean | |
| Category | `/es/15-tornos` | ✅ Clean | |
| Pricing | `/es/pricing` | ✅ Clean | |

---

## Bugs Found

### BUG-001 (REOPENED): Login page returns HTTP 500
- **URL:** `https://new.zonacnc.com/es/iniciar-sesion`
- **Severity:** **Critical** — blocks all login/authentication via normal flow
- **Impact:** Users cannot log in through the standard login page. Registration works via `/es/?controller=registration`.
- **Status:** Still broken since previous report (2026-05-02). Needs investigation.

### BUG-002: `.zcnc-hero` element overflow (all viewports)
- **Severity:** Low (overflow:hidden, visual clipping only)
- **Impact:** Hero section background/decoration content is clipped on all breakpoints. Functional content is still visible.
- **Detail:** `.zcnc-hero` scrollWidth exceeds clientWidth by 78px (mobile), 154px (tablet), 256px (desktop).

### BUG-003: Vendor name truncation on mobile search
- **Severity:** Low (text-overflow:ellipsis applied)
- **Impact:** Long vendor names like "VELETA COMERCIALIZACION Y SERVICIOS SLU" are truncated to ~160px on mobile. Users see partial name.

### BUG-004: Sidebar category names truncated on mobile/desktop
- **Severity:** Low (text-overflow:ellipsis applied)
- **Impact:** "Accesorios para maquinaria metal" truncated at ~165px (desktop) / ~220px (mobile).

---

## Responsiveness Observations

### Header / Navigation
- **Mobile (390px):** Hamburger menu replaces full nav. Search bar visible. Clean responsive behavior.
- **Tablet (768px):** Full top bar visible with contact, sellers, pricing, language selector, user dropdown.
- **Desktop (1280px):** Full horizontal navigation.

### Footer
- All viewports: Full multi-column layout always shown. On mobile, very long scroll with 50+ links.
- **Recommendation:** Consider collapsible/accordion sections on mobile for better UX.

### Product Cards
- **Mobile:** Single-column vertical stack. Clean.
- **Tablet:** 2-column grid. Some product descriptions show text clipping.
- **Desktop:** Multiple columns, no overflow issues.

### Search Page
- **Mobile:** Full-width single column. Vendor name overflow handled with ellipsis.
- **Tablet/Desktop:** Left sidebar visible with filters.

### Pricing Page
- Clean responsive layout across all viewports. Plan cards stack vertically on mobile.

---

## Recommendations

1. **Fix login page 500 error (BUG-001):** Most critical issue. The `/es/iniciar-sesion` route needs investigation.
2. **Review `.zcnc-hero` overflow (BUG-002):** Ensure decorative background content doesn't overflow and get hidden.
3. **Consider truncation improvements (BUG-003, BUG-004):** Use responsive max-width or multi-line clamping for long vendor names and sidebar categories.
4. **Implement mobile footer accordion:** 50+ links in a flat list is too long for mobile.
5. **No critical responsive breakage found** — layout behaves well across all viewports.
