import https from 'node:https';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://new.zonacnc.com';
const RESULTS_DIR = path.join(process.cwd(), 'results', `responsive-${new Date().toISOString().split('T')[0]}`);
fs.mkdirSync(RESULTS_DIR, { recursive: true });

// Pages to test under each language
const PAGES = [
  { path: '/es/', lang: 'ES', name: 'homepage' },
  { path: '/es/pricing', lang: 'ES', name: 'pricing' },
  { path: '/es/content/category/2-fresadoras', lang: 'ES', name: 'category' },
  { path: '/es/content/148-centro-mecanizado-cnc', lang: 'ES', name: 'product' },
  { path: '/en/', lang: 'EN', name: 'homepage-en' },
  { path: '/en/pricing', lang: 'EN', name: 'pricing-en' },
  { path: '/fr/', lang: 'FR', name: 'homepage-fr' },
  { path: '/de/', lang: 'DE', name: 'homepage-de' },
];

// Viewports to simulate via User-Agent + CSS analysis
const VIEWPORTS = [
  { name: 'mobile', width: 390, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'tablet', width: 768, ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'desktop', width: 1440, ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36' },
];

function fetchUrl(url, ua) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function fetchCss(cssUrl) {
  try {
    const fullUrl = cssUrl.startsWith('http') ? cssUrl : (cssUrl.startsWith('/') ? BASE_URL + cssUrl : BASE_URL + '/' + cssUrl);
    const result = await fetchUrl(fullUrl, 'Mozilla/5.0 (compatible; audit)');
    return result.body;
  } catch (e) { return ''; }
}

function extractCssLinks(html) {
  const links = new Set();
  const regex = /<link[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    if (href.includes('.css') || href.includes('stylesheet')) links.add(href);
  }
  return [...links];
}

function extractMetaViewport(html) {
  const m = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
           html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']viewport["'][^>]*>/i);
  return m ? m[1] : null;
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}

function countImgSrcset(html) {
  const totalImgs = (html.match(/<img[^>]*>/gi) || []).length;
  const withSrcset = (html.match(/<img[^>]*srcset=["'][^"']+["'][^>]*>/gi) || []).length;
  return { totalImgs, withSrcset };
}

function extractJsonLD(html) {
  const scripts = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try { scripts.push(JSON.parse(match[1])); } catch (e) {}
  }
  return scripts;
}

