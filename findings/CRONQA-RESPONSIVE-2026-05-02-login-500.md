# 📱 Responsive QA Finding — new.zonacnc.com (Login 500 Persists)

**Date:** 2026-05-02 21:33 UTC  
**Tester:** CRON_QA (responsive focus)  
**Email used:** test7@zonacnc.com (pre-registered, but all test7-test30 emails exist)  
**Browser:** Chromium via MCP remoto (pwmcp-zonacnc)  
**Scope:** https://new.zonacnc.com/es/ — core public pages + auth pages  
**Mode:** Responsive + functional

---

## Summary

The site has **partially recovered** from the earlier full outage (14:43 UTC report). Public pages now serve content correctly, but **authentication pages remain broken** with HTTP 500.

| Endpoint | Status | Response |
|---|---|---|
| Homepage `/es/` | ✅ 200 | Full content renders |
| Pricing `/es/pricing` | ✅ 200 | Full content renders |
| Sellers `/es/vendedores` | ✅ 200 | Full content renders |
| Contact `/es/contactenos` | ✅ 200 | Full content renders |
| Create Ad `/module/zonacncproductadd/ads` | ✅ 200 | Multi-step form renders |
| Search `/es/buscar` | ✅ 200 | Search page renders |
| Registration `/?controller=registration` | ✅ 200 | Form renders, validation works |
| **Login `/es/iniciar-sesion`** | **❌ 500** | **Empty body** |
| **My Account `/es/mi-cuenta`** | **❌ 500** | **Empty body** |

---

## Responsive Results

No horizontal overflow, text cutoff, or layout breakage on any of the working pages across all viewports:

| Viewport | Overflow Issues |
|---|---|
| 375×667 (mobile) | 0 |
| 390×844 (mobile) | 0 |
| 768×1024 (tablet) | 0 |
| 1280×720 (desktop) | 0 |
| 1440×900 (desktop) | 0 |

---

## 🔴 Critical Bug: Login & My Account HTTP 500

### Reproduction
```
GET https://new.zonacnc.com/es/iniciar-sesion → HTTP 500 (0 bytes body)
GET https://new.zonacnc.com/es/mi-cuenta → HTTP 500 (0 bytes body)
```

### Impact
- Users **cannot log in** to existing accounts
- Users **cannot access** their account dashboard
- The "Iniciar sesión" header link on every page points to a broken endpoint
- Google OAuth flow (`/module/zonacncoauth/google`) likely fails as it redirects to the broken login page
- The "Crear una cuenta" link in the footer works (registration succeeds), but post-registration redirect likely fails too
- Blocks all seller/ buyer flows that require authentication

### Technical Context
- Server: nginx
- PHP: 8.3.30
- Platform: PrestaShop (Hummingbird theme)
- Response: Empty body, content-length: 0, no error details exposed

---

## Registration Page Functional Test

- Navigated to `/es/?controller=registration` ✅
- Form fields: Nombre, Apellidos, Empresa, NIF, Email, Password, Fecha de nacimiento ✅
- Checkboxes: opt-in, newsletter, GDPR terms, privacy policy ✅
- Validation: correct handling of duplicate emails ("ya está en uso") ✅
- Submit button functional ✅

All emails test7@zonacnc.com through test30@zonacnc.com are already registered (from prior test sessions).

---

## Conclusion

**Responsive layout PASS** — no regressions on any working page.  
**Critical functional FAIL** — login/my-account HTTP 500 persists, partially blocking all authenticated flows.  
Server-side fix is needed for the authentication controller (`AuthController` or its dependencies).
