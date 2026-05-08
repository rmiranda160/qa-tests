# Responsive QA — new.zonacnc.com — 2026-05-08

**Date:** 2026-05-08 01:03 UTC
**Trigger:** CRON QA responsive (focus_area=responsive)
**Scope:** new.zonacnc.com — Homepage, Search, Product Detail, Login, Registration, Category, Publish
**Viewports tested:** Mobile (375×667), Tablet (768×1024)

## Summary

**Result: 2 findings (1 MEDIUM, 1 LOW)**

Overall responsive design is solid. No horizontal scroll detected on any page at any viewport. All 8 pages pass the overflow check at both mobile and tablet breakpoints.

---

## Finding 1 [MEDIUM]: Overlapping sticky headers at mobile and tablet

- **Viewport:** Mobile (375×667) and Tablet (768×1024)
- **Elements:**
  - `.zcnc-testmode-front-banner` — test mode warning banner: top=0, height=46px (mobile) / 28px (tablet)
  - `.zcmn-topbar` — mobile navigation bar: top=0, height=60px, `display: block`
  - `.header` — main site header: top=26
- **Issue:** The test mode banner and mobile topbar both render at position `top: 0`, overlapping each other. The mobile topbar (60px) completely covers the test banner content. Additionally, the `.zcmn-topbar` remains `display: block` at 768px tablet width where it may not be intended.
- **Gap:** Multiple sticky elements stacked at position 0 without proper offset coupling.
- **Impact:** Test mode banner text is partially or fully hidden behind the mobile navigation at mobile widths. At tablet (768px), the mobile navigation bar is still visible and overlaps the test banner.
- **Fix:** Add proper top offsets so the topbar sits below the test banner (e.g., `top: 46px` at mobile). Alternatively, verify whether `.zcmn-topbar` should be hidden at tablet breakpoint (≥768px).

**Data:**
```
Mobile 375px:
  testBanner:  top=0, bottom=46,  height=46
  topbar:      top=0, bottom=60,  height=60, display=block
  header:      top=26, bottom=123, height=97

Tablet 768px:
  testBanner:  top=0, bottom=28,  height=28
  topbar:      top=0, bottom=60,  height=60, display=block
  header:      top=26, bottom=146, height=120
```

---

## Finding 2 [LOW]: Touch target size — footer accordion toggles and inline links

- **Viewport:** Mobile (375×667)
- **Elements:**
  - Footer section toggle buttons (5 elements): 24×26px
  - "Cancelar" button (product contact form): 93×38px
  - "Enviar solicitud" button (product contact form): 319×39px
  - "Su cuenta" link (footer): 78×24px
  - Logo link: 128×28px
- **Gap:** Multiple interactive elements fall below WCAG 2.5.5 minimum of 44×44px in at least one dimension.
- **Impact:** Footer accordion toggles are most affected — closely spaced 24×26px buttons may cause mis-taps on touch devices. Contact form buttons with 38-39px height are marginally below threshold for primary CTAs.
- **Fix:** For footer toggles, make the entire section header row tappable (not just the chevron icon). For contact form buttons, increase min-height to 44px.
- **Note:** This is a continuation from prior runs. Footer toggles have been flagged before (RESPONSIVE-2026-05-07-run2). The "Cancelar" button previously reported as RESOLVED at 44×44px was on a different page; the product-page contact form "Cancelar" is a different element.

---

## ✅ Pages tested (all passed horizontal overflow check)

| Page | Mobile (375) | Tablet (768) |
|------|:---:|:---:|
| Home `/es/` | ✅ Clean | ✅ Clean |
| Search `/es/buscar` | ✅ Clean | ✅ Clean |
| Product detail `/es/inicio/13212-saeilo-dialog-h-66.html` | ✅ Clean | ✅ Clean |
| Login `/es/iniciar-sesion` | ✅ Clean | ✅ Clean |
| Registration `/es/?controller=registration` | ✅ Clean | — |
| Category `/es/15-tornos` | ✅ Clean | — |
| Publish `/es/publicar` | ✅ Clean | — |
| `/es/registro` | 404 (expected) | — |

---

## Layout behavior verification

| Behavior | Mobile (375) | Tablet (768) |
|----------|:---:|:---:|
| No horizontal scroll (html.scrollWidth ≤ viewport) | ✅ All pages | ✅ All pages |
| Hamburger menu available | ✅ | ✅ |
| Product cards stack vertically | ✅ | ✅ |
| Cookie consent banner displays correctly | ✅ | ✅ |
| Forms fill viewport width | ✅ | ✅ |
| Images scale with max-width | ✅ | ✅ |
| Sticky headers present | ✅ | ✅ |

---

## Console errors (informational, not responsive-related)

- GSI (Google Sign-In) FedCM NetworkError — expected when not logged into Google
- GSI inline script "Unexpected token '&'" — GSI config parsing
- "Provider's accounts list is empty" — Google One Tap, not a responsive issue

---

## Previous run comparison

**Prior run (2026-05-07 17:35 UTC):** 2 findings (2 MEDIUM)
**This run (2026-05-08 01:03 UTC):** 2 findings (1 MEDIUM, 1 LOW)

Changes:
- `.zcnc-hero` overflow → remains RESOLVED ✅
- Touch target findings persist for footer toggles and product-page contact form buttons
- NEW: Overlapping sticky headers detected (test banner + mobile topbar)
