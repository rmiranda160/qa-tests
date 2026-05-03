# Testing Continuous Cycle 20260320_055202

## Summary

| Application | Mode | Status | Passed | Failed |
|-------------|------|--------|--------|--------|
| cenarbe | full | FAIL | 6 | 4 |
| contentoai | smoke | PASS | 2 | 0 |
| contentoai | responsive | PASS | 4 | 0 |

## Details

### cenarbe_full.json

**Mode:** full  
**Status:** FAIL  
**Passed tests:** 6  
**Failed tests:** 4  

      ✓  2 tests/responsive.spec.js:15:3 › responsive: mobile (1.0s)
      ✓  1 tests/smoke.spec.js:5:1 › smoke: homepage carga (1.2s)
      ✓  5 tests/responsive.spec.js:15:3 › responsive: tablet (1.1s)
      ✓  4 tests/accessibility.spec.js:6:1 › a11y: sin violaciones graves (2.5s)
      ✓  6 tests/responsive.spec.js:15:3 › responsive: desktop (1.1s)
      ✘  3 tests/visual.spec.js:5:1 › visual: homepage (5.4s)
        Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveScreenshot[2m([22m[32mexpected[39m[2m)[22m failed
        test-results/visual-visual-homepage/test-failed-1.png
      1 failed
      5 passed (6.7s)

### contentoai_smoke.json

**Mode:** smoke  
**Status:** PASS  
**Passed tests:** 2  
**Failed tests:** 0  

      ✓  1 tests/smoke.spec.js:5:1 › smoke: homepage carga (729ms)
      1 passed (1.4s)

### contentoai_responsive.json

**Mode:** responsive  
**Status:** PASS  
**Passed tests:** 4  
**Failed tests:** 0  

      ✓  1 tests/responsive.spec.js:15:3 › responsive: mobile (726ms)
      ✓  2 tests/responsive.spec.js:15:3 › responsive: tablet (671ms)
      ✓  3 tests/responsive.spec.js:15:3 › responsive: desktop (678ms)
      3 passed (2.8s)

