#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime
import time

CONFIG_PATH = '/home/node/.openclaw/workspace-tester/continuous-testing/config.json'
SCRIPT_PATH = '/home/node/.openclaw/workspace-tester/skills/web-tester/run-web-tester.sh'
RESULTS_DIR = '/home/node/.openclaw/workspace-tester/continuous-testing/results'

def load_config():
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def run_test(url, mode):
    """Run web tester and return parsed result."""
    cmd = [SCRIPT_PATH, url, mode]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        stdout = result.stdout.strip()
        stderr = result.stderr.strip()
        # Try to parse JSON from stdout
        if stdout:
            try:
                data = json.loads(stdout)
                return {'ok': data.get('ok', False), 'stdout': data.get('stdout', ''), 'stderr': data.get('stderr', ''), 'raw': stdout}
            except json.JSONDecodeError:
                return {'ok': False, 'stdout': stdout, 'stderr': stderr, 'raw': stdout}
        else:
            return {'ok': False, 'stdout': stdout, 'stderr': stderr, 'raw': ''}
    except subprocess.TimeoutExpired:
        return {'ok': False, 'stdout': '', 'stderr': 'Timeout', 'raw': ''}
    except Exception as e:
        return {'ok': False, 'stdout': '', 'stderr': str(e), 'raw': ''}

def analyze_result(result, url, mode):
    """Determine severity and issues from result."""
    if not result['ok']:
        # Distinguish between execution failure and accessibility violations
        if mode == 'accessibility' and not result['stderr']:
            # Accessibility violations, not execution failure
            return 'medium', f"Accessibility violations for {url}: {result['stdout']}"
        else:
            return 'critical', f"Test execution failed for {url} ({mode}): {result['stderr']}"
    # Check stdout for failures
    stdout = result['stdout']
    if 'failed' in stdout.lower() or '✗' in stdout:
        # count failures
        lines = stdout.split('\n')
        failed_lines = [l for l in lines if 'failed' in l.lower() or '✗' in l]
        # Determine severity based on mode and failure count
        if mode == 'smoke':
            severity = 'critical'
        elif mode == 'responsive':
            severity = 'high'
        elif mode == 'accessibility':
            severity = 'medium'
        elif mode == 'visual':
            severity = 'medium'
        else:
            severity = 'high'
        return severity, f"Test failures for {url} ({mode}): {', '.join(failed_lines[:3])}"
    # Check for warnings? maybe accessibility warnings are low severity
    if 'warning' in stdout.lower() and mode == 'accessibility':
        return 'low', f"Accessibility warnings for {url}: {stdout[:200]}"
    # No issues
    return None, None

def test_critical_path(url_base, path):
    """Test a critical path with smoke test."""
    url = url_base.rstrip('/') + '/' + path.lstrip('/')
    return run_test(url, 'smoke')

def main():
    config = load_config()
    applications = config['applications']
    alert_min_severity = config['alerting']['minSeverity']  # 'high'
    
    all_findings = []
    critical_errors = []
    
    for app in applications:
        name = app['name']
        base_url = app['url']
        modes = app['modes']
        critical_paths = app.get('criticalPaths', [])
        
        print(f"Testing {name} ({base_url})", file=sys.stderr)
        
        # Test each mode
        for mode in modes:
            print(f"  Mode: {mode}", file=sys.stderr)
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
            else:
                print(f"    PASS", file=sys.stderr)
        
        # Test critical paths
        for path in critical_paths:
            print(f"  Critical path: {path}", file=sys.stderr)
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
            else:
                print(f"    PASS", file=sys.stderr)
    
    # Generate report
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    report = {
        'timestamp': timestamp,
        'summary': {
            'total_applications': len(applications),
            'total_findings': len(all_findings),
            'critical_errors': len([f for f in all_findings if f['severity'] == 'critical']),
            'high_errors': len([f for f in all_findings if f['severity'] == 'high']),
            'medium_errors': len([f for f in all_findings if f['severity'] == 'medium']),
            'low_errors': len([f for f in all_findings if f['severity'] == 'low'])
        },
        'findings': all_findings,
        'alert_required': len(critical_errors) > 0
    }
    
    # Save report
    os.makedirs(RESULTS_DIR, exist_ok=True)
    report_path = os.path.join(RESULTS_DIR, f'{timestamp}.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Output plain text summary
    print(f"Continuous testing completed at {timestamp}")
    print(f"Applications tested: {len(applications)}")
    print(f"Total findings: {len(all_findings)}")
    for sev in ['critical', 'high', 'medium', 'low']:
        count = len([f for f in all_findings if f['severity'] == sev])
        if count > 0:
            print(f"  {sev}: {count}")
    if critical_errors:
        print("\nCRITICAL/HIGH ERRORS FOUND:")
        for err in critical_errors:
            print(f"- {err['application']}: {err['issue']}")
        print(f"\nALERT REQUIRED: Yes, send to {config['alerting']['telegramChannel']}")
    else:
        print("\nNo critical/high errors found.")
    
    # Return exit code for alerting (0 = success, 1 = alert needed)
    sys.exit(1 if critical_errors else 0)

if __name__ == '__main__':
    main()