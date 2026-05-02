#!/usr/bin/env python3
"""
Continuous testing cycle for CEO Miranda's order.
Runs web tests for all applications, logs results, and sends alerts for critical issues.
"""
import json
import os
import sys
import subprocess
import time
from datetime import datetime, timedelta
import logging

# Configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
LOG_FILE = os.path.join(os.path.dirname(__file__), 'continuous-testing.log')
ALERTS_FILE = os.path.join(os.path.dirname(__file__), 'alerts.json')

# Ensure directories exist
os.makedirs(RESULTS_DIR, exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def load_config():
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def run_web_tester(url, mode):
    """Call the web-tester script and return JSON output."""
    # Try new playwright tester first
    script_path = os.path.join(os.path.dirname(__file__), 'playwright-tester', 'compat.js')
    if not os.path.exists(script_path):
        # Fallback to old web-tester (might be broken)
        script_path = os.path.join(os.path.dirname(__file__), '..', 'skills', 'web-tester', 'run-web-tester.sh')
    if not os.path.exists(script_path):
        raise FileNotFoundError(f"Web tester script not found at {script_path}")
    cmd = ['node', script_path, url, mode]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            logger.error(f"Web tester script failed: {result.stderr}")
            return None
        # Parse JSON output
        output = json.loads(result.stdout)
        return output
    except subprocess.TimeoutExpired:
        logger.error(f"Timeout running web tester for {url}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON output from web tester: {result.stdout[:200]} - Error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error running web tester: {e}")
        return None

def analyze_result(result, app_name, url, mode):
    """Analyze test result and determine severity."""
    if not result:
        return {
            'status': 'error',
            'severity': 'high',
            'message': 'Test execution failed',
            'screenshot_paths': []
        }
    # Extract screenshot paths from rawResult if available
    screenshot_paths = []
    raw_result = result.get('rawResult')
    if raw_result and isinstance(raw_result, dict):
        if 'screenshots' in raw_result and isinstance(raw_result['screenshots'], list):
            for screenshot in raw_result['screenshots']:
                if isinstance(screenshot, dict) and 'path' in screenshot:
                    screenshot_paths.append(screenshot['path'])
    
    if result.get('ok') == True:
        return {
            'status': 'pass',
            'severity': 'none',
            'message': 'All tests passed',
            'screenshot_paths': screenshot_paths
        }
    else:
        # Determine severity based on output (simplistic)
        stdout = result.get('stdout', '')
        stderr = result.get('stderr', '')
        if 'critical' in stdout.lower() or 'critical' in stderr.lower():
            severity = 'critical'
        elif 'error' in stdout.lower() or 'error' in stderr.lower():
            severity = 'high'
        else:
            severity = 'medium'
        return {
            'status': 'fail',
            'severity': severity,
            'message': f'Test failures detected. See results at {result.get("resultsDir", "unknown")}',
            'screenshot_paths': screenshot_paths
        }

def send_alert(alert):
    """Write alert to alerts file for external notification."""
    alerts = []
    if os.path.exists(ALERTS_FILE):
        with open(ALERTS_FILE, 'r') as f:
            alerts = json.load(f)
    alerts.append(alert)
    with open(ALERTS_FILE, 'w') as f:
        json.dump(alerts, f, indent=2)
    logger.info(f"Alert written: {alert['title']}")
    # Optionally send to Telegram
    send_telegram_alert(alert)

def send_telegram_alert(alert):
    """Send alert to Telegram channel with optional screenshots."""
    import subprocess
    chat_id = "7885094157"  # TODO: make configurable
    # Build message text
    title = alert.get('title', 'Alert')
    message = alert.get('message', '')
    full_text = f"{title}\n{message}"
    # Escape quotes for shell
    full_text_escaped = full_text.replace('"', '\\"')
    # Command base
    cmd = ['openclaw', 'message', 'send', '--channel', 'telegram', '--target', chat_id, '--message', full_text_escaped]
    # Add screenshot if available
    screenshot_paths = alert.get('screenshot_paths', [])
    if screenshot_paths:
        # Send first screenshot as photo (limit 1 for simplicity)
        first_path = screenshot_paths[0]
        # Use media parameter
        cmd.extend(['--media', first_path, '--caption', full_text_escaped])
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            logger.info(f"Telegram alert sent: {title}")
        else:
            logger.error(f"Telegram alert failed: {result.stderr}")
    except Exception as e:
        logger.error(f"Telegram alert exception: {e}")

def main():
    logger.info("Starting continuous testing cycle")
    config = load_config()
    cycle_start = datetime.utcnow()
    cycle_id = cycle_start.strftime('%Y%m%d_%H%M%S')
    results = {
        'cycle_id': cycle_id,
        'start_time': cycle_start.isoformat(),
        'applications': []
    }
    
    for app in config['applications']:
        app_name = app['name']
        url = app['url']
        logger.info(f"Testing {app_name} ({url})")
        app_result = {
            'name': app_name,
            'url': url,
            'modes': []
        }
        for mode in app['modes']:
            logger.info(f"  Running {mode} tests")
            test_result = run_web_tester(url, mode)
            analysis = analyze_result(test_result, app_name, url, mode)
            mode_result = {
                'mode': mode,
                'raw_result': test_result,
                'analysis': analysis
            }
            app_result['modes'].append(mode_result)
            
            # Check if alert needed
            min_severity = config['alerting']['minSeverity']
            severity_order = {'none': 0, 'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
            if severity_order.get(analysis['severity'], 0) >= severity_order.get(min_severity, 0):
                alert = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'application': app_name,
                    'url': url,
                    'mode': mode,
                    'severity': analysis['severity'],
                    'title': f"{analysis['severity'].upper()} - {app_name} {mode} test failed",
                    'message': analysis['message'],
                    'cycle_id': cycle_id,
                    'screenshot_paths': analysis.get('screenshot_paths', [])
                }
                send_alert(alert)
        results['applications'].append(app_result)
    
    # Save cycle results
    results_file = os.path.join(RESULTS_DIR, f'{cycle_id}.json')
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    logger.info(f"Cycle {cycle_id} completed. Results saved to {results_file}")
    
    # Generate summary report
    total_modes = sum(len(app['modes']) for app in config['applications'])
    passed_modes = sum(1 for app in results['applications'] for mode in app['modes'] if mode['analysis']['status'] == 'pass')
    failed_modes = total_modes - passed_modes
    logger.info(f"Summary: {passed_modes}/{total_modes} modes passed, {failed_modes} failed.")
    
    # If any critical alerts, also log loudly
    critical_alerts = [app for app in results['applications'] for mode in app['modes'] if mode['analysis']['severity'] == 'critical']
    if critical_alerts:
        logger.critical(f"CRITICAL ISSUES DETECTED: {len(critical_alerts)}")
    
    return 0 if failed_modes == 0 else 1

if __name__ == '__main__':
    sys.exit(main())