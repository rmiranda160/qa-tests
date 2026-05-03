const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  // Ruta al ejecutable de Chrome. En nuestro entorno, puede que no tengamos Chrome instalado.
  // Puppeteer-core no descarga navegador, necesitamos especificar ruta.
  // Intentamos encontrar chrome en PATH
  const browserPath = process.env.CHROME_PATH || '/usr/bin/google-chrome-stable' || '/usr/bin/chromium';
  
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Establecer viewport a 1024x1024 (igual que imagen de referencia)
    await page.setViewport({ width: 1024, height: 1024 });
    // Cargar archivo local (file://)
    const htmlPath = path.resolve('/home/node/.openclaw/workspace-desarrollo/projects/lavanderia-villanua/index.html');
    const fileUrl = 'file://' + htmlPath;
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    // Esperar un poco para que las fuentes y estilos carguen
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Tomar screenshot
    const screenshotPath = '/tmp/lavanderia-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Screenshot saved to', screenshotPath);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();