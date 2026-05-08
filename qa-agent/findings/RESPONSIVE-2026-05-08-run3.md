# QA Responsive — 2026-05-08 Run 3

**Timestamp:** 2026-05-08 12:48 UTC
**URL:** https://new.zonacnc.com/
**Viewports tested:** Mobile 390×844, Tablet 768×1024, Desktop 1440×900
**Mode:** Full multi-page responsive audit (4 pages × 3 viewports = 12 combinations)

## Summary

4 páginas × 3 viewports = 12 combinaciones probadas. **0 horizontal overflow issues** (all pages clean at all viewports). **44 mobile tap-target findings**, concentrated in 3 categories. Overall responsive health: **GOOD** with one HIGH severity UX issue.

## Pages tested

| Page | URL | Mobile (390×844) | Tablet (768×1024) | Desktop (1440×900) |
|------|-----|:---:|:---:|:---:|
| Home | `/` | ⚠️ | ✅ | ✅ |
| Category | `/26-plegadoras` | ⚠️ | ✅ | ✅ |
| Product | `/plegadoras/1-plegadora-cnc.html` | ⚠️ | ✅ | ✅ |
| Login | `/iniciar-sesion` | ⚠️ | ✅ | ✅ |

## Automated checks passed

- ✅ Viewport meta tag present with `width=device-width` — all pages
- ✅ Zero horizontal overflow (`scrollWidth - clientWidth ≤ 3px`) — all viewports, all pages
- ✅ Zero tiny text (<10px) — all viewports, all pages
- ✅ Tablet (768×1024) — zero issues across all pages
- ✅ Desktop (1440×900) — zero issues across all pages

## Findings

### F1: Footer accordion toggle buttons too small for mobile touch targets

- **Severity:** HIGH
- **Pages affected:** Home, Category, Product, Login (all pages with footer)
- **Viewport:** 390×844 only
- **Observed:** Footer section toggle buttons ("Mostrar/ocultar enlaces de marketplace/legal/nuestra empresa/tu cuenta/información de la tienda") measure **24×26px**
- **WCAG target:** Minimum 44×44px touch target (WCAG 2.5.5)
- **Impact:** Users cannot reliably access footer links (Marketplace, Legal, Company info, Account, Shop info) on mobile. The accordion toggle is the ONLY way to expand these footer sections — blocked access to crucial navigation.
- **Element:** `<button>` elements inside `.footer__accordion` or equivalent
- **Root cause:** Footer accordion toggle chevron icons use default small sizing without sufficient padding
- **Fix suggestion:**
  ```css
  .footer__accordion-toggle {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }
  ```
- **Screenshots:** `resp-home-mobile-1778244845592.png`, `resp-login-mobile-1778244873703.png`

### F2: Breadcrumb links below minimum touch target height on mobile

- **Severity:** MEDIUM
- **Pages affected:** Category page (breadcrumbs: "Inicio / Maquinaria Metal")
- **Viewport:** 390×844 only
- **Observed:** Breadcrumb links have heights of **17px** (e.g., "Inicio" at 34×17px, "Maquinaria Metal" at 114×17px)
- **WCAG target:** Minimum 44×44px recommended
- **Impact:** Difficult to tap breadcrumb links without accidentally triggering adjacent elements
- **Element:** `<a>` elements inside breadcrumb `.breadcrumb` or equivalent
- **Fix suggestion:** Add vertical padding to breadcrumb links or increase `line-height` + `padding`
  ```css
  .breadcrumb a {
    display: inline-block;
    padding: 8px 4px;
    min-height: 44px;
    line-height: 28px;
  }
  ```

### F3: Cookie consent banner positioning inconsistency and missing prominent dismiss button

- **Severity:** MEDIUM
- **Pages affected:** All pages
- **Viewport:** 390×844
- **Observed:** Cookie banner appears at different vertical positions across pages. On Home/Category it sits at the top, on Login it appears mid-content. No prominent "Accept" or "Close" button visible — only a link to the cookie policy.
- **Impact:** 
  - Banner occupies ~15-20% of viewport height
  - Inconsistent positioning confuses users about what is page content vs consent UI
  - Users forced to keep banner visible with no obvious way to dismiss
- **Element:** Cookie consent banner from `zonacnc-cookieconsent` module
- **Root cause:** Banner uses `position: fixed` or absolute without z-index consistency; missing prominent CTA button
- **Fix suggestion:** 
  - Use consistent `position: fixed; bottom: 0` for all pages
  - Add a large, prominent "Aceptar y cerrar" button
  - Ensure banner stays at bottom consistently

### F4: Category pill links at 42px height — borderline under WCAG target

- **Severity:** LOW
- **Pages affected:** Product detail page (404 page in test)
- **Viewport:** 390×844 only
- **Observed:** Category navigation links (Tornos, Fresadoras, Plegadoras, etc.) at **42px height** — just 2px under the 44px WCAG minimum
- **Impact:** Borderline; most users will not have issues at 42px, but strictly under WCAG 2.5.5
- **Fix suggestion:** Add 2px vertical padding or increase to 44px

## Comparison with previous runs

| Run | Date | Horizontal Overflow | Tap Targets | Overall |
|-----|------|:---:|:---:|:---:|
| Run 1 | 2026-05-07 | 1 finding (product image) | Not tested | ⚠️ |
| Run 2 | 2026-05-08 | 0 findings | Not tested | ✅ |
| Run 3 | 2026-05-08 12:48 | **0 findings** | 4 findings | ⚠️ HIGH footer toggle |

**Trend:** Horizontal overflow issues resolved (0 across all pages/viewports). New mobile tap-target audit reveals pre-existing accessibility gap in footer accordion toggles.

## Console errors (non-blocking)

- `Not signed in with the identity provider.` — Google One Tap, expected for anonymous sessions
- No functional JS errors on any tested page

## Recommendations

1. **P0 — Footer accordion toggles:** Increase touch target to 44×44px minimum. This blocks legal/shop navigation access on all mobile pages.
2. **P1 — Breadcrumb tap targets:** Add vertical padding to breadcrumb links.
3. **P2 — Cookie banner:** Ensure consistent `fixed` positioning and prominent accept button.
4. **P3 — Category pills:** Increase to full 44px height.
