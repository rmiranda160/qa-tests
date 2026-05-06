# Responsive Testing Report — new.zonacnc.com

**Date:** 2026-05-06 13:07 UTC
**Tool:** MCP Browser (pwmcp-zonacnc) + Playwright
**Scope:** new.zonacnc.com only (strict)

---

## Methodology

Tested 4 page types at 3 standard breakpoints:
| Breakpoint | Width x Height | Media Query |
|-----------|----------------|-------------|
| Mobile | 375 x 812 px | (max-width: 767px) |
| Tablet | 768 x 1024 px | (min-width: 768px) and (max-width: 1023px) |
| Desktop | 1920 x 1080 px | (min-width: 1024px) |

---

## Pages Tested

| # | Page | URL | Status |
|---|------|-----|--------|
| 1 | Homepage | https://new.zonacnc.com/es/ | ✅ OK |
| 2 | Category Listing | https://new.zonacnc.com/es/32-plegadoras | ✅ OK |
| 3 | Product Detail | https://new.zonacnc.com/es/centros-de-mecanizado-verticales/13133-doosan-dnm-5700-cnc-vertical-machining-center-2019.html | ✅ OK |
| 4 | Search | https://new.zonacnc.com/es/buscar | ✅ OK |

---

## Key Metrics Per Breakpoint

### Mobile (375px)

| Metric | Value | Status |
|--------|-------|--------|
| Horizontal overflow | None | ✅ PASS |
| Viewport meta | width=device-width, initial-scale=1 | ✅ PASS |
| Header height | 97px | ✅ Compact |
| Header-top visibility | Hidden (d-none) | ✅ Expected |
| Listing card width | 351px (single column) | ✅ Full width |
| Specs table width | 309px (fits 375px) | ✅ No overflow |
| Body font size | 16px | ✅ Readable |
| Touch targets < 44px | 5+ elements | 🟡 Warning |

### Tablet (768px)

| Metric | Value | Status |
|--------|-------|--------|
| Horizontal overflow | None | ✅ PASS |
| Header height | 116px | ✅ OK |
| Header-top visibility | Visible (d-md-block) | ✅ Expected |
| Listing card width | 440px | ✅ OK |
| Filters width | 200-300px | ✅ Sidebar |
| Product image (placeholder) | 696px display / 253px native | 🟡 Upscaled |

### Desktop (1920px)

| Metric | Value | Status |
|--------|-------|--------|
| Horizontal overflow | None | ✅ PASS |
| Header height | 116px | ✅ OK |
| Full header visible | Yes | ✅ OK |
| Listing layout | Flex layout | ✅ OK |
| Product image | 713px display / 960px native | ✅ Good |

---

## Findings

### ✅ PASS Items

1. **No horizontal scroll** at any breakpoint on any page — document width = viewport width everywhere
2. **Correct viewport meta tag**: `width=device-width, initial-scale=1`
3. **Bootstrap responsive utilities working**: `.d-none.d-md-block` correctly hides/shows header-top
4. **Responsive header**: 97px mobile vs 116px desktop — compact on small screens
5. **Single-column listing on mobile**: Product cards use full 351px width
6. **No table overflow**: Specs table (zcnc-data-table) fits without horizontal scroll
7. **All product images load** — no broken images detected
8. **No text overflow**: No words > 50 chars causing layout breaks
9. **Offcanvas mobile menu present**: `.ps-mainmenu--mobile.offcanvas` exists for mobile navigation

### 🟡 Minor Issues

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | **Touch targets too small** | Minor | Multiple links/buttons below WCAG-recommended 44×44px. E.g., "Vendedores" (28×24px), "Tarifas" (28×24px), flag icons (20×13px). Affects mobile usability. |
| 2 | **Placeholder image upscaling** | Minor | Default product image (123×123px) displayed at 351px (2.85×) on mobile and 696px (5.66×) on tablet. Products without real images appear blurry. |
| 3 | **Console JS warning** | Minor | "Unexpected token '&'" — likely malformed URL parameter in a script tag. Non-functional impact. |
| 4 | **GSI errors** | Info | Google Sign-In "Not signed in with identity provider" — expected when not authenticated. Non-blocking. |
| 5 | **Mobile menu toggle hidden** | Info | `.menu-toggle` button (aria-label="Abrir menú móvil") exists in DOM but parent `.ps-mainmenu--desktop` has `display:none` on mobile. Mobile nav uses `.zcnc-cat-btn` instead. Legacy code artifact. |

---

## Summary

### Overall Responsive Verdict: **PASS** ✅

`new.zonacnc.com` adapts correctly across all tested breakpoints:
- No horizontal overflow
- Proper column/width adjustments via Bootstrap classes
- Header adapts height and visibility appropriately
- Offcanvas mobile menu present
- No critical JS or CSS errors

### Recommendations

1. **Touch targets**: Increase tap targets to ≥44px on mobile (WCAG 2.5.5) — especially top-nav links and flag icons
2. **Placeholder images**: Use higher-resolution default product images (≥500px) to avoid upscaling blur on product detail pages
3. **Clean up dead code**: Remove hidden `.menu-toggle` button inside `.ps-mainmenu--desktop` or consolidate mobile menu triggers
4. **Fix JS parsing error**: Investigate "Unexpected token '&'" in console

---

**Test duration:** ~10 minutes
**QA email:** test7-test30@zonacnc.com
**Scope adherence:** Only new.zonacnc.com tested ✅
