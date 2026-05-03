#!/usr/bin/env node
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT || 'ws://51.254.244.216:3000/';
const BASE = 'https://new.zonacnc.com';
const RESULTS_DIR = path.join(__dirname, 'responsive-results');
const REPORT_PATH = path.join(RESULTS_DIR, `zonacnc-responsive-${Date.now()}.json`);

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'home', url: `${BASE}/es/` },
  { name: 'search', url: `${BASE}/es/buscar?search_query=torno` },
  { name: 'category', url: `${BASE}/es/28-maquinaria-metal` },
  { name: 'pricing', url: `${BASE}/es/module/zonacncplans/pricing` },
];

async function checkOverflow(page) {
  return await page.evaluate(() => {
    const doc = document.documentElement;
    const results = [];
    if (doc.scrollWidth > doc.clientWidth) {
      results.push({
        element: 'HTML',
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        type: 'DOCUMENT_OVERFLOW',
      });
    }
    const selectors = [
      '#wrapper', '.columns-container.container', '#center-column',
      '#content', 'section#products', 'div#js-product-list',
      '.zcnc-listings-layout', '.zcnc-listings-page',
      'main.zcnc-content', '#zcnc-listings-container',
      'article.zcnc-listing-row', '.zcnc-row-price-col',
      'header .container', '.zcnc-hero', 'footer .container',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const sw = el.scrollWidth;
        const cw = el.clientWidth;
        if (sw > cw + 2) {
          results.push({ element: sel, scrollWidth: sw, clientWidth: cw, diff: sw - cw, type: 'ELEMENT_OVERFLOW' });
        }
      }
    }
    return results;
  });
}

async function checkResponsiveLayout(page) {
  return await page.evaluate(() => {
    const issues = [];
    const vw = window.innerWidth;
    const sidebar = document.querySelector('#right-column, .zcnc-sidebar, aside#right-column');
    if (vw < 576 && sidebar) {
      const sbRect = sidebar.getBoundingClientRect();
      if (sbRect.width > 0 && sbRect.width > vw * 0.4) {
        issues.push({ type: 'SIDEBAR_TOO_WIDE_MOBILE', detail: `Sidebar ${sbRect.width}px on ${vw}px` });
      }
    }
    const headerContainers = document.querySelectorAll('header .container, header .row, .header-top, .header-bottom');
    for (const el of headerContainers) {
      const rect = el.getBoundingClientRect();
      if (rect.left < -2 || rect.right > vw + 2) {
        issues.push({ type: 'HEADER_OVERFLOW', detail: `${el.tagName}.${el.className} left=${rect.left} right=${rect.right} vw=${vw}` });
      }
    }
    return issues;
  });
}

async function run() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  console.log(`Connecting to Playwright server: ${WS_ENDPOINT}`);
  const browser = await playwright.chromium.connect(WS_ENDPOINT);
  console.log('Connected.\n');

  const allResults = [];
  let totalIssues = 0;
  let totalOverflows = 0;

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: 'es-ES',
    });
    const page = await context.newPage();

    for (const pg of PAGES) {
      const label = `${pg.name} @ ${vp.name} (${vp.width}×${vp.height})`;
      console.log(`Testing ${label}...`);
      try {
        await page.goto(pg.url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);

        const ssName = `zonacnc-${pg.name}-${vp.name}.png`;
        const ssPath = path.join(RESULTS_DIR, ssName);
        await page.screenshot({ path: ssPath, fullPage: true });

        const overflowIssues = await checkOverflow(page);
        const layoutIssues = await checkResponsiveLayout(page);
        const all = [...overflowIssues, ...layoutIssues];

        totalOverflows += overflowIssues.filter(i => i.type === 'ELEMENT_OVERFLOW' || i.type === 'DOCUMENT_OVERFLOW').length;
        totalIssues += all.length;

        allResults.push({
          vp: vp.name,
          vpWidth: vp.width,
          page: pg.name,
          url: pg.url,
          issues: all,
          screenshot: ssName,
        });

        if (all.length > 0) {
          console.log(`  ⚠️  ${all.length} issues:`);
          for (const issue of all.slice(0, 5)) {
            console.log(`    - [${issue.type}] ${issue.element || ''} ${issue.detail || ''}`);
          }
        } else {
          console.log(`  ✅ OK`);
        }
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
        allResults.push({ vp: vp.name, vpWidth: vp.width, page: pg.name, url: pg.url, issues: [{ type: 'ERROR', detail: err.message }], screenshot: 'N/A' });
      }
    }
    await context.close();
  }

  await browser.close();

  const summary = {
    totalIssues,
    totalOverflows,
    totalChecks: VIEWPORTS.length * PAGES.length,
    result: totalOverflows > 5 ? 'FAIL' : totalOverflows > 0 ? 'PASS_WITH_NOTES' : 'PASS',
  };

  const report = {
    site: BASE,
    date: new Date().toISOString(),
    viewports: VIEWPORTS.map(v => `${v.name} (${v.width}×${v.height})`),
    pages: PAGES.map(p => p.name),
    summary,
    details: allResults,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n=== RESPONSIVE TEST SUMMARY ===`);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nReport: ${REPORT_PATH}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
