# Issue #236 — Stripe Billing Template Bugs (May 7 Audit)

**Created:** 2026-05-07 01:35 UTC  
**PR:** #236 (merged to main)  
**Finding:** `findings/finding-stripe-billing-2026-05-07-0135.md`

---

## Context

Deep template audit across 55 billing emails from 6 accounts. Site new.zonacnc.com remains down with HTTP 500 (Day 2+), so E2E browser testing impossible. IMAP-only audit.

## Bugs Found: 10 (8 persistent + 2 new)

### 🔴 HIGH — Persistent

1. **BUG-001: Wrong ad count in welcome emails** — Always shows "Anuncios incluidos: 1" regardless of plan (Starter=3, Pro=10, Business=50, Enterprise=unlimited)

2. **BUG-002: "Renovación" wording in welcome emails** — "Próxima renovación" shown for brand-new first subscriptions

3. **BUG-004: EN/ES mix + "plan plan" duplication** — "Your tu plan plan has been canceled."

### 🟡 MEDIUM — Persistent

4. **BUG-003: Template variables unresolved** — ES onboarding fixed, EN still has `{myads_url}` unresolved

5. **BUG-005: No IVA in invoice emails** — Prices include 21% IVA but never disclosed

6. **BUG-006: EN body for ES accounts** — ES locale accounts receive English emails

7. **BUG-009: Add-on anglicism + truncated amount** — "Add-on añadido" should be "Complemento añadido", amount shows "(pr..."

### 🟢 LOW — Persistent

8. **BUG-007: Charset=ascii with UTF-8 content** — HTML declares ascii, content is UTF-8

### 🆕 NEW

9. **BUG-011: "tu plan tu plan" in Spanish cancellation emails (MEDIUM)** — Pure Spanish emails also have word duplication: "Confirmamos la cancelación de tu plan tu plan"

10. **BUG-012: DE locale URL in ES account email (LOW)** — test26 account creation email links to /de/ but body is Spanish

### 🔴 BLOCKING

11. **SITE-500-001** — new.zonacnc.com returns HTTP 500, Day 2+ outage

---

## Action Items

- [ ] Fix welcome email ad count to use plan-specific limits
- [ ] Change "Próxima renovación" to "Próximo cobro" for first subscription
- [ ] Fix cancellation template: remove duplicate "tu plan" / "plan" words
- [ ] Fix EN onboarding email `{myads_url}` variable
- [ ] Add IVA breakdown to invoice emails
- [ ] Fix language detection for ES accounts receiving EN emails
- [ ] Fix add-on email: "Complemento añadido" + show prorated amount
- [ ] Fix charset declaration in HTML emails
- [ ] **NEW:** Fix Spanish cancellation template duplicate "tu plan"  
- [ ] **NEW:** Review locale URL vs email language consistency
- [ ] **URGENT:** Fix site-wide HTTP 500 outage
