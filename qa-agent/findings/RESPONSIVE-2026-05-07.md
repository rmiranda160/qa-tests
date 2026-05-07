# Responsive QA — new.zonacnc.com — 2026-05-07

**Date:** 2026-05-07 14:11 UTC
**Trigger:** CRON QA responsive (focus_area=responsive)
**Scope:** new.zonacnc.com — Homepage + product detail + login + search
**Viewports tested:** Mobile (390×844), Tablet (768×1024), Desktop (1440×900)

## Summary

**Result: 3 findings (1 HIGH, 2 MEDIUM)**

No body-level horizontal scroll detected on any viewport. However, three specific overflow/target-size issues were identified.

---

## Finding 1 [HIGH]: `.zcnc-hero` section overflows without responsive adaptation

- **Viewports affected:** Mobile (468px vs 390px — 78px overflow), Tablet (922px vs 768px — 154px overflow)
- **Desktop:** Clean (fits 1440px)
- **Impact:** Hero section content is rendered wider than the viewport and clipped via `overflow: hidden`. Content at the right edge is invisible to mobile/tablet users. If the section contains CTAs or key messaging, they may be cut off.
- **Root cause:** The `.zcnc-hero` element appears to have fixed/min-width styling that doesn't adapt below ~468px. Likely using non-responsive absolute widths or lacking `max-width: 100%` on child elements.
- **Fix direction:** Review CSS for `.zcnc-hero` and its children. Ensure all child elements use `max-width: 100%`, flex-wrap, or percentage-based widths. Consider using `box-sizing: border-box` throughout.

## Finding 2 [MEDIUM]: Several interactive elements below 44×44px minimum tap target

- **Viewport:** Mobile (390×844)
- **Elements affected:**
  - `navbar-brand` (logo link): 128×28px — height 36% below minimum
  - "Cancelar" button (`.btn-link`): 93×38px
  - "Crear alerta" CTA (`.zcnc-banner-strip__cta`): 107×30px
  - "Ver catálogo" CTA (`.zcnc-banner-strip__cta`): 112×30px
  - "Ver todas las categorías" button: 214×42px (borderline)
  - Newsletter submit button: 107×38px
  - Footer expand/collapse toggles (`.stretched-link`): 24×26px
  - Footer links under categories/brands: 20px height
- **Impact:** Users on touch devices may have difficulty accurately tapping these targets, particularly the 30px-height CTAs and 20px-height footer links. WCAG 2.1 Success Criterion 2.5.5 (Target Size) recommends 44×44px.
- **Fix direction:** Add `min-height: 44px` and `min-width: 44px` to interactive elements, or increase padding. For inline links in the footer, ensure sufficient line-height and padding.

## Finding 3 [MEDIUM]: Font sizes below 12px on mobile

- **Font sizes detected:** 11px, 11.2px
- **Impact:** Text at these sizes may be difficult to read on mobile devices, especially for users with visual impairments. Apple's Human Interface Guidelines and Google's Material Design both recommend minimum 12px for body text.
- **Fix direction:** Audit elements using font-size below 12px. Increase to at least 12px (0.75rem) for mobile viewports. Use CSS media queries or clamp() for fluid typography.

---

## Pages tested (all passed body-scroll check)

| Page | Mobile (390) | Tablet (768) | Desktop (1440) |
|------|:---:|:---:|:---:|
| Home `/es/` | ⚠️ overflow elements | ⚠️ overflow elements | ✅ Clean |
| Product detail `/es/inicio/13166-...` | ✅ No scroll | — | — |
| Login `/es/iniciar-sesion` | ✅ No scroll | — | — |
| Search `/es/buscar` | ✅ No scroll | — | — |

## Console errors (non-responsive, informational)

- GSI (Google Sign-In) FedCM NetworkError — expected for non-logged-in users
- "Unexpected token '&'" — likely GSI-related, not a responsive issue

---

## Previous run comparison

No prior RESPONSIVE findings file found in repo — this is the baseline run.
