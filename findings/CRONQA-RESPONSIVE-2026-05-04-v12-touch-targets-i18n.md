# CRON QA Responsive Testing — 2026-05-04

**Cron ID**: `53983183-66c6-4b72-9b21-404aac116c60`  
**Focus Area**: Responsive  
**Target**: `https://new.zonacnc.com`  
**Date**: 2026-05-04 14:06 UTC  
**Tester**: QA Agent (MCP browser `pwmcp-zonacnc`)  
**Accounts**: test7-test30@zonacnc.com (IMAP unreachable — see Finding 7)

---

## Test Matrix

| Viewport | Width | Height | Pages Tested |
|----------|-------|--------|-------------|
| Mobile   | 390px | 844px  | Homepage, Category (/es/28-maquinaria-metal), Product detail, Login, Password Recovery, Create Ad |
| Tablet   | 768px | 1024px | Homepage |
| Desktop  | 1440px| 900px  | Homepage |

**Languages tested**: ES, EN, CA

---

## Findings

### 1. ⚠️ MEDIUM: Touch Targets Below WCAG 2.5.5 Minimum (44×44px)

**Across all viewports**, 55-65 interactive elements have width or height < 44px:

| Element | Size (w×h) | Viewport |
|---------|------------|----------|
| Carousel prev/next buttons | 36×36px | All |
| Language selector | 123-153×28-38px | All |
| "Contacte con nosotros" link | 172×20px | All |
| "Vendedores"/"Tarifas" header links | 28-113×24px | Tablet/Desktop |
| "Categorías" nav link | 61-147×36-37px | All |
| "Ver catálogo"/"Crear alerta" buttons | 107-112×30px | All |
| Newsletter input height | 38px | All |
| Product carousel buttons | 36×36px | All |

**Impact**: WCAG 2.5.5 requires minimum 44×44px target size. These are difficult to tap accurately on mobile.

### 2. ⚠️ LOW-MEDIUM: Small Font Sizes Below 12px

7 elements with `font-size < 12px` across all viewports:

| Text | Font Size |
|------|-----------|
| "Empieza gratis" (SPAN) | 11.2px |
| "Usada - Funcional" labels (×5 SPANs) | 11px |
| "Powered by AI · Verifica siempre" (DIV) | 11px |

**Impact**: Below recommended minimum of 12px for body text readability.

### 3. ⚠️ LOW: Page Title Issues

- **`/es/module/zonacncproductadd/ads`** → title = `"zonacnc.com"` (generic, no SEO value, no user context)
- **`/en/`** homepage → title = `"Purchase and sale of new and used industrial machinery and tool"` — truncated, likely should end with `"tools"` (missing `s`)

**Expected**: Descriptive, localized titles. Spanish homepage title is correct: `"Maquinaria Industrial Segunda Mano y Nueva | ZonaCNC España"`

### 4. ⚠️ LOW: i18n — Parentheses Pluralization Pattern

On password recovery page (`/es/recuperar-contraseña`):
```
"Solo puede regenerar su contraseña cada 360 minuto(s)"
```

The `(s)` pattern is a known i18n anti-pattern. Proper pluralization rules should be used instead.

### 5. ⚠️ LOW: Console JavaScript Errors

Recurring on every page load:
```
[ERROR] Not signed in with the identity provider.
[ERROR] [GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token.
Unexpected token '&'
```

These are Google Sign-In / FedCM related errors. May affect Google login button functionality.

### 6. ℹ️ LOW: Cookie Consent Banner Size on Mobile

Cookie consent banner (`zcnc-cc`) takes **426px** of vertical space on mobile — nearly half of an iPhone viewport (844px). This is a significant obstruction to content.

### 7. ❌ HIGH: IMAP Email Server Unreachable

Unable to verify email templates or translations — IMAP connections to both `zonacnc.com:993` and `mail.zonacnc.com:993` time out from the testing environment. **Email template verification skipped**.

---

## Passes ✅

| Check | Result |
|-------|--------|
| Horizontal overflow (all viewports) | ✅ No overflow |
| Mobile hamburger menu visibility | ✅ Visible and toggleable |
| Viewport meta tag | ✅ `width=device-width, initial-scale=1` |
| Category page (mobile) | ✅ No overflow, facets clean |
| Product detail (mobile) | ✅ Images/tables responsive |
| Language switching (ES→EN→CA) | ✅ All loads correctly |
| i18n — Spanish in English page | ✅ No contamination |
| No `user-scalable=no` restriction | ✅ Zoom allowed |
| Fixed elements don't break layout | ✅ Normal behavior |

---

## Screenshots

- `screenshot-mobile-390-home.png`
- `screenshot-tablet-768-home.png`
- `screenshot-mobile-390-category.png`
- `screenshot-mobile-390-product.png`

---

## Recommendation

1. **Increase touch targets** to ≥44×44px for interactive elements (carousel buttons, language selector, header links)
2. **Increase minimum font size** to ≥12px for body text
3. **Fix page titles**: `/es/module/zonacncproductadd/ads` and `/en/` homepage
4. **Fix i18n pluralization**: Replace `(s)` pattern with proper plural forms
5. **Investigate GSI/FedCM console errors** — may indicate broken Google Sign-In
6. **Investigate IMAP connectivity** — mail server unreachable from QA environment
