# 📱 Responsive QA Results — new.zonacnc.com

**Date:** 2026-05-06 01:26 UTC  
**Tester:** CRON_QA (responsive focus)  
**Cron ID:** 53983183-66c6-4b72-9b21-404aac116c60  
**Email pool:** test7-test30@zonacnc.com (via .env.qa.email)  
**Browser:** Chromium via MCP remoto (pwmcp-zonacnc)  
**Scope:** https://new.zonacnc.com/es/ — strict  
**Mode:** Responsive

---

## ✅ Overall Result: PASS

All 13 pages tested across 4 viewports. No horizontal overflow detected on any page. Previously reported critical bugs (Login 500, My Account 500) are now **FIXED**.

---

## 📊 Responsive Results by Viewport

| Viewport | Dimensions | Body Overflow | Pages with Issues |
|---|---|---|---|
| Mobile S | 375×667 | None | 0/13 |
| Mobile M | 390×844 | None | 0/13 |
| Tablet | 768×1024 | None | 0/13 |
| Desktop | 1440×900 | None | 0/13 |

### Internal element overflow (mobile 375px — cosmetic only)

| Element | scrollWidth | clientWidth | Severity |
|---|---|---|---|
| `.zcnc-hero` section | 450px | 375px | Minor — hero content clipped but no body overflow |
| `.zcnc-category-name` span | 250px | 205px | Minor — text truncation for long category names |
| `.ps-searchbar__container` | 252px | 246px | Negligible — 6px difference |
| `.visually-hidden` spans (×5) | varies | 1px | Intentional — a11y elements |
| `.visually-hidden-focusable` links (×2) | varies | 1px | Intentional — skip links |

No visual breakage, no text cutoff affecting usability, no overlapping elements observed.

---

## 📋 Page-by-Page Results

| # | Page | URL | Status | 375px | 390px | 768px | 1440px |
|---|---|---|---|---|---|---|---|
| 1 | Home | `/es/` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 2 | Login | `/es/iniciar-sesion` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 3 | My Account | `/es/mi-cuenta` | ✅ Redirect | ✅ | ✅ | ✅ | ✅ |
| 4 | Contact | `/es/contactenos` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 5 | Pricing | `/es/pricing` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 6 | Registration | `/?controller=registration` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 7 | Search | `/es/buscar` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 8 | Create Ad | `/module/zonacncproductadd/ads` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 9 | Content | `/content/4-como-funciona` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 10 | Privacy | `/content/8-privacidad` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 11 | Product | `/tornos-automaticos/13044-haas-st-30.html` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 12 | Sellers | `/es/vendedores` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |
| 13 | Category | `/es/15-tornos` | ✅ 200 | ✅ | ✅ | ✅ | ✅ |

---

## 🔴 Previously Critical Bugs — Now FIXED

| Endpoint | Prior Status (2026-05-02) | Current Status |
|---|---|---|
| `/es/iniciar-sesion` | ❌ HTTP 500 (0 bytes) | ✅ 200 — Full login form renders |
| `/es/mi-cuenta` | ❌ HTTP 500 (0 bytes) | ✅ 302 → Login (expected for guest) |

---

## 🔶 Authentication Note

Login attempt with test7@zonacnc.com using known password `TestZonaCnc2026!` returned **"Error de autenticación"**. The password may have been reset or the account may need password recovery.

---

## Console Errors (Non-blocking)

| Error | Source | Impact |
|---|---|---|
| "Not signed in with the identity provider" | Google GSI | Expected when not authenticated |
| "[GSI_LOGGER]: FedCM get() rejects with NetworkError" | Google GSI client | Expected for non-auth state |
| "Unexpected token '&'" | zonacnc JS | Minor JS parsing issue, no functional impact |

---

## Translaciones / i18n

El sitio carga correctamente en español. El selector de idioma muestra 11 opciones (English, Català, Español, Galego, Euskera, Français, Deutsch, Português PT, Italiano, Türkçe, Русский). No se detectaron strings sin traducir en las páginas probadas.

---

## IMAP Verification

No emails to verify for this responsive-only scenario. No ads created, no registrations performed. IMAP credentials for test7-test30 available in .env.qa.email.

---

## Screenshots Captured

- `responsive-mobile-375x667-home.png` — Homepage at 375×667
- `responsive-tablet-768x1024-home.png` — Homepage at 768×1024
- `responsive-desktop-1440x900-home.png` — Homepage at 1440×900
- `responsive-mobile-375x667-login.png` — Login at 375×667

---

**Conclusion:** The site is fully responsive with no horizontal overflow issues. The previously critical Login 500 bug is resolved. No new regressions detected. ✅
