#!/usr/bin/env node
const { firefox } = require('playwright');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = process.env.RESULTS_DIR || path.join(__dirname, 'results');
const URL = process.argv[2] || 'https://new.zonacnc.com/es/';

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

async function main() {
  let browser;
  try {
    browser = await firefox.launch({ headless: true });
    const results = { viewports: {}, issues: [], checks: [] };

    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);

      const timestamp = Date.now();
      const screenshotName = `responsive-${vp.name}-${timestamp}.png`;
      const screenshotPath = path.join(RESULTS_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Check responsive issues in the browser
      const issues = await page.evaluate(() => {
        const problems = [];
        // Horizontal overflow
        const docW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        if (docW > clientW + 5) {
          problems.push(`Horizontal overflow: scroll=${docW}px vs client=${clientW}px (overflow=${docW - clientW}px)`);
        }
        // Viewport meta
        const vpMeta = document.querySelector('meta[name="viewport"]');
        if (!vpMeta) {
          problems.push('Missing viewport meta tag');
        }
        // Small font sizes
        const allElements = document.querySelectorAll('p,span,a,li,td,th,button,label,div');
        const smallFonts = [];
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const fs = parseFloat(style.fontSize);
          if (fs < 12 && el.textContent.trim().length > 0) {
            smallFonts.push({ tag: el.tagName, size: fs, text: el.textContent.trim().substring(0, 40) });
          }
        });
        if (smallFonts.length > 0) {
          problems.push(`${smallFonts.length} elements with font-size < 12px`);
          smallFonts.slice(0, 5).forEach(f => {
            problems.push(`  <${f.tag}> "${f.text}" = ${f.size}px`);
          });
        }
        // Overlapping elements check (rough)
        const overlayElements = document.querySelectorAll('[style*="position: fixed"], [style*="position: absolute"], .fixed-top, .fixed-bottom, .sticky-top');
        if (overlayElements.length > 10) {
          problems.push(`Many fixed/absolute positioned elements: ${overlayElements.length}`);
        }
        // Check for visible mobile menu toggle
        const menuToggle = document.querySelector('.zcmn-hamburger, .menu-toggle, .navbar-toggler, [aria-label*="menú"], [aria-label*="menu"]');
        const menuToggleVisible = menuToggle ? (menuToggle.offsetParent !== null) : false;
        // Check page title
        const title = document.title;
        // Check body for text
        const bodyText = document.body.innerText.substring(0, 200);
        // Check main content width
        const mainEl = document.querySelector('main, #main, .main, #content, .content');
        let mainWidth = null;
        if (mainEl) {
          const rect = mainEl.getBoundingClientRect();
          mainWidth = rect.width;
        }
        // Count images
        const imgs = document.querySelectorAll('img');
        // Check if any element has inline width > viewport
        const wideElements = [];
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > window.innerWidth + 20) {
            wideElements.push({ tag: el.tagName, class: el.className?.toString().substring(0, 40), width: Math.round(rect.width) });
          }
        });
        if (wideElements.length > 0) {
          problems.push(`${wideElements.length} elements wider than viewport`);
          wideElements.slice(0, 3).forEach(w => {
            problems.push(`  <${w.tag}> class="${w.class}" width=${w.width}px`);
          });
        }
        return {
          problems,
          title,
          bodyTextPreview: bodyText,
          mainWidth,
          imgCount: imgs.length,
          menuToggleVisible,
          wideElements: wideElements.length,
        };
      });

      results.viewports[vp.name] = {
        width: vp.width,
        height: vp.height,
        screenshot: screenshotName,
        ...issues,
      };

      if (issues.problems.length > 0) {
        issues.problems.forEach(p => {
          results.issues.push(`[${vp.name}] ${p}`);
        });
      }

      results.checks.push({
        check: `render_${vp.name}`,
        ok: true,
        detail: `Title: "${issues.title}", ${issues.imgCount} images, main width: ${issues.mainWidth}px, menu toggle visible: ${issues.menuToggleVisible}`,
      });

      await page.close();
    }

    const allOk = results.issues.length === 0;
    const output = {
      ok: allOk,
      passed: allOk ? '✅ PASSED' : '❌ FAILED — Issues found',
      timestamp: new Date().toISOString(),
      url: URL,
      mode: 'responsive (firefox headless)',
      resultsDir: RESULTS_DIR,
      checks: results.checks,
      viewportDetails: results.viewports,
      issues: results.issues,
      issueCount: results.issues.length,
    };

    const reportPath = path.join(RESULTS_DIR, 'report-responsive-firefox.json');
    fs.writeFileSync(reportPath, JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));

    await browser.close();
    process.exit(allOk ? 0 : 1);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      error: error.toString(),
      stderr: error.stack || '',
      resultsDir: RESULTS_DIR,
    }));
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();
