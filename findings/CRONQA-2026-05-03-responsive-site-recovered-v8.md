# Finding: new.zonacnc.com — Site Recovered From HTTP 500, Responsive Testing Pass

**Date:** 2026-05-03 18:33 UTC  
**Cron:** 53983183-66c6-4b72-9b21-404aac116c60  
**Focus Area:** Responsive  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)

---

## Summary

The new.zonacnc.com site experienced a complete HTTP 500 outage earlier today (confirmed at 17:22 UTC) but has since **recovered** and is now **fully operational** as of 18:33 UTC. Comprehensive responsive testing was performed across mobile (390px), tablet (768px), and desktop (1440px) viewports.

## What Changed

- **17:22 UTC:** HTTP 500 on ALL pages (homepage, search, product, login, register, pricing, etc.)
- **18:33 UTC:** HTTP 200 on ALL pages — site fully functional

Root cause was not determined. The recovery appears to be a server-side fix (application restart, config fix, or rollback).

## Responsive Test Results

| Aspect | Result |
|--------|--------|
| All pages load (200 OK) | ✅ |
| Desktop (1440×900) | ✅ Pass |
| Tablet (768×1024) | ✅ Pass |
| Mobile (390×844) | ✅ Pass |
| Console errors | 🟡 3 non-critical (Google FedCM) |
| Layout breakage | ✅ None |
| Forms (login/register) | ✅ Functional |
| Product detail page | ✅ |
| Search/listing page | ✅ |
| Pricing page | ✅ |
| Sell machine wizard | ✅ |

## Pages Verified

1. ✅ Homepage `/es/`
2. ✅ Search `/es/buscar`
3. ✅ Product detail `/es/centros-de-mecanizado-multifuncion/12934-gildemeister-ctx-510.html`
4. ✅ Login `/es/iniciar-sesion`
5. ✅ Registration `/es/?controller=registration`
6. ✅ Pricing `/es/pricing`
7. ✅ Sell Machine `/es/module/zonacncproductadd/ads`

## Non-Critical Console Errors

| Error | Source |
|-------|--------|
| `Provider's accounts list is empty` | Google Identity Services |
| `FedCM get() rejects with NetworkError` | Google FedCM |
| `Not signed in with the identity provider` | Google FedCM |

All are Google FedCM-related and expected in a test environment without configured Google accounts.

## Minor Observations

| ID | Issue | Severity |
|----|-------|----------|
| RSP-001 | Stats counters hidden on mobile viewport | 🟡 Medium |
| RSP-002 | "Vender máquina" icon-only on tablet (768px) | 🟢 Low |
| RSP-003 | Search bar behind toggle on mobile | 🟢 Low |
| RSP-004 | "Sin imagen" placeholder on product cards without images | 🟢 Low |

## Files

- Report: `continuous-testing/responsive-test-report-2026-05-03-v8.md`
