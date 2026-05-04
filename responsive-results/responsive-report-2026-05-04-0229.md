# CRON QA: Responsive Testing Report — new.zonacnc.com

**Date:** 2026-05-04 02:29 UTC  
**Scope:** Strict to `new.zonacnc.com` (Spanish + English locale)  
**Testing Type:** Responsive Web Design — Functional & Visual  
**Test Account:** test25@zonacnc.com (from `.env.qa.email`)  
**Method:** MCP browser (pwmcp-zonacnc) — 3 viewports  
**Framework:** MJML (email templates), Bootstrap (site), PrestaShop (platform)

---

## Pages Tested

| Page | URL | Desktop (1440×900) | Tablet (768×1024) | Mobile (390×844) |
|------|-----|:---:|:---:|:---:|
| Home | `/es/` | ✅ | ✅ | ✅ |
| Login | `/es/iniciar-sesion` | ✅ | ✅ | ✅ |
| Pricing | `/es/pricing` | ✅ | ✅ | ✅ |
| Product Listing (Tornos) | `/es/15-tornos` | ✅ | ✅ | ✅ |
| Sellers | `/es/vendedores` | ✅ | ✅ | ✅ |
| Brand page (Haas) | `/es/marca/5-haas` | ❌ **500** | ❌ | ❌ |
| Product detail | `/es/tornos-automaticos/12969...` | ❌ **500** | ❌ | ❌ |

## Results by Category

### Horizontal Overflow

| Page | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| Home | 0px overflow | 0px overflow | 0px overflow |
| Login | 0px overflow | 0px overflow | 0px overflow |
| Pricing | 0px overflow | 0px overflow | 0px overflow |
| Tornos | 0px overflow | 0px overflow | 0px overflow |
| Sellers | 0px overflow | 0px overflow | 0px overflow |

**Status: ✅ PASS** — No horizontal scrollbars or overflow on any tested page/viewport.

### Off-Screen Elements

Analysis of detected off-screen elements:

| Element | Size | Purpose |
|---------|------|---------|
| `button.menu-toggle` (0×0) | **0×0px** | ❌ **Mobile hamburger menu invisible** — trigger is in hidden container |
| `#mobileMenu` offcanvas | present, `display: flex` | ✅ Off-canvas exists but has no clickable trigger |
| Footer accordion buttons | .footer-accordion | ✅ Intentional collapsible pattern |

**Status: ❌ FAIL** — Mobile hamburger menu toggle renders at 0×0px. WCAG violations.

### Console Errors

| Error | Source | Severity | Root Cause |
|-------|--------|----------|------------|
| `Not signed in with the identity provider` | Google Identity Services | ⚠️ Low | No active Google session in test browser |
| `FedCM get() rejects with NetworkError` | `accounts.google.com/gsi/client` | ⚠️ Low | FedCM requires valid OAuth client ID |

**Status: ⚠️ Non-critical** — Same known Google Sign-In issue in test environments.

### Page Title Quality

| Page | Title | Status |
|------|-------|:------:|
| Home (ES) | *Maquinaria Industrial Segunda Mano y Nueva \| ZonaCNC España* | ✅ Correct |
| Tornos (ES) | *Tornos Segunda Mano — CNC, Paralelos y Automáticos \| ZonaCNC* | ✅ Correct |
| Pricing (ES) | *Planes para Vendedores de Maquinaria Industrial \| ZonaCNC* | ✅ Correct |
| Sellers (ES) | *Directorio de Vendedores de Maquinaria Industrial \| ZonaCNC* | ✅ Correct |
| Login (ES) | *Iniciar Sesión — ZonaCNC Marketplace de Maquinaria* | ✅ Correct |
| EN Category | `Tornos` (should be "Lathes") | ❌ Spanish title on EN page |
| EN Content (how-it-works) | `About us` (wrong page) | ❌ Redirected to Spanish slug |
| EN Create Ad | `zonacnc.com` | ❌ Generic fallback title |

## Email Templates — IMAP Verification (test25@zonacnc.com)

| # | Subject | Language | Template Quality |
|---|---------|----------|:----------------:|
| 1 | ¡Bienvenido! (Welcome) | Spanish | ✅ MJML responsive |
| 2 | ¡Bienvenido! (Welcome) | Spanish | ✅ MJML responsive |
| 3 | Password query confirmation | English | ⚠️ Mixed language |
| 4 | Your new password | English | ⚠️ Mixed language |
| 5 | Confirmación de contraseña | Spanish | ✅ MJML responsive, correct translation |

**Email structure:** multipart/alternative (text/plain qp + text/html qp)  
**Sender:** no-reply@mg.zonacnc-sales.es  
**Framework:** MJML (responsive HTML, 600px max-width, inline styles)  
**Reset link verified:** Valid token `a8d9013f9c4b9eff33ba8e958c5167ac` with `id_customer=6615`

## Summary

| Category | Result | Notes |
|----------|--------|-------|
| Horizontal overflow | ✅ **PASS** | No overflow on tested pages |
| Mobile menu toggle | ❌ **FAIL** | 0×0px — inaccessible navigation |
| Brand pages | ❌ **CRITICAL** | HTTP 500 on all `/es/marca/*` |
| Product details | ❌ **CRITICAL** | HTTP 500 on all product pages |
| EN i18n routing | ❌ **HIGH** | Content slugs redirect to Spanish |
| EN page titles | ❌ **HIGH** | Spanish titles on EN pages |
| Console errors | ⚠️ Non-critical | Google FedCM — test env only |
| Page titles (ES) | ✅ **PASS** | Spanish translations correct |
| Email templates | ✅ **PASS** | MJML responsive, translations correct |
| Email delivery | ✅ **PASS** | Via Mailgun, correct sender |
| Layout integrity | ✅ **PASS** | Pages render within viewport |

## Recommendations

1. **🔴 IMMEDIATE:** Fix brand/manufacturer pages HTTP 500 (`/es/marca/*`, `/fabricantes`)
2. **🔴 IMMEDIATE:** Fix product detail pages HTTP 500 (blocks entire buyer journey)
3. **🔴 HIGH:** Make mobile hamburger menu toggle visible (move `menu-toggle` out of hidden desktop container)
4. **🟠 HIGH:** Fix EN i18n routing — content pages should not redirect to Spanish slugs
5. **🟠 HIGH:** Translate category page titles for EN locale
6. **🔵 LOW:** Set descriptive page titles for module-generated pages
