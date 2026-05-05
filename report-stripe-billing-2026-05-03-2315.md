# QA Report: Stripe Billing Flow — test19@zonacnc.com
**Date:** 2026-05-03 23:25 UTC  
**Scenario:** Fresh vendor registration → Starter subscription → Ad creation → Email verification  
**Account:** test19@zonacnc.com (clean, no prior subscription)

---

## Test Execution Summary

| Step | Status | Notes |
|------|--------|-------|
| 1. Password Reset | ✅ | Reset token from IMAP, password set to TestQA2026! |
| 2. Vendor Registration | ✅ | Registered as "Test QA Maquinaria S.L." (CIF B12345678, Barcelona) |
| 3. Starter Plan Subscription | ✅ | Stripe checkout: 39€/month, card ending in 4242 |
| 4. Ad Creation | ✅ | Product ID: 12977 — Haas ST-20Y 2020, 35.000€ |
| 5. IMAP Email Verification | ✅ | 6 emails received |
| 6. Subscription Dashboard | ✅ | Active, next billing 04/06/2026 |
| 7. Billing/Invoices Page | ✅ | Page loads, "Sin movimientos todavía" (invoice pending) |

---

## FINDINGS

### FINDING-001 (REGRESSION) — Template variables rendered literally in vendor onboarding email
**Severity:** HIGH  
**Affected email:** "Empieza con buen pie en ZonaCNC: 3 pasos en 10 minutos" (email #5)  
**Template:** Vendor onboarding (sent after subscription activation)

**Raw template variables found in both TEXT and HTML parts:**

| Variable | Expected value |
|----------|---------------|
| `{vendor_dashboard_url}` | URL to vendor dashboard |
| `{max_listings}` | 3 |
| `{new_ad_url}` | URL to create new ad |
| `{messaging_url}` | URL to messaging inbox |
| `{boost_quota_monthly}` | Boost quota for plan |
| `{boostpacks_url}` | URL to boost packs |

**Impact:** Links are completely broken — users see literal `{vendor_dashboard_url}` text and cannot click through. This is a **regression** of the same issue documented in previous reports (FINDING-001).

**Evidence:**
```
→ {vendor_dashboard_url}
Tu plan Starter permite hasta {max_listings} anuncios activos.
→ {new_ad_url}
→ {messaging_url}
Tu plan incluye {boost_quota_monthly} Boosts 24h al mes.
{boostpacks_url}
```

### FINDING-002 (MINOR) — Customer name truncated in subscription confirmation email
**Severity:** LOW  
**Affected email:** "¡Bienvenido a Starter! Tu suscripción está activa" (email #6)  
**Template:** Subscription confirmation (zonacncplans)

**Issue:** The email addresses the user as "Hola Test" instead of "Hola Test ZonaCNC QA". The first name seems to be extracted incorrectly — it shows only "Test" when the full name is "Test ZonaCNC QA".

**Evidence:**
```
<p>Hola Test,</p>
<p>¡Bienvenido a ZonaCNC! Tu plan <strong>Starter</strong> ya está activo.</p>
```

**Note:** This email does NOT have the template variable rendering issue — all plan details (Starter, monthly, 39,00 €, 1 anuncio, 04/06/2026) are correctly populated.

---

## Passed Checks

| Check | Result |
|-------|--------|
| Password reset email | ✅ Template renders correctly, reset link is valid |
| Password reset confirmation | ✅ "Su nueva contraseña" — link valid |
| Subscription confirmation email | ✅ All plan details correctly populated (no raw vars) |
| Stripe checkout flow | ✅ Test card 4242 accepted, payment successful |
| Subscription page | ✅ Shows Starter, Active, next billing 04/06/2026 |
| Ad creation | ✅ Product 12977 created successfully |
| Billing page | ✅ Loads correctly (no invoices yet — expected) |
| Vendor registration | ✅ Completed, vendor exists |
| Language detection | ✅ Emails in Spanish as expected |

---

## Files & Evidence

- Previous report: `report-stripe-billing-2026-05-03-2153.md`
- This report: `report-stripe-billing-2026-05-03-2315.md`
- Test account: test19@zonacnc.com (ID: 6620)
- Product ID: 12977
- Stripe session: `cs_test_a13J2zcHLuNBTgQmmezzPF2w2nqUScECGGdXnqpsI96Rn1EQwexVAugweL`

---

## Recommendations

1. **CRITICAL:** Fix FINDING-001 — the vendor onboarding email template (`Empieza con buen pie en ZonaCNC`) is not substituting any of its template variables. Check the email rendering pipeline for the onboarding template specifically.
2. **LOW:** Fix FINDING-002 — customer name is truncated to first word in subscription confirmation email.
