# Continuous Testing Cycle Report

**Cycle ID:** 20260319_204157  
**Start Time:** 2026-03-19T20:41:57.794006 UTC  
**End Time:** 2026-03-19T20:42:22 UTC  

## Summary
- **Total Test Modes:** 7
- **Passed:** 6
- **Failed:** 1
- **Success Rate:** 85.7%

## Applications

### Cenarbe Bike Rental (https://dev1.cenarbe.com/)
- **Smoke:** ✅ PASS
- **Responsive:** ✅ PASS
- **Accessibility:** ✅ PASS

### ContentoAI (https://contentoai.cenarbe.com/)
- **Smoke:** ✅ PASS
- **Responsive:** ✅ PASS

### Villa Zocotin (https://villazocotin.cenarbe.com/)
- **Smoke:** ✅ PASS
- **Responsive:** ❌ FAIL (Severity: HIGH)

## Failure Details

**Application:** Villa Zocotin  
**Mode:** Responsive  
**Error:** Horizontal overflow detected on mobile viewport.  
**Test:** `responsive: mobile` failed with `expect(hasHorizontalOverflow).toBeFalsy()`  
**Attachments:** Screenshot, video, trace available in results directory.

## Alert Status
⚠️ **Alert Generated:** YES (Severity HIGH meets threshold)  
**Alert Target:** coordinator agent  
**Alert Message:** HIGH - Villa Zocotin responsive test failed

## Recommendations
1. Investigate responsive layout on mobile for Villa Zocotin.
2. Check CSS overflow issues on narrow screens.
3. Review recent changes to the site that may have introduced this regression.

## Raw Data
Full JSON results: [20260319_204157.json](20260319_204157.json)  
Logs: [continuous-testing.log](../continuous-testing.log)  
Alerts: [alerts.json](../alerts.json)