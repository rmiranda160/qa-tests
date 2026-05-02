#!/usr/bin/env python3
import json
import os
import sys
import subprocess
import time
from datetime import datetime, timedelta
import logging

CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config-test.json')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
LOG_FILE = os.path.join(os.path.dirname(__file__), 'continuous-testing-test.log')
ALERTS_FILE = os.path.join(os.path.dirname(__file__), 'alerts-test.json')

os.makedirs(RESULTS_DIR, exist_ok=True)

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
    script_path = os.path.join(os.path.dirname(__file__), 'playwright-tester', 'compat.js')
    if not os.path.exists(script_path):
        raise FileNotFoundError(f"Script not found at {script_path}")
    cmd = ['node', script_path, url, mode]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            logger.error(f"Web tester script failed: {result.stderr}")
            return None
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

def main():
    logger.info("Starting test cycle")
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
            app_result['modes'].append({
                'mode': mode,
                'raw_result': test_result
            })
        results['applications'].append(app_result)
    
    results_file = os.path.join(RESULTS_DIR, f'{cycle_id}.json')
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    logger.info(f"Cycle {cycle_id} completed. Results saved to {results_file}")
    return 0

if __name__ == '__main__':
    sys.exit(main())