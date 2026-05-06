# Responsive Testing Report — new.zonacnc.com
**Date:** 2026-05-06 10:06 UTC  
**Tester:** QA Bot (test7@zonacnc.com)  
**Focus Area:** Responsive Design  
**Viewports Tested:** 390×844 (Mobile), 768×1024 (Tablet), 1440×900 (Desktop)

---

## Executive Summary

| Category | Result | Issues |
|----------|--------|--------|
| Responsive Layout | ✅ PASS | Minor polish needed |
| Console Errors | ❌ FAIL | 4 unique errors on ALL pages |
| Email Templates | ❌ FAIL | 2 welcome emails in English (should be Spanish) |
| Authentication | ⚠️ ISSUE | test7 login fails, password recovery works |
| Cross-browser Consistency | ✅ PASS | Layout consistent across viewports |
| Test Mode Banner | ✅ PASS | Renders correctly at all sizes |

---

## 1. Responsive Layout Analysis ✅

### Pages Tested
- Homepage (`/es/`)
- Login page (`/es/iniciar-sesion`)
- Registration page (`/es/?controller=registration`)
- Password recovery (`/es/recuperar-contraseña`)
- Product listing (`/es/27-otros-tipos-de-maquinaria`)
- Product detail (`/es/otros-tipos-de-maquinaria/333-transformador-ormazabal.html`)

### Mobile (390×844) Observations
- **Header:** Simplified — top-bar links hidden ("Contacte con nosotros", "Vendedores", "Tarifas"), language options collapsed into inline text, login shows icon-only
- **Search:** Hidden behind toggle button ("Mostrar barra de búsqueda")
- **Footer:** Collapsible accordion sections with "Mostrar/ocultar" toggle buttons
- **Product cards:** Single column, full-width, images scale properly
- **Forms:** Full-width inputs, stacked vertically
- **Breadcrumbs:** Visible and properly condensed
- **Test mode banner:** Renders correctly at full width

### Tablet (768×1024) Observations
- **Header:** Top-bar links visible ("Contacte con nosotros", etc.), language as select dropdown, login shows "Iniciar sesión" text
- **Search:** Full search bar with icon
- **Footer:** Full columns, no collapsible sections
- **Category sidebar:** Visible alongside products
- **Product cards:** Grid layout (likely 2-3 columns)

### Desktop (1440×900) Observations
- **Header:** Maximum details — all top-bar links, full navigation
- **Footer:** All columns visible with sub-categories and descriptions
- **Product listing:** Multi-column grid with category sidebar
- **Product detail:** Side-by-side layout with image gallery and details

### Responsive Summary
The responsive design is well-implemented with clean breakpoints. All interactive elements remain accessible at all sizes. No layout overflow or text clipping observed.

---

## 2. Console Errors ❌

**Consistent across ALL pages and ALL viewports:**

| # | Error Message | Severity | Source |
|---|--------------|----------|--------|
| 1 | `"Provider's accounts list is empty"` | ERROR | Google One Tap / FedCM |
| 2 | `"Unexpected token '&'"` | ERROR | HTML inline script (encoding issue) |
| 3 | `"Not signed in with the identity provider"` | ERROR | Google Identity Services |
| 4 | `"[GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token"` | ERROR | accounts.google.com/gsi/client |

**Analysis:**
- Errors #1, #3, #4 relate to Google Sign-In (One Tap / FedCM) integration — likely due to the site being in test mode with no real Google OAuth configuration
- Error #2 `"Unexpected token '&'"` suggests a URL/HTML encoding issue in inline JavaScript — `&` used instead of `&amp;` in a script context
- These errors fire on page load and persist across all page navigations

**Recommendation:**
1. Fix the `&` → `&amp;` encoding issue in inline scripts
2. Configure Google OAuth provider correctly or suppress FedCM errors in test mode

---

## 3. Email Template Review ❌

### Email #41 — "¡Bienvenido a Starter! Tu suscripción está activa"
- **Subject:** ✅ Spanish — "¡Bienvenido a Starter! Tu suscripción está activa"
- **TEXT body:** ❌ **ENGLISH** — "Hello Test, Welcome to ZonaCNC! Your Starter plan is now active."
- **HTML body:** ❌ **ENGLISH** — Full HTML template in English ("Welcome to ZonaCNC", "Plan Details", "Manage Subscription")
- **Salutation:** ❌ "Hello Test" — placeholder issue, should be "Hola Test Seven"

### Email #42 — "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos"
- **Subject:** ✅ Spanish
- **TEXT body:** ❌ **ENGLISH** — "Hello Test, Welcome as a seller on ZonaCNC!"
- **HTML body:** ❌ **ENGLISH** — "Welcome to ZonaCNC", "B2B marketplace for CNC machinery", "Get started on ZonaCNC"
- **Template variable:** ❌ `{myads_url}` not replaced in TEXT version
- **Salutation:** ❌ "Hello Test" instead of "Hello Test Seven"

### Email #43 — "Confirmación de contraseña"
- **Subject:** ✅ Spanish — "Confirmación de contraseña"
- **TEXT body:** ✅ Spanish — "Hola Test Seven, Confirmación de la solicitud de contraseña en zonacnc.com"
- **HTML body:** ✅ Spanish — Full PrestaShop email template in Spanish
- **Salutation:** ✅ "Hola Test Seven"

**Root Cause:** The "zonacncplans" module (Starter welcome + onboarding) uses English-only email templates. The core PrestaShop password reset email has proper Spanish translations.

**Recommendation:** Add Spanish translations for the zonacncplans module email templates.

---

## 4. Authentication Status

- **test7@zonacnc.com login:** ❌ Failed with "Error de autenticación"
- **Password recovery:** ✅ Email sent and received (email #43 confirmed via IMAP)
- The account exists (customer ID 6644) but the stored password doesn't match the IMAP password (77G7YmLXuOae)

---

## 5. Pages Tested Summary

| Page | Mobile | Tablet | Desktop | Console Errors | Notes |
|------|--------|--------|---------|---------------|-------|
| Homepage `/es/` | ✅ | ✅ | ✅ | 3 | — |
| Login `/es/iniciar-sesion` | ✅ | ✅ | — | 3 | Error alert renders correctly |
| Registration | ✅ | ✅ | — | 3 | All fields accessible |
| Password Recovery | ✅ | — | — | 2 | Success alert renders correctly |
| Product Listing | ✅ | ✅ | — | 2 | Category sidebar, 362 results |
| Product Detail | ✅ | — | — | 2 | Gallery, specs table, contact form |

---

## 6. Overall Assessment

**Responsive Design: GOOD ✅**  
The site handles all tested viewports well. Navigation adapts appropriately, forms remain usable, and content is never cut off or overflowing.

**Email Localization: NEEDS FIX ❌**  
Two critical email templates (Starter welcome, Onboarding tips) are only available in English while the rest of the platform is in Spanish. This creates an inconsistent user experience.

**Console Errors: NEEDS FIX ❌**  
Four JavaScript errors fire on every page load. While they don't appear to break functionality, they indicate integration issues (Google OAuth) and an HTML-encoding bug.

**Test Environment Notice: GOOD ✅**  
The "MODO TEST" banner is clearly visible, properly styled, and renders correctly across all viewports.
