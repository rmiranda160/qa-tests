const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://contentoai.cenarbe.com');
  await page.screenshot({ path: 'screenshots/contentoai-homepage.png', fullPage: true });
  
  // viewports
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];
  for (const vp of viewports) {
    await page.setViewportSize(vp);
    await page.screenshot({ path: `screenshots/contentoai-${vp.name}.png` });
  }
  
  await browser.close();
  console.log('Screenshots tomados en screenshots/');
})();