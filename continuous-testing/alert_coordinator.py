#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

def find_latest_continuous():
    results_dir = '/home/node/.openclaw/workspace-tester/continuous-testing/results'
    # Pattern: YYYYMMDD_HHMMSS.json
    import re
    pattern = re.compile(r'^\d{8}_\d{6}\.json$')
    matches = [(f, os.path.getmtime(os.path.join(results_dir, f))) 
               for f in os.listdir(results_dir) if pattern.match(f)]
    if not matches:
        return None
    matches.sort(key=lambda x: x[1], reverse=True)
    return os.path.join(results_dir, matches[0][0])

def find_latest_coherence():
    coherence_dir = '/home/node/.openclaw/workspace-tester/continuous-testing/coherence-results'
    files = [f for f in os.listdir(coherence_dir) if f.endswith('.json')]
    if not files:
        return None
    files.sort(key=lambda f: os.path.getmtime(os.path.join(coherence_dir, f)), reverse=True)
    return os.path.join(coherence_dir, files[0])

def main():
    cont_path = find_latest_continuous()
    if not cont_path:
        print("No continuous results found")
        return
    coh_path = find_latest_coherence()
    if not coh_path:
        print("No coherence results found")
        return
    
    cont_data = load_json(cont_path)
    coh_data = load_json(coh_path)
    
    # Build message
    lines = []
    lines.append("🚀 CONTINUOUS TESTING CYCLE REPORT")
    lines.append(f"Continuous cycle: {cont_data.get('cycle_id', 'N/A')}")
    lines.append(f"Coherence cycle: {coh_data.get('cycleId', 'N/A')}")
    lines.append(f"Time: {datetime.utcnow().isoformat()}Z")
    lines.append("")
    
    # Continuous summary
    total_modes = 0
    passed_modes = 0
    failed_modes_details = []
    for app in cont_data['applications']:
        for mode in app['modes']:
            total_modes += 1
            if mode['analysis']['status'] == 'pass':
                passed_modes += 1
            else:
                failed_modes_details.append({
                    'app': app['name'],
                    'mode': mode['mode'],
                    'severity': mode['analysis']['severity'],
                    'message': mode['analysis']['message']
                })
    
    lines.append(f"📊 WEB TESTER: {passed_modes}/{total_modes} modes passed")
    if failed_modes_details:
        lines.append("   Failures:")
        for f in failed_modes_details:
            lines.append(f"      • {f['app']} - {f['mode']} ({f['severity']}): {f['message']}")
    
    # Coherence summary
    total_apps = len(coh_data['results'])
    passed_apps = sum(1 for r in coh_data['results'] if r['passed'])
    failed_apps_details = [r for r in coh_data['results'] if not r['passed']]
    lines.append(f"\n🔍 COHERENCE: {passed_apps}/{total_apps} applications passed")
    if failed_apps_details:
        lines.append("   Failures:")
        for r in failed_apps_details:
            lines.append(f"      • {r['app']}: {len(r['errors'])} errors")
            for err in r['errors'][:2]:
                lines.append(f"        - {err}")
            if len(r['errors']) > 2:
                lines.append(f"        - ... and {len(r['errors']) - 2} more")
    
    # Critical errors check
    critical = False
    critical_details = []
    # Coherence page load errors
    for r in coh_data['results']:
        for err in r['errors']:
            if 'Page load error' in err or 'Body content too short' in err:
                critical = True
                critical_details.append(f"{r['app']}: {err}")
                break
    # Continuous high/critical severity
    for app in cont_data['applications']:
        for mode in app['modes']:
            sev = mode['analysis']['severity']
            if sev in ('high', 'critical'):
                critical = True
                critical_details.append(f"{app['name']} - {mode['mode']}: severity {sev}")
    
    lines.append(f"\n🚨 CRITICAL ERRORS: {'YES' if critical else 'NO'}")
    if critical:
        lines.append("   Details:")
        for d in critical_details:
            lines.append(f"      • {d}")
    
    # Screenshots
    screenshot_paths = []
    for r in coh_data['results']:
        if not r['passed'] and r.get('screenshots'):
            screenshot_paths.extend(r['screenshots'])
    
    lines.append(f"\n📸 SCREENSHOTS for failures: {len(screenshot_paths)} available")
    for path in screenshot_paths[:3]:
        lines.append(f"   - {os.path.basename(path)}")
    if len(screenshot_paths) > 3:
        lines.append(f"   - ... and {len(screenshot_paths) - 3} more")
    
    # File paths
    lines.append(f"\n📁 Results files:")
    lines.append(f"   Continuous: {cont_path}")
    lines.append(f"   Coherence: {coh_path}")
    
    message = '\n'.join(lines)
    
    # Determine if alert needed
    alert_needed = critical
    # Also alert if any high severity failures (already covered)
    
    # Save summary file
    summary_dir = '/home/node/.openclaw/workspace-tester/continuous-testing/results'
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    summary_path = os.path.join(summary_dir, f'summary_{timestamp}.txt')
    with open(summary_path, 'w') as f:
        f.write(message)
    
    print(f"Summary saved to {summary_path}")
    
    # Prepare data for external sending
    output = {
        'alert_needed': alert_needed,
        'critical': critical,
        'message': message,
        'summary_path': summary_path,
        'screenshot_paths': screenshot_paths,
        'continuous_path': cont_path,
        'coherence_path': coh_path
    }
    print(json.dumps(output))
    
    return output

if __name__ == '__main__':
    data = main()