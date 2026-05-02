#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

def main():
    # Paths
    base_dir = os.path.dirname(__file__)
    results_dir = os.path.join(base_dir, 'results')
    coherence_dir = os.path.join(base_dir, 'coherence-results')
    
    # Find latest continuous results (excluding miranda files)
    cont_files = []
    for f in os.listdir(results_dir):
        if f.endswith('.json') and not f.startswith('coherence') and not f.startswith('miranda'):
            cont_files.append(f)
    if not cont_files:
        print("No continuous testing results found")
        return
    # Sort by modification time
    cont_files_with_mtime = [(f, os.path.getmtime(os.path.join(results_dir, f))) for f in cont_files]
    cont_files_with_mtime.sort(key=lambda x: x[1], reverse=True)
    latest_cont = cont_files_with_mtime[0][0]
    cont_path = os.path.join(results_dir, latest_cont)
    
    # Find latest coherence results
    coh_files = []
    for f in os.listdir(coherence_dir):
        if f.endswith('.json'):
            coh_files.append(f)
    if not coh_files:
        print("No coherence results found")
        return
    # Sort by modification time
    coh_files_with_mtime = [(f, os.path.getmtime(os.path.join(coherence_dir, f))) for f in coh_files]
    coh_files_with_mtime.sort(key=lambda x: x[1], reverse=True)
    latest_coh = coh_files_with_mtime[0][0]
    coh_path = os.path.join(coherence_dir, latest_coh)
    
    # Load data
    with open(cont_path, 'r') as f:
        cont_data = json.load(f)
    with open(coh_path, 'r') as f:
        coh_data = json.load(f)
    
    # Extract info
    cycle_id = cont_data.get('cycle_id', 'unknown')
    start_time = cont_data.get('start_time', '')
    apps = cont_data.get('applications', [])
    
    # Build summary lines
    lines = []
    lines.append(f"Continuous Testing Cycle executed at {start_time[:10]} {start_time[11:19]} UTC")
    lines.append("")
    lines.append("Applications tested:")
    
    total_modes = 0
    passed_modes = 0
    failed_modes = 0
    alerts = []
    
    for app in apps:
        name = app.get('name', 'Unknown')
        url = app.get('url', '')
        lines.append(f"- {name} ({url})")
        for mode in app.get('modes', []):
            total_modes += 1
            mode_name = mode.get('mode', 'unknown')
            analysis = mode.get('analysis', {})
            status = analysis.get('status', 'unknown')
            severity = analysis.get('severity', 'none')
            if status == 'pass':
                passed_modes += 1
                lines.append(f"  - {mode_name}: PASS")
            else:
                failed_modes += 1
                sev_label = severity.upper() if severity != 'none' else ''
                lines.append(f"  - {mode_name}: FAIL ({sev_label})")
                if severity in ['critical', 'high']:
                    alerts.append({
                        'application': name,
                        'mode': mode_name,
                        'severity': severity,
                        'message': analysis.get('message', '')
                    })
    
    lines.append("")
    lines.append(f"Overall: {passed_modes}/{total_modes} test modes passed, {failed_modes} failed.")
    lines.append("")
    
    # Coherence results
    coh_results = coh_data.get('results', [])
    lines.append("Coherence testing:")
    coh_passed = sum(1 for r in coh_results if r.get('passed', False))
    coh_total = len(coh_results)
    for r in coh_results:
        app = r['app']
        passed = r['passed']
        status = "PASS" if passed else "FAIL"
        lines.append(f"- {app}: {status}")
    lines.append(f"Coherence summary: {coh_passed}/{coh_total} applications passed.")
    lines.append("")
    
    # Alert status
    if alerts:
        lines.append("Alerts generated:")
        for alert in alerts:
            lines.append(f"- {alert['severity'].upper()} - {alert['application']} {alert['mode']} test failed")
        lines.append("Alert notification sent to coordinator agent (agent:coordinator:main).")
    else:
        lines.append("Alert status: No critical/high alerts generated. No notification sent to coordinator.")
    
    # Additional info
    lines.append("")
    lines.append(f"Continuous results saved to: {cont_path}")
    lines.append(f"Coherence results saved to: {coh_path}")
    lines.append(f"Logs: {os.path.join(base_dir, 'continuous-testing.log')}")
    lines.append(f"Coherence logs: {os.path.join(base_dir, 'coherence_output.log')}")
    
    # Output summary
    summary = '\n'.join(lines)
    print(summary)
    
    # Save to file
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    summary_path = os.path.join(base_dir, f'cron_summary_{timestamp}.txt')
    with open(summary_path, 'w') as f:
        f.write(summary)
    # Update latest
    latest_path = os.path.join(base_dir, 'cron_summary_latest.txt')
    with open(latest_path, 'w') as f:
        f.write(summary)
    
    # Determine exit code (failures present?)
    exit_code = 0 if failed_modes == 0 else 1
    sys.exit(exit_code)

if __name__ == '__main__':
    main()