function hasMobileMenu(html) {
  const patterns = [/class=["'][^"']*hamburger[^"']*["']/i, /class=["'][^"']*menu-toggle[^"']*["']/i, /class=["'][^"']*navbar-toggler[^"']*["']/i, /class=["'][^"']*offcanvas[^"']*["']/i, /aria-label=["'][^"']*men[uú][^"']*["']/i];
  return patterns.some(p => p.test(html));
}

function checkInlineFontSize(html) {
  const problems = [];
  const regex = /<(p|span|a|li|td|th|button|label|h[1-6])[^>]*style=["']([^"']*)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const sm = match[2].match(/font-size\s*:\s*(\d+)\s*px/i);
    if (sm && parseInt(sm[1]) < 12) {
      problems.push(parseInt(sm[1]));
    }
  }
  return problems;
}

function checkTouchTargets(html) {
  // Look for buttons/links with small inline sizes
  const problems = [];
  const regex = /<(button|a)[^>]*style=["']([^"']*)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const style = match[2];
    const wm = style.match(/width\s*:\s*(\d+)px/i);
    const hm = style.match(/height\s*:\s*(\d+)px/i);
    if (wm && parseInt(wm[1]) < 44) problems.push({ element: match[1], dim: `w${wm[1]}px` });
    if (hm && parseInt(hm[1]) < 44) problems.push({ element: match[1], dim: `h${hm[1]}px` });
  }
  return problems;
}

function checkBootstrapClasses(html) {
  // Check for responsive grid classes
  const hasColMd = /col-md-\d+/i.test(html);
  const hasColLg = /col-lg-\d+/i.test(html);
  const hasColSm = /col-sm-\d+/i.test(html);
  const hasColXl = /col-xl-\d+/i.test(html);
  const hasDNone = /d-none\s+d-\w+-block|d-\w+-none/i.test(html);
  return { hasColSm, hasColMd, hasColLg, hasColXl, hasDNoneResponsive: hasDNone };
}

async function analyzePage(pageInfo) {
  const results = { page: pageInfo, viewports: {}, issues: [], checks: [] };

  for (const vp of VIEWPORTS) {
    try {
      const res = await fetchUrl(BASE_URL + pageInfo.path, vp.ua);
      const html = res.body;

      const vpResult = {
        status: res.status,
        htmlSize: html.length,
        title: extractTitle(html),
        viewportMeta: extractMetaViewport(html),
        imgStats: countImgSrcset(html),
        hasMobileMenu: hasMobileMenu(html),
        smallFonts: checkInlineFontSize(html),
        touchTargetIssues: checkTouchTargets(html),
        bootstrapClasses: checkBootstrapClasses(html),
        jsonLdCount: extractJsonLD(html).length,
      };

      results.viewports[vp.name] = vpResult;

      // Checks
      results.checks.push({ check: `${pageInfo.name}_${vp.name}_status`, ok: res.status === 200, detail: `HTTP ${res.status}, ${html.length}B` });
      results.checks.push({ check: `${pageInfo.name}_${vp.name}_viewport`, ok: !!vpResult.viewportMeta, detail: vpResult.viewportMeta || 'MISSING' });

      if (!vpResult.viewportMeta) {
        results.issues.push(`[${pageInfo.path}@${vp.name}] ❌ Missing viewport meta tag`);
      }

      if (vpResult.imgStats.totalImgs > 5 && vpResult.imgStats.withSrcset === 0) {
        results.issues.push(`[${pageInfo.path}@${vp.name}] ⚠️ ${vpResult.imgStats.totalImgs} images without srcset`);
      }

      if (!vpResult.hasMobileMenu && vp.name === 'mobile') {
        results.issues.push(`[${pageInfo.path}@mobile] ⚠️ No mobile menu toggle detected`);
      }

      if (vpResult.smallFonts.length > 0) {
        results.issues.push(`[${pageInfo.path}@${vp.name}] ⚠️ ${vpResult.smallFonts.length} elements with font-size < 12px (min: ${Math.min(...vpResult.smallFonts)}px)`);
      }

      if (vpResult.touchTargetIssues.length > 0) {
        results.issues.push(`[${pageInfo.path}@${vp.name}] ⚠️ ${vpResult.touchTargetIssues.length} touch targets < 44px (accessibility)`);
      }

    } catch (e) {
      results.issues.push(`[${pageInfo.path}@${vp.name}] ❌ Error: ${e.message}`);
      results.viewports[vp.name] = { status: 'error', error: e.message };
    }
  }

  return results;
}

// === CSS Deep Analysis ===
async function analyzeGlobalCss() {
  try {
    const desktopRes = await fetchUrl(BASE_URL + '/es/', VIEWPORTS[2].ua);
    const cssLinks = extractCssLinks(desktopRes.body);
    console.error(`[CSS] Found ${cssLinks.length} CSS links`);

    let totalMq = 0, cssWithMq = 0, cssWithoutMq = 0;
    const breakpoints = new Set();

    for (const link of cssLinks.slice(0, 20)) {
      try {
        const css = await fetchCss(link);
        const mqMatches = css.match(/@media\s+[^{]+\{/g) || [];
        totalMq += mqMatches.length;
        mqMatches.forEach(mq => {
          const mm = mq.match(/(?:max|min)-width\s*:\s*(\d+)px/g);
          if (mm) mm.forEach(m => { const n = parseInt(m.match(/\d+/)[0]); breakpoints.add(n); });
        });
        if (mqMatches.length > 0) cssWithMq++; else cssWithoutMq++;
      } catch (e) { cssWithoutMq++; }
    }

    return {
      totalCssChecked: cssLinks.length,
      totalMediaQueries: totalMq,
      cssWithMq,
      cssWithoutMq,
      breakpoints: [...breakpoints].sort((a, b) => a - b),
    };
  } catch (e) { return { error: e.message }; }
}

// === Main ===
console.error('[RESPONSIVE] Starting multi-page audit...');
const allResults = [];
const allIssues = [];
const allChecks = [];

for (const pageInfo of PAGES) {
  console.error(`[RESPONSIVE] Testing: ${pageInfo.path}`);
  const result = await analyzePage(pageInfo);
  allResults.push(result);
  allIssues.push(...result.issues);
  allChecks.push(...result.checks);
}

// Analyze CSS globally
console.error('[RESPONSIVE] Analyzing CSS...');
const cssAnalysis = await analyzeGlobalCss();
allChecks.push({
  check: 'global_css_media_queries',
  ok: cssAnalysis.totalMediaQueries > 0,
  detail: `${cssAnalysis.totalMediaQueries} MQs in ${cssAnalysis.cssWithMq}/${cssAnalysis.totalCssChecked} CSS files. Breakpoints: [${cssAnalysis.breakpoints.join(', ')}]px`,
});

// Check for essential breakpoints
for (const bp of [768, 1024]) {
  const found = cssAnalysis.breakpoints?.some(b => b >= bp - 10 && b <= bp + 10);
  if (cssAnalysis.breakpoints?.length > 0 && !found) {
    allIssues.push(`[CSS] ⚠️ No breakpoint near ${bp}px detected`);
  }
}

// Count unique findings by type
const uniqueIssues = [...new Set(allIssues)];

const report = {
  ok: uniqueIssues.length === 0,
  passed: uniqueIssues.length === 0 ? '✅ PASSED — No responsive issues found' : `❌ FAILED — ${uniqueIssues.length} issues found`,
  timestamp: new Date().toISOString(),
  url: BASE_URL,
  mode: 'responsive (multi-page headless audit)',
  pagesTested: PAGES.length,
  viewports: VIEWPORTS.map(v => v.name),
  cssAnalysis,
  checks: allChecks,
  issues: uniqueIssues,
  issueCount: uniqueIssues.length,
  resultsDir: RESULTS_DIR,
  pageResults: allResults.map(r => ({
    page: r.page,
    viewportStatus: Object.fromEntries(Object.entries(r.viewports).map(([k, v]) => [k, v.status])),
  })),
};

const reportPath = path.join(RESULTS_DIR, 'report-multi-page.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
