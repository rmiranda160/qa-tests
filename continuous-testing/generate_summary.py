#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

def main():
    # Find latest continuous results
    results_dir = '/home/node/.openclaw/workspace-tester/continuous-testing/results'
    coherence_dir = '/home/node/.openclaw/workspace-tester/continuous-testing/coherence-results'
    
    # Get latest continuous result
    cont_files = [f for f in os.listdir(results_dir) if f.endswith('.json') and not f.startswith('summary')]
    cont_files.sort(reverse=True)
    if not cont_files:
        print("No continuous results found")
        return
    latest_cont = os.path.join(results_dir, cont_files[0])
    cont_data = load_json(latest_cont)
    
    # Get latest coherence result
    coh_files = [f for f in os.listdir(coherence_dir) if f.endswith('.json')]
    coh_files.sort(reverse=True)
    if not coh_files:
        print("No coherence results found")
        return
    latest_coh = os.path.join(coherence_dir, coh_files[0])
    coh_data = load_json(latest_coh)
    
    # Summary text
    lines = []
    lines.append("=" * 60)
    lines.append(f"CONTINUOUS TESTING CYCLE REPORT")
    lines.append(f"Generated: {datetime.utcnow().isoformat()}Z")
    lines.append(f"Continuous cycle ID: {cont_data.get('cycle_id', 'N/A')}")
    lines.append(f"Coherence cycle ID: {coh_data.get('cycleId', 'N/A')}")
    lines.append("=" * 60)
    
    # Continuous results
    lines.append("\n📊 WEB TESTER RESULTS")
    total_modes = 0
    passed_modes = 0
    failed_apps = []
    for app in cont_data['applications']:
        app_name = app['name']
        app_failed = False
        for mode in app['modes']:
            total_modes += 1
            if mode['analysis']['status'] == 'pass':
                passed_modes += 1
            else:
                app_failed = True
        if app_failed:
            failed_apps.append(app_name)
    lines.append(f"   Total modes: {total_modes}")
    lines.append(f"   Passed: {passed_modes}")
    lines.append(f"   Failed: {total_modes - passed_modes}")
    if failed_apps:
        lines.append(f"   Failed applications: {', '.join(failed_apps)}")
    
    # Coherence results
    lines.append("\n🔍 COHERENCE TEST RESULTS")
    total_apps = len(coh_data['results'])
    passed_apps = sum(1 for r in coh_data['results'] if r['passed'])
    failed_apps_co = [r['app'] for r in coh_data['results'] if not r['passed']]
    lines.append(f"   Total applications: {total_apps}")
    lines.append(f"   Passed: {passed_apps}")
    lines.append(f"   Failed: {total_apps - passed_apps}")
    if failed_apps_co:
        lines.append(f"   Failed applications: {', '.join(failed_apps_co)}")
        # List errors
        for r in coh_data['results']:
            if not r['passed']:
                lines.append(f"      - {r['app']}: {len(r['errors'])} errors")
                for err in r['errors'][:3]:  # limit
                    lines.append(f"          * {err}")
                if len(r['errors']) > 3:
                    lines.append(f"          * ... and {len(r['errors']) - 3} more")
    
    # Determine critical errors
    critical = False
    # Check for page load errors in coherence
    for r in coh_data['results']:
        for err in r['errors']:
            if 'Page load error' in err or 'Body content too short' in err:
                critical = True
                break
    # Check for high/critical severity in continuous
    for app in cont_data['applications']:
        for mode in app['modes']:
            sev = mode['analysis']['severity']
            if sev in ('high', 'critical'):
                critical = True
                break
    
    lines.append("\n🚨 CRITICAL STATUS: " + ("YES" if critical else "NO"))
    
    # Screenshots
    lines.append("\n📸 SCREENSHOTS AVAILABLE")
    screenshot_paths = []
    for r in coh_data['results']:
        if r.get('screenshots'):
            for path in r['screenshots']:
                screenshot_paths.append(path)
                lines.append(f"   - {r['app']}: {os.path.basename(path)}")
    
    # Write summary file
    summary_dir = '/home/node/.openclaw/workspace-tester/continuous-testing/results'
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    summary_path = os.path.join(summary_dir, f'summary_{timestamp}.txt')
    with open(summary_path, 'w') as f:
        f.write('\n'.join(lines))
    
    print(f"Summary written to {summary_path}")
    
    # Return data for alerting
    return {
        'critical': critical,
        'summary_path': summary_path,
        'failed_web': failed_apps,
        'failed_coherence': failed_apps_co,
        'screenshot_paths': screenshot_paths,
        'continuous_cycle_id': cont_data.get('cycle_id'),
        'coherence_cycle_id': coh_data.get('cycleId')
    }

if __name__ == '__main__':
    data = main()
    # Print JSON for external consumption
    print(json.dumps(data))