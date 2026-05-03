const playwright = require('playwright');

(async () => {
  console.log('Connecting to remote Playwright server...');
  let browser;
  try {
    browser = await playwright.chromium.connect('ws://51.254.244.216:3000/');
    console.log('Connected successfully');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    // Test Cenarbe homepage
    await page.goto('https://dev1.cenarbe.com/');
    const title = await page.title();
    console.log(`Cenarbe title: ${title}`);
    
    // Take screenshot
    const screenshotPath = `/tmp/cenarbe-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Close browser
    await browser.close();
    console.log('Test completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
})();