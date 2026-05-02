#!/usr/bin/env python3
import json
import subprocess
import sys
import os

# Load original config
with open('config.json', 'r') as f:
    config = json.load(f)

# Filter only Calendario Cenarbe
calendario_app = None
for app in config['applications']:
    if app['name'] == 'Calendario Cenarbe':
        calendario_app = app
        break

if not calendario_app:
    print("Calendario app not found")
    sys.exit(1)

# Create config with only that app
test_config = {
    'applications': [calendario_app],
    'alerting': config['alerting'],
    'schedule': config['schedule']
}

# Write temporary config
with open('config.json.test', 'w') as f:
    json.dump(test_config, f, indent=2)

# Backup original config
os.rename('config.json', 'config.json.original')
os.rename('config.json.test', 'config.json')

try:
    # Run cycle
    result = subprocess.run(['python3', 'run_cycle.py'], capture_output=True, text=True)
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
    print("Return code:", result.returncode)
finally:
    # Restore original config
    os.rename('config.json', 'config.json.test')
    os.rename('config.json.original', 'config.json')
    os.remove('config.json.test')