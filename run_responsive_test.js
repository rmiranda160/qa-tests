const { execSync } = require('child_process');
const result = execSync(
  'node /home/node/.openclaw/workspace-tester/continuous-testing/playwright-tester/compat.js "https://new.zonacnc.com" "responsive"',
  { encoding: 'utf8', timeout: 120000 }
);
console.log(result);
