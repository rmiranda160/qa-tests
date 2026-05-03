# CRON QA — Responsive Test Report
**Date:** 2026-05-02 08:00 UTC  
**Agent:** tester (subagent)  
**Focus:** responsive  
**Scenario:** Product detail page — Centros de mecanizado verticales  
**URL:** https://new.zonacnc.com/es/centros-de-mecanizado-verticales/12923-agiecharmilles-modelo.html  
**Method:** MCP remote browser (navigate + snapshot + resize + evaluate + screenshot)  
**Verdict:** ✅ PASS (B+)

---

## Summary

| Check | Status | Detail |
|-------|--------|--------|
| Viewport meta tag | ✅ | `width=device-width, initial-scale=1` |
| HTTP status | ✅ | 200 |
| Page load time | ✅ | 1.07s (DOM: 0.58s) |
| DOM size | ✅ | 1,035 elements |
| Console errors | ✅ | Only FedCM "accounts list empty" (non-critical, Google) |
| No horizontal overflow | ✅ | All 3 breakpoints |
| Cookie consent dialog | ✅ | Present and dismissible |
| Back to top link | ✅ | Present |
| Chat help button | ✅ | Present at all breakpoints |

---

## Responsive Breakpoint Results

### ✅ Desktop 1280×720

| Element | Status | Detail |
|---------|--------|--------|
| Top bar | ✅ | Full labels: Contacto, Vendedores, Tarifas, Language selector, Iniciar sesión |
| Main navbar | ✅ | Logo + "Categorías" + search bar + "Vender máquina" |
| Breadcrumb | ✅ | Full 5-level: Inicio > Maquinaria Metal > Centros de Mecanizado > Centros de mecanizado verticales > Agiecharmilles Modelo |
| Product image gallery | ✅ | Main image + thumbnail strip + gallery enlarge button + favorites |
| Product info panel | ✅ | Price (10.200,00€), Year (2010), Status (Para repuestos), Location (Mostoles) |
| Machine data table | ✅ | 7-row table: Fabricante, Modelo, Año, Estado, Horas, Ubicación, Tipo precio |
| "Proveedor profesional" section | ✅ | Dealer info + phone + "Contactar para ver" + Google Maps iframe |
| "ENVIAR SOLICITUD" form | ✅ | 4 fields: Message, Name, Email, Phone + checkbox + submit button |
| Related products | ✅ | 4 product cards in same category |
| Footer | ✅ | 4-column with full links (Marketplace, Legal, Nuestra empresa, Su cuenta) |
| Newsletter | ✅ | Email input + subscribe button |

### ✅ Tablet 768×1024

| Element | Status | Detail |
|---------|--------|--------|
| Top bar | ✅ | Text labels remain: Contacto, Vendedores (icon-only), Tarifas (icon-only), Language, Login |
| Main navbar | ✅ | Logo + "Categorías" icon + search bar + "Vender máquina" icon |
| Breadcrumb | ✅ | Truncated naturally, still readable |
| Product layout | ✅ | Image + info stack vertically, full-width |
| Machine data table | ✅ | Full table visible |
| Proveedor section | ✅ | Stacks below product info, map visible |
| Contact form | ✅ | Full-width fields |
| Related products | ✅ | 2-column grid |
| Footer | ✅ | Still 4-column with text |
| No horizontal scroll | ✅ | bodyWidth = 768px, no overflow |

### ✅ Mobile 375×812

| Element | Status | Detail |
|---------|--------|--------|
| Top bar | ✅ | Hidden (clean collapse) |
| Main navbar | ✅ | Icon-only: logo, categories, language, search toggle, login, sell |
| Search toggle | ✅ | "Mostrar barra de búsqueda" button |
| Breadcrumb | ✅ | Visible, text truncates naturally |
| Product image | ✅ | Full-width, gallery/favorites buttons visible |
| Price/info strip | ✅ | Stacks vertically |
| Machine data table | ✅ | Responsive table, all columns visible |
| "Proveedor profesional" | ✅ | Stacks below data, map visible |
| Contact form | ✅ | Full-width inputs |
| Related products | ✅ | Single column stack, full-width cards |
| "Enviar solicitud" button | ✅ | Full-width, visible, clickable |
| Footer accordion | ✅ | "Mostrar/ocultar" toggles on ALL sections |
| Cookie dialog | ✅ | Responsive, dismissible |
| Chat button | ✅ | Visible, proper position |
| Back to top | ✅ | Functional |
| No horizontal scroll | ✅ | bodyWidth = 375px, no overflow |

---

## WCAG Tap Target Warnings (< 44px at mobile)

| Severity | Count | Examples |
|----------|-------|---------|
| 🟡 Footer accordion toggles | 5 | 24×26px each |
| 🟡 Footer/breadcrumb links | 3 | 32-38×17-20px (Haas, TOS, OMS) |
| 🟡 Nav icon buttons | 4 | 36×36px (search, categories, login, sell) |
| 🟡 Search input | 1 | 13×13px (checkbox input) |
| 🟢 Skip-to-content link | 1 | 1×1px (focus-only, expected behavior) |
| 🟢 "Volver arriba" | 1 | 1×1px (focus-only) |

> Note: These are **systemic** to the Hummingbird theme and consistent with findings from previous responsive tests (homepage, search results, category pages). No new unique issues found on this product page.

---

## Button/Action Verification (Regla Miranda)

| Button/Action | Status | Detail |
|---------------|--------|--------|
| "Abrir galería ampliada" | ✅ | Present, clickable (image zoom on click) |
| "Guardar en favoritos" | ✅ | Present on product + all related items |
| "Contactar para ver" | ✅ | Link opens contact form |
| "Enviar solicitud" (main) | ✅ | Button present, text: "Enviar solicitud" |
| "Enviar solicitud" (related) | ✅ | Present on each related product card (×4) |
| "Suscríbete" newsletter | ✅ | Email input + subscribe button |
| Footer accordion toggles | ✅ | 5 sections with "Mostrar/ocultar" on mobile |
| "Aceptar y cerrar" cookies | ✅ | Present |
| "Abrir chat de ayuda" | ✅ | Present |
| "Volver arriba" | ✅ | Present and functional |
| Breadcrumb links | ✅ | All 5 parent links clickable |
| Manufacturer link | ✅ | "Agiecharmilles" links to brand page |

---

## HTTP Performance

| Metric | Value |
|--------|-------|
| DOM Content Loaded | 580ms |
| Full load | 1,068ms |
| DOM size | 1,035 elements |

---

## Conclusion

**✅ PASS (B+)** — Product detail page renders correctly across all 3 tested viewports (1280×720, 768×1024, 375×812). No layout breakage, no horizontal overflow, no functional issues. All buttons and actions are present and clickable. Responsive transformations (top bar collapse, footer accordion, image/product stacking, breadcrumb truncation) work as expected.

Minor WCAG tap target concerns on navbar icons (36px vs 44px req) and footer accordion toggles (24-26px) are pre-existing systemic issues with the Hummingbird theme — no new issues introduced.
