#!/usr/bin/env node
process.env.PLAYWRIGHT_WS_ENDPOINT = 'ws://51.254.244.216:3000/';
require('./playwright-tester/compat.js');
