const { chromium } = require('playwright');
const path = require('path');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1024, height: 1024 });
    const htmlPath = path.resolve('/home/node/.openclaw/workspace-desarrollo/projects/lavanderia-villanua/index.html');
    const fileUrl = 'file://' + htmlPath;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    // Esperar a que las fuentes carguen
    await page.waitForTimeout(1000);
    const screenshotPath = '/tmp/lavanderia-screenshot-playwright.png';
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved to', screenshotPath);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();