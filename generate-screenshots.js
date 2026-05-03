const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = 'ws://51.254.244.216:3000/';

// Configuración de aplicaciones y URLs
const APPS = [
  { name: 'cenarbe', url: 'https://dev1.cenarbe.com/' },
  { name: 'cntai', url: 'https://cntai.cenarbe.com/' },
  { name: 'villazocotin', url: 'https://villazocotin.cenarbe.com/' }
];

// Configuración de viewports
const VIEWPORTS = [
  { mode: 'mobile', width: 375, height: 667 },
  { mode: 'tablet', width: 768, height: 1024 },
  { mode: 'desktop', width: 1920, height: 1080 }
];

// Directorio base para screenshots
const BASE_DIR = path.join(__dirname, 'screenshots');
const TODAY = new Date().toISOString().split('T')[0]; // 2026-03-20
const TODAY_DIR = path.join(BASE_DIR, TODAY);

// Crear directorios si no existen
if (!fs.existsSync(TODAY_DIR)) {
  fs.mkdirSync(TODAY_DIR, { recursive: true });
}
APPS.forEach(app => {
  const appDir = path.join(TODAY_DIR, app.name);
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
});

// Función para generar nombre de archivo
function generateFilename(appName, mode, timestamp) {
  const dateStr = timestamp.toISOString().replace(/[-:]/g, '').split('.')[0]; // YYYYMMDDTHHMMSS
  const datePart = dateStr.slice(0, 8); // YYYYMMDD
  const timePart = dateStr.slice(9, 13); // HHMM
  return `${appName}-${mode}-${datePart}-${timePart}.png`;
}

async function captureScreenshot(page, app, viewport, timestamp) {
  const { mode, width, height } = viewport;
  console.log(`Capturing ${app.name} ${mode} (${width}x${height})...`);
  
  await page.setViewportSize({ width, height });
  await page.goto(app.url, { waitUntil: 'networkidle' });
  
  // Esperar un poco más para que cargue contenido dinámico
  await page.waitForTimeout(2000);
  
  const filename = generateFilename(app.name, mode, timestamp);
  const appDir = path.join(TODAY_DIR, app.name);
  const filepath = path.join(appDir, filename);
  
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  Saved: ${filepath}`);
  
  return {
    app: app.name,
    mode,
    name: filename,
    path: filepath,
    timestamp: timestamp.toISOString()
  };
}

async function main() {
  console.log('Connecting to remote Playwright server...');
  let browser;
  try {
    browser = await playwright.chromium.connect(WS_ENDPOINT);
    console.log('Connected successfully');
    
    const metadata = [];
    const timestamp = new Date();
    
    for (const app of APPS) {
      console.log(`\n=== Processing ${app.name} ===`);
      const page = await browser.newPage();
      
      for (const viewport of VIEWPORTS) {
        const meta = await captureScreenshot(page, app, viewport, timestamp);
        metadata.push(meta);
      }
      
      await page.close();
    }
    
    await browser.close();
    console.log('\nAll screenshots captured successfully!');
    
    // Guardar metadatos en un archivo JSON temporal
    const metadataPath = path.join(TODAY_DIR, 'screenshots_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Metadata saved to ${metadataPath}`);
    
    // También generar un archivo dashboard_data.json con el formato esperado
    const dashboardData = {
      recent_screenshots: metadata.map(m => ({
        app: m.app,
        mode: m.mode,
        name: m.name,
        path: `/assets/screenshots/${TODAY}/${m.app}/${m.name}`, // Ruta relativa al dashboard
        timestamp: m.timestamp
      }))
    };
    
    const dashboardDataPath = path.join(TODAY_DIR, 'dashboard_data.json');
    fs.writeFileSync(dashboardDataPath, JSON.stringify(dashboardData, null, 2));
    console.log(`Dashboard data saved to ${dashboardDataPath}`);
    
    // Mostrar resumen
    console.log('\n=== SUMMARY ===');
    console.log(`Total screenshots: ${metadata.length}`);
    metadata.forEach(m => {
      console.log(`  ${m.app} ${m.mode}: ${m.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();