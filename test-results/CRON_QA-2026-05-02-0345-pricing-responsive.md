# 📱 Responsive Test: Pricing Page (ZonaCNC España)

- **Timestamp:** 2026-05-02 03:45 UTC
- **Agent:** tester (subagent)
- **Focus Area:** responsive
- **Tooling:** **MCP remote browser** (pwmcp-zonacnc — Playwright via remote node)
- **Anti-duplicate:** ✅ NUEVO escenario — Pricing page (`/es/pricing`) responsive test. Previous responsive tests covered: homepage (13:45), FAQ (14:00), legal pages (14:30), auth/registration (08:00), Issue #675 (07:00), CMS tables (07:15), PDP+Cart (05:00), category (05:15), i18n/EN (06:30), CMS content (03:45). **Pricing page NOT tested in any prior run.**
- **URL:** https://new.zonacnc.com/es/pricing
- **EN URL:** https://new.zonacnc.com/en/pricing
- **Viewports:** Desktop (1280×900) · Tablet (768×1024) · Mobile (375×812)
- **Label:** qa-responsive

---

## Verdict: ✅ PASS

## Summary

| Check | Status | Details |
|-------|--------|---------|
| Viewport meta tag | ✅ | `width=device-width, initial-scale=1` |
| HTML lang | ✅ | `es-ES` (ES), `en-US` (EN) |
| No horizontal overflow | ✅ | All 3 breakpoints: scrollWidth === viewportWidth |
| Console errors | ✅ | Only Google FedCM/GSI (non-critical, consistent with all other pages) |
| Page 200 OK | ✅ | ES: "Planes para Vendedores de Maquinaria Industrial \| ZonaCNC" |
| EN page 200 OK | ✅ | EN: "Seller Plans for Industrial Machinery \| ZonaCNC" |
| H1 present | ✅ | "Planes para vendedores" at all breakpoints |
| Breadcrumb | ✅ | "Inicio" at all breakpoints |
| 5 plan cards visible | ✅ | Free, Starter, Pro, Business, Enterprise |
| All CTA buttons present | ✅ | Empezar gratis, Contratar Starter/Pro/Business/Enterprise |
| Add-ons dropdown | ✅ | "Personalizar con add-ons ▾" on all paid plans |
| Boost 24h section | ✅ | "⚡ Boost 24h" section + "Ver packs →" CTA |
| Value propositions | ✅ | 4 icons: Sin comisión, Cancela cuando quieras, Pago seguro, 3.400+ anuncios |
| Test mode banner | ✅ | Visible at all breakpoints |
| Cookie consent dialog | ✅ | Present and dismissable |

---

## 1. Desktop (1280×900)

### Layout
- **Header top bar:** Contacte con nosotros | Vendedores (icon+text) | Tarifas (icon+text) | 🌐 11 idiomas | Iniciar sesión (icon+text)
- **Main nav:** Logo ZonaCNC | Categorías (text+icon) | 🔍 search bar (full width) | Vender máquina (icon+text)
- **Breadcrumb:** Inicio
- **Content:**
  - H1: "Planes para vendedores"
  - Subheading: "Elige tu plan de vendedor"
  - **5 pricing cards side-by-side** (Free / Starter / Pro / Business / Enterprise):
    - Free: 0€, "Para siempre", 1 anuncio, 5 imágenes, perfil público, "Empezar gratis" CTA + Boost packs link
    - Starter: 39€/mes, 3 anuncios, 3 boosts, 10 imágenes, perfil, "Contratar Starter" CTA + add-ons
    - Pro: 99€/mes, "Más popular" badge, 10 anuncios, 8 boosts, 20 imágenes, estadísticas, CSV, soporte, "Contratar Pro" CTA + add-ons
    - Business: 199€/mes, 25 anuncios, 20 boosts, 30 imágenes, badge Verificado, estadísticas, CSV, soporte, prod nuevo, "Contratar Business" CTA + add-ons
    - Enterprise: 299€/mes, 100 anuncios, 60 boosts, 50 imágenes, badge Verificado, estadísticas, CSV, soporte, prod nuevo, "Contratar Enterprise" CTA + add-ons
  - Boost 24h section with "Ver packs de Boost 24h →" CTA
  - Value props: 4 cards in row (Sin comisión, Cancela, Pago seguro, 3.400+)
- **Footer:** 5 columns expanded + 15 categorías + 12 marcas
- **Elements:** Test mode banner, Back to top, Chat, Cookie consent

