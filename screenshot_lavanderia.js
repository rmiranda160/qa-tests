const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  // Crear directorio de screenshots si no existe
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navegar a la URL
  await page.goto('https://lavanderiavillanua.es', { waitUntil: 'networkidle' });
  
  // Tomar screenshot completo
  const screenshotPath = path.join(screenshotDir, 'lavanderia-actual.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  // También tomar screenshot de viewport por defecto
  const viewportPath = path.join(screenshotDir, 'lavanderia-viewport.png');
  await page.screenshot({ path: viewportPath });
  
  await browser.close();
  
  console.log(`Screenshots guardados en ${screenshotPath} y ${viewportPath}`);
  console.log(screenshotPath);
})();