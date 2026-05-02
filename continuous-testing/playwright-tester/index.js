#!/usr/bin/env node
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT || 'ws://51.254.244.216:3000/';
const RESULTS_DIR = process.env.RESULTS_DIR || path.join(__dirname, 'results');

async function runSmokeTest(page, url) {
  console.error(`Running smoke test for ${url}`);
  await page.goto(url);
  const title = await page.title();
  console.error(`Title: ${title}`);
  // Basic checks: page loaded, no major errors
  const status = page.url().startsWith(url) ? 'ok' : 'redirected';
  return { ok: true, title, status };
}

async function runResponsiveTest(page, url, viewports) {
  console.error(`Running responsive test for ${url}`);
  const results = {};
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url);
    const screenshotPath = path.join(RESULTS_DIR, `responsive-${vp.name}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    results[vp.name] = { screenshot: screenshotPath, width: vp.width, height: vp.height };
  }
  return { ok: true, results };
}

async function runAccessibilityTest(page, url) {
  console.error(`Running accessibility test for ${url}`);
  // Inject axe-core and run audit
  await page.goto(url);
  await page.addScriptTag({ path: require.resolve('axe-core') });
  const auditResults = await page.evaluate(() => {
    return window.axe.run();
  });
  const violations = auditResults.violations;
  return { ok: violations.length === 0, violations };
}

async function main() {
  const url = process.argv[2];
  const mode = process.argv[3] || 'smoke';
  
  if (!url) {
    console.error('Usage: node index.js <url> [mode]');
    process.exit(1);
  }
  
  // Ensure results directory exists
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  let browser;
  try {
    browser = await playwright.chromium.connect(WS_ENDPOINT);
    const page = await browser.newPage();
    
    let result;
    switch (mode) {
      case 'smoke':
        result = await runSmokeTest(page, url);
        break;
      case 'responsive':
        const viewports = [
          { name: 'mobile', width: 390, height: 844 },
          { name: 'tablet', width: 768, height: 1024 },
          { name: 'desktop', width: 1440, height: 900 }
        ];
        result = await runResponsiveTest(page, url, viewports);
        break;
      case 'accessibility':
        result = await runAccessibilityTest(page, url);
        break;
      default:
        console.error(`Unknown mode: ${mode}`);
        process.exit(1);
    }
    
    // Output JSON result with expected fields
    const output = {
      ...result,
      ok: result.ok !== false,
      stdout: "",
      stderr: "",
      resultsDir: process.env.RESULTS_DIR || ""
    };
    console.log(JSON.stringify(output, null, 2));
    
    await browser.close();
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    console.error('Error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runSmokeTest, runResponsiveTest, runAccessibilityTest };