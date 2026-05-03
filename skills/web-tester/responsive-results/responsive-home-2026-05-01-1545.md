# Responsive Home Page Test — 2026-05-01 15:45 UTC

**Agent:** tester  
**Focus:** responsive  
**Scenario:** Home page (`https://new.zonacnc.com/es/`)  
**URL:** https://new.zonacnc.com/es/

## Verdict: ✅ PASS (B)

| Viewport | Status | Details |
|---|---|---|
| Desktop 1440×900 | ✅ PASS | Full layout, 3-column cards, expanded nav, footer lists visible |
| Tablet 768×1024 | ✅ PASS | 2-column cards, collapsed nav, no overflow, footer links visible |
| Mobile 390×844 | ✅ PASS | 1-column cards, icon nav, footer accordions working |

## Checks summary

| Check | Desktop | Tablet | Mobile |
|---|---|---|---|
| HTTP 200 | ✅ | ✅ | ✅ |
| No horizontal overflow | ✅ | ✅ | ✅ |
| Layout responsive | ✅ | ✅ | ✅ |
| Cards proper width | 3-col | 2-col (49%) | 1-col (100%) |
| Header adapted | ✅ full nav | ✅ side menu | ✅ icon-only |
| Search visible | ✅ | ✅ | ✅ icon toggle |
| Footer nav usable | ✅ | ✅ | ✅ accordion |
| Cookie notice visible | ✅ | ✅ | ✅ |
| Hero section readable | ✅ | ✅ | ✅ |
| Categories grid | ✅ | ✅ | ✅ |

## ⚠️ Findings

| Issue | Severity | Viewport | Detail |
|---|---|---|---|
| Cookie accept btn touch target | LOW | Mobile | 358×38px — height 6px below WCAG 44px min |
| Language selector touch target | LOW | Mobile | 153×38px — height 6px below WCAG 44px min |
| "Ver catálogo" CTA touch target | LOW | Mobile | 61×37px — both dims below WCAG 44px |
| Footer accordion toggle buttons | LOW | Mobile | 24×26px — well below WCAG 44px min (icon-only) |
| Google FedCM errors | INFO | All | Expected in automated browser env (not a bug) |
| GSI accounts list empty | INFO | All | Expected without Google logged in |

## Passed checks ✅
- Zero horizontal overflow at all breakpoints
- Product cards stack correctly: 3→2→1 columns
- Hero CTA "Empezar gratis" visible and actionable at all sizes
- "Vender máquina" icon meets 44×44 WCAG touch target at mobile
- "Iniciar sesión" icon meets 44×44 WCAG touch target at mobile
- Search button meets WCAG at mobile (342×44)
- Language selector present and functional at all sizes
- Footer accordions collapse properly at mobile, expand at tablet/desktop
- Back-to-top link present
- Cookie notice dialog usable at all sizes

## Evidence
- Test performed via Playwright MCP browser (PrestaShop 9.1, Hummingbird theme)
- Screenshots: desktop/tablet/mobile full-page captures taken
- All metrics measured with `getBoundingClientRect()`

## Duration
~4 min
