# QA Responsive — 2026-05-08

**Timestamp:** 2026-05-08 07:06 UTC
**URL:** https://new.zonacnc.com/
**Viewports tested:** Mobile 390×844, Tablet 768×1024, Desktop 1440×900

## Summary

5 páginas probadas en 3 viewports. 1 finding (leve).

## Pages tested

| Page | Mobile (390×844) | Tablet (768×1024) | Desktop (1440×900) |
|------|:---:|:---:|:---:|
| Homepage `/` | ✅ | ✅ | ✅ |
| Product detail `/centros-de-mecanizado-multifuncion/13203-gildemeister-ctx-510.html` | ⚠️ | — | — |
| Search `/buscar` | ✅ | — | — |
| Login `/iniciar-sesion` | ✅ | — | — |
| Publish `/publicar` | ✅ | — | — |

## Findings

### F1: Product detail page — horizontal overflow 7px at 390px viewport

- **Severity:** Low
- **Page:** `https://new.zonacnc.com/es/centros-de-mecanizado-multifuncion/13203-gildemeister-ctx-510.html`
- **Viewport:** 390×844
- **Observed:** `document.documentElement.scrollWidth = 397px` vs `window.innerWidth = 390px`
- **Overflow element:** `<img>` at right=396.5px, width=98px, left=298.5px (no class/id)
- **Screenshot:** `responsive-product-mobile.png`
- **Root cause:** Product image extends 6.5px beyond the viewport boundary
- **Fix suggestion:** Add `max-width: 100%` and/or `overflow-x: hidden` to the image container

## Console errors (non-blocking)

- `Not signed in with the identity provider.` — Google One Tap expected error (anonymous user)
- No functional JS errors on any tested page
