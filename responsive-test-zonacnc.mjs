#!/usr/bin/env node
import playwright from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'responsive-results');
const SITE_URL = 'https://new.zonacnc.com';

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 720 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const PAGES = [
  { path: '/es/', label: 'Homepage' },
  { path: '/es/28-maquinaria-metal', label: 'Category page' },
  { path: '/es/content/10-precios', label: 'Pricing page' },
  { path: '/es/module/zonacncproductadd/ads', label: 'Create ad' },
];

async function checkOverflow(page, label) {
  return await page.evaluate((lbl) => {
    const issues = [];
    const doc = document.documentElement;
    const docSW = doc.scrollWidth;
    const docCW = doc.clientWidth;
    
    if (docSW > docCW + 2) {
      issues.push({ element: 'document', scrollWidth: docSW, clientWidth: docCW, diff: docSW - docCW, type: 'document-overflow' });
    }

    // Check common containers that might overflow
    const selectors = [
      '.accordion-item', 'button.accordion-button', 
      '.container', '.row', '.col-*', 
      '.facet', '.sidebar', '.main-content',
      '.product-grid', '.grid',
      '.navbar', '.header', '.footer',
      '.columns-container',
      'section', 'article', 'aside',
      '.pricing-card', '.plan-card',
      'form', 'table', '.table-responsive',
    ];

    // Specific overflow check on wider elements
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0) return;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (style.overflow === 'hidden' || style.overflow === 'auto' || style.overflow === 'scroll') {
        const sw = el.scrollWidth;
        const cw = el.clientWidth;
        if (sw > cw + 2 && sw > 50) { // Ignore tiny diffs & empty elements
          const rect = el.getBoundingClientRect();
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const cls = el.className && typeof el.className === 'string' ? `.${el.className.split(' ').slice(0,2).join('.')}` : '';
          const label = `${tag}${id}${cls}`;
          if (rect.top < 10000 && rect.left >= 0) { // Visible elements only
            issues.push({
              element: label.substring(0, 80),
              scrollWidth: sw,
              clientWidth: cw,
              diff: sw - cw,
              type: style.overflow === 'hidden' ? 'clipped' : style.overflow === 'auto' ? 'scrollable' : 'overflow-visible',
              overflow: style.overflow,
            });
          }
        }
      }
    });

    return { docSW, docCW, docOverflow: docSW > docCW + 2, issues: issues.slice(0, 50) };
  }, label);
}

async function checkResponsiveElements(page) {
  return await page.evaluate(() => {
    const issues = [];
    
    // Viewport meta
    const vp = document.querySelector('meta[name="viewport"]');
    if (!vp) issues.push({ type: 'missing-viewport', detail: 'No viewport meta tag found' });
    else if (!vp.content.includes('device-width')) issues.push({ type: 'bad-viewport', detail: vp.content });

    // Touch targets
    document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (rect.width < 44 && rect.height < 44) {
          const tag = el.tagName.toLowerCase();
          const text = (el.textContent || '').trim().substring(0, 30);
          issues.push({ type: 'small-touch-target', detail: `${tag}: "${text}" → ${Math.round(rect.width)}×${Math.round(rect.height)}px`, width: Math.round(rect.width), height: Math.round(rect.height) });
        }
      }
    });

    // Images without responsive attributes
    document.querySelectorAll('img').forEach(img => {
      if (!img.getAttribute('srcset') && !img.getAttribute('sizes') && img.naturalWidth > 0) {
        if (img.naturalWidth > 1200 && img.getBoundingClientRect().width < img.naturalWidth * 0.5) {
          issues.push({ type: 'oversized-image', detail: `${img.src?.substring(0,60)} — natural ${img.naturalWidth}w, rendered ${Math.round(img.getBoundingClientRect().width)}w` });
        }
      }
    });

    // Font size check
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, li, label').forEach(el => {
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      if (fontSize > 0 && fontSize < 10 && el.textContent.trim().length > 0) {
        issues.push({ type: 'tiny-font', detail: `<${el.tagName.toLowerCase()}> "${el.textContent.trim().substring(0,40)}" → ${style.fontSize}` });
      }
    });

    return issues.slice(0, 100);
  });
}

