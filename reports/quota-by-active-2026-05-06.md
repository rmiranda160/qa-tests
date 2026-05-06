# Regression Report: quota-by-active — 2026-05-06

**Tester**: OpenClaw (tester agent)
**Account**: `qatester-reg20260506@zonacnc.com` / `ZonaCNCtest2026!`
**Plan**: Starter (3 ads, 10 images, 3 boosts/mo)
**Auto-Approve**: OFF (`ZONACNC_PA_AUTO_APPROVE=0`)
**Test Environment**: new.zonacnc.com (sandbox Stripe)

---

## Executive Summary

| Case | Verdict | Severity |
|------|---------|----------|
| TC-01 · Create normal ad | PASS with notes | — |
| TC-02 · Overflow creation | **FAIL** | 🔴 CRITICAL |
| TC-03 · Activate with quota | **FAIL** | 🟠 HIGH |
| TC-04 · Activate over-quota | **FAIL** | 🟠 HIGH |
| TC-05 · Pause ad | PASS | — |
| TC-06 · Moderator with quota | NOT TESTED | — |
| TC-07 · Moderator without quota | **FAIL** | 🔴 CRITICAL |
| TC-08 · Enforcequota cron | NOT TESTED | — |

**2 CRITICAL · 2 HIGH · 3 MEDIUM bugs found**

---

## TC-01 · Create normal ad — PASS with notes

**Ad**: #13069 "DMG MORI CTX 310 CNC Turning Center 2022" (45000€)

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Redirect URL | `/success?id_product=X` | `/anuncio-publicado?id_product=13069` | ❌ |
| Success message | "publicado y visible" | "pendiente de revisión" | ❌ (AUTO_APPROVE=0) |
| Quota after | 1/3 | 1/3 | ✅ |
| product.active | 1 | 1 (after cron) | ✅ |
| Badge on /myads | Activo | PUBLISHED | ✅ |

**Notes**: AUTO_APPROVE=0 causes "pending review" message instead of "published". After moderator cron, ad shows correctly as PUBLISHED with quota 1/3.

---

## TC-02 · Overflow creation — 🔴 FAIL (CRITICAL)

Created 4th ad (#13077 Okuma LB3000) when at 3/3 quota.

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Warning banner on form | "Has alcanzado el límite" | Missing | ❌ |
| Redirect URL | `/success?paused=1` | `/anuncio-publicado` (no pause) | ❌ |
| Success message | "Anuncio creado en pausa" | "pendiente de revisión" | ❌ |
| CTAs | "Ir a Mis anuncios" + "Ver planes" | Standard "Post another ad" + "View my ads" | ❌ |
| product.active | 0 | N/A | ❌ |
| Badge on /myads | Pausado | PUBLISHED (after cron) | ❌ |

**Root cause**: No quota check at ad creation time. System allows unlimited creation. Over-quota detection happens only later (at moderator cron).

---

## TC-03 · Activate with quota — 🟠 FAIL (HIGH)

Attempted to activate disabled Mazak ad (#13071) when quota showed 2/3.

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| HTTP response | 200 | **409** | ❌ |
| Toast message | "Anuncio activado" | Empty alert (no visible text) | ❌ |
| product.active | 1 | No change | ❌ |
| Quota after | 3/3 | Unchanged (2/3) | ❌ |

**Notes**: Toggle endpoint returns 409 even when UI shows available quota (2/3). Possible data inconsistency between displayed count and actual active count.

---

## TC-04 · Activate over-quota — 🟠 FAIL (HIGH)

Attempted to activate disabled Mazak ad (#13071) when at 3/3 quota.

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| HTTP response | 409 | 409 | ✅ |
| Error message visible | "No puedes activar más anuncios…" | Empty (alert element exists but no text) | ❌ |
| product.active | unchanged (0) | unchanged | ✅ |
| Console error | none | "Unexpected token '&'" | ❌ |

**Root cause**: Toggle endpoint returns malformed JSON (HTML with `&` instead of proper JSON). Frontend JSON parser fails silently. User sees no feedback.

---

## TC-05 · Pause ad — PASS

Disabled DMG MORI CTX 310 (#13069) from published state.

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| HTTP response | 200 | 200 | ✅ |
| Badge change | PUBLISHED → DISABLED | PUBLISHED → DISABLED | ✅ |
| Button change | Disable → Activate | Disable → Activate | ✅ |
| Quota update (live) | 3→2 without refresh | Stays 3 (needs refresh) | ⚠️ |
| Quota after refresh | 2/3 | 2/3 | ✅ |

**Note**: Quota counter doesn't update via AJAX — requires page refresh.

---

## TC-07 · Moderator without quota — 🔴 FAIL (CRITICAL)

Ran moderator cron when vendor had 2 active + 1 pending (Okuma #13077).

**Cron output**: `batch_size: 3, processed: 3, approved: 3`

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Okuma product.active | 0 (paused, over-quota) | **1 (PUBLISHED)** | ❌ |
| Okuma badge | Pausado | PUBLISHED | ❌ |
| Haas status | unchanged (disabled) | Reactivated to PUBLISHED | ❌ |
| Quota after | 2/3 or 3/3 | 3/3 | ⚠️ |

**Root cause**: Moderator cron does NOT check vendor quota before activating. All approved submissions are auto-activated regardless of quota limits.

---

## Bug Summary

### 🔴 CRITICAL

| ID | Title | Found in |
|----|-------|----------|
| B-REG-01 | No over-quota detection at ad creation time | TC-02 |
| B-REG-02 | Moderator cron activates ads ignoring quota limits | TC-07 |

### 🟠 HIGH

| ID | Title | Found in |
|----|-------|----------|
| B-REG-03 | Toggle active/pause returns malformed JSON (HTML `&` instead of JSON) | TC-03, TC-04 |
| B-REG-04 | No user-visible error message on over-quota activation rejection | TC-04 |
| B-REG-05 | Quota counter does not update via AJAX after toggle | TC-05 |

### 🟡 MEDIUM

| ID | Title | Found in |
|----|-------|----------|
| B-REG-06 | Yellow "límite alcanzado" banner missing on ad creation form | TC-02 |
| B-REG-07 | "DISABLED" badge contradicts "PUBLISHED" status on same ad | UI |
| B-REG-08 | Success message always shows "pending review" ignoring auto-approve status | TC-01 |

---

## Test Data Created

| ID | Title | Price | Status |
|----|-------|-------|--------|
| 13069 | DMG MORI CTX 310 CNC Turning Center 2022 | 45000€ | PUBLISHED |
| 13070 | Haas ST-20 CNC Lathe 2021 Q2 | 32000€ | PUBLISHED |
| 13071 | Mazak Quick Turn 250 CNC Lathe 2020 Q3 | 28000€ | DISABLED |
| 13077 | Okuma LB3000 EX II CNC Lathe 2023 TC02-OVERFLOW | 55000€ | PUBLISHED |

---

## Recommendations

1. **URGENT**: Add quota check in `ProductAddController::postProcess()` before accepting new ads
2. **URGENT**: Add quota check in moderator cron's approval logic
3. Fix toggle-active endpoint to return proper JSON on 409
4. Add client-side toast/alert for toggle error responses
5. Update quota counter in DOM after successful AJAX toggle
6. Add warning banner to ad creation form when at quota
7. Clean up DISABLED/PUBLISHED badge inconsistency
