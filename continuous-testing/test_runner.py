import sys
sys.path.insert(0, '.')
from run_cycle import run_web_tester, analyze_result

url = 'https://dev1.cenarbe.com'
mode = 'smoke'
result = run_web_tester(url, mode)
print('Result:', result)
if result:
    analysis = analyze_result(result, 'Test', url, mode)
    print('Analysis:', analysis)