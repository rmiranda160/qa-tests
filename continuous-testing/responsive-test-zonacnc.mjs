#!/usr/bin/env node
import playwright from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'https://new.zonacnc.com';
const RESULTS_DIR = '/home/node/.openclaw/workspace-tester/continuous-testing/responsive-results';

// Escenario único: Home page + Search page + Category page
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
    const docOverflow = doc.scrollWidth > doc.clientWidth;
    const results = [];
    
    if (docOverflow) {
      results.push({
        element: 'HTML',
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        diff: doc.scrollWidth - doc.clientWidth,
        type: 'DOCUMENT_OVERFLOW',
      });
    }

    // Check key layout elements for overflow
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
        if (sw > cw + 2) { // 2px tolerance
          const style = window.getComputedStyle(el);
          results.push({
            element: sel,
            scrollWidth: sw,
            clientWidth: cw,
            diff: sw - cw,
            overflowX: style.overflowX,
            type: 'ELEMENT_OVERFLOW',
          });
        }
      }
    }
    
    // Check for text overflow in visible elements
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      const sh = el.scrollHeight;
      const ch = el.clientHeight;
      if ((sw > cw + 5 || sh > ch + 5) && el.children.length === 0 && el.textContent.trim().length > 0) {
        const style = window.getComputedStyle(el);
        if (style.overflow !== 'visible') {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            results.push({
              element: el.tagName,
              text: el.textContent.trim().substring(0, 60),
              scrollWidth: sw,
              clientWidth: cw,
              scrollHeight: sh,
              clientHeight: ch,
              overflow: style.overflow,
              overflowX: style.overflowX,
              overflowY: style.overflowY,
              whiteSpace: style.whiteSpace,
              textOverflow: style.textOverflow,
              type: 'TEXT_OVERFLOW',
            });
            if (results.length > 30) break; // cap at 30 text issues
          }
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
    
    // Check if sidebar is visible and causing issues on mobile
    const sidebar = document.querySelector('#right-column, .zcnc-sidebar, aside#right-column');
    const mainContent = document.querySelector('#center-column, main, #content-wrapper');
    
    if (vw < 576 && sidebar) {
      const sbRect = sidebar.getBoundingClientRect();
      if (sbRect.width > 0 && sbRect.width > vw * 0.4) {
        issues.push({
          type: 'SIDEBAR_TOO_WIDE_MOBILE',
          detail: `Sidebar width ${sbRect.width}px on ${vw}px viewport (>40%)`,
        });
      }
    }
    
    // Check products grid on tablet
    if (vw >= 750 && vw <= 800) {
      const productList = document.querySelector('#js-product-list, .products, .zcnc-listings-layout');
      if (productList) {
        const plRect = productList.getBoundingClientRect();
        if (plRect.right > vw + 5) {
          issues.push({
            type: 'PRODUCT_LIST_OVERFLOW_TABLET',
            detail: `Product list right edge ${plRect.right}px on ${vw}px viewport`,
          });
        }
      }
    }
    
    // Check header elements don't overflow
    const headerContainers = document.querySelectorAll('header .container, header .row, .header-top, .header-bottom');
    for (const el of headerContainers) {
      const rect = el.getBoundingClientRect();
      if (rect.left < -2 || rect.right > vw + 2) {
        issues.push({
          type: 'HEADER_OVERFLOW',
          detail: `Header element ${el.tagName}.${el.className} overflows: left=${rect.left}, right=${rect.right}, vw=${vw}`,
        });
      }
    }

    return issues;
  });
}

async function run() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

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
      console.log(`Testing ${pg.name} @ ${vp.name} (${vp.width}×${vp.height})...`);
      try {
        await page.goto(pg.url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);
        
        // Screenshot
        const ssName = `${pg.name}-${vp.name}-${vp.width}x${vp.height}.png`;
        await page.screenshot({ path: path.join(RESULTS_DIR, ssName), fullPage: true });
        
        // Overflow check
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

        // Output issues as they're found
        if (all.length > 0) {
          console.log(`  ⚠️  ${all.length} issues found:`);
          for (const issue of all.slice(0, 10)) {
            console.log(`    - [${issue.type}] ${issue.element || ''} ${issue.text ? '"' + issue.text + '"' : ''} ${issue.detail || ''} (diff: ${issue.diff || ''}px)`);
          }
          if (all.length > 10) console.log(`    ... and ${all.length - 10} more`);
        } else {
          console.log(`  ✅ No issues`);
        }
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
        allResults.push({
          vp: vp.name,
          vpWidth: vp.width,
          page: pg.name,
          url: pg.url,
          issues: [{ type: 'ERROR', detail: err.message }],
          screenshot: 'N/A',
        });
      }
    }

    await context.close();
  }

  await browser.close();

  // Generate report
  const report = {
    site: BASE,
    date: new Date().toISOString(),
    mode: 'responsive',
    viewports: VIEWPORTS.map(v => `${v.name} (${v.width}×${v.height})`),
    pages: PAGES.map(p => p.name),
    summary: {
      totalIssues,
      totalOverflows,
      totalChecks: VIEWPORTS.length * PAGES.length,
      result: totalOverflows > 5 ? 'FAIL' : totalOverflows > 0 ? 'PASS_WITH_NOTES' : 'PASS',
    },
    details: allResults,
  };

  const reportPath = path.join(RESULTS_DIR, 'responsive-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n=== REPORT ===`);
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`\nFull report: ${reportPath}`);
}

run().catch(console.error);
