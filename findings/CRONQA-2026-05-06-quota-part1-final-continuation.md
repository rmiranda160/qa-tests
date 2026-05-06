# QA Regression: quota-by-active — Part 1 FINAL Continuation

**Date**: 2026-05-06 09:21–09:40 UTC  
**Tester**: Tester subagent (continuation session)  
**Accounts tested**: 
- `test7-quota@zonacnc.com` / ZonaCNCtest2026! (Starter, 5 ads, 3/3 active)
- `qatester-reg20260506@zonacnc.com` / ZonaCNCtest2026! (Starter, 4 ads, 3/3 active)

**Environment**: https://new.zonacnc.com

---

## 🔴 CRITICAL FINDING: Form Block Confirmed on BOTH Accounts

The auto-generated report (`reports/quota-regression-test7-2026-05-06.md`) claimed TC-06 PASS (form accessible at quota), but **our actual browser testing on BOTH accounts contradicts this**:

| Account | Route | Form Fields | Block Element | Result |
|---------|-------|------------|---------------|--------|
| test7-quota | `/en/publicar` | 1 (`id_product` only) | `zonacnc-quota-block` present | ❌ BLOCKED |
| test7-quota | `/en/module/zonacncproductadd/ads` | 1 (`id_product` only) | `zonacnc-quota-block` present | ❌ BLOCKED |
| qatester-reg | `/en/publicar` | 1 (`id_product` only) | `zonacnc-quota-block` present | ❌ BLOCKED |
| qatester-reg | `/en/module/zonacncproductadd/ads` | 1 (`id_product` only) | `zonacnc-quota-block` present | ❌ BLOCKED |

**Block message**: "Has alcanzado el límite de anuncios de tu plan — Currently you have 3 … 3 anuncios activos permitidos. Amplía tu cuota o contrata un plan superior para publicar más."
**Actions available**: "Expand my plan" + "Return to my account"

### ⚠️ Discrepancy Alert

The auto-generated report file claims:
> "TC-06 · Llena cuota, verifica bloqueo — ✅ PASS — At 3/3, navigated to /en/publicar — form IS accessible ✅"

This is **factually incorrect** based on our direct browser testing. The form was blocked on BOTH accounts at 3/3. The auto-generated report should be treated as unreliable.

---

## Test Results (Actual Browser Verification)

### TC-06: Form block at quota ✅ VERIFIED

| Account | Test | Result |
|---------|------|--------|
| test7-quota | `/en/publicar` at 3/3 | ❌ BLOCKED — form replaced by quota-block |
| test7-quota | `/en/module/zonacncproductadd/ads` at 3/3 | ❌ BLOCKED — form replaced by quota-block |
| qatester-reg | `/en/publicar` at 3/3 | ❌ BLOCKED — form replaced by quota-block |
| qatester-reg | `/en/module/zonacncproductadd/ads` at 3/3 | ❌ BLOCKED — form replaced by quota-block |

### TC-07: Enforcequota cron ⚠️ NOT TESTABLE
- Requires `PLANS_CRON_TOKEN` from secrets
- All token attempts returned 403 Forbidden
- Previous findings: `stripe_sync: sync_failed:plan_not_loaded` for subscription 1

### TC-08: Force exceed quota via API ❌ BLOCKED

| Account | POST attempt | Response | Result |
|---------|-------------|----------|--------|
| qatester-reg | 4 attempts with various params | HTTP 200, body=0 bytes | ❌ BLOCKED |
| test7-quota | 1 attempt | HTTP 200, body=0 bytes | ❌ BLOCKED |

**Key observation**: The module returns `content-length: 0` on ALL POST attempts at quota limit. No redirect, no error JSON, no HTML — just empty response. This means the module has a hard block in `postProcess()` that exits without processing when quota is reached.

---

## Consolidated Bug List (for GitHub qa-quota-regression)

### CRITICAL — 2 bugs

| ID | Title | Evidence |
|----|-------|----------|
| BUG-01 | **Ad creation form COMPLETELY BLOCKED at quota limit** — Form replaced by `zonacnc-quota-block` with only "Expand plan" and "Return to account" buttons. No machine fields render. | Confirmed on 2 accounts, 2 routes each. Only `id_product` hidden input, 0 visible fields. |
| BUG-02 | **Moderator cron activates ads ignoring quota** — Ads approved at overflow get `active=1` instead of `active=0`. Vendor can exceed quota via moderator cron. | Ad #13077 (Okuma) on qatester, badge=Published despite 3/3 quota. |

### HIGH — 3 bugs

| ID | Title |
|----|-------|
| BUG-03 | **Toggle active/pause returns HTML in JSON response** — JS error `Unexpected token '&'` breaks ALL interactive buttons |
| BUG-04 | **No user feedback when activation is rejected (409)** — Alert element exists but remains empty |
| BUG-05 | **Quota counter doesn't update via AJAX after toggle** — Requires full page refresh |

### MEDIUM — 3 bugs

| ID | Title |
|----|-------|
| BUG-06 | **Yellow warning banner missing on `/en/publicar` form** when at quota |
| BUG-07 | **Badge "DISABLED" on ads with status "Published"** — UI inconsistency |
| BUG-08 | **Success message always shows "pending review"** regardless of auto-approve status |
| BUG-09 | **enforcequota creates ads with `new_plan=0, new_quota=0`** — Stripe sync failed |

---

## test7-quota Account State (Final)

| ID | Machine | Status | Active |
|----|---------|--------|--------|
| 13072 | Haas VF-2 2018 | Published | ✅ Active |
| 13075 | Mazak VTC-300C 2017 | Published | ✅ Active |
| 13133 | Doosan DNM 5700 2019 | Published | ✅ Active |
| 13073 | DMG Mori DMU 50 2019 | Published | ❌ Paused |
| 13128 | Deckel Maho DMU 60 EVO 2020 | Published | ❌ Paused |

**Quota**: 3/3 — Banner: "Has alcanzado el máximo de tu plan"
**Plan**: Starter (39€/mes)

## qatester-reg Account State (Final)

| ID | Machine | Status | Active |
|----|---------|--------|--------|
| 13069 | DMG MORI CTX 310 2022 | Published | ✅ Active |
| 13070 | Haas ST-20 2021 | Published | ✅ Active |
| 13077 | Okuma LB3000 EX II 2023 | Published | ✅ Active |
| 13071 | Mazak Quick Turn 250 2020 | Published | ❌ Paused |

**Quota**: 3/3 — Banner: "Has alcanzado el máximo de tu plan"
**Plan**: Starter (39€/mes)

---

*Final report — 2026-05-06 09:40 UTC — Tester subagent (continuation)*
