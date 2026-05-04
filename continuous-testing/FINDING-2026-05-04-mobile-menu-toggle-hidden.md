# Finding: Mobile Hamburger Menu Toggle Invisible on Mobile Viewports

**Date**: 2026-05-04
**Tester**: CRON_QA responsive (v10)
**Severity**: High
**Affected Viewport**: Mobile (390×844 and below)
**WCAG Violation**: 2.1.1 (Keyboard), 2.4.3 (Focus Order), 2.5.5 (Target Size)

## Summary

The hamburger menu toggle button (`button.menu-toggle`, aria-label="Abrir menú móvil") is completely invisible and inaccessible on mobile viewports despite being present in the DOM. The button renders at 0×0 pixels because it is nested inside `.ps-mainmenu--desktop`, which has `display: none` applied on mobile screens (below the `md` Bootstrap breakpoint).

Although a proper offcanvas mobile menu panel (`#mobileMenu` / `.ps-mainmenu--mobile`) exists and renders at full viewport dimensions, the toggle button to open it cannot be seen or touched by mobile users.

## Technical Details

### Element Tree Analysis (mobile viewport 390×844)

| Level | Element | Display | Dimensions | Notes |
|-------|---------|---------|------------|-------|
| 0 | `button.menu-toggle` | flex | 0×0 | OffsetParent = null |
| 1 | `div.ps-mainmenu__mobile-toggle` | flex | 0×0 | All children collapsed |
| 2 | **`div.ps-mainmenu--desktop`** | **none** | **0×0** | **ROOT CAUSE** |
| 3 | `div.header-bottom__row.row` | flex | 374×44 | Parent renders correctly |

### Key Observations

1. **The button exists**: `document.querySelector('button.menu-toggle')` returns the element
2. **Properly configured**: Has `data-bs-target="#mobileMenu"` and `aria-controls="mobileMenu"`
3. **Styling is correct**: `display: flex`, `visibility: visible`, `opacity: 1`
4. **BUT dimension is zero**: `getBoundingClientRect()` returns `{x:0, y:0, width:0, height:0}`
5. **Root cause**: The ancestor `.ps-mainmenu--desktop` has `display: none` (Bootstrap's `d-none` on mobile)

### The Mobile Offcanvas Menu (Correct Part)

A separate `.ps-mainmenu--mobile.offcanvas.offcanvas-start` panel exists at the page root:
- **display**: flex
- **Dimensions**: 390×844 (full viewport)
- **Target**: `#mobileMenu`
- **Content**: Contains proper mobile navigation structure

However, there is **no visible trigger** to open this offcanvas on mobile viewports.

## Proposed Fix

The hamburger toggle button should be moved outside the `.ps-mainmenu--desktop` container, or the responsive CSS should be adjusted so that the toggle is visible on mobile while only the desktop menu items are hidden.

### Options

1. **Option A**: Move `button.menu-toggle` and its wrapper `div.ps-mainmenu__mobile-toggle` outside of `div.ps-mainmenu--desktop` in the HTML structure, placing them at the same level as the desktop nav container.

2. **Option B**: Add a separate mobile-specific hamburger button in the header top section (e.g., next to the search icon in `div.header-block__actions`), targeting the same `#mobileMenu` offcanvas.

3. **Option C**: Change the responsive CSS so that `.ps-mainmenu--desktop` uses `position: absolute; left: -9999px;` on mobile instead of `display: none`, allowing the toggle button to remain rendered and interactive.

## Screenshots

- Mobile home page: `home-mobile-390-v2.png`
- Mobile tornos category: screenshot from earlier CRON run

## Related Issues

- 115 interactive elements on the tornos category page have touch targets smaller than 44×44px (WCAG 2.5.5), indicating widespread small touch area concerns
- No horizontal overflow detected on any tested page at any viewport
- Console errors present but non-blocking (Google FedCM, provider accounts list empty)
