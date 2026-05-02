# CRON-QA Report: Responsive — Mis anuncios (mobile 375×812)

**Date:** 2026-05-01T10:20 UTC  
**Tester:** agent:tester  
**Focus area:** responsive  
**Target:** https://new.zonacnc.com/es/module/zonacncproductadd/myads  
**Viewport:** 375×812 (mobile)  
**User:** test3@zonacnc.com (Pro vendor, 4 ads)

---

## Summary

**BUG FOUND** → Action button labels overflow at 375px viewport. Fixed in PR #965.

## Bugs Found

### B1 — Action buttons cramped at 375px (CRITICAL)
4 buttons (Editar, Desactivar, Boost 24h, Eliminar) forced into a single row at ~75px each. "Desactivar" (91px needed) and "Boost 24h" (86px needed) overflow.

### B2 — No dedicated mobile breakpoint
The only responsive rule is `≤768px`. No handling for actual phone viewports.

## Action Buttons Verification (Regla Miranda)

| Button | Visible | Clickable | Functional | Status |
|---|---|---|---|---|
| Editar (edit) | ✅ | ✅ → URL form with edit=1&id_product=X | ✅ | PASS |
| Desactivar (visibility) | ✅ | ✅ → AJAX toggle_active | ✅ | PASS |
| Boost 24h (★) | ✅ disabled | ✅ blocked (no boosts) | ✅ shows toast | PASS |
| Eliminar (delete) | ✅ | ✅ → opens modal | ✅ | PASS |
| Si, eliminar (modal) | exists | ✅ → AJAX delete | ✅ | PASS |
| Historial (link) | ✅ | ✅ | ✅ | PASS |
| Comprar Boosts (link) | ✅ | ✅ | ✅ | PASS |

## Layout Issues

- No horizontal overflow detected ✅
- Cards stack vertically ✅
- Image takes full width on mobile ✅
- ✅ **OK** | Search bar + "Publicar nuevo anuncio" wrap correctly
- ✅ **OK** | Footer responsive with collapsible sections
- ✅ **OK** | Breadcrumb visible
- ❌ **Action buttons overflow** — see B1

## Resolution

### Fix applied (PR #965)
- **Branch:** `fix/responsive-myads-buttons-mobile-20260501`
- **File:** `modules/zonacncproductadd/views/templates/front/myads.tpl`
- **Changes:** Added 2 media queries:
  - `≤520px`: grid 2×2 columns for action buttons
  - `≤380px`: icon-only mode, hide text labels

### References
- PR: https://github.com/Veleta-Com-y-Serv/new.zonacnc.com/pull/965
- Issue: https://github.com/Veleta-Com-y-Serv/new.zonacnc.com/issues/967
- Label: `qa-responsive`