async function testPage(browser, pageData, viewport) {
  const page = await browser.newPage();
  const results = { page: pageData.label, path: pageData.path, viewport: viewport.name, width: viewport.width, height: viewport.height };
  
  try {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const url = `${SITE_URL}${pageData.path}`;
    
    const startTime = Date.now();
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    results.status = resp?.status() || 0;
    results.loadTime = loadTime;
    
    // Check if page loaded properly
    const bodyText = await page.evaluate(() => document.body?.innerText?.length || 0);
    results.bodyContentLength = bodyText;

    if (resp?.status() === 200 && bodyText > 0) {
      // Responsive checks
      results.overflow = await checkOverflow(page, pageData.label);
      results.responsiveElements = await checkResponsiveElements(page);
      
      // Check for mobile nav/menu
      const mobileNav = await page.evaluate(() => {
        const hasHamburger = !!document.querySelector('.navbar-toggler, .hamburger, [class*="menu-toggle"], [class*="mobile-menu"], .navbar-toggler-icon, .fa-bars, .material-icons:contains("menu")');
        return { hasHamburger: !!document.querySelector('.navbar-toggler, .hamburger') };
      });
      results.mobileNav = mobileNav;
      
      results.ok = true;
    } else {
      results.ok = false;
      results.error = bodyText === 0 ? 'Empty page' : `HTTP ${resp?.status()}`;
    }

    // Screenshot
    const screenshotFile = `${pageData.label.replace(/[^a-z0-9]/gi, '-')}-${viewport.name}.png`;
    const screenshotPath = path.join(RESULTS_DIR, screenshotFile);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    results.screenshot = screenshotFile;

  } catch (err) {
    results.ok = false;
    results.error = err.message;
  } finally {
    await page.close();
  }
  
  return results;
}

async function main() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const browser = await playwright.chromium.launch({ headless: true });
  const allResults = [];

  for (const pageData of PAGES) {
    for (const viewport of VIEWPORTS) {
      console.error(`Testing ${pageData.label} @ ${viewport.name} (${viewport.width}×${viewport.height})...`);
      const result = await testPage(browser, pageData, viewport);
      allResults.push(result);
    }
  }

  await browser.close();

  // Generate report
  const report = generateReport(allResults);
  const reportPath = path.join(RESULTS_DIR, `responsive-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report, null, 2));
}

function generateReport(results) {
  const failures = results.filter(r => !r.ok);
  const overflows = results.filter(r => r.overflow?.issues?.length > 0);
  const smallTouch = results.filter(r => r.responsiveElements?.filter(e => e.type === 'small-touch-target')?.length > 0);
  const tinyFont = results.filter(r => r.responsiveElements?.filter(e => e.type === 'tiny-font')?.length > 0);
  const oversizedImgs = results.filter(r => r.responsiveElements?.filter(e => e.type === 'oversized-image')?.length > 0);

  const allIssues = [];
  for (const r of results) {
    if (r.overflow?.issues) {
      for (const issue of r.overflow.issues) {
        allIssues.push({ page: r.page, viewport: r.viewport, ...issue, category: 'overflow' });
      }
    }
    if (r.responsiveElements) {
      for (const issue of r.responsiveElements) {
        allIssues.push({ page: r.page, viewport: r.viewport, ...issue, category: 'responsive-element' });
      }
    }
  }

  return {
    ok: failures.length === 0 && overflows.length === 0,
    timestamp: new Date().toISOString(),
    site: SITE_URL,
    summary: {
      total: results.length,
      passed: results.filter(r => r.ok).length,
      failed: failures.length,
      pagesWithOverflow: [...new Set(overflows.map(r => r.page))],
      pagesWithSmallTouch: [...new Set(smallTouch.map(r => r.page))],
      issuesFound: allIssues.length,
    },
    details: results.map(r => ({
      page: r.page,
      path: r.path,
      viewport: r.viewport,
      width: r.width,
      height: r.height,
      ok: r.ok,
      status: r.status,
      loadTime: r.loadTime,
      error: r.error,
      docOverflow: r.overflow?.docOverflow,
      overflowCount: r.overflow?.issues?.length || 0,
      touchTargetIssues: r.responsiveElements?.filter(e => e.type === 'small-touch-target')?.length || 0,
      fontIssues: r.responsiveElements?.filter(e => e.type === 'tiny-font')?.length || 0,
      imageIssues: r.responsiveElements?.filter(e => e.type === 'oversized-image')?.length || 0,
    })),
    issues: allIssues.slice(0, 200),
  };
}

main().catch(err => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
