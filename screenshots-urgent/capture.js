const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function captureScreenshot(url, outputPath) {
  let browser;
  try {
    // Buscar ejecutable de Chrome
    const possiblePaths = [
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/snap/bin/chromium',
      process.env.CHROME_BIN
    ];
    let executablePath = null;
    for (const p of possiblePaths) {
      if (p && fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }
    if (!executablePath) {
      // Intentar encontrar con which
      const { execSync } = require('child_process');
      try {
        executablePath = execSync('which chromium-browser 2>/dev/null || which chromium 2>/dev/null || which google-chrome-stable 2>/dev/null', { encoding: 'utf-8' }).trim();
      } catch (e) {}
    }
    if (!executablePath) {
      throw new Error('No se encontró Chrome/Chromium instalado');
    }

    console.log(`Usando navegador: ${executablePath}`);
    browser = await puppeteer.launch({
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: 'new'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`Capturado: ${outputPath}`);
  } catch (error) {
    console.error(`Error capturando ${url}:`, error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  const pages = [
    { url: 'https://cntai.cenarbe.com/', name: 'landing' },
    { url: 'https://cntai.cenarbe.com/login', name: 'login' },
    { url: 'https://cntai.cenarbe.com/register', name: 'register' },
    { url: 'https://cntai.cenarbe.com/dashboard', name: 'dashboard' }
  ];
  const timestamp = Math.floor(Date.now() / 1000);
  for (const page of pages) {
    const output = `${page.name}-${timestamp}.png`;
    try {
      await captureScreenshot(page.url, output);
    } catch (e) {
      console.log(`No se pudo capturar ${page.url}, continuando...`);
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}