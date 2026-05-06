# quota-regression session — 2026-05-06

## Account
- **Email**: qatester-reg20260506@zonacnc.com
- **Password**: ZonaCNCtest2026!
- **Plan**: Starter (3 ads, 10 images, 3 boosts/mo)
- **Stripe**: Subscribed via Stripe Checkout sandbox (cs_test_a13s5SkwQdZryWIVdqtfE8YevYKaBLfXEKfjbPexJOGfHkBSVaJt2kCkyE)

## Environment
- **Site**: new.zonacnc.com
- **Auto-Approve**: OFF (ZONACNC_PA_AUTO_APPROVE=0)
- **Moderator token**: 8cdc705a61f1841bb24388102b59265e
- **Enforcequota token**: c70e312e0ca49881207fdb69dfe4d83f

## Test Data
| ID | Title | Status | Price |
|----|-------|--------|-------|
| 13069 | DMG MORI CTX 310 CNC Turning Center 2022 | PUBLISHED | 45000€ |
| 13070 | Haas ST-20 CNC Lathe 2021 Q2 | PUBLISHED | 32000€ |
| 13071 | Mazak Quick Turn 250 CNC Lathe 2020 Q3 | DISABLED | 28000€ |
| 13077 | Okuma LB3000 EX II CNC Lathe 2023 TC02-OVERFLOW | PUBLISHED | 55000€ |

## Results Summary
- TC-01: ✅ PASS with notes
- TC-02: 🔴 FAIL (no overflow detection)
- TC-03: 🟠 FAIL (409 + broken JSON)
- TC-04: 🟠 FAIL (no error feedback)
- TC-05: ✅ PASS
- TC-07: 🔴 FAIL (moderator ignores quota)
- TC-06, TC-08: Not tested

## Reports
- `reports/quota-by-active-2026-05-06.md`
- `reports/github-issues-quota-regression-2026-05-06.json`
