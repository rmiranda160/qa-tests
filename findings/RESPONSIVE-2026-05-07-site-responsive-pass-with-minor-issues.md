# 📱 Responsive QA Report — new.zonacnc.com

**Date:** 2026-05-07 05:07 UTC
**Cron ID:** 53983183-66c6-4b72-9b21-404aac116c60
**Focus:** responsive
**Email pool:** test7-test30@zonacnc.com (used test7@zonacnc.com)
**Browser:** Chromium via MCP remoto (pwmcp-zonacnc)
**Scope:** https://new.zonacnc.com — strict

---

## ✅ OVERALL RESULT: PASS (with minor findings)

| Category | Status | Notes |
|----------|:------:|-------|
| Site availability | ✅ UP | All routes return 200 |
| Mobile (390×844) | ✅ PASS | No horizontal overflow on any page |
| Tablet (768×1024) | ✅ PASS | 2-column grid, no overflow |
| Desktop (1440×900) | ✅ PASS | 5-column grid, no overflow |
| Viewport meta | ✅ PASS | `width=device-width, initial-scale=1` |
| Email templates | ⚠️ MINOR | Welcome email in EN for ES account |
| Touch targets | ⚠️ MINOR | Footer links below WCAG 44px |

---

## 📊 Detailed Responsive Test Results

### Viewport: 390×844 (Mobile)

| # | Page | URL | Overflow | Key Metrics | Status |
|---|------|-----|:---:|------|:---:|
| 1 | Home (ES) | `/es/` | ❌ No | 1-col products (334px), hamburger menu ✅ | ✅ PASS |
| 2 | Home (EN) | `/en/` | ❌ No | lang="en-US", lang switcher ✅ | ✅ PASS |
| 3 | Login | `/es/iniciar-sesion` | ❌ No | Inputs 366×44, submit 366×44 | ✅ PASS |
| 4 | Registration | `/es/?controller=registration` | ❌ No | Inputs 366×38, social login present | ✅ PASS |
| 5 | Search | `/es/buscar` | ❌ No | Products 334px, filter sidebar visible | ✅ PASS |
| 6 | Contact | `/es/contactenos` | ❌ No | Textarea 366×86, form fields responsive | ✅ PASS |
| 7 | Pricing | `/es/pricing` | ❌ No | Cards stack vertically (366/334px) | ✅ PASS |
| 8 | Product | `/es/inicio/13166-...` | ❌ No | Full-width 390px, CTAs 364×44 | ✅ PASS |
| 9 | Password Recovery | `/es/recuperar-contraseña` | ❌ No | Alert message, "Volver al login" link | ✅ PASS |

### Viewport: 768×1024 (Tablet)

| # | Page | URL | Overflow | Key Metrics | Status |
|---|------|-----|:---:|------|:---:|
| 1 | Home (ES) | `/es/` | ❌ No | 2-col articles (360px each) | ✅ PASS |

### Viewport: 1440×900 (Desktop)

| # | Page | URL | Overflow | Key Metrics | Status |
|---|------|-----|:---:|------|:---:|
| 1 | Home (ES) | `/es/` | ❌ No | 5-col articles (269px each), all fit | ✅ PASS |

---

## 📧 Email Verification

### Email #50: Welcome Email (2026-05-07 02:24 UTC)

| Property | Value |
|----------|-------|
| Subject | Welcome! |
| HTML lang | Not found in headers |
| Title | Message from zonacnc.com |
| Language | **English** |
| Account locale | **Spanish (ES)** |

**⚠️ Finding:** Welcome email sent in English for a Spanish-registered account (test7@zonacnc.com registered on `/es/`). Body starts with "Hi Test Seven" and links point to `https://www.zonacnc.com/en/` instead of `/es/`. The email template should respect the user's registration locale.

### Email #51: Password Reset (2026-05-07 05:15 UTC)

| Property | Value |
|----------|-------|
| Subject | Solicitud de Contraseña |
| Title | Solicitud de Contraseña |
| Language | **Spanish** ✅ |
| Template issues | None |

✅ Password reset email correctly sent in Spanish with proper encoding. No unresolved placeholders, no mixed language.

---

## 🔍 Minor Issues

### 1. ⚠️ RES-001: Welcome Email Language Mismatch
- **Severity:** Low
- **Description:** Welcome email (#50) sent in English for a Spanish-registered account. Body: "Hi Test Seven" instead of "Hola Test Seven". Links in email point to `/en/` instead of `/es/`.
- **Impact:** Confusing for Spanish-speaking users who registered on the Spanish site.
- **Recommendation:** Use the locale from user registration context to select email template language.

### 2. ⚠️ RES-002: Footer Touch Targets Below WCAG Minimum
- **Severity:** Low
- **Description:** Footer category links (e.g., "Otros tipos de maquinaria", "Tornos") have a height of only 20px on mobile, well below the WCAG 2.1 SC 2.5.8 minimum of 44×44 CSS pixels for touch targets.
- **Impact:** Difficult to tap accurately on mobile devices.
- **Affected elements:** All footer navigation links in "Categorías destacadas" and "Marcas líderes" sections.
- **Recommendation:** Increase line-height or padding on footer links to meet 44px minimum.

### 3. ⚠️ RES-003: Footer Expand/Collapse Buttons Too Small
- **Severity:** Low
- **Description:** Footer section toggle buttons ("Mostrar/ocultar enlaces de...") render at 24×26px on mobile, severely below the 44px minimum touch target.
- **Impact:** Very difficult to tap accurately.
- **Recommendation:** Increase button size to at least 44×44px.

### 4. ⚠️ RES-004: Registration Page Title Not Descriptive
- **Severity:** Trivial
- **Description:** The registration page (`/?controller=registration`) has `<title>zonacnc.com</title>` instead of a descriptive title like "Registro — ZonaCNC".
- **Impact:** Poor SEO and accessibility for screen readers.
- **Recommendation:** Set a proper page title.

### 5. ⚠️ RES-005: Console Errors on All Pages
- **Severity:** Trivial
- **Description:** Multiple pages show console error: "Provider's accounts list is empty" and "Unexpected token '&'". These appear on every tested page.
- **Impact:** May indicate a JavaScript module or integration issue (possibly Google OAuth provider).
- **Recommendation:** Investigate and fix the provider accounts configuration.

---

## 📈 Comparison with Previous Run

| Metric | 2026-05-06 23:21 | 2026-05-07 05:07 |
|--------|:---:|:---:|
| Site available | ❌ 500 | ✅ UP |
| Homepage loads | ❌ | ✅ |
| Login loads | ❌ | ✅ |
| Search works | ❌ | ✅ |
| Registration loads | ❌ | ✅ |
| Horizontal overflow | N/A | ✅ None |
| Viewport meta | N/A | ✅ Present |
| Email templates verified | ❌ | ✅ |

**Improvement:** Site recovered from the 500 outage documented in the previous run. All routes functional.

---

## Conclusion

The responsive design of new.zonacnc.com is working well across all tested viewports. No critical responsive issues were found. The site has recovered from the previous 500 outage. Five minor issues were identified:

1. Welcome email language mismatch (EN for ES account)
2. Footer touch targets too small (20px vs 44px minimum)
3. Footer toggle buttons too small (24×26px)
4. Registration page title not descriptive
5. Console errors on all pages

All issues are low-severity or trivial. No blocking responsive problems.

---

*Generated by CRON QA tester-responsive — 2026-05-07 05:07 UTC*
