# Responsive QA — new.zonacnc.com — 2026-05-08 (Run 2)

**Date:** 2026-05-08 08:27 UTC
**Trigger:** CRON QA responsive (focus_area=responsive)
**Scope:** new.zonacnc.com — Homepage only
**Viewports tested:** Mobile (390×844), Tablet (768×1024), Desktop (1440×900)
**Method:** Playwright headless Chromium + visual AI analysis

## Summary

**Result: 9 findings (0 CRITICAL, 3 MEDIUM, 5 LOW, 1 COSMETIC)**

Automated checks passed (no horizontal overflow, viewport meta present, no abnormally tall body). Visual AI analysis revealed layout, truncation, and spacing issues across all viewports.

---

## Finding 1 [MEDIUM]: Broken 5-column grid on Desktop — orphan product card

- **Viewport:** Desktop (1440×900)
- **Section:** "Últimas máquinas publicadas"
- **Observed:** 6 product cards in a 5-column grid layout. The 6th card sits alone in a new row, leaving 4 empty column spaces.
- **Impact:** Visually unbalanced grid. The orphan card looks like a layout bug to end users.
- **Fix:** Use a 3-column or 6-column grid (`grid-template-columns: repeat(3, 1fr)` at desktop) for this section, or ensure the number of displayed cards is a multiple of the column count.

## Finding 2 [MEDIUM]: Cookie consent banner overlaps content on Tablet

- **Viewport:** Tablet (768×1024)
- **Section:** Cookie consent banner
- **Observed:** The cookie notice banner renders in the middle/bottom area of the viewport, directly obscuring product cards and important content.
- **Impact:** Content blocked by the cookie consent popup; users must dismiss before interacting with the page.
- **Fix:** Position the cookie consent banner at the very bottom (`position: fixed; bottom: 0`) or top of the viewport on all viewports. Consider reducing height on tablet.

## Finding 3 [MEDIUM]: Footer lists fully expanded on Mobile and Tablet

- **Viewport:** Mobile (390×844), Tablet (768×1024)
- **Section:** Footer — "Categorías destacadas" and "Marcas líderes"
- **Observed:** Unlike "Marketplace", "Legal" etc. sections that use accordions, "Categorías destacadas" and "Marcas líderes" are fully expanded long lists. This creates excessive scrolling at the bottom of the page.
- **Impact:** Poor UX — users must scroll through dozens of footer links before reaching the page end. On mobile this is particularly fatiguing.
- **Fix:** Convert these sections to accordion-style (same as "Marketplace" / "Legal") so they are collapsed by default.

## Finding 4 [LOW]: Text "Accesorios para maquinaria..." truncated across all viewports

- **Viewport:** All (Mobile, Tablet, Desktop)
- **Section:** "Categorías principales" grid
- **Observed:** Category name "Accesorios para maquinaria..." is truncated with ellipsis on all viewports, including desktop where there is ample horizontal space.
- **Impact:** Users cannot read the full category name. May cause confusion.
- **Fix:** Allow text to wrap to 2 lines on tablet/desktop (`-webkit-line-clamp: 2`), or increase the card width. Ensure truncation only when truly necessary.

## Finding 5 [LOW]: Text "Mandrinadoras" / "Otros..." truncated on Mobile

- **Viewport:** Mobile (390×844)
- **Section:** "Categorías principales" grid
- **Observed:** Category names like "Mandrinadoras" and "Otros..." appear truncated on mobile.
- **Impact:** Minor — most category names are still recognizable. "Mandrinadoras" is cut off mid-word.
- **Fix:** Allow text wrapping or increase card width slightly on mobile.

## Finding 6 [LOW]: Two search bars visible simultaneously on Tablet

- **Viewport:** Tablet (768×1024)
- **Observed:** Both the header-integrated search bar AND the hero section search bar are visible at the same time. This creates visual redundancy.
- **Impact:** Visual clutter. Users may be confused about which search to use.
- **Fix:** Hide the hero search bar at tablet breakpoint (≥768px) when the header search is already visible, or consolidate to a single prominent search bar.

## Finding 7 [LOW]: Excessive whitespace in "Vende tu maquinaria" section on Desktop

- **Viewport:** Desktop (1440×900)
- **Section:** "Vende tu maquinaria" (red/purple gradient CTA)
- **Observed:** The CTA text on the left and statistics on the right are pushed to far edges of the container, making related information feel disconnected.
- **Impact:** Reduced visual cohesion. The wider-than-necessary gap between text and stats weakens the CTA message.
- **Fix:** Add `max-width` to the container or reduce the gap between the left and right sections. Consider centering the content block.

## Finding 8 [LOW]: Hero search input vertically cramped on Mobile

- **Viewport:** Mobile (390×844)
- **Section:** Hero section search input
- **Observed:** The white search input box in the dark blue hero section has tight vertical padding. Placeholder text is very close to top and bottom borders.
- **Impact:** Minor UX issue — input feels cramped and harder to tap accurately.
- **Fix:** Increase `padding-top` and `padding-bottom` on the search input to at least 12px on mobile.

## Finding 9 [COSMETIC]: Navigation bar spacing asymmetry on Desktop

- **Viewport:** Desktop (1440×900)
- **Section:** Top utility bar (black bar)
- **Observed:** "Iniciar sesión" text is very close to the right edge of the viewport, while "Contacte con nosotros" on the left has normal spacing. Lacks symmetry with the main content container width.
- **Impact:** Cosmetic only. No functional issue.
- **Fix:** Add consistent horizontal padding to the utility bar, or constrain its content to the same `max-width` as the main content area.

---

## Automated checks (all passed)

| Check | Mobile | Tablet | Desktop |
|-------|:------:|:------:|:-------:|
| Horizontal overflow (< 5px) | ✅ 0px | ✅ 0px | ✅ 0px |
| Viewport meta tag present | ✅ | ✅ | ✅ |
| Page body height normal | ✅ | ✅ | ✅ |

## Positive observations

- ✅ Button/touch targets meet 44×44px minimum (Buscar, Crear alerta, Empezar gratis)
- ✅ Product images scale correctly without distortion
- ✅ No horizontal scrollbars detected
- ✅ Content reflow from single column → two columns → multi-column grids is handled logically
- ✅ Hamburger menu present on mobile/tablet

## Screenshots

| Viewport | File |
|----------|------|
| Mobile (390×844) | `responsive-mobile-1778229181829.png` |
| Tablet (768×1024) | `responsive-tablet-1778229184628.png` |
| Desktop (1440×900) | `responsive-desktop-1778229187297.png` |

## Previous run comparison

**Prior run (2026-05-08 07:06 UTC):** 1 finding (1 LOW — product detail horizontal overflow)
**This run (2026-05-08 08:27 UTC):** 9 findings (0 HIGH, 3 MEDIUM, 5 LOW, 1 COSMETIC)

Note: This run used full-page homepage visual analysis (AI-assisted). Prior run tested 5 pages with automated checks only. Different methodology explains the increase in findings count — this run is more thorough for the homepage.
