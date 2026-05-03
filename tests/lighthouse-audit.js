const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url, options = {}) {
  const opts = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: 0,
    ...options
  };

  let chrome;
  try {
    const chromeFlags = ['--headless', '--no-sandbox'];
    const chromePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
    chrome = await chromeLauncher.launch({ chromeFlags, chromePath });
    opts.port = chrome.port;

    const results = await lighthouse(url, opts, null);
    const reportHtml = results.report;

    // Save report to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `lighthouse-report-${timestamp}.html`;
    fs.writeFileSync(`reports/${filename}`, reportHtml);
    console.log(`Lighthouse report saved to reports/${filename}`);

    // Log scores
    console.log('Lighthouse scores:');
    Object.keys(results.lhr.categories).forEach(category => {
      const cat = results.lhr.categories[category];
      console.log(`  ${category}: ${(cat.score * 100).toFixed(0)}`);
    });

    return results.lhr;
  } catch (error) {
    console.error('Lighthouse audit failed:', error);
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

// If run directly, use example URL
if (require.main === module) {
  (async () => {
    const fs = require('fs');
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }
    const url = process.env.TARGET_URL || 'https://dev1.cenarbe.com';
    console.log(`Running Lighthouse audit for ${url}...`);
    await runLighthouse(url);
  })();
}

module.exports = { runLighthouse };