#!/usr/bin/env node
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT || 'ws://51.254.244.216:3000/';
const RESULTS_DIR = '/home/node/.openclaw/workspace-tester/continuous-testing/playwright-tester/results';

async function run() {
  const url = 'https://new.zonacnc.com/';
  
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  let browser;
  try {
    console.error('Connecting to Playwright server...');
    browser = await playwright.chromium.connect(WS_ENDPOINT);
    const page = await browser.newPage();
    
    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ];
    
    const results = {};
    for (const vp of viewports) {
      console.error(`Testing ${vp.name} (${vp.width}x${vp.height})...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const screenshotName = `responsive-${vp.name}-${Date.now()}.png`;
      const screenshotPath = path.join(RESULTS_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results[vp.name] = { screenshot: screenshotPath, width: vp.width, height: vp.height };
    }
    
    const output = { ok: true, results };
    console.log(JSON.stringify(output, null, 2));
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message || error);
    const output = { ok: false, error: error.message || String(error) };
    console.log(JSON.stringify(output, null, 2));
    if (browser) await browser.close();
    process.exit(1);
  }
}

run();
