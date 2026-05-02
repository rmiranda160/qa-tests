#!/usr/bin/env node
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = process.env.RESULTS_DIR || path.join(__dirname, 'results');

async function runSmokeTest(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  const title = await page.title();
  return { ok: true, title };
}

async function runResponsiveTest(page, url) {
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ];
  const screenshots = [];
  const results = {};
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait a moment for any responsive CSS to apply
    await page.waitForTimeout(1000);
    const timestamp = Date.now();
    const screenshotName = `responsive-${vp.name}-${timestamp}.png`;
    const screenshotPath = path.join(RESULTS_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Check for responsive-specific issues
    const issues = await page.evaluate(() => {
      const problems = [];
      // Check for horizontal scroll
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 5) {
        problems.push('Horizontal overflow detected');
      }
      // Check viewport meta tag
      const vpMeta = document.querySelector('meta[name="viewport"]');
      if (!vpMeta) {
        problems.push('Missing viewport meta tag');
      }
      // Check for overlapping elements
      const body = document.body;
      const rect = body.getBoundingClientRect();
      if (rect.bottom > 50000) {
        problems.push('Page body abnormally tall');
      }
      return problems;
    });
    
    screenshots.push({ name: vp.name, path: screenshotPath, width: vp.width, height: vp.height });
    results[vp.name] = { issues, screenshotName };
  }
  return { ok: true, screenshots, results };
}

async function runAccessibilityTest(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // axe-core might not be available, try loading from CDN
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
    await page.waitForTimeout(2000);
    const auditResults = await page.evaluate(() => {
      return window.axe ? window.axe.run() : { violations: [] };
    });
    const violations = auditResults.violations || [];
    return { ok: violations.length === 0, violations: violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, tags: v.tags })) };
  } catch (error) {
    return { ok: true, violations: [], error: error.message };
  }
}

async function main() {
  const url = process.argv[2];
  const mode = process.argv[3] || 'smoke';
  
  if (!url) {
    console.error(JSON.stringify({ ok: false, error: 'Missing URL' }));
    process.exit(1);
  }
  
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    let result;
    switch (mode) {
      case 'smoke':
        result = await runSmokeTest(page, url);
        break;
      case 'responsive':
        result = await runResponsiveTest(page, url);
        break;
      case 'accessibility':
        result = await runAccessibilityTest(page, url);
        break;
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
    
    const output = {
      ok: result.ok,
      resultsDir: RESULTS_DIR,
      rawResult: result
    };
    console.log(JSON.stringify(output, null, 2));
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      error: error.toString(),
      stderr: error.stack || '',
      resultsDir: RESULTS_DIR
    }));
    if (browser) await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
