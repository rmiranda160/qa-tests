# CRON QA Responsive — 2026-05-06 12:18 UTC

| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| ⚠️ PASS with issues | Responsive + Email templates tested: 6 pages × 3 viewports | TBD | TBD |

**Scope:** new.zonacnc.com only  
**Test Email:** test25@zonacnc.com (pool: test7-test30)  
**Test Mode:** Manual responsive via MCP browser (Playwright remote server unavailable)  
**Viewports:** Desktop 1440×900, Tablet 768×1024, Mobile 390×844

---

## Pages Tested

| Page | URL | Status |
|------|-----|--------|
| Home | `/es/` | ✅ OK |
| Login | `/es/iniciar-sesion` | ✅ OK |
| Registration | `/es/?controller=registration` | ⚠️ Title "zonacnc.com" |
| Category Listing | `/es/28-maquinaria-metal` | ✅ OK |
| Product Detail | `/es/brocas-de-plaquitas/12881-...` | ✅ OK |
| Contact | `/es/contactenos` | ⚠️ URL inconsistency |
| Password Recovery | `/es/recuperar-contraseña` | ⚠️ URL encoding issue |

---

## Findings

### ❌ CRITICAL: 404 Errors on Expected URLs

| Expected URL | Actual | Status |
|---|---|---|
| `/es/registro` | 404 | Must use `/es/?controller=registration` |
| `/es/contacto` | 404 | Must use `/es/contactenos` |
| `/es/recuperar-contrasena` (with n) | 404 | Must use ñ: `/es/recuperar-contraseña` |

**Impact:** Users typing common Spanish URLs get 404. SEO impact and broken internal links.

### ⚠️ MEDIUM: Small Touch Targets (WCAG 2.5.5)

All pages show 50–100 interactive elements below the 44×44px minimum touch target at mobile (390px). Examples:
- Language selector: 153×38
- Category button: 61×37
- Brand logo link: 128×28
- Navigation elements across footer/menu

**Impact:** Harder to use on touch devices, affects accessibility compliance.

### ⚠️ LOW: Small Text (<12px)

Homepage has 20–27 text elements with font-size below 12px at all viewports. Affects readability, especially on mobile.

### ⚠️ LOW: Registration Page Title

Registration page (`/es/?controller=registration`) has title `zonacnc.com` instead of a descriptive title like "Registro — ZonaCNC".

---

## Email Template Analysis (test25@zonacnc.com via IMAP)

### ❌ CRITICAL: Typo in Password Reset Subject
- **Subject:** `[zonacnc.com] Confirmación decontraseña`
- **Issue:** Missing space between "de" and "contraseña"
- **All password reset emails** (emails #14, #16) have this typo

### ⚠️ MEDIUM: Inconsistent Sender Branding
- Transactional emails (password reset, welcome): From `"zonacnc.com"` (lowercase)
- Subscription emails (Stripe): From `"ZonaCNC"` (proper casing)
- **Impact:** Brand inconsistency across email communications

### ⚠️ LOW: Default PrestaShop Footer
- Password changed email: Contains "Powered by PrestaShop"
- Password reset email: Contains PrestaShop reference in footer
- **Impact:** Unbranded transactional emails expose platform identity

### ✅ Positive Findings
- Welcome email has proper security tips
- Password reset emails include clear instructions and warnings
- Subscription emails (Stripe module) well-branded and informative
- HTML emails render with logo and proper structure

---

## Responsive Scorecard

| Check | Home | Login | Register | Category | Product | Contact | Pwd Reset |
|-------|------|-------|----------|----------|---------|---------|-----------|
| No horizontal overflow | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Viewport meta tag | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Form inputs visible | N/A | ✅ | ✅ | N/A | N/A | ⚠️ | ✅ |
| Images responsive | ✅ | N/A | N/A | ✅ | ✅ | N/A | N/A |
| Mobile navigation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cookie consent banner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Test Environment
- **Browser:** Chromium via MCP remote
- **Date:** 2026-05-06 12:16–12:25 UTC
- **Method:** Manual responsive evaluation + IMAP email verification
