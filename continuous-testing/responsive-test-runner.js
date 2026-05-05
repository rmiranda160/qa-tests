const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT || 'ws://51.254.244.216:3000/';
const RESULTS_DIR = '/home/node/.openclaw/workspace-tester/skills/web-tester/responsive-results';

function checkUrl(url) {
  return new Promise((resolve) => {
    const https = require('https');
    const http = require('http');
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 8000 }, (res) => {
      resolve({ url: url, status: res.statusCode });
      res.resume();
    });
    req.on('error', (e) => {
      resolve({ url: url, error: e.message.substring(0, 100) });
    });
    req.setTimeout(8000, () => { req.destroy(); resolve({ url: url, error: 'timeout' }); });
  });
}

async function run() {
  const url = process.argv[2] || 'https://new.zonacnc.com/';
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ];
  
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
  
  let browser;
  try {
    browser = await playwright.chromium.connect(WS_ENDPOINT);
  } catch (e) {
    // Fall back to checking via HTTP requests only
    console.log(JSON.stringify({ ok: false, mode: 'http-only', error: e.message }));
    return;
  }
  
  const results = [];
  
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    
    const pages = [
      'https://new.zonacnc.com/es/',
      'https://new.zonacnc.com/en/',
      'https://new.zonacnc.com/es/15-tornos',
      'https://new.zonacnc.com/es/iniciar-sesion',
      'https://new.zonacnc.com/es/contactenos',
      'https://new.zonacnc.com/es/module/zonacncplans/pricing',
    ];
    
    for (const p of pages) {
      try {
        await page.goto(p, { timeout: 15000, waitUntil: 'domcontentloaded' });
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        const title = await page.title();
        results.push({
          viewport: vp.name,
          page: p,
          status: 'ok',
          title: title.substring(0, 60),
          overflow: overflow,
        });
      } catch (e) {
        results.push({
          viewport: vp.name,
          page: p,
          status: 'error',
          error: e.message.substring(0, 100)
        });
      }
    }
    await ctx.close();
  }
  
  // Check product detail pages with HTTP requests
  const productUrls = [
    'https://new.zonacnc.com/es/tornos-automaticos/12969-torno-cnc-haas-st-10.html',
    'https://new.zonacnc.com/es/tornos-automaticos/12968-torno-cnc-haas-qa-test-i18n-001.html',
    'https://new.zonacnc.com/es/tornos-automaticos/12965-torno-cnc-haas-st-20y-2019.html',
    'https://new.zonacnc.com/es/15-tornos',
    'https://new.zonacnc.com/en/search',
    'https://new.zonacnc.com/es/buscar',
  ];
  
  for (const p of productUrls) {
    results.push(await checkUrl(p));
  }
  
  const report = {
    ok: true,
    timestamp: new Date().toISOString(),
    results
  };
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(RESULTS_DIR, `responsive-report-${timestamp}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  
  if (browser) await browser.close();
}

run().catch(e => { console.error(e.message); process.exit(1); });
