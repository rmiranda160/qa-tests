#!/usr/bin/env node
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, 'responsive-results');
const SCREENSHOTS_DIR = path.join(__dirname, 'responsive-screenshots-404');
const BASE = 'https://new.zonacnc.com';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'error-404-page', url: `${BASE}/es/pagina-no-encontrada` },
  { name: 'error-404-random', url: `${BASE}/es/esta-url-no-existe-12345-qa-test` },
];

async function launchBrowser() {
  // Try remote first, fallback to local
  const wsEp = process.env.PLAYWRIGHT_WS_ENDPOINT;
  if (wsEp) {
    try {
      console.log(`Trying remote Playwright: ${wsEp}`);
      const b = await playwright.chromium.connect(wsEp, { timeout: 5000 });
      console.log('Connected to remote.\n');
      return b;
    } catch (e) {
      console.log(`Remote unavailable (${e.message}), trying local...`);
    }
  }
  console.log('Launching local Chromium...');
  return await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await launchBrowser();
  console.log('');

  const allResults = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: 'es-ES',
    });
    const page = await context.newPage();

    for (const pg of PAGES) {
      const label = `${pg.name} @ ${vp.name} (${vp.width}x${vp.height})`;
      console.log(`Testing ${label}...`);
      try {
        const resp = await page.goto(pg.url, { waitUntil: 'networkidle', timeout: 30000 });
        const httpStatus = resp ? resp.status() : null;
        await page.waitForTimeout(1000);

        const ssName = `error-${pg.name}-${vp.name}.png`;
        const ssPath = path.join(SCREENSHOTS_DIR, ssName);
        await page.screenshot({ path: ssPath, fullPage: true });

        const title = await page.title();
        const h1Count = await page.locator('h1').count();
        let h1Text = '';
        if (h1Count > 0) h1Text = (await page.locator('h1').first().textContent()) || '';
        const finalUrl = page.url();

        // Check overflow
        const overflowData = await page.evaluate(() => {
          const doc = document.documentElement;
          const issues = [];
          if (doc.scrollWidth > doc.clientWidth) {
            issues.push({ el: 'HTML', sw: doc.scrollWidth, cw: doc.clientWidth, diff: doc.scrollWidth - doc.clientWidth });
          }
          for (const sel of ['header .container', 'footer .container', '#wrapper', '#content', '.zcnc-listings-layout']) {
            const el = document.querySelector(sel);
            if (el && el.scrollWidth > el.clientWidth + 2) {
              issues.push({ el: sel, sw: el.scrollWidth, cw: el.clientWidth, diff: el.scrollWidth - el.clientWidth });
            }
          }
          return { overflow: issues, vw: window.innerWidth, vh: window.innerHeight };
        });

        const result = {
          vp: vp.name, vpW: vp.width, page: pg.name,
          url: pg.url, finalUrl, title, httpStatus,
          h1: h1Count > 0 ? h1Text.trim() : 'MISSING',
          overflow: overflowData.overflow,
          pass: true,
        };
        allResults.push(result);

        console.log(`  URL: ${finalUrl}  HTTP: ${httpStatus}  Title: ${title.substring(0,50)}`);
        console.log(`  H1: "${h1Text.trim().substring(0,60)}"`);
        if (overflowData.overflow.length > 0) {
          console.log(`  ⚠️ OVERFLOW (${overflowData.overflow.length}):`);
          overflowData.overflow.forEach(o => console.log(`    ${o.el}: scroll=${o.sw} client=${o.cw} diff=${o.diff}`));
        } else {
          console.log(`  ✅ Layout OK`);
        }
      } catch (err) {
        console.log(`  ❌ ERROR: ${err.message.substring(0,100)}`);
        allResults.push({ vp: vp.name, vpW: vp.width, page: pg.name, url: pg.url, error: err.message, pass: false });
      }
    }
    await context.close();
  }

  await browser.close();

  // Summary
  const ok = allResults.filter(r => r.pass);
  const fails = allResults.filter(r => !r.pass);
  const overflows = allResults.filter(r => r.overflow && r.overflow.length > 0);
  const noH1 = allResults.filter(r => r.h1 === 'MISSING');

  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESPONSIVE TEST - ERROR PAGES (404)`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Pages tested: ${PAGES.length} × ${VIEWPORTS.length} viewports = ${VIEWPORTS.length * PAGES.length} checks`);
  console.log(`Passed: ${ok.length}`);
  console.log(`Errors: ${fails.length}`);
  console.log(`Overflow issues: ${overflows.length}`);
  console.log(`Missing H1: ${noH1.length}`);

  if (fails.length > 0) {
    console.log(`\n❌ ERRORS:`);
    fails.forEach(f => console.log(`  [${f.vp}/${f.page}] ${f.error}`));
  }
  if (overflows.length > 0) {
    console.log(`\n⚠️  OVERFLOWS:`);
    overflows.forEach(r => {
      console.log(`  [${r.vp}/${r.page}]`);
      if (r.overflow) r.overflow.forEach(o => console.log(`    ${o.el}: ${o.diff}px overflow`));
    });
  }
  if (noH1.length > 0) {
    console.log(`\n⚠️  MISSING H1:`);
    noH1.forEach(r => console.log(`  [${r.vp}/${r.page}]`));
  }

  const finalResult = fails.length > 0 ? 'ERROR' : overflows.length > 0 ? 'PASS_WITH_NOTES' : 'PASS';
  console.log(`\nResult: ${finalResult}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}`);
}

run().catch(err => { console.error(err); process.exit(1); });
