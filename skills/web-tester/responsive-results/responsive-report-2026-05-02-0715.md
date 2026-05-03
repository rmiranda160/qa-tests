# Responsive QA Report — Search Results Page
**Date:** 2026-05-02 07:15 UTC  
**Focus:** responsive  
**URL:** https://new.zonacnc.com/es/buscar?s=CNC  
**Verdict:** PASS_WITH_NOTES  

## Scenario
Search results page with 3,436 product listings. Tests the product grid/list layout responsiveness, filter sidebar drawer, pagination, breadcrumb, and header/footer across 3 viewports.

## Viewport Results

| Viewport | Resolution | Status | Overflow | Products | Filter |
|----------|-----------|--------|----------|----------|--------|
| Desktop  | 1440×900  | ✅ PASS | No | 14 | Inline sidebar |
| Tablet   | 768×1024 | ✅ PASS | No | 14 | Toggle button |
| Mobile   | 375×812  | ✅ PASS | No | 14 | Slide-in drawer |

## Positive Findings
- ✅ **Filter drawer works on mobile**: Sidebar slides in/out with `.zcnc-sidebar open`/`closed` class toggle
- ✅ **No horizontal overflow** at any breakpoint
- ✅ **All 14 product listings** render correctly at all viewport sizes with proper scaling
- ✅ **Pagination fully visible** and navigable at all sizes
- ✅ **Breadcrumb truncates naturally** on mobile viewport
- ✅ **Chat button** meets WCAG tap target (60×60px)
- ✅ **"Buscar" filter button** (40px) and **"Enviar solicitud"** (44px) are adequate sizes

## WCAG Tap Target Warnings (< 44px)

| ID | Severity | Element | Size | Gap |
|----|----------|---------|------|-----|
| SRC-TAP-01 | 🟡 MEDIUM | "Categorías" nav link | 37px | −7px |
| SRC-TAP-02 | 🟡 MEDIUM | "★ Guardar búsqueda" button | 29px | −15px |
| SRC-TAP-03 | 🟡 MEDIUM | Filter sidebar close "×" button | 19×28px | −25px |
| SRC-TAP-04 | 🟡 MEDIUM | "Mostrar N más" facet buttons (×3) | 34px | −10px |
| SRC-TAP-05 | 🟢 LOW | "Filtros" toggle button | 42px | −2px (borderline) |
| SRC-TAP-06 | 🟢 LOW | Cookie notice buttons | 38px | −6px |
| SRC-TAP-07 | 🟢 LOW | Footer accordion toggles (×5) | 24–26px | −18px |
| SRC-TAP-08 | 🟢 LOW | Footer/breadcrumb text links | 20–24px | −20px |

## Notes
- Same WCAG tap target pattern observed in previous responsive tests (homepage, pricing page). These are systemic to the Hummingbird theme.
- The **filter sidebar close button** (× at 19×28px) is a new finding specific to this page — notably small.
- No layout breakage or functional issues detected.
