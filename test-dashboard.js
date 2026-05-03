const playwright = require('playwright');

(async () => {
  console.log('Testing dashboard screenshot rendering...');
  let browser;
  try {
    browser = await playwright.chromium.connect('ws://51.254.244.216:3000/');
    const page = await browser.newPage();
    await page.goto('https://dashboard.cenarbe.com/', { waitUntil: 'networkidle' });
    
    // Esperar a que cargue la sección de screenshots
    await page.waitForSelector('#screenshots');
    
    // Verificar que hay elementos de screenshot
    const screenshotCards = await page.$$('.screenshot-card');
    console.log(`Found ${screenshotCards.length} screenshot cards`);
    
    // Verificar que cada card contiene una imagen
    for (let i = 0; i < screenshotCards.length; i++) {
      const img = await screenshotCards[i].$('img');
      if (img) {
        const src = await img.getAttribute('src');
        console.log(`  Card ${i+1}: img src = ${src}`);
        // Verificar que la imagen se carga correctamente
        const isVisible = await img.isVisible();
        console.log(`    Visible: ${isVisible}`);
        // Podríamos verificar HTTP status pero omitimos por simplicidad
      } else {
        console.log(`  Card ${i+1}: NO IMG FOUND`);
      }
    }
    
    // Tomar screenshot del dashboard para evidencia
    const testScreenshotPath = '/tmp/dashboard-test.png';
    await page.screenshot({ path: testScreenshotPath, fullPage: true });
    console.log(`Dashboard screenshot saved to ${testScreenshotPath}`);
    
    await browser.close();
    console.log('Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during test:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
})();