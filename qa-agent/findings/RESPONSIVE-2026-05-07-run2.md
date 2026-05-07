# Responsive QA — new.zonacnc.com — 2026-05-07 (Run 2)

**Date:** 2026-05-07 17:35 UTC
**Trigger:** CRON QA responsive (focus_area=responsive)
**Scope:** new.zonacnc.com — Homepage, Search, Product Detail, Login, Registration, Pricing, Publish (auth-gated)
**Viewports tested:** Mobile (375×667), Tablet (768×1024)

## Summary

**Result: 2 findings (2 MEDIUM) — 1 HIGH from prior run RESOLVED**

Overall responsive design is solid. No horizontal scroll detected on any page at any viewport. The `.zcnc-hero` overflow (HIGH from prior run) has been fixed. Remaining findings are touch-target sizing issues on specific CTA elements.

---

## ✅ Resolved from prior run

### `.zcnc-hero` overflow [was HIGH] → RESOLVED
- Now uses `max-width: 100%`, `overflow: hidden`
- Hero section fits 375px viewport exactly (was 468px → 78px overflow)
- All child elements (`zcnc-hero-inner`, `zcnc-hero-title`, `zcnc-hero-subtitle`, `zcnc-hero-search`) render within 375px bounds
- **Impact:** Hero content no longer clipped — all CTAs and messaging visible on mobile

### "Cancelar" button touch target [was part of MEDIUM] → RESOLVED
- Now 44×44px (was 93×38px)
- Meets WCAG 2.5.5 minimum touch target

### "Empieza gratis" small font [was part of MEDIUM] → CLOSED
- The 11.2px elements are decorative "▸" arrow characters only, not content text
- No actionable content below 12px found

---

## Finding 1 [MEDIUM]: "Crear alerta" and "Ver catálogo" CTAs at 30px height

- **Viewport:** Mobile (375×667)
- **Elements:** 
  - "Crear alerta" button: 107×30px
  - "Ver catálogo" button: 112×30px
- **Gap:** 30px height is 32% below WCAG 2.5.5 minimum of 44px
- **Impact:** These are primary conversion CTAs. Users on touch devices may mis-tap, reducing conversion rate.
- **Fix:** Increase `min-height` to 44px or add vertical padding. These are `.zcnc-banner-strip__cta` elements.

## Finding 2 [MEDIUM]: Footer accordion toggle buttons at 24×26px

- **Viewport:** Mobile (375×667)
- **Elements:** 5 footer section expand/collapse buttons (Legal, Marketplace, Nuestra empresa, Su cuenta, Información de la tienda)
- **Gap:** 26px height is 41% below WCAG minimum
- **Impact:** Users may accidentally tap wrong section or miss the toggle entirely. Given these are closely spaced, mis-taps are likely.
- **Fix:** Increase button size to at least 44×44px, or ensure the entire section header row is tappable.

---

## Pages tested (all passed horizontal overflow check)

| Page | Mobile (375) | Tablet (768) |
|------|:---:|:---:|
| Home `/es/` | ✅ Clean | ✅ Clean |
| Search `/es/buscar` | ✅ Clean | ✅ Clean |
| Product detail `/es/centros-de-mecanizado/13213-...` | ✅ Clean | ✅ Clean |
| Login `/es/iniciar-sesion` | ✅ Clean | — |
| Registration `/es/?controller=registration` | ✅ Clean | — |
| Pricing `/es/pricing` | ✅ Clean | ✅ Clean |
| Publish `/es/publicar` | Auth redirect | — |

## Layout behavior verification

| Behavior | Mobile (375) | Tablet (768) |
|----------|:---:|:---:|
| Hamburger menu present | ✅ | ✅ |
| Product grid columns | 1 col | 2 col (360px each) |
| Search results | 1 col full-width | 1 col (664px) |
| Pricing cards stack vertically | ✅ | ✅ |
| Form fields fill viewport | ✅ | ✅ |
| Images scale with max-width | ✅ | ✅ |
| No horizontal scroll bars | ✅ | ✅ |

## Console errors (informational, not responsive)

- GSI (Google Sign-In) FedCM NetworkError — expected when not logged into Google
- "Unexpected token '&'" — likely GSI inline script parsing, not a responsive issue
- "Provider's accounts list is empty" — Google One Tap configuration, not responsive

---

## Previous run comparison

**Prior run (2026-05-07 14:11 UTC):** 3 findings (1 HIGH, 2 MEDIUM)
**This run (2026-05-07 17:35 UTC):** 2 findings (0 HIGH, 2 MEDIUM)

Improvements detected:
- `.zcnc-hero` HIGH overflow → RESOLVED
- "Cancelar" button touch target → RESOLVED  
- Total issues: 3 → 2, HIGH issues: 1 → 0
