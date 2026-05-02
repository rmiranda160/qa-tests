#!/usr/bin/env python3
import sys
sys.path.insert(0, '.')

# Mock the analyze_result function by importing it
from run_extended_cycle import analyze_result

# Test cases
print("Testing patched analyze_result")

# Case 1: accessibility test with violations (ok: false, stderr empty)
result1 = {
    'ok': False,
    'stdout': 'Accessibility test failed for https://cntai.cenarbe.com/. Violations: 3',
    'stderr': '',
    'raw': ''
}
severity1, issue1 = analyze_result(result1, 'https://cntai.cenarbe.com/', 'accessibility')
print(f"Case 1 - Accessibility violations:")
print(f"  Severity: {severity1}")
print(f"  Issue: {issue1}")
assert severity1 == 'medium', f"Expected 'medium', got '{severity1}'"

# Case 2: accessibility test with execution failure (stderr not empty)
result2 = {
    'ok': False,
    'stdout': '',
    'stderr': 'Timeout',
    'raw': ''
}
severity2, issue2 = analyze_result(result2, 'https://cntai.cenarbe.com/', 'accessibility')
print(f"\nCase 2 - Accessibility execution failure:")
print(f"  Severity: {severity2}")
print(f"  Issue: {issue2}")
assert severity2 == 'critical', f"Expected 'critical', got '{severity2}'"

# Case 3: smoke test failure (ok: false)
result3 = {
    'ok': False,
    'stdout': '',
    'stderr': 'Connection refused',
    'raw': ''
}
severity3, issue3 = analyze_result(result3, 'https://cntai.cenarbe.com/', 'smoke')
print(f"\nCase 3 - Smoke execution failure:")
print(f"  Severity: {severity3}")
print(f"  Issue: {issue3}")
assert severity3 == 'critical', f"Expected 'critical', got '{severity3}'"

# Case 4: accessibility test passed (ok: true) but with failures in stdout (should be medium)
result4 = {
    'ok': True,
    'stdout': 'Accessibility test failed for https://cntai.cenarbe.com/. Violations: 2',
    'stderr': '',
    'raw': ''
}
severity4, issue4 = analyze_result(result4, 'https://cntai.cenarbe.com/', 'accessibility')
print(f"\nCase 4 - Accessibility test passed with failures in stdout:")
print(f"  Severity: {severity4}")
print(f"  Issue: {issue4}")
assert severity4 == 'medium', f"Expected 'medium', got '{severity4}'"

# Case 5: accessibility test passed with warnings
result5 = {
    'ok': True,
    'stdout': 'Accessibility test passed with warnings for https://cntai.cenarbe.com/.',
    'stderr': '',
    'raw': ''
}
severity5, issue5 = analyze_result(result5, 'https://cntai.cenarbe.com/', 'accessibility')
print(f"\nCase 5 - Accessibility warnings:")
print(f"  Severity: {severity5}")
print(f"  Issue: {issue5}")
assert severity5 == 'low', f"Expected 'low', got '{severity5}'"

print("\nAll test cases passed!")