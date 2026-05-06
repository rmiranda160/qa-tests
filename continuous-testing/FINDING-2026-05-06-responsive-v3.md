# CRON QA: tester-responsive — 2026-05-06 07:01 UTC

**Focus:** responsive  
**Duration:** ~25 min  
**Scope:** new.zonacnc.com — Responsive layout, email templates, i18n consistency  
**Accounts used:** test7@zonacnc.com (IMAP verified)  
**Method:** MCP browser (pwmcp-zonacnc) — 3 viewports (390×844, 768×1024, 1440×900)

---

## Pages Tested

| # | Página | URL | Desktop | Tablet | Mobile |
|---|--------|-----|---------|--------|--------|
| 1 | Home (ES) | `/es/` | ✅ | ✅ | ✅ |
| 2 | Buscar (ES) | `/es/buscar` | ✅ 200 | — | ✅ |
| 3 | Contacto (ES) | `/es/contactenos` | — | — | ✅ (form sent) |
| 4 | Product detail (ES) | `/es/tornos/13059-haas-st-20y.html` | — | — | ✅ |
| 5 | Brand page (Haas) | `/es/marca/5-haas` | ✅ 200 | — | — |
| 6 | Cómo funciona | `/es/content/4-como-funciona` | ✅ 200 | — | — |
| 7 | Pricing | `/es/pricing` | ✅ 200 | — | — |
| 8 | Vendedores | `/es/vendedores` | ✅ 200 | — | — |
| 9 | Fabricantes | `/fabricantes` | ✅ 200 | — | — |

**🟢 Previously reported 500 pages (brand, fabricantes, how-it-works) are now FIXED — all return 200.**

---

## Findings Summary

