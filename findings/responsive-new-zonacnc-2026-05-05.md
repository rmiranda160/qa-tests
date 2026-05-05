# Responsive Test Report: new.zonacnc.com

**Date:** 2026-05-05 04:52 UTC
**Focus:** Responsive Design
**URL:** https://new.zonacnc.com/
**Tool:** MCP Browser (pwmcp-zonacnc)
**Viewports tested:** Mobile (390×844), Tablet (768×1024), Desktop (1440×900)
**IMAP verified:** ✅ (test7@zonacnc.com, 32 emails)

---

## Result: ❌ FAILED — 1 Critical Issue

---

## ✅ Positives (Passed Checks)

| # | Check | Detail |
|---|-------|--------|
| 1 | Horizontal overflow | No overflow at any viewport (scrollWidth === clientWidth) |
| 2 | Viewport meta | `width=device-width, initial-scale=1` ✅ |
| 3 | Card grid responsive | 1 col (390px) → 2 col (768px) → 5 col (1440px) |
| 4 | Category grid responsive | 1 col → 2 col → 4 col (CSS Grid) |
| 5 | Footer responsive | Full-width stacking on mobile, 2-col on tablet, 4-col on desktop |
| 6 | Desktop nav breakpoint | Shows at ≥1200px via `d-none d-xl-block` |
| 7 | Typography readable | Body 16px, H1 20.8px, H2 20px |
| 8 | No element overflow | Zero elements wider than viewport |
| 9 | Bootstrap responsive | `col-md-6`, `col-lg-3`, flex-wrap correctly applied |
| 10 | All images sized | width/height attributes prevent CLS |

---

## 🔴 Issues Found

### CRITICAL — Issue #1: Hamburger Menu Button Invisible (0×0px)

**Severity:** Critical — Blocks mobile/tablet navigation entirely

**Description:**
The menu toggle button (`button.menu-toggle.btn.btn-link`) with `aria-label="Abrir menú móvil"` has zero visible dimensions at **all tested viewports** (390px, 768px, 1440px). 

- Computed style: `display: flex`, `visibility: visible`, `opacity: 1`
- Actual bounding rect: `{x: 0, y: 0, width: 0, height: 0}`
- The offcanvas menu `#mobileMenu` exists (390×844px) but is unreachable because the toggle button has no clickable area

```css
/* Current state: */
.menu-toggle { display: flex; /* but 0×0 dimensions */ }
.ps-mainmenu__mobile-toggle { display: flex; /* also 0×0 dimensions */ }
```

**Impact:**
- Users on mobile (390px) and tablet (768px) **cannot access the navigation menu**
- Pages like Vendedores, Tarifas, and category navigation are completely inaccessible
- The icon span inside has content (``) and 28.8×28.8px computed size, but the parent button collapses to zero

**Recommendation:**
Ensure the `.menu-toggle` button has explicit dimensions and the `.ps-mainmenu__mobile-toggle` container has proper sizing. The Material Icons hamburger icon should render at a minimum of 44×44px (WCAG touch target).

---

### MODERATE — Issue #2: Small Touch Targets Below WCAG 2.5.5 Minimum (44×44px)

**Severity:** Moderate — Accessibility and usability on mobile

12+ interactive elements fall below the WCAG 2.5.5 minimum touch target size of 44×44px at mobile (390px):

| Element | Size | Text/Label |
|---------|------|------------|
| Carousel prev/next buttons (×6) | 36×36px | (empty) |
| "Cancelar" button | 93×38px | Cancelar |
| "Ver todos los anuncios" link | 173×22px | Ver todos los anuncios → |
| "Ver catálogo" link | 112×30px | Ver catálogo |
| "Crear alerta" link | 107×30px | Crear alerta |
| Language selector | 153×38px | (dropdown) |
| Search inputs (×2) | 261×42px, 251×38px | (placeholder) |

---

### LOW — Issue #3: Console JavaScript Errors

3 JS errors on every page load:
- `Provider's accounts list is empty` — Google Sign-In initialization
- `FedCM get() rejects with NetworkError` — Google Identity Services
- `Unexpected token '&'` — Possible malformed URL parameter

These are non-blocking but indicate integration issues with Google Sign-In.

---

### LOW — Issue #4: Missing Image Placeholders on Cards

Cards without images show "Sin imagen" text but no visual placeholder image. These cards have inconsistent height (379px vs 359px for cards with images), causing visual misalignment in the grid.

---

### LOW — Issue #5: No Responsive Images

- No `<picture>` elements or `srcset` attributes for responsive image delivery
- Only 2 of 3 images use `loading="lazy"` (1 missing)

---

### EMAIL — Issue #6: Template/Translation Issues

Verified via IMAP (test7@zonacnc.com). Found issues in emails:

1. **Invoice add-on email**: Contains untranslated/placeholder text: `"(prorrateado por Stripe)"` instead of the actual prorated amount.
2. **Password reset email**: Subject line has mixed encoding — raw `=?utf-8?Q?` mixed with plain text instead of fully encoded headers.

---

## Viewport Comparison Table

| Metric | Mobile (390×844) | Tablet (768×1024) | Desktop (1440×900) |
|--------|-------------------|--------------------|----------------------|
| Cards per row | 1 | 2 | 5 |
| Card width | 358px | 360px | 269px |
| Category grid cols | 1 | 2 | 4 |
| Footer cols | 1 (stacked) | 2 (col-md-6) | 4 (col-lg-3) |
| Desktop nav visible | No | No | Yes (block) |
| Hamburger button | 0×0px ❌ | 0×0px ❌ | 0×0px ❌ |
| Horizontal overflow | None ✅ | None ✅ | None ✅ |
| H1 font size | 20.8px | — | — |

---

## Summary

- **Critical:** 1 (hamburger menu invisible — blocks mobile navigation)
- **Moderate:** 1 (small touch targets — accessibility)
- **Low:** 3 (console errors, missing placeholders, no responsive images)
- **Email templates:** 2 issues (untranslated placeholder, encoding)

**Overall: ❌ FAILED** due to critical hamburger menu bug making navigation inaccessible on mobile/tablet.
