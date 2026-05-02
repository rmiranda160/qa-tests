#!/usr/bin/env node
// Wrapper to set PLAYWRIGHT_WS_ENDPOINT and run compat.js with args
process.env.PLAYWRIGHT_WS_ENDPOINT = 'ws://51.254.244.216:3000/';
const mod = require('./playwright-tester/compat.js');
// compat.js runs in main via require.main === module check, so we can't just require it
// Let's just inline the logic with the env var set
const { spawn } = require('child_process');
const cp = spawn('node', ['./playwright-tester/compat.js', 'https://new.zonacnc.com', 'responsive'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, PLAYWRIGHT_WS_ENDPOINT: 'ws://51.254.244.216:3000/' }
});
let stdout = '';
let stderr = '';
cp.stdout.on('data', d => stdout += d);
cp.stderr.on('data', d => stderr += d);
cp.on('close', code => {
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  process.exit(code || 0);
});
