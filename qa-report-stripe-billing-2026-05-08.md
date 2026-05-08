# QA Report: stripe-billing — new.zonacnc.com
**Date**: 2026-05-08 04:41–05:00 UTC  
**Focus Area**: stripe-billing  
**Test Accounts**: test7@zonacnc.com (password recovery)  
**Hard Cap**: 30 min  

---

## SUMMARY
**Result**: ⚠️ 1 finding | 44/45 unit+smoke pass  

---

## TEST RESULTS

### 1. Pricing Page (`/es/pricing`)  
**Status**: ✅ PASS  
- All 5 plans correctly displayed: Free (0€), Starter (39€/mes), Pro (99€/mes "Más popular"), Business (199€/mes), Enterprise (299€/mes)  
- All prices show "+IVA (21%)"  
- Add-on personalization dropdowns present (Starter/Pro/Business/Enterprise)  
- Boost 24h section present with link to `/es/packs-boost`  
- "Pago seguro — Tarjeta o transferencia vía Stripe" messaging present  
- TEST MODE banner present ⚠️  
- Mobile responsive (375px): OK, plans stack vertically  
- Console: Google OneTap FedCM errors only (expected)  

### 2. Checkout Auth Gate  
**Status**: ✅ PASS  
- `/es/pagar-plan?plan=pro` → redirects to `/es/iniciar-sesion` with `back` parameter  
- Payment flow correctly gated behind authentication  

### 3. Boost Packs Page (`/es/packs-boost`)  
**Status**: ✅ PASS  
- 5 packs displayed: 5 Boosts (25€), 10 Boosts (45€), 25 Boosts (100€ "RECOMENDADO"), 50 Boosts (179€), 100 Boosts (200€)  
- Unit prices shown (≈ X.XX €/Boost)  
- "Pago seguro con Stripe" badge present  
- "Los Boosts no caducan" info present  
- Auth gate: "Para comprar packs primero inicia sesión o regístrate como vendedor"  

### 4. Password Recovery Email  
**Status**: ✅ PASS  
- Email received via IMAP (test7@zonacnc.com, msg #69)  
- Subject: `[zonacnc.com] Confirmación de contraseña`  
- Greeting: "Hola Test Seven" (personalized)  
- Body: correct Spanish translations throughout  
- Reset link with valid token format  
- Footer: "Powered by PrestaShop"  
- Sender: no-reply@mg.zonacnc-sales.es (Mailgun)  

### 5. Stripe Seed Endpoint  
**Status**: ✅ PASS  
- `GET /zonacnc-seed-stripe-prices.php?action=preview` → HTTP 200  

### 6. Unit + Smoke Tests  
**Status**: ⚠️ 44/45 PASS  

---

## FINDING

### F1: Boost pack naming mismatch (naming_boostpacks_uses_boost_pack_n)  
**Severity**: Low (cosmetic/naming standard)  
**Test**: `naming_boostpacks_uses_boost_pack_n` FAIL  
**Error**: `unexpected 'Pack Boost 24h' in haystack`  
**Expected**: "Boost Pack {N}" per PRICING_RULES.md §5 naming standard  
**Actual**: "Pack Boost 24h" naming observed  
**Impact**: Non-blocking; affects only checkout invoice line items and Stripe metadata  
**Fix**: Update `getPackLineName()` in zonacncplans to return "Boost Pack {N}" format  

---

## VERIFIED ENV
- **URL**: new.zonacnc.com  
- **Zone**: ES (Spanish)  
- **Mode**: TEST MODE (⚠️ banner confirmed)  
- **Module**: zonacncplans v1.7.13 (boost_ledger + Stripe price seeding)  
- **Payment**: Stripe (not Stripe Connect)  
- **Email**: Mailgun (no-reply@mg.zonacnc-sales.es)  
