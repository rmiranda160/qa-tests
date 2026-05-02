#!/usr/bin/env python3
import json
import os
import sys
import time
from datetime import datetime

# Import functions from run_extended_cycle
sys.path.insert(0, '.')
from run_extended_cycle import run_test, analyze_result, test_critical_path

# Custom config with only ContentoAI
config = {
    "applications": [
        {
            "name": "ContentoAI",
            "url": "https://cntai.cenarbe.com/",
            "modes": ["smoke", "responsive", "accessibility"],
            "criticalPaths": ["/"]
        }
    ],
    "alerting": {
        "telegramChannel": "CEO Miranda",
        "minSeverity": "high"
    },
    "schedule": {
        "testIntervalMinutes": 5,
        "reportIntervalHours": 12
    }
}

print("Testing ContentoAI with patched classification")
print("=" * 60)

all_findings = []
critical_errors = []

for app in config['applications']:
    name = app['name']
    base_url = app['url']
    modes = app['modes']
    critical_paths = app.get('criticalPaths', [])
    
    print(f"Testing {name} ({base_url})")
    
    # Test each mode
    for mode in modes:
        print(f"  Mode: {mode}")
        result = run_test(base_url, mode)
        severity, issue = analyze_result(result, base_url, mode)
        if severity and issue:
            finding = {
                'application': name,
                'url': base_url,
                'mode': mode,
                'severity': severity,
                'issue': issue,
                'timestamp': datetime.utcnow().isoformat()
            }
            all_findings.append(finding)
            if severity in ['critical', 'high']:
                critical_errors.append(finding)
            print(f"    {severity.upper()}: {issue[:100]}...")
        else:
            print(f"    PASS")
    
    # Test critical paths
    for path in critical_paths:
        print(f"  Critical path: {path}")
        result = test_critical_path(base_url, path)
        severity, issue = analyze_result(result, base_url + path, 'smoke')
        if severity and issue:
            finding = {
                'application': name,
                'url': base_url + path,
                'mode': 'critical_path',
                'severity': severity,
                'issue': issue,
                'timestamp': datetime.utcnow().isoformat()
            }
            all_findings.append(finding)
            if severity in ['critical', 'high']:
                critical_errors.append(finding)
            print(f"    {severity.upper()}: {issue[:100]}...")
        else:
            print(f"    PASS")

print("\n" + "=" * 60)
print("SUMMARY")
print(f"Total findings: {len(all_findings)}")
for sev in ['critical', 'high', 'medium', 'low']:
    count = len([f for f in all_findings if f['severity'] == sev])
    if count > 0:
        print(f"  {sev}: {count}")

if critical_errors:
    print("\nCRITICAL/HIGH ERRORS FOUND:")
    for err in critical_errors:
        print(f"- {err['application']}: {err['issue']}")
else:
    print("\nNo critical/high errors found.")

# Exit code 0 if no critical/high errors
sys.exit(1 if critical_errors else 0)