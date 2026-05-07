# Finding: Stripe Billing Template Audit — 2026-05-07 01:35 UTC

**Focus Area:** stripe-billing  
**Scenario:** Deep template string audit across 6 accounts (test7, test10, test14, test25, test26, test30)  
**Site Status:** ❌ HTTP 500 (BLOCKED — ~26h+ outage, Day 2+)  
**Mode:** IMAP-only (E2E browser testing blocked by site outage)

---

## Executive Summary

Deep-dive template analysis across 55 billing emails from 6 representative accounts (Starter, Pro, Business, Enterprise plans). All 8 previously-known bugs reconfirmed + **2 new findings** discovered.

| Metric | Value |
|---|---|
| Accounts audited | 6 (of 24) |
| Billing emails analyzed | 55 |
| Bugs confirmed | 8 persistent |
| New bugs found | 2 |
| Site status | ❌ HTTP 500 |

---

## 🔴 PERSISTENT BUGS (8 reconfirmed)

### BUG-001 — Wrong Ad Count in Welcome Emails (HIGH)
All welcome emails show **"Anuncios incluidos: 1"** regardless of plan.

| Account | Plan | Ad Count Shown | Actual |
|---|---|---|---|
| test7#29 | Starter | 1 | 3 |
| test7#12 | Pro | 1 | 10 |
| test14#4 | Starter | 1 | 3 |
| test14#10 | Business | 1 | 50 |
| test25#11 | Starter | 1 | 3 |
| test10#8 | Starter | 1 | 3 |
| test26#7 | Starter (EN body) | 1 | 3 |
| test30#10 | Starter (EN body) | 1 | 3 |

**Reproduction:** Subscribe to any plan → check welcome email → "Anuncios incluidos: 1" always shown.

### BUG-002 — "Renovación" Wording in Welcome Emails (HIGH)
Welcome emails say **"Próxima renovación"** even for brand-new/first subscriptions.

Confirmed on: test7#12, test7#29, test10#8, test14#4, test14#10, test25#11, test26#15

**Expected:** "Próximo cobro" or similar for first subscription (no prior period to "renew").

### BUG-003 — Template Variables in Onboarding Emails (MEDIUM)
- **OLD emails (May 2-3):** 6 unresolved variables: `{boost_quota_monthly}`, `{vendor_dashboard_url}`, `{max_listings}`, `{messaging_url}`, `{boostpacks_url}`, `{new_ad_url}` — test7#11, test14#3
- **NEW emails (May 4-6) ES:** Variables resolved correctly — clean emails
- **NEW emails (May 4-6) EN:** `{myads_url}` still unresolved — test7#42, test10#14, test26#8, test30#9

**Root cause:** ES template fixed, EN template still broken for `{myads_url}`.

### BUG-004 — EN/ES Mix + Duplicate "tu plan plan" (HIGH)
Cancellation emails body: **"Your tu plan plan has been canceled."**

Confirmed on: test10#11, test14#8, test26#10, test30#12

### BUG-005 — Invoice Emails: No IVA/Tax Breakdown (MEDIUM)
Invoice emails show total amount but never mention IVA. Prices include 21% IVA:
- test7#13: Business = 99,73 € (prorated, no IVA shown)
- test7#31: Starter = 30,07 € (prorated, no IVA shown)  
- test7#48: Starter = 47,19 € (= 39€ + 21% IVA, but not disclosed)
- test14#12: Business = 199,00 € (no IVA shown)
- test10#15: Starter EN = 39,00 € (no IVA/tax info)
- test25#13: Starter = 39,00 € (no IVA)

### BUG-006 — Wrong Language: EN body for ES accounts (MEDIUM)
ES locale accounts receive English welcome/onboarding/invoice/cancellation emails.

Confirmed on: test7#41, test7#42, test10#13, test10#14, test10#15, test26#7, test26#8, test30#9, test30#10, test30#12

Spanish subject (e.g., "¡Bienvenido a Starter!") but English body ("Hello Test, Welcome to ZonaCNC!").

### BUG-007 — Wrong Charset: ascii with UTF-8 content (LOW)
HTML emails declare `charset=ascii` while containing UTF-8 encoded content.

Confirmed on: test7#42, test10#14, test26#8

### BUG-009 — Add-on Email Anglicism + Missing Prorated Amount (MEDIUM)
- **Anglicism:** "Add-on añadido" → should be "Complemento añadido"  
- **Truncated amount:** "Cobro proporcional ahora: (pr..." — amount placeholder/cut off
- **Double parentheses:** "((prorrateado por Stripe))"

Confirmed on: test7#14, test7#32

---

## 🆕 NEW FINDINGS

### BUG-011 — "tu plan tu plan" Duplication in Spanish Cancellation Emails (MEDIUM)
**Discovery:** The cancellation email body also has word duplication in **pure Spanish** emails, not just the EN/ES mix case.

