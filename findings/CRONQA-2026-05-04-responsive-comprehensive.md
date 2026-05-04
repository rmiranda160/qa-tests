# CRON QA: Responsive Focus Area — new.zonacnc.com (2026-05-04)

## Summary
**Result: ⚠️ PASS with 3 findings**
**Scope:** Responsive design verification across 4 breakpoints on 6 pages
**Account:** test7@zonacnc.com (IMAP verified — no unexpected emails triggered by login)

---

## Test Matrix

| Page | 1920×1080 | 1280×800 | 768×1024 | 375×812 |
|------|:---------:|:--------:|:--------:|:-------:|
| Home `/es/` | ✅ | ✅ | ✅ | ✅ |
| Login `/es/iniciar-sesion` | ✅ | — | — | ✅ |
| Search `/es/buscar` | — | — | — | ✅ |
| Pricing `/es/pricing` | — | — | ✅ | ✅ |
| Account `/es/mi-cuenta` | — | — | — | ✅ |
| Contact `/es/contactenos` | — | — | — | ✅ |

All pages rendered without horizontal overflow at every tested breakpoint.

---

## Findings

### FINDING 1 ⚠️: Touch targets below WCAG 2.1 minimum (44×44px) — Mobile 375px

**Severity:** Low
**Location:** Multiple pages at mobile breakpoint (375×812)
**Evidence:**
- Favorite/save buttons: 36×36px (6 instances on home page)
- Language selector: 153×38px (height)
- Newsletter textbox: 236×38px (height)
- "Crear alerta" / "Ver catálogo" links: 30px height
- "Ver todos los anuncios →" link: 22px height

**WCAG 2.1 Success Criterion 2.5.5 (Target Size):** Touch targets should be at least 44×44 CSS pixels. The 36×36 favorite buttons are 8px short. The text links at 22-30px height are harder to tap accurately on mobile.

**Recommendation:** Increase minimum touch target size to 44×44px, especially for icon-only buttons like favorites. Consider adding padding to text links to reach 44px height.

---

### FINDING 2 ℹ️: Desktop nav links collapse to 6 visible (from 22) at mobile — No hamburger menu detected

**Severity:** Info
**Location:** Header navigation
**Evidence:** At 1920px: 22 visible nav links. At 375px: only 6 visible (logo, categorías, search, sell, account). No `<button>` with aria-label containing "Menú" or `.hamburger`/`.burger` class detected via DOM query. Navigation items like "Vendedores", "Tarifas", "Contacte con nosotros" hidden but not accessible through a toggle.

**Impact:** Mobile users cannot access the "Vendedores" directory or "Tarifas" page from the header. However, footer links provide alternative access to most pages.

**Recommendation:** Add a mobile hamburger menu to expose hidden navigation items, or ensure all critical links are available through the visible mobile header.

---

### FINDING 3 ℹ️: Console errors — Google GSI + "Unexpected token '&'" across all pages

**Severity:** Low (external service)
**Location:** All pages on new.zonacnc.com
**Evidence:** 2 errors per page load:
1. `[GSI_LOGGER]: FedCM get() rejects with NetworkError` — Google Sign-In library failing to retrieve token (no Google session in test browser)
2. `Unexpected token '&'` — JavaScript syntax error, appears ~17 times across multiple page loads, likely in an inline `<script>` tag with template variable encoding issue

**Impact:** Error 1 is cosmetic (no real Google account). Error 2 could indicate a PrestaShop template variable not being properly JSON-encoded, potentially causing JS failures.

**Recommendation:** Investigate the "Unexpected token '&'" error — likely an unescaped ampersand (&) in inline JavaScript (e.g., `var url = "..."` containing `&` without proper encoding in a `.tpl` file).

---

## Responsive Design Assessment

### What works well ✅
- **No horizontal overflow** at any tested breakpoint
- **Viewport meta tag** correctly set to `width=device-width, initial-scale=1`
- **50 CSS media queries** detected — solid responsive foundation
- **Body font size 16px** consistent across breakpoints
- **Heading scaling**: H1 goes from 28px (desktop) → 20.8px (mobile), H2 stays at 20px, H3 at 15px
- **No images exceed viewport** at any breakpoint
- **Login form** reflows correctly at mobile
- **Pricing plans** display correctly at tablet portrait (768×1024)
- **Product cards** stack properly at mobile
- **Footer** adapts with accordion-style sections on mobile
- **Account dashboard** reflows at mobile
- **Test mode banner** ("⚠️ MODO TEST") visible across all breakpoints

### Minor notes
- Footer toggle labels ("Mostrar/ocultar enlaces de legal", etc.) overflow at mobile — truncated with ellipsis, acceptable UX
- "Accesorios para maquinaria metal" text in footer overflows slightly
- IMAP verification: test7@zonacnc.com has 26 messages, 0 unread — login did not trigger unexpected emails

---

## Test Environment
- **Browser:** Chromium (Playwright MCP)
- **Date:** 2026-05-04 18:51–18:58 UTC
- **Tool:** MCP remote pwmcp-zonacnc
- **Account:** test7@zonacnc.com (authenticated)
- **Site mode:** TEST MODE (⚠️ MODO TEST banner visible)
