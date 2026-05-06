# QA Finding — Stripe Billing v3 · new.zonacnc.com
**Date:** 2026-05-06 20:33–20:40 UTC  
**Tester:** test25@zonacnc.com (full site login + IMAP)  
**Site:** https://new.zonacnc.com/es/ (MODO TEST banner visible)  
**Focus:** Stripe billing UI, invoice text, email templates, translation review

---

## Executive Summary

Logged into test25@zonacnc.com (password reset via IMAP token), reviewed subscription management, billing history, facturacion page, and 3 fresh emails. Found **4 issues** (2 P1, 2 P2), confirmed **2 fixes**, and identified **1 systemic issue**.

---

## Scope & Methodology

| Step | Action | Result |
|------|--------|--------|
| 1 | Password reset for test25 via IMAP token | ✅ Reset OK, logged in |
| 2 | Review `/es/suscripcion` (subscription page) | ✅ Full page reviewed |
| 3 | Review `/es/facturacion` (billing history) | ✅ Full page reviewed |
| 4 | Check Stripe-hosted invoice page | ✅ Accessed via "Ver factura" link |
| 5 | IMAP email review (test25, 17 emails) | ✅ 3 fresh emails analyzed |
| 6 | Pricing page re-check | ✅ IVA fix confirmed |

---

## ✅ Confirmed Fixes (Previously Reported)

| Previous Finding | Status | Evidence |
|-----------------|--------|----------|
| **IVA not shown on pricing** | ✅ FIXED | All plans now show "+ IVA (21%)" after price |
| **Starter shows "1 anuncio" on pricing** | ✅ FIXED | Pricing page now shows "3 anuncios activos" for Starter |

---

## New/Continuing Findings

### F1 [P1] — Invoice Description: English Text in Spanish UI

**Pages affected:** `/es/suscripcion` history table, `/es/facturacion` billing table  
**Evidence:**
```
Concepto: Suscripción 1 × Plan Starter (at €39.00 / month) (+39,00 €)
```
The substring `(at €39.00 / month)` is English embedded in a Spanish interface.  

**Expected:** `(a 39,00 €/mes)`  
**Impact:** Breaks Spanish UI consistency; looks unprofessional  
**Root cause:** Stripe plan description is stored in English; not translated for Spanish display  

---

### F2 [P1] — "Confirmación decontraseña" Missing Space — STILL PRESENT

**Source:** test25@zonacnc.com password reset emails (IDs 14, 16)  
**Subject:** `[zonacnc.com] Confirmación decontraseña`  
**Expected:** `[zonacnc.com] Confirmación de contraseña`  

IMAP raw encoding confirms the bug:
- Encoded as: `Confirmación` + ` de` (space before "de") + `contraseña`
- Concatenated result: missing space between "de" and "contraseña"

**Status:** Previously reported (F5 in v2 report); **still unfixed**  
**Impact:** Unprofessional email subject; recurring PrestaShop template bug  

---

### F3 [P2] — Invoice Email: English "(monthly)" in Spanish Content

**Source:** test25 email #13 — "Factura pagada — Tu plan sigue activo"  
**Evidence:**
```
- Plan: Starter (monthly)
```
**Expected:** `- Plan: Starter (mensual)`  
**Impact:** Minor language inconsistency in billing emails  
**Root cause:** Stripe plan interval descriptor not translated  

---

### F4 [P2] — Invoice Email Greets Generic "Hola Test" not Full Name

**Source:** test25 email #13 — "Factura pagada — Tu plan sigue activo"  
**Evidence:**
```
Hola Test,
Hemos cobrado la renovación de tu plan Starter...
```
**Expected:** `Hola Test TwentyFive,`  
**Context:** Other emails (password reset, welcome) correctly use `Hola Test TwentyFive`  
**Root cause:** Billing email template uses `{firstname}` only, not `{firstname} {lastname}`  

---

## IMAP Account Status Update

| Account | IMAP Access | Password | Emails | Notes |
|---------|------------|----------|--------|-------|
| test25 | ✅ Active | S0CDQRmwzTp8 | 17 | Full billing history accessible |
| test7 | ❌ Auth failed | Changed | — | Site password also changed, recovery rate-limited (360 min) |
| test26 | ❌ Auth failed | Changed | — | Password rotated |
| test8 | ❌ Auth failed | Changed | — | Password rotated |
| test16 | ❌ Auth failed | Changed | — | Password rotated |

**Systemic finding:** Only test25 retains the shared IMAP password. 4 of 5 checked accounts have had their passwords rotated, leaving the QA email pool partially inaccessible.

---

## Verified: Correct Spanish Content

- ✅ `/es/pricing`: All plan descriptions, "+ IVA (21%)", trust badges — correct Spanish
- ✅ `/es/suscripcion`: "Mi suscripción", "Suscripción", "Cancelar al final del período" — correct
- ✅ `/es/facturacion`: "Aquí encontrarás un histórico de los pagos..." — correct
- ✅ Password update email body: "Su contraseña ha sido actualizada correctamente." — correct
- ✅ Breadcrumbs: "Inicio / Mi cuenta / Mi suscripción" — correct
- ✅ Onboarding email (test25 #12): "Empieza con buen pie en ZonaCNC" — well-structured Spanish template

---

## Recommendations Priority

1. **P1: Translate Stripe plan description** — Change "(at €39.00 / month)" to "(a 39,00 €/mes)" in invoice display
2. **P1: Fix "decontraseña" space bug** — Fix PrestaShop email template encoding for password recovery subject
3. **P2: Translate "(monthly)" in invoice emails** — Change to "(mensual)"
4. **P2: Use full name in billing emails** — Change `{firstname}` to `{firstname} {lastname}`
5. **Info: Audit QA pool passwords** — Synchronize IMAP passwords across test7–test30 pool

---

*Finding generated by OpenClaw CRON QA — stripe-billing scenario*
