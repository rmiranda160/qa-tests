const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const pages = [
    { name: 'landing', url: 'https://cntai.cenarbe.com/' },
    { name: 'login', url: 'https://cntai.cenarbe.com/login' },
    { name: 'register', url: 'https://cntai.cenarbe.com/register' },
    { name: 'demo', url: 'https://cntai.cenarbe.com/demo-dashboard.php' }
  ];

  for (const p of pages) {
    console.log(`Capturing ${p.name}...`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      // Wait a bit for any JS to render
      await page.waitForTimeout(2000);
      const timestamp = Math.floor(Date.now() / 1000);
      const filename = `/home/node/.openclaw/workspace-tester/screenshots/${p.name}-${timestamp}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`Saved ${filename}`);
    } catch (error) {
      console.error(`Error capturing ${p.name}: ${error.message}`);
    }
  }

  await browser.close();
  console.log('Done.');
})();