| # | Severity | Finding | Page | Status |
|---|----------|---------|------|--------|
| 1 | 🔴 HIGH | Language selector broken on mobile — bare `<option>` text nodes, no combobox wrapper | ALL (mobile) | **REGRESSION** (PR #181) |
| 2 | 🟡 MEDIUM | Welcome email copy mentions "hacer pedidos" — doesn't match B2B marketplace model | Email template | NEW |
| 3 | 🟡 MEDIUM | Welcome email URLs point to `/en/` when account created in `/es/` | Email template | NEW |
| 4 | 🟢 LOW | Console errors: Google Sign-In (`Provider's accounts list is empty`), FedCM NetworkError, `Unexpected token '&'` in JS | ALL | KNOWN |
| 5 | ✅ FIXED | Brand page 500 → now 200 OK | `/es/marca/5-haas` | RESOLVED |
| 6 | ✅ FIXED | Fabricantes page 500 → now 200 OK | `/fabricantes` | RESOLVED |
| 7 | ✅ FIXED | Content pages 500 → now 200 OK | `/es/content/4-como-funciona` | RESOLVED |

---

## Detailed Analysis

### 🔴 Finding 1: Language selector non-functional on mobile (REGRESSION)

**Observation:** At viewport 390×844, the language selector renders as bare `<option>` text elements without a `<select>` combobox wrapper. The 10 language options appear as unstyled plain text in the header DOM:

```
option "English"
option "Català"
option "Español" [selected]
option "Galego"
option "Euskera"
option "Français"
option "Deutsch"
option "Português PT"
option "Italiano"
option "Türkçe"
option "Русский"
```

On desktop (1440×900), the language selector renders correctly as a `<select>` combobox.

**Impact:** Mobile users cannot switch languages. This blocks international browsing on mobile devices.

**Previously reported:** PR #181 (2026-05-06 05:50) — regression persists.

**Root cause:** The JS function `zcncFixLanguageSelector()` clones and replaces the `<select>` element using `sel.parentNode.replaceChild(clone, sel)` but the clone may fail when the parent is not present in mobile DOM or when the selector `.js-language-selector` doesn't exist on mobile-rendered header.

---

### 🟡 Finding 2: Welcome email template has "hacer pedidos" copy (NEW)

**Observation:** The account welcome email sent to test7@zonacnc.com contains:

> "Ahora puedes hacer pedidos en nuestra tienda: zonacnc.com"

This is the default PrestaShop welcome template text. ZonaCNC is a B2B marketplace, not an e-commerce store — there are no "pedidos" (orders). This is confusing for users.

**Recommendation:** Replace with marketplace-appropriate copy like:
> "Ahora puedes contactar vendedores y solicitar información sobre maquinaria."

---

### 🟡 Finding 3: Welcome email language mismatch (NEW)

**Observation:** The welcome email for test7 (registered in Spanish `/es/`) contains URLs pointing to `/en/`:

```
https://new.zonacnc.com/en/
```

The email body is correctly in Spanish but all links go to the English version of the site.

**Impact:** Users clicking email links may land on wrong-language pages, causing confusion.

---

### 🟢 Finding 4: Known console errors (NON-BLOCKING)

Persistent non-critical console errors across all viewports:
- `Provider's accounts list is empty` — Google Sign-In SDK initialization
- `FedCM get() rejects with NetworkError` — FedCM API not available on test domain
- `Unexpected token '&'` — likely malformed URL parameter in JS

None affect core responsive or functional behavior.

---

### ✅ Findings 5-7: Previously reported 500 errors — RESOLVED

Pages that returned 500 in previous test cycles (2026-05-04, 2026-05-03) now return 200 OK:
- `/es/marca/5-haas` → 200 ✅
- `/fabricantes` → 200 ✅
- `/es/content/4-como-funciona` → 200 ✅
- `/es/vendedores` → 200 ✅
- `/es/pricing` → 200 ✅

---

## Responsive Layout Assessment

### Header
- **Desktop:** Full header with all elements visible — logo, categories mega-menu, search bar, "Vender máquina" CTA, user icon, language selector combobox
- **Tablet:** Nav labels collapse to icons (by design) — works correctly. Categories menu resizes. Search bar adapts.
- **Mobile:** Icon-only navigation. Language selector BROKEN (Finding 1). Categories mega-menu opens as full-width overlay on tap.

### Main Content
- **Search results:** Filters hidden behind "Filtros" toggle button on mobile — standard responsive pattern, works correctly ✅
- **Product detail:** Image, price, specs table, and enquiry form stack vertically — correct ✅
- **Contact form:** Fields adapt correctly to mobile width ✅
- **Breadcrumb:** Wraps properly on narrow viewports ✅

### Footer
- **Desktop/Tablet:** All 5 footer sections expanded as columns ✅
- **Mobile:** Accordion-style collapse — 5 toggle buttons for "Mostrar/ocultar enlaces de..." — tested, toggles work ✅

### Newsletter Signup
- Present on all viewports ✅
- Email input + "Suscríbete" button layout adapts correctly ✅

---

## Email Verification (IMAP)

Checked test7@zonacnc.com via IMAP (zonacnc.com:993):
- 40 total messages in inbox
- Contact form submission (2026-05-06 07:05 UTC) did not trigger an email — expected on test environment (⚠️ MODO TEST banner)
- Welcome email template reviewed (Findings 2-3)
- Password recovery email template reviewed — proper Spanish localization, correct token links

---

## Console Errors Detail

```
#1 - Google Sign-In (all pages)
[GSI_LOGGER]: Provider's accounts list is empty

#2 - FedCM (all pages)  
IdentityProvider.get() rejects with NetworkError

#3 - JS parsing (search page)
Uncaught SyntaxError: Unexpected token '&'
```

---

## Screenshots Captured

| File | Viewport | Page |
|------|----------|------|
| `desktop-1440x900.png` | 1440×900 | Home `/es/` |
| `tablet-768x1024.png` | 768×1024 | Home `/es/` |
| `mobile-390x844.png` | 390×844 | Home `/es/` |
| `buscar-mobile-390x844.png` | 390×844 | Search `/es/buscar` |
| `contacto-mobile-390x844.png` | 390×844 | Contact `/es/contactenos` |
| `producto-mobile-390x844.png` | 390×844 | Product `/es/tornos/13059-haas-st-20y.html` |

---

*Generated by CRON QA tester-responsive — 2026-05-06 07:01 UTC*
