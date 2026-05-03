# Responsive Test Report — new.zonacnc.com (v3)

**Date:** 2026-05-02  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**User:** test19@zonacnc.com  
**Scope:** Home, Search, Category (Maquinaria Metal), Pricing — ESP España  
**Viewports:** Mobile (390×844), Tablet (768×1024), Desktop (1440×900)  
**Mode:** responsive  
**Commit:** CRON QA test19@zonacnc.com

---

## Summary

| Metric | Result |
|--------|--------|
| Pages tested | 4 (Home, Search, Category, Pricing) |
| Viewports tested | 3 (390×844, 768×1024, 1440×900) |
| **Actual layout breakages** | **0** — all pages clean across all viewports |
| **Horizontal scrollbar** | **None** detected |
| **Login page HTTP 500** | **❌ STILL BROKEN** (confirmed from previous report) |
| Console errors | None |
| Registration | ✅ test19@zonacnc.com registered & logged in successfully |

---

## Test Results Matrix

### Mobile (390×844)

| Page | HTTP | Horizontal Scroll | Layout Issues | Text Overflows (benign) | Status |
|------|------|-------------------|---------------|------------------------|--------|
| Home `/es/` | 200 | No | None | 9 (skip-link, footer toggles, category truncation) | ✅ PASS |
| Search `/es/buscar?search_query=torno` | 200 | No | None | 19 (skip-link, product desc line-clamp, footer toggles) | ✅ PASS |
| Category `/es/28-maquinaria-metal` | 200 | No | None | 14 (skip-link, product desc line-clamp, footer toggles) | ✅ PASS |
| Pricing `/es/module/zonacncplans/pricing` | 200 | No | None | 7 (skip-link, footer toggles) | ✅ PASS |

### Tablet (768×1024)

| Page | HTTP | Horizontal Scroll | Layout Issues | Text Overflows (benign) | Status |
|------|------|-------------------|---------------|------------------------|--------|
| Home | 200 | No | None | 8 (skip-link, search label, footer descriptions, category truncation) | ✅ PASS |
| Search | 200 | No | None | 11 (skip-link, product desc line-clamp, footer descriptions) | ✅ PASS |
| Category | 200 | No | None | 17 (skip-link, product desc clipping, footer descriptions) | ✅ PASS |
| Pricing | 200 | No | None | 6 (skip-link, footer descriptions) | ✅ PASS |

### Desktop (1440×900)

| Page | HTTP | Horizontal Scroll | Layout Issues | Text Overflows (benign) | Status |
|------|------|-------------------|---------------|------------------------|--------|
| Home | 200 | No | None | 8 (skip-link, search label, footer descriptions, category truncation) | ✅ PASS |
| Search | 200 | No | None | 10 (skip-link, product desc line-clamp, footer descriptions) | ✅ PASS |
| Category | 200 | No | None | 11 (skip-link, product desc line-clamp, footer descriptions) | ✅ PASS |
| Pricing | 200 | No | None | 6 (skip-link, footer descriptions) | ✅ PASS |

---

## Bugs Found

### BUG-001 (PRE-EXISTING): Login page returns HTTP 500
- **URL:** `https://new.zonacnc.com/es/iniciar-sesion`
- **Severity:** **Critical**
- **Status:** **STILL BROKEN** — confirmed on 2026-05-02
- **Impact:** Users cannot log in through the standard login page. Registration works via direct `/es/?controller=registration`.
- **First reported:** 2026-05-01

---

## Responsive Analysis

### False Positive Notes
The automated text overflow detector flagged several elements that are intentionally styled with `overflow: hidden` and `white-space: nowrap`. These are **not real responsive bugs**:

| Element | Reason |
|---------|--------|
| "Ir al contenido principal" | Skip-to-content link (WCAG accessibility); off-screen until focused |
| "Volver arriba" | Back-to-top button; off-screen until triggered |
| Footer toggle labels | `white-space: nowrap` + `overflow: hidden` for section headers (Mostrar/ocultar...) |
| "Buscar anuncios" `<label>` | Label clipped inside search box; intentional |
| Category sidebar names | Single-line truncation with ellipsis; intentional |
| Footer description texts | Long `white-space: nowrap` text in "Nuestra empresa" footer section — these are intentionally hidden with overflow:hidden as they're `<span>` descriptions paired with the link text |

### Real Responsive Assessment

| Area | Mobile (390px) | Tablet (768px) | Desktop (1440px) |
|------|---------------|----------------|-------------------|
| Header | Clean; hamburger menu for nav | Clean; top bar & full search visible | Clean; all elements visible |
| Hero section | Clean; content wraps | Clean | Clean |
| Product cards | Single column, clean | 2-column grid, clean | Multi-column grid, clean |
| Search results | Clean; cards stack | Clean; cards in grid | Clean; full width |
| Category page | Clean; product list stacks | Clean | Clean |
| Pricing page | Clean; plan cards stack | Clean; side-by-side | Clean; full layout |
| Footer | Long but no overflow | Long but no overflow | Clean multi-column |
| Horizontal scroll | None | None | None |

### UX Observations (Non-Blocking)
1. **Footer on mobile:** Multi-column layout with 50+ links, no accordion. Functionally correct but long. Consider collapsible sections.
2. **Product description line-clamping:** Some cards clip descriptions at different heights. This is standard CSS line-clamp behavior and works as expected.

---

## Conclusion

**✅ Responsive PASS** — 4 pages × 3 viewports = 12 combinations, zero real responsive breakages. No horizontal scroll, no layout overflow, no console errors.

The only critical issue is BUG-001 (Login page HTTP 500), which persists from previous reports and should be addressed separately.

---

*Report generated by CRON QA — test19@zonacnc.com*
