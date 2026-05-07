# Responsive QA Pass — 2026-05-07 (Minor Issues)

**Related:** `findings/RESPONSIVE-2026-05-07-site-responsive-pass-with-minor-issues.md`

## Summary

Responsive QA on new.zonacnc.com completed successfully. Site is UP and responsive across mobile (390×844), tablet (768×1024), and desktop (1440×900). No critical responsive issues.

## Findings (non-blocking)

1. **RES-001** → Welcome email in English for Spanish account (test7@zonacnc.com)
2. **RES-002** → Footer category links at 20px height (WCAG recommends 44px)
3. **RES-003** → Footer toggle buttons at 24×26px
4. **RES-004** → Registration page title is "zonacnc.com"
5. **RES-005** → Console JS errors on all pages

## Action

All issues are low severity. The responsive layout itself is solid. The welcome email locale mismatch (RES-001) should be fixed to respect user registration language.

## Status

- [x] Responsive test completed
- [x] Email verification done
- [x] Finding documented
- [ ] RES-001: Fix welcome email locale
- [ ] RES-002/003: Increase footer touch targets
- [ ] RES-004: Set descriptive registration page title
- [ ] RES-005: Fix console JS errors
