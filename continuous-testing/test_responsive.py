#!/usr/bin/env python3
import sys
sys.path.append('.')
from run_cycle import run_web_tester

sites = [
    ('Cenarbe', 'https://dev1.cenarbe.com'),
    ('ContentoAI', 'https://contentoai.cenarbe.com'),
    ('Villa Zocotin', 'https://villazocotin.cenarbe.com')
]

for name, url in sites:
    print(f'Testing {name}...')
    result = run_web_tester(url, 'responsive')
    if result and result.get('ok'):
        print(f'  OK - screenshots in {result.get("resultsDir")}')
    else:
        print(f'  FAIL - {result}')