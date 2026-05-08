import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://new.zonacnc.com';
const RESULTS_DIR = path.join(process.cwd(), 'results', 'responsive-2026-05-08');
fs.mkdirSync(RESULTS_DIR, { recursive: true });

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const results = [];
const issues = [];

const browser = await chromium.launch({ headless: true });

try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Collect failed network requests
    const failedRequests = [];
    page.on('requestfailed', req => {
      failedRequests.push({ url: req.url(), failure: req.failure()?.errorText || 'unknown' });
    });

    // Navigate
    const startTime = Date.now();
    let loadOk = true;
    let loadError = null;
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      loadOk = false;
      loadError = e.message;
    }
    const loadTime = Date.now() - startTime;

    // Title
    const title = await page.title().catch(() => '(error)');
    if (!title || title === '(error)') {
      issues.push(`[${vp.name}] No se pudo obtener el título de la página`);
    }

    // Check for horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (hasHorizontalScroll) {
      issues.push(`[${vp.name}] Scroll horizontal detectado — overflow en viewport ${vp.width}px`);
    }

    // Check meta viewport
    const metaViewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });
    if (!metaViewport) {
      issues.push(`[${vp.name}] Falta meta viewport`);
    }

    // Check for elements that might overflow
    const overflowElements = await page.evaluate((vpWidth) => {
      const offenders = [];
      const all = document.querySelectorAll('*');
      all.forEach(el => {
        if (el.nodeType !== 1) return;
        const rect = el.getBoundingClientRect();
        if (rect.width > vpWidth + 5) {
          const tag = el.tagName.toLowerCase();
          const cls = el.className?.toString?.() || '';
          const id = el.id || '';
          if (rect.width > vpWidth + 20) {
            offenders.push({ tag, cls: cls.substring(0, 60), id, overflowWidth: Math.round(rect.width), viewport: vpWidth });
          }
        }
      });
      return offenders.slice(0, 10);
    }, vp.width);
    if (overflowElements.length > 0) {
      overflowElements.forEach(o => {
        issues.push(`[${vp.name}] Elemento overflow: <${o.tag}${o.id ? '#'+o.id : ''} class="${o.cls}"> (${o.overflowWidth}px > viewport ${o.viewport}px)`);
      });
    }

    // Check readable font sizes
    const tinyFonts = await page.evaluate(() => {
      const offenders = [];
      const all = document.querySelectorAll('p, span, a, li, td, th, button, label, input, textarea, select, h1, h2, h3, h4, h5, h6');
      all.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const tag = el.tagName.toLowerCase();
        if (fontSize < 9 && el.textContent.trim().length > 0) {
          offenders.push({ tag, fontSize, text: el.textContent.trim().substring(0, 40) });
        }
      });
      return offenders.slice(0, 10);
    });
    if (tinyFonts.length > 0) {
      tinyFonts.forEach(t => {
        issues.push(`[${vp.name}] Fuente muy pequeña: <${t.tag}> "${t.text}" = ${t.fontSize}px`);
      });
    }

    // Check tap target sizes (mobile/tablet)
    if (vp.width <= 768) {
      const smallTaps = await page.evaluate(() => {
        const offenders = [];
        const all = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
        all.forEach(el => {
          if (el.offsetParent === null) return; // hidden
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
            offenders.push({ tag: el.tagName.toLowerCase(), text: el.textContent.trim().substring(0, 30), width: Math.round(rect.width), height: Math.round(rect.height) });
          }
        });
        return offenders.slice(0, 15);
      });
      if (smallTaps.length > 0) {
        smallTaps.forEach(t => {
          issues.push(`[${vp.name}] Tap target pequeño: <${t.tag}> "${t.text}" = ${t.width}x${t.height}px (mínimo recomendado 44x44)`);
        });
      }
    }

    // Screenshot
    const ssName = `responsive-${vp.name}-${vp.width}x${vp.height}.png`;
    const ssPath = path.join(RESULTS_DIR, ssName);
    await page.screenshot({ path: ssPath, fullPage: true });

    // Snapshot of visible page structure
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 3000)).catch(() => '(no content)');
    const urlAfter = page.url();

    results.push({
      viewport: vp,
      title,
      loadTimeMs: loadTime,
      loadOk,
      loadError,
      consoleErrors: consoleErrors.slice(0, 10),
      failedRequests: failedRequests.slice(0, 10),
      url: urlAfter,
      hasHorizontalScroll,
      metaViewport,
      screenshot: ssPath,
      bodyTextPreview: bodyText.substring(0, 600),
    });

    await context.close();
  }
} catch (err) {
  console.error('Fatal error:', err.message);
} finally {
  await browser.close();
}

const summary = {
  ok: issues.length === 0,
  timestamp: new Date().toISOString(),
  url: URL,
  viewports: results,
  issues,
  issueCount: issues.length,
  resultsDir: RESULTS_DIR,
};

fs.writeFileSync(path.join(RESULTS_DIR, 'report.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