| Feature | Estado |
|---------|--------|
| Page load (200 OK) | ✅ PASS |
| Title correcto | ✅ "Planes para Vendedores de Maquinaria Industrial \| ZonaCNC" |
| H1 presente | ✅ "Planes para vendedores" |
| 5 plan cards side-by-side | ✅ Free, Starter, Pro, Business, Enterprise |
| "Más popular" badge on Pro | ✅ |
| All CTAs present | ✅ 5 buttons |
| Add-ons dropdown | ✅ On Starter, Pro, Business, Enterprise |
| Boost 24h section | ✅ Heading + paragraph + CTA |
| Value props (4) | ✅ Row of 4 cards |
| Footer expandido | ✅ 5 columns |
| Console errors | ✅ Non-critical (Google FedCM) |

---

## 2. Tablet (768×1024)

### Layout
- **Header top bar:** Contacte con nosotros | Vendedores/Tarifas (icon ONLY, labels hidden) | 🌐 ES | Iniciar sesión (icon+text)
- **Main nav:** Logo | Categorías (icon ONLY) | 🔍 search bar | Vender máquina (icon ONLY)
- **Content:** Same structure as desktop — all 5 pricing cards, Boost section, value props
- **Footer:** Same structure as desktop (expanded, no accordion at tablet)

| Feature | Status |
|---------|--------|
| Nav icons without text | ✅ PASS — expected responsive behavior |
| No horizontal overflow | ✅ scrollWidth(768) === clientWidth(768) |
| All 5 plan cards visible | ✅ |
| All CTAs visible | ✅ |
| Footer expanded | ✅ No accordion |

---

## 3. Mobile (375×812)

### Layout
- **Nav:** Logo | Categorías (icon) | 🌐 ES (inline select) | 🔍 "Mostrar barra de búsqueda" toggle | 👤 Iniciar sesión (icon) | Vender máquina (icon)
- **Content:**
  - Breadcrumb: Inicio
  - H1: "Planes para vendedores"
  - Subheading + paragraph
  - **5 pricing cards stacked vertically** — each card full-width
  - All CTAs visible and tappable
  - "Personalizar con add-ons ▾" visible on paid plans
  - Boost 24h section followed by value props in 2×2 grid
- **Footer:**
  - **Accordion mode** — "Mostrar/ocultar enlaces de..." toggle buttons (Marketplace, Legal, Nuestra empresa, Su cuenta, Información tienda)
  - Categorías destacadas + Marcas líderes expanded below accordion
- **Elements:** Test mode banner, Back to top, Chat, Cookie consent

| Feature | Status |
|---------|--------|
| Nav responsive | ✅ Icons + language select visible |
| No horizontal overflow | ✅ scrollWidth(375) === clientWidth(375) |
| All 5 plans stacked | ✅ Full-width cards |
| All CTAs tappable | ✅ |
| Footer accordion | ✅ 5 collapsible sections with toggle buttons |
| Categorías/Marcas visible | ✅ Expanded at bottom |
| Cookie consent | ✅ Present |
| Console errors | ✅ Non-critical |

---

## ⚠️ Observations

1. **All 5 plan cards stack vertically on mobile** — this is expected and correct responsive behavior for pricing tables on narrow viewports. Free and Starter plans appear first (lower price → less friction), which is good UX.

2. **Footer accordion at mobile** uses "Mostrar/ocultar enlaces de..." toggle buttons — matches pattern seen on homepage and other pages. Good consistent responsive pattern.

3. **No issues found** — all content accessible, no overflow, all CTAs functional.

---

## EN Pricing Page Check

| Check | Status |
|-------|--------|
| `/en/pricing` loads | ✅ 200 OK |
| Title | ✅ "Seller Plans for Industrial Machinery \| ZonaCNC" |
| Viewport meta | ✅ `width=device-width, initial-scale=1` |
| HTML lang | ✅ `en-US` |

---

## Final Result

| Breakpoint | Estado |
|------------|--------|
| Desktop (1280×900) | ✅ PASS |
| Tablet (768×1024) | ✅ PASS |
| Mobile (375×812) | ✅ PASS |
| **Overall** | **✅ PASS** |

The pricing page renders correctly at all tested breakpoints. No horizontal overflow at any viewport. All 5 plans, CTAs, add-ons dropdown, Boost 24h section, value propositions, newsletter, and footer are fully accessible.
