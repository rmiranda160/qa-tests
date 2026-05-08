# Responsive QA Audit 2026-05-08 — new.zonacnc.com

**Test run:** 2026-05-08 03:35–03:45 UTC (CRON RESPONSIVE)
**Agent:** tester (OpenClaw) via MCP `pwmcp-zonacnc`
**Scope:** 10 pages × 4 viewports

---

## Pages audited
| # | Page | URL |
|---|------|-----|
| 1 | Home | `/es/` |
| 2 | Product Detail (PDP) | `/es/inicio/13212-saeilo-dialog-h-66.html` |
| 3 | Search / Browse | `/es/buscar` |
| 4 | Pricing | `/es/pricing` |
| 5 | Login | `/es/iniciar-sesion` |
| 6 | CMS / Cómo funciona | `/es/content/4-como-funciona` |
| 7 | Registration / Publicar | `/es/publicar` |
| 8 | Contact | `/es/contactenos` |
| 9 | Plans (module) | `/module/zonacncplans/pricing` |
| 10 | Category | `/es/15-tornos` |

## Viewports tested
| Name | Resolution | Result |
|------|-----------|--------|
| XS Mobile | 375×667 | ✅ No horizontal scroll |
| Mobile | 390×844 | ✅ No horizontal scroll |
| Tablet | 768×1024 | ❌ Dual header bug |
| Desktop | 1440×900 | ✅ No horizontal scroll |

---

## Findings

### 🔴 HIGH — Finding 1: Dual header at tablet breakpoint (768×1024px)

**Description:** At the tablet breakpoint (768px), both the Hummingbird desktop header (`#header .header-top`) and the PrestaShop mobile menu toggle (`.ps-mainmenu__mobile-toggle`) are visible simultaneously. The desktop header uses `d-none d-md-block` (shows at ≥768px) while the mobile toggle also activates at the same breakpoint, causing both UI layers to render at once.

**Evidence:**
- `header-top d-none d-md-block` → `display: block` at 768px
- `ps-mainmenu__mobile-toggle` → `display: flex` at 768px
- Both elements have `offsetParent !== null` (rendered in layout)

**Impact:** UI clutter with two overlapping navigation systems visible. Users see both the full desktop nav bar AND the mobile hamburger icon simultaneously from 768–991px.

**Screenshot:** `responsive-tablet-768x1024-dual-header-bug.png`

**Recommended fix:** Change Hummingbird's desktop header breakpoint from `md` (768px) to `lg` (992px), or hide the mobile toggle at `md` breakpoint. The `d-none d-md-block` classes on `.header-top` elements should become `d-none d-lg-block`, and the mobile toggle should use `d-md-none`.

**WCAG/Files affected:** `themes/hummingbird/templates/_partials/header.tpl`, `themes/hummingbird/assets/css/theme.css` — header-top responsive classes.

---

### 🔴 HIGH — Finding 2: PrestaShop mobile menu toggle has 0px computed width

**Description:** The PS mainmenu mobile toggle (`.ps-mainmenu__mobile-toggle`) renders with `width: 0px` at mobile viewport (390×844). The element is technically in the DOM and has `display: flex`, but its computed dimensions are 0×44px, making it invisible and non-functional.

**Evidence:**
```json
{
  "psToggle": {
    "classes": "ps-mainmenu__mobile-toggle",
    "display": "flex",
    "visible": true,
    "rect": { "x": 12, "y": 90, "width": 0, "height": 44 }
  }
}
```

- Bounding box: 12×90 to 12×134 — zero-width rectangle
- No child elements visible within the toggle

**Impact:** The official PS9/Hummingbird mobile menu trigger is broken. Only the ZonaCNC custom hamburger (`zcmn-hamburger`, 44×44px) works. Users relying on the standard PS menu cannot open it.

**Recommended fix:** Check CSS for `.ps-mainmenu__mobile-toggle` in `themes/hummingbird/assets/css/theme.css` or `modules/ps_mainmenu/`. The `width: 0` or missing `width` on flex children is likely caused by a CSS override from ZonaCNC custom modules (`modules/zonacnc*`).

---

### 🟡 MEDIUM — Finding 3: Hamburger menu click interception

**Description:** Two hamburger menu buttons coexist in the mobile header:
1. PrestaShop `.ps-mainmenu__mobile-toggle` — broken (width: 0), positioned at y=90px
2. ZonaCNC custom `.zcmn-iconbtn.zcmn-hamburger` — functional (44×44px), positioned at y=33.5px

When the PS toggle is rendered at tablet (768px), it visually overlaps the ZCNC hamburger, causing click interception. At mobile, the PS toggle has 0 width so interception is not an issue, but the broken element still occupies layout space.

**Impact:** At tablet breakpoint, users clicking the visible hamburger may trigger the wrong menu or no menu at all. At mobile, a dead element occupies header real estate.

**Recommended fix:** Remove or properly hide `.ps-mainmenu__mobile-toggle` when ZCNC custom hamburger is active. The ZCNC header should take full control of mobile navigation.

**Files affected:** Likely `modules/zonacnclistings/` or `modules/zonacncfeatured/` CSS overriding PS mainmenu styles.

---

### 🟡 LOW — Finding 4: Console errors on all pages (Google Sign-In + JS)

**Description:** Three console errors appear consistently across all audited pages:
1. `Provider's accounts list is empty.` — FedCM/Google One Tap
2. `[GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token.` — Google Sign-In
3. `Unexpected token '&'` — minor JS syntax error

**Impact:** Low. The Google Sign-In errors are expected in test environments without proper OAuth configuration (oauth module installed but disabled — needs Client ID/Secret, per zonacnc.md). The `Unexpected token '&'` may indicate an HTML entity being parsed as JS.

**Recommended fix:** 
- Install Google OAuth Client ID/Secret in BackOffice → Module `zonacncoauth` (id_module=93)
- Fix JS parsing of `&amp;` or `&` in inline scripts

---

## Summary

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | HIGH | Dual header at tablet (768px) — desktop + mobile visible | NEW |
| 2 | HIGH | PS mobile toggle 0px width — broken hamburger | NEW |
| 3 | MEDIUM | Hamburger click interception (two menu toggles) | NEW |
| 4 | LOW | Console errors (Google Sign-In + JS) | KNOWN |
| — | PASS | No horizontal scroll on any page/viewport | ✅ |

---

## IMAP email verification

Verified IMAP on **test7@zonacnc.com** (zonacnc.com:993):
- ✅ 18 emails in INBOX since May 7, 2026
- ✅ Registration confirmations, password resets, QA reports all delivered
- ✅ All emails in Spanish (ES) — templates use correct language
- ✅ Previous QA Accessibility report (2026-05-07) delivered and readable

---

*Report generated by tester cron QA (responsive focus), 2026-05-08 03:35–03:45 UTC*
