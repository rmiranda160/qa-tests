# QA Stripe Billing — 2026-05-07 20:27 UTC

**Focus area:** stripe-billing
**Scope:** new.zonacnc.com (ES + EN)
**Test runner:** backend tests + browser exploratory

---

## Scenario: Pricing Page & Stripe Checkout Flow

### Pages checked
| Page | URL | Status |
|------|-----|--------|
| Pricing (ES) | `/es/pricing` | 200 OK |
| Pricing (EN) | `/en/pricing` | 200 OK |
| Boost Packs (ES) | `/es/packs-boost` | 200 OK |
| Boost Packs (EN) | `/en/packs-boost` | 200 OK |
| Login | `/es/iniciar-sesion` | 200 OK |
| Registration | `/es/?controller=registration` | 200 OK |
| Module pricing | `/module/zonacncplans/pricing` | 200 OK |
| Stripe webhook | `/module/zonacncplans/webhook` | 400 (expected, GET) |
| Stripe diag | `/zonacnc-stripe-diag.php` | forbidden (token req) |
| Run tests | `/zonacnc-run-tests.php?full=1` | 44/45 PASS |
| Boost ledger diag | `/zonacnc-boost-ledger-diag.php` | OK, consistent |

---

## ✅ PASSES (21)

### Pricing page — visual
1. **All 5 plan tiers render**: Free (0€), Starter (39€/mes), Pro (99€/mes), Business (199€/mes), Enterprise (299€/mes)
2. **SEO page titles correct**: ES="Planes para Vendedores de Maquinaria Industrial | ZonaCNC", EN="Seller Plans for Industrial Machinery | ZonaCNC"
3. **Plan features match spec**: anuncios (1/3/10/25/100), boosts (0/0/3/10/25 incluidos), imágenes (5/10/20/30/50)
4. **Prices match PRICING_RULES.md**: Starter 39€, Pro 99€, Business 199€, Enterprise 299€
5. **IVA notice**: "+ IVA (21%)" shown on all paid plans
6. **CTA buttons**: "Empezar gratis" (Free → `/es/alta-vendedor`), "Contratar X" (paid → `/es/pagar-plan?plan=X`)
7. **"Más popular" badge** on Pro plan
8. **"Personalizar con add-ons ▾"** dropdown present on Starter/Pro/Business/Enterprise
9. **Boost 24h section**: with link to `/es/packs-boost`
10. **Footer**: "Sin comisión", "Cancela cuando quieras", "Pago seguro vía Stripe", "3.400+ anuncios"

### Auth flow
11. **Auth gate correct**: unauthenticated → login page when clicking "Contratar"
12. **Login page**: email/password fields + "Continuar con Google" OAuth + password recovery + registration link
13. **Google OAuth links**: `/es/module/zonacncoauth/google` on both login and registration pages
14. **Registration form**: full form (Tratamiento/Nombre/Apellidos/Empresa/NIF/Email/Password/Fecha) + "Registrarme con Google"

### Infrastructure
15. **"Modo test" region**: visible on all pages `⚠️ MODO TEST — entorno de pruebas`
16. **Cookie consent**: dialog present with proper text on all pages
17. **Security headers**: HSTS, X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, Permissions-Policy
18. **Module pricing endpoint**: HTTP 200, content-type text/html; charset=utf-8
19. **Stripe webhook endpoint**: responsive (HTTP 400 on GET, expected for POST-only Stripe webhook)

### Backend tests (44/45 PASS)
20. All unit tests pass (sanitize, ledger, naming, schema, plans, addons, countries)
21. All smoke tests pass (boost balance consistency, no phantom pack payments, legacy descriptions, webhook idempotency, addon cancel)

### Boost ledger
22. **Ledger consistency OK**: aggregates match (diff=0), cross-check (105 purchased − 25 consumed = 80 remaining)

---

## ⚠️ WARNINGS (2)

### W1: Missing SEO page titles on boost packs + registration
- **`/es/packs-boost`**: title = "zonacnc.com" (no SEO title)
- **`/en/packs-boost`**: title = "zonacnc.com" (no SEO title)
- **`/es/?controller=registration`**: title = "zonacnc.com" (no SEO title)
- Expected: something like "Packs de Boost 24h | ZonaCNC" and "Crear una cuenta | ZonaCNC"

### W2: JS syntax errors on boost packs page
- 4× `Unexpected token '&'` on `/es/packs-boost`
- Likely a minification issue in cached JS bundle. Needs investigation.

---

## ❌ FAILURES (2)

### F1: Stripe product naming doesn't match PRICING_RULES.md §5
**Test:** `naming_boostpacks_uses_boost_pack_n`
**Error:** `ASSERT FAIL (): unexpected 'Pack Boost 24h' in haystack`
**Expected (spec):** "Boost Pack {N}" (e.g. "Boost Pack 5")
**Actual (Stripe):** "Pack Boost 24h"
**Impact:** Invoice/checkout naming inconsistency. Stripe customers see "Pack Boost 24h" instead of "Boost Pack 5" in their payment receipts.
**Fix:** Update Stripe Product names to match PRICING_RULES.md §5 naming standard.

### F2: 4× JS "Unexpected token '&'" on boost packs page
**Page:** `/es/packs-boost`
**Symptom:** 4 identical `Unexpected token '&'` console errors
**Likely cause:** Minified JS cache issue (bottom-*.js). An unescaped `&` in inline JS or template variable.
**Impact:** May cause partial JS failures on the boost packs page. If the Stripe checkout JS fails, users can't purchase boost packs.
**Fix:** Identify the specific JS file with the syntax error and fix the unescaped ampersand.

---

## Test run timestamp
```
=== ZonaCNC Pricing Tests ===
Mode: FULL (unit + smoke)
Total: 45  Passed: 44  Failed: 1
```

## Console errors (non-Google)
All non-Google console errors are from the boost packs page:
- `Unexpected token '&'` × 4

Google-related errors are expected (no user signed in):
- `Provider's accounts list is empty`
- `[GSI_LOGGER]: FedCM get() rejects with NetworkError`
- `Not signed in with the identity provider`

## Recommendations
1. **HIGH**: Fix Stripe product naming (F1) — update "Pack Boost 24h" → "Boost Pack 5" (and others) in Stripe Dashboard to match PRICING_RULES.md §5
2. **MEDIUM**: Fix JS syntax error on boost packs page (F2/W2) — could block Stripe checkout JS
3. **LOW**: Add proper SEO page titles to `/es/packs-boost`, `/en/packs-boost`, and registration page (W1)
