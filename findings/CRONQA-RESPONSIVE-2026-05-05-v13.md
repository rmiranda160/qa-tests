# CRON QA Responsive Testing — 2026-05-05

**Cron ID**: `53983183-66c6-4b72-9b21-404aac116c60`  
**Focus Area**: Responsive  
**Target**: `https://new.zonacnc.com`  
**Date**: 2026-05-05 17:21 UTC  
**Tester**: QA Agent (MCP browser `pwmcp-zonacnc`)  
**Accounts**: test7-test30@zonacnc.com (IMAP verified: ✅ reachable)  
**Escenarios**: 1/1 ✅ Completed  

---

## Test Matrix

| Viewport | Width | Height | Pages Tested |
|----------|-------|--------|-------------|
| Small Mobile | 320px | 568px | Homepage |
| Mobile        | 390px | 844px | Homepage, Login, Product Detail, Search, Publish |
| Tablet        | 768px | 1024px | Homepage |
| Desktop       | 1440px| 900px | Homepage |

**Total pages tested across viewports**: Homepage (×4), Login (×1), Product Detail (×1), Search/Browse (×1), Publish (×1)

---

## Summary

| Result | Details |
|--------|---------|
| **Overall** | ✅ PASS — No critical responsive issues found |
| Horizontal overflow | ✅ None at any viewport |
| Viewport meta tag | ✅ `width=device-width, initial-scale=1` present |
| Elements wider than viewport | ✅ None |
| Mobile menu visible | ✅ Yes (24×26px toggle present) |
| Language selector | ✅ Visible at all viewports |
| Footer responsive | ✅ Collapsible sections work |

---

## Findings

### 1. ⚠️ MEDIUM: Touch Targets Below WCAG 2.5.5 Minimum (44×44px)

**Recurring finding — confirmed present on 2026-05-05.**

| Viewport | # Elements < 44px |
|----------|-------------------|
| Desktop (1440×900) | 62 |
| Tablet (768×1024) | 61 |
| Mobile (390×844) | 52 |

Consistent across all viewports. Common small targets include language selector, footer toggles (24×26px), navigation links, product carousel buttons.

**Impact**: WCAG 2.5.5 requires minimum 44×44px touch target size. Difficult to tap accurately on mobile/tablet devices.

### 2. ⚠️ LOW: Small Font Sizes at 320px Viewport

At 320×568px viewport, 7 text elements have `font-size < 12px`:

| Element count | Font Size | Context |
|---------------|-----------|---------|
| 7 | < 12px | Various labels/text throughout page |

**Impact**: Minor readability concern at the narrowest viewports. Below recommended 12px minimum for body text.

### 3. ⚠️ LOW: 404 on /es/registro

- URL: `https://new.zonacnc.com/es/registro`
- Returns: **Error 404**
- Registration page does not exist at this URL. The login page offers registration via a different path (`?controller=registration`).

**Impact**: Any hardcoded links or user attempts to access `/es/registro` directly will fail.

### 4. ℹ️ INFO: Console Errors (Non-responsive, unchanged)

Recurring across all pages, unrelated to responsive behavior:

```
[ERROR] Not signed in with the identity provider.
[ERROR] [GSI_LOGGER]: FedCM get() rejects with NetworkError.
Unexpected token '&'
```

These are Google Sign-In / FedCM related errors from external scripts.

### 5. ℹ️ INFO: Footer Accordion Toggle Size

Footer section toggles ("Mostrar/ocultar enlaces de legal/marketplace/...") are 24×26px on mobile — below the 44px touch target minimum. These are Bootstrap `stretched-link collapsed d-md-none` buttons.

---

## IMAP Verification

| Account | Status |
|---------|--------|
| test7@zonacnc.com | ✅ 37 messages — latest: "Welcome!" (2026-05-05 19:15 CEST) |
| All test7-test30 | ✅ Pool available |

---

## Page-by-Page Results

| Page | URL | Mobile (390) | Tablet (768) | Desktop (1440) | 320px |
|------|-----|--------------|--------------|-----------------|-------|
| Home | `/es/` | ✅ | ✅ | ✅ | ✅ |
| Login | `/es/iniciar-sesion` | ✅ | — | — | — |
| Product Detail | `/es/corte-por-plasma/12906-...` | ✅ | — | — | — |
| Search/Browse | `/es/buscar` | ✅ | — | — | — |
| Publish | `/es/publicar` | ✅ | — | — | — |

All pages: No horizontal overflow, no elements wider than viewport, proper layout adaptation.

---

## Regression Check vs Previous CRON (2026-05-04 v12)

| Finding | 2026-05-04 Status | 2026-05-05 Status |
|---------|-------------------|-------------------|
| Touch targets < 44px | ⚠️ 55-65 elements | ⚠️ 52-62 elements (unchanged) |
| Small fonts < 12px | ⚠️ 7 elements | ⚠️ 7 elements (at 320px) |
| Console GSI errors | ⚠️ Present | ⚠️ Present (unchanged) |
| Page title issues | ⚠️ /ads generic title | Not retested |
| i18n "(s)" pattern | ⚠️ On password recovery | Not retested |
| /es/registro 404 | Not reported | ⚠️ NEW finding |

---

## Conclusion

✅ **Responsive testing PASSED** — No critical responsive issues found. The site adapts correctly across all tested viewports (320px to 1440px). No horizontal overflow detected on any page. The persistent touch-target-size findings remain the main area for improvement but are not regressions.

Minor new finding: `/es/registro` returns 404 (registration works via `?controller=registration` parameter).
