# Issue: Login/Auth Pages HTTP 500 + 404 — Registration + Login Completely Broken

**Reported:** 2026-05-02 22:23 UTC  
**Reporter:** CRON_QA (responsive focus, test21@zonacnc.com)  
**Severity:** 🔴 Critical  
**Component:** PrestaShop authentication module  

## Description

The login page at `/es/iniciar-sesion` returns **HTTP 500 Internal Server Error**. All common registration URL paths return **HTTP 404 Not Found**. This makes it completely impossible to create new accounts or log in to existing ones.

Unlike the earlier site-wide 500 outage (resolved), the public pages (homepage, search, categories, pricing) now load correctly — only the authentication endpoints are broken.

## Reproduction

```bash
# Login page → 500
curl -s -o /dev/null -w "%{http_code}" https://new.zonacnc.com/es/iniciar-sesion
# → 500

# Registration paths → 404
curl -s -o /dev/null -w "%{http_code}" https://new.zonacnc.com/es/registro
# → 404

curl -s -o /dev/null -w "%{http_code}" https://new.zonacnc.com/es/register
# → 404

# Auth-protected pages → fail
curl -s -o /dev/null -w "%{http_code}" https://new.zonacnc.com/es/mi-cuenta
# → HTTP error
```

## Affected URLs

| URL | Status | Expected Behavior |
|-----|--------|-------------------|
| `/es/iniciar-sesion` | 500 | Login form |
| `/es/registro` | 404 | Registration form |
| `/es/register` | 404 | Registration form (alt path) |
| `/es/crear-cuenta` | 404 | Registration form (alt path) |
| `/es/mi-cuenta` | Error | Protected user dashboard |

## Console Errors

- `Provider's accounts list is empty.`
- `Not signed in with the identity provider.`

## Impact

- **Cannot register** new test accounts (blocks all CRON_QA workflows requiring auth)
- **Cannot log in** with any existing account
- **Cannot test** seller dashboard, product creation, or any authenticated flow
- **"Empezar gratis" button** redirects to listing creation which requires auth

## Responsive Impact

While the public-site responsive layout is functional, the auth block prevents testing of:
- Login form responsive layout
- Registration form responsive layout
- Seller dashboard (mobile/tablet/desktop)
- Product creation flow responsiveness
- Account settings responsive views

## Suggested Actions

1. Debug the PrestaShop authentication module (`ps_customersignin` / authentication controller)
2. Check for missing database tables or corrupted module configuration
3. Verify that the identity provider configuration is complete
4. Check PHP error logs for the specific 500 error details
5. Add proper registration URL route (`/es/registro`) if missing from routing table
