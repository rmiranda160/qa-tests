# CRON QA Finding · Login Page HTTP 500 (Blocking Authentication)

> **Date:** 2026-05-02 15:14 UTC (re-confirmed)
> **First identified:** 2026-05-01 (prior run)
> **Focus:** stripe-billing
> **Endpoint:** `/es/iniciar-sesion` and `/es/?controller=authentication`
> **Environment:** new.zonacnc.com (MODO TEST)
> **Priority:** 🔴 CRITICAL (blocks all login-dependent testing)

---

## Finding

The login/authentication controller on new.zonacnc.com returns an **HTTP 500 Internal Server Error**, making it impossible to authenticate any user through the standard web interface or API.

## Evidence

All of the following return HTTP 500:
1. `GET /es/iniciar-sesion` — browser navigation
2. `GET /es/?controller=authentication` — direct controller access
3. `POST /es/?controller=authentication&submitLogin=1` — form submission with body `email=test3@zonacnc.com&password=ZonacncTest2026!&submitLogin=1`

## Impact

- **Blocks all QA testing** that requires logging into different accounts
- **Blocks verification** of phantom 19€ invoice bug on test3 account
- **Blocks standard user login flow** entirely
- **Only registration works** via `/es/?controller=registration` (a different controller)

## Workaround

- Registration page (`/?controller=registration`) still works for creating **new accounts**
- Once registered, the user is auto-logged in (session cookie set on registration)
- However, logging out means the account is **inaccessible** until the bug is fixed

## Suspected Cause

A PHP error or exception in the authentication controller (`AuthController.php` or equivalent) that prevents the login page from rendering. This could be:
- A recent deployment that introduced a breaking change
- A missing dependency or class
- A template rendering error specific to the login page
- A database connection issue triggered by the authentication query

## Recommendation

**URGENT:** Investigate and fix the authentication controller on new.zonacnc.com immediately:
1. Check PHP error logs for the specific exception
2. Verify the authentication module is properly installed/enabled
3. Test on a local/staging environment first
4. Deploy fix to new.zonacnc.com