**Evidence — test7#35:**
```
Hola Test Vendor,

Confirmamos la cancelación de tu plan tu plan. Tu acceso seguirá
activo hasta el fin del periodo facturado: 03/06/2026.
```

The phrase "tu plan tu plan" is duplicated. The template likely contains:
- Variable: `{plan_name}` or similar resolving to "tu plan"  
- Hardcoded: "tu plan" in the sentence

Making the combined output: "tu plan" + "tu plan" = "tu plan tu plan"

**Impact:** Appears in ALL cancellation emails (both ES and EN variants). The EN variant produces "Your tu plan plan" — same root cause, different manifestation.

**Reproduction:** Cancel any subscription → check cancellation email → duplicate words visible.

### BUG-012 — German Locale URL in Account Welcome Email (LOW)
**Discovery:** test26#11 account creation email contains German locale URL.

**Evidence:**
```
https://new.zonacnc.com/de/

Hola QA Tester DE TestTwentySix,
Gracias por crear una cuenta de cliente en zonacnc.com.
```

The email link points to `/de/` (German) but the email body is in Spanish ("Hola", "Gracias por crear una cuenta"). This indicates the locale URL is set correctly but the email template language doesn't match the locale.

**Impact:** Minor UX inconsistency — user sees DE URL but ES email body.

---

## Price Analysis (across plans)

| Account | Plan | Email Type | Amount | IVA Disclosed? |
|---|---|---|---|---|
| test7#29 | Starter | Welcome | 39,00 € | N/A (welcome) |
| test7#31 | Starter | Invoice (prorated) | 30,07 € | ❌ No |
| test7#48 | Starter | Invoice (full) | 47,19 € | ❌ No |
| test7#12 | Pro | Welcome | 99,00 € | N/A |
| test7#13 | Business | Invoice (prorated) | 99,73 € | ❌ No |
| test14#4 | Starter | Welcome | 39,00 € | N/A |
| test14#10 | Business | Welcome | 199,00 € | N/A |
| test14#12 | Business | Invoice | 199,00 € | ❌ No |
| test10#8 | Starter | Welcome | 39,00 € | N/A |
| test10#15 | Starter EN | Invoice | 39,00 € | ❌ No |
| test25#11 | Starter | Welcome | 39,00 € | N/A |
| test25#13 | Starter | Invoice | 39,00 € | ❌ No |

**Key observation:** Full-cycle Starter invoices show €39.00 (test10#15, test25#13) or €47.19 (test7#48). The €47.19 amount = €39.00 + 21% IVA, which is correct but IVA is never itemized.

---

## Invoice Amount Anomaly

test7#13 shows Business at 99,73 € (not 199€) — this is a **prorated** amount (mid-cycle plan change from Pro→Business). The proration is by Stripe and correct, but the email doesn't explain the proration.

---

## Template Comparison: ES vs EN Onboarding

**ES (test7#30 — May 6) — CLEAN:**
```
Bienvenido a ZonaCNC
Hola Test Vendor Seven QA,
Tu plan Starter está activo. Para sacarle el máximo desde el
primer día, aquí tienes 3 pasos rápidos (10 minutos en total):
PASO 1 · Completa tu perfil de empresa...
```

**EN (test7#42 — May 6) — BROKEN:**
```
Hello Test,
Welcome as a seller on ZonaCNC!
Your seller account is now active. Here are some tips to get started:
1. Create your first ad with quality photos...
Start selling:
{myads_url}
```

The EN template is older/more generic, references "seller" not "plan", and has `{myads_url}` unresolved.

---

## Summary

| # | Bug | Severity | Status |
|---|---|---|---|
| BUG-001 | Wrong ad count (always "1") | 🔴 HIGH | PERSISTS |
| BUG-002 | "Renovación" in welcome emails | 🔴 HIGH | PERSISTS |
| BUG-003 | Template vars unresolved | 🟡 MEDIUM | Partial fix (ES ok, EN broken) |
| BUG-004 | EN/ES mix + "plan plan" | 🔴 HIGH | PERSISTS |
| BUG-005 | No IVA in invoices | 🟡 MEDIUM | PERSISTS |
| BUG-006 | EN body for ES accounts | 🟡 MEDIUM | PERSISTS |
| BUG-007 | Charset=ascii with UTF-8 | 🟢 LOW | PERSISTS |
| BUG-009 | Add-on anglicism + truncated amount | 🟡 MEDIUM | PERSISTS |
| **BUG-011** | **"tu plan tu plan" in ES cancellation (NEW)** | 🟡 MEDIUM | **NEW** |
| **BUG-012** | **DE locale URL in ES account email (NEW)** | 🟢 LOW | **NEW** |
| SITE-500-001 | Site-wide HTTP 500 | 🔴 BLOCKING | Day 2+ |
