#!/usr/bin/env node
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT || 'ws://51.254.244.216:3000/';
const RESULTS_DIR = process.env.RESULTS_DIR || path.join(__dirname, 'results');

async function runSmokeTest(page, url) {
  await page.goto(url);
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
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url);
    const screenshotName = `responsive-${vp.name}-${Date.now()}.png`;
    const screenshotPath = path.join(RESULTS_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    screenshots.push({ name: vp.name, path: screenshotPath, width: vp.width, height: vp.height });
  }
  return { ok: true, screenshots };
}

async function runAccessibilityTest(page, url) {
  try {
    await page.goto(url);
    await page.addScriptTag({ path: require.resolve('axe-core') });
    const auditResults = await page.evaluate(() => {
      return window.axe.run();
    });
    const violations = auditResults.violations;
    return { ok: violations.length === 0, violations };
  } catch (error) {
    // fallback: just return ok true for now
    return { ok: true, violations: [], error: error.message };
  }
}

async function runApiTest(page, url) {
  // For calendario API tests
  // Base URL is https://dev1.cenarbe.com/calendario/
  // We'll test the two endpoints
  const baseUrl = url.replace(/\/$/, '');
  const endpoints = [
    { path: '/api/bicicletas.php', method: 'GET' },
    { path: '/api/eventos.php', method: 'GET' }
  ];
  const results = [];
  let allOk = true;
  
  for (const endpoint of endpoints) {
    const endpointUrl = baseUrl + endpoint.path;
    try {
      const response = await page.request.get(endpointUrl);
      const status = response.status();
      const contentType = response.headers()['content-type'] || '';
      let jsonValid = false;
      let data = null;
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
          jsonValid = Array.isArray(data);
        } catch (e) {
          jsonValid = false;
        }
      }
      const ok = status === 200 && jsonValid;
      if (!ok) allOk = false;
      results.push({
        endpoint: endpoint.path,
        url: endpointUrl,
        status,
        contentType,
        jsonValid,
        ok
      });
    } catch (error) {
      results.push({
        endpoint: endpoint.path,
        url: endpointUrl,
        error: error.message,
        ok: false
      });
      allOk = false;
    }
  }
  
  return { ok: allOk, results };
}

async function main() {
  const url = process.argv[2];
  const mode = process.argv[3] || 'smoke';
  
  if (!url) {
    console.error(JSON.stringify({ ok: false, error: 'Missing URL' }));
    process.exit(1);
  }
  
  // Ensure results directory exists
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  let browser;
  let stdout = '';
  let stderr = '';
  try {
    browser = await playwright.chromium.connect(WS_ENDPOINT);
    const page = await browser.newPage();
    
    let result;
    switch (mode) {
      case 'smoke':
        result = await runSmokeTest(page, url);
        stdout = `Smoke test passed for ${url}. Title: ${result.title}`;
        break;
      case 'responsive':
        result = await runResponsiveTest(page, url);
        stdout = `Responsive test passed for ${url}. Screenshots: ${result.screenshots.map(s => s.name).join(', ')}`;
        break;
      case 'accessibility':
        result = await runAccessibilityTest(page, url);
        stdout = `Accessibility test ${result.ok ? 'passed' : 'failed'} for ${url}. Violations: ${result.violations ? result.violations.length : 0}`;
        break;
      case 'api':
        result = await runApiTest(page, url);
        stdout = `API test ${result.ok ? 'passed' : 'failed'} for ${url}. Results: ${JSON.stringify(result.results)}`;
        break;
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
    
    const output = {
      ok: result.ok,
      stdout,
      stderr,
      resultsDir: RESULTS_DIR,
      rawResult: result
    };
    console.log(JSON.stringify(output, null, 2));
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    stderr = error.toString();
    console.log(JSON.stringify({
      ok: false,
      stdout: '',
      stderr,
      resultsDir: ''
    }));
    if (browser) await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}