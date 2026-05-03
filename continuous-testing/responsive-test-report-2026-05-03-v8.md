# Responsive Test Report — new.zonacnc.com

**Date:** 2026-05-03 18:33 UTC  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Scope:** CRON_QA — Responsive  
**Environment:** new.zonacnc.com  
**Cap:** 30 min  

---

## ✅ Site Status: RECOVERED

**Previous report (17:22 UTC):** HTTP 500 Internal Server Error — Total Outage  
**Current status (18:33 UTC):** HTTP 200 OK — Site operational

The site recovered from the complete outage observed earlier today. All pages now return HTTP 200.

---

## Viewport Testing Summary

| Viewport | Width | Height | Status |
|----------|-------|--------|--------|
| Mobile | 390px | 844px | ✅ Pass |
| Tablet | 768px | 1024px | ✅ Pass |
| Desktop | 1440px | 900px | ✅ Pass |

---

## Pages Tested

### 1. Homepage (`/es/`)
| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Top bar (Contacto, Vendedores, Tarifas) | ✅ Visible | ✅ Visible | 🔹 Hidden |
| Logo | ✅ | ✅ | ✅ |
| Search bar | ✅ Full | ✅ Full | 🔹 Toggle button |
| Language selector | ✅ Full combobox | ✅ Full combobox | ✅ Compact |
| "Iniciar sesión" link | ✅ Icon + text | ✅ Icon + text | 🔹 Icon only |
| "Vender máquina" button | ✅ Icon + text | 🔹 Icon only | 🔹 Icon only |
| Hero section (stats counters) | ✅ Visible | ✅ Visible | 🔹 Hidden |
| Latest machines grid (6 cards) | ✅ 3 cols | ✅ 2 cols | ✅ 1 col |
| Search section | ✅ Full | ✅ Full | ✅ Full |
| Main categories (12 items) | ✅ Grid | ✅ Grid | ✅ Stack |
| "Cómo funciona" steps (3) | ✅ 3 cols | ✅ 3 cols | ✅ Stack |
| Footer sections | ✅ Expanded | ✅ Expanded | 🔹 Collapsible accordion |
| Newsletter form | ✅ | ✅ | ✅ |
| Cookies banner | ✅ | ✅ | ✅ |
| Test mode banner | ✅ | ✅ | ✅ |
| Chat button | ✅ | ✅ | ✅ |

### 2. Search/Listing Page (`/es/buscar`)
| Element | Status |
|---------|--------|
| Breadcrumbs | ✅ |
| Category filters sidebar | ✅ |
| Product results list | ✅ |
| No layout breakage at any viewport | ✅ |

### 3. Product Detail (`/es/centros-de-mecanizado-multifuncion/12934-gildemeister-ctx-510.html`)
| Element | Status |
|---------|--------|
| Breadcrumbs | ✅ |
| Product images / gallery | ✅ |
| Product title | ✅ |
| Price display | ✅ |
| Brand + year | ✅ |
| "Contact seller" section | ✅ |
| Related products | ✅ |
| Mobile layout (stacked) | ✅ |

### 4. Login (`/es/iniciar-sesion`)
| Element | Status |
|---------|--------|
| Login form | ✅ |
| Google OAuth button | ✅ |
| "Crear una cuenta" link | ✅ |
| "Recordar contraseña" link | ✅ |
| Mobile spacing/touch targets | ✅ |

### 5. Registration (`/es/?controller=registration`)
| Element | Status |
|---------|--------|
| "Crear una cuenta" heading | ✅ |
| Google OAuth registration | ✅ |
| Form fields ("Sus datos personales") | ✅ |
| Submit button | ✅ |
| Mobile form layout | ✅ |

### 6. Pricing (`/es/pricing`)
| Element | Status |
|---------|--------|
| Page loads | ✅ |
| Plan cards | ✅ |
| Mobile: cards stack vertically | ✅ |

### 7. Sell Machine Wizard (`/es/module/zonacncproductadd/ads`)
| Element | Status |
|---------|--------|
| "Publica tu anuncio GRATIS" page | ✅ accessible without login |
| 3-step wizard (Datos → Fotos → Cuenta) | ✅ |
| Product data form fields | ✅ |
| Image upload section | ✅ |
| "Tus datos" (personal info) | ✅ |
| "Publicar anuncio gratis" button | ✅ |

---

## Console Errors (All Non-Critical)

| Error | Source | Severity |
|-------|--------|----------|
| `Provider's accounts list is empty` | Homepage (Google Identity Services) | 🟡 Low |
| `FedCM get() rejects with NetworkError: Error retrieving a token` | accounts.google.com/gsi/client | 🟡 Low |
| `Not signed in with the identity provider` | Search/Pricing/Product pages | 🟡 Low |

All errors originate from Google Federated Credential Management (FedCM) and are expected in a test environment without Google accounts configured.

---

## Responsive Design Assessment

### Breakpoints
The site implements at least two responsive breakpoints:
- **Mobile (<768px):** Compact navigation, collapsed footer, stacked layouts
- **Tablet (768px–1024px):** Mid-sized navigation, visible top bar, expanded footer
- **Desktop (>1024px):** Full layout with all features

### What works well
- ✅ Content reflows correctly at all viewport sizes
- ✅ Font sizes scale appropriately
- ✅ Touch targets are adequate (minimum 44px)
- ✅ No horizontal scroll or overflow at any tested viewport
- ✅ Images are responsive (use `max-width: 100%`)
- ✅ Breadcrumbs truncate properly on small screens
- ✅ Cookie consent dialog is responsive
- ✅ Footer accordion on mobile is well-implemented
- ✅ Product grids change columns (3→2→1) at breakpoints
- ✅ "Cómo funciona" steps reflow from horizontal to vertical

### Minor observations

| ID | Description | Severity | Viewport |
|----|------------|----------|----------|
| RSP-001 | Stats counters (3.462+, 11 idiomas, 1.200+ fabricantes) hidden on mobile — these provide valuable social proof | 🟡 Medium | Mobile |
| RSP-002 | "Vender máquina" button shows icon-only on tablet (768px) with no text label — may affect click-through for unfamiliar users | 🟢 Low | Tablet |
| RSP-003 | Search bar hidden behind toggle on mobile — common mobile pattern but reduces discoverability of search | 🟢 Low | Mobile |
| RSP-004 | Some product cards display "Sin imagen" placeholder consistently — affects visual appeal across all viewports | 🟢 Low | All |

---

## Previous Outage Resolution

The **HTTP 500 total outage** reported at 17:22 UTC has been **resolved**. The site is now fully operational.

However, root cause was not determined. The outage progression was:
1. **2026-05-02:** Partial outage (auth only, pages 500)
2. **2026-05-03 17:22:** Complete outage (all pages 500)
3. **2026-05-03 18:33:** Fully recovered (all pages 200)

---

## Resumen

| Aspecto | Resultado |
|---------|-----------|
| **Site status** | ✅ Operational (recovered from 500 outage) |
| **Responsive desktop** | ✅ Pass — 0 critical issues |
| **Responsive tablet** | ✅ Pass — 0 critical issues |
| **Responsive mobile** | ✅ Pass — 0 critical issues |
| **Console errors** | 🟡 3 non-critical (Google FedCM) |
| **Layout breakage** | ✅ None detected |
| **Content accessibility** | ✅ All sections accessible |
| **Forms (login/register)** | ✅ Functional and responsive |
| **Sell machine wizard** | ✅ Accessible without login |

**Overall: Responsive PASS** — The site is functioning correctly across all tested viewports with no critical or high-severity issues.
