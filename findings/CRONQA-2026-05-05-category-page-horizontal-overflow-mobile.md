# Finding: Horizontal Overflow in Category Listing Page at Mobile (390px)

**Date**: 2026-05-05 06:53 UTC  
**CRON Run**: tester-responsive focus_area=responsive  
**Environment**: new.zonacnc.com (TEST mode)  
**Severity**: Medium  
**Category**: Responsive / CSS  

## Summary

The category listing page (`/es/8-centros-de-mecanizado` and similar category pages) exhibits horizontal overflow at mobile viewport (390px width). The `zcnc-row-*` CSS classes produce elements that are 486px wide with a 25px left offset, totaling 511px → exceeding the 390px viewport by 121px.

## Technical Details

### Affected URL
`https://new.zonacnc.com/es/8-centros-de-mecanizado` (and likely all category listing pages)

### Viewport
- **Width**: 390px (iPhone 14 Pro)
- **Height**: 844px

### Overflowing Elements
All have `left: 25px` and `width: 486px` (total: 511px):

| Element | CSS Class | Width | Left |
|---------|-----------|-------|------|
| DIV | `zcnc-row-info` | 486px | 25px |
| DIV | `zcnc-row-top` | 486px | 25px |
| H2 | `zcnc-row-title` | 486px | 25px |
| DIV | `zcnc-row-location` | 486px | 25px |
| DIV | `zcnc-row-specs` | 486px | 25px |
| P | `zcnc-row-desc` | 486px | 25px |

### Not Affected
- **Tablet (768px)**: No overflow (document width = viewport width)
- **Desktop (1440px)**: No overflow
- **Search results page** (`/es/buscar`): No overflow at any breakpoint
- **All other tested pages**: No overflow at any breakpoint

## Reproduction Steps
1. Open `https://new.zonacnc.com/es/8-centros-de-mecanizado`
2. Resize browser to 390px width (mobile)
3. Observe horizontal scrollbar and content extending beyond viewport

## Expected Behavior
Category listing product rows should scale to fit the 390px mobile viewport with proper padding/margins, without horizontal overflow.

## Screenshot
See: `responsive-mobile-category.png` (taken during test)

## Comprehensive Responsive Test Results

| # | Page | Desktop (1440) | Tablet (768) | Mobile (390) |
|---|------|:-:|:-:|:-:|
| 1 | Homepage `/es/` | ✅ | ✅ | ✅ |
| 2 | Search `/es/buscar` | — | — | ✅ |
| 3 | Product Detail | — | ✅ | ✅ |
| 4 | Contact `/es/contactenos` | — | — | ✅ |
| 5 | Login `/es/iniciar-sesion` | — | — | ✅ |
| 6 | Publish `/es/publicar` | — | — | ✅ |
| 7 | Category `/es/8-centros-de-mecanizado` | — | ✅ | 🔴 OVERFLOW (121px) |
| 8 | 404 `/es/registro` | — | — | ✅ |

### Other Observations
- All pages had 2-3 benign console errors (Google FedCM / identity provider), not page-critical
- Google Maps iframe on product detail properly sized (333px < 390px viewport)
- Footer accordion toggles work correctly at mobile
- Cookie notice, language selector, and header icons respond correctly
- 404 page is properly responsive
- Breadcrumbs wrap correctly on all pages
- Contact form, login form, and publish form stack vertically at mobile without overflow
