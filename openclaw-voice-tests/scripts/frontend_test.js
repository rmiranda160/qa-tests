#!/usr/bin/env node

/**
 * OpenClaw Voice - Frontend Test con Puppeteer
 * Pruebas de navegador real: micrófono, UI, transcripción
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuración
const IP = process.env.OPENCLAW_IP || '217.182.244.180';
const PORT = process.env.HTTP_PORT || 3002;
const USE_HTTPS = process.env.USE_HTTPS === 'true';
const PROTOCOL = USE_HTTPS ? 'https' : 'http';
const URL = `${PROTOCOL}://${IP}:${PORT}`;
const HEADLESS = process.env.HEADLESS !== 'false'; // default true
const TIMEOUT = 30000; // ms

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function logSuccess(msg) {
  console.log(`${colors.green}[✓]${colors.reset} ${msg}`);
}

function logWarning(msg) {
  console.log(`${colors.yellow}[!]${colors.reset} ${msg}`);
}

function logError(msg) {
  console.log(`${colors.red}[✗]${colors.reset} ${msg}`);
}

function logInfo(msg) {
  console.log(`${colors.blue}[i]${colors.reset} ${msg}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPageLoad(page) {
  logInfo('Cargando página...');
  const response = await page.goto(URL, { waitUntil: 'networkidle2', timeout: TIMEOUT });
  if (!response) {
    throw new Error('No response from page');
  }
  const status = response.status();
  if (status >= 200 && status < 400) {
    logSuccess(`Página cargada (HTTP ${status})`);
  } else {
    throw new Error(`HTTP ${status} - ${response.statusText()}`);
  }
  
  // Verificar título
  const title = await page.title();
  if (title && title.toLowerCase().includes('openclaw')) {
    logSuccess(`Título correcto: "${title}"`);
  } else {
    logWarning(`Título inesperado: "${title}"`);
  }
  
  // Esperar a que los elementos estén presentes
  await page.waitForSelector('h1', { timeout: 5000 });
  logSuccess('Elemento h1 encontrado');
  
  await page.waitForSelector('button', { timeout: 5000 });
  logSuccess('Botones encontrados');
  
  // Contar botones
  const buttonCount = await page.$$eval('button', els => els.length);
  logSuccess(`Número de botones: ${buttonCount}`);
  
  // Verificar textos de botones
  const buttonTexts = await page.$$eval('button', els => els.map(el => el.textContent.trim()));
  const expectedButtons = ['Iniciar Voz', 'Detener'];
  for (const expected of expectedButtons) {
    if (buttonTexts.some(text => text.includes(expected))) {
      logSuccess(`Botón "${expected}" encontrado`);
    } else {
      logError(`Botón "${expected}" no encontrado`);
    }
  }
  
  // Verificar contenedor de salida
  const outputExists = await page.$('#output');
  if (outputExists) {
    logSuccess('Contenedor #output encontrado');
  } else {
    logError('Contenedor #output no encontrado');
  }
}

async function testMicrophonePermission(page) {
  logInfo('Probando permisos de micrófono...');
  
  // Sobrescribir getUserMedia para simular
  await page.evaluateOnNewDocument(() => {
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      console.log('getUserMedia llamado con:', constraints);
      // Simular éxito devolviendo un MediaStream vacío (mock)
      if (constraints.audio) {
        return new Promise((resolve) => {
          // Crear un MediaStream vacío (no implementado en JS puro, pero podemos devolver un objeto mock)
          const mockStream = {
            getTracks: () => [],
            getAudioTracks: () => [],
            stop: () => {}
          };
          resolve(mockStream);
        });
      }
      throw new Error('Permission denied');
    };
  });
  
  // Recargar para aplicar el mock
  await page.reload({ waitUntil: 'networkidle2' });
  
  // Hacer clic en Iniciar Voz
  const startButton = await page.$('button:has-text("Iniciar Voz")');
  if (startButton) {
    await startButton.click();
    logSuccess('Clic en "Iniciar Voz" realizado');
    await sleep(1000);
    
    // Verificar que el texto cambió
    const outputText = await page.$eval('#output', el => el.textContent);
    if (outputText.includes('Escuchando')) {
      logSuccess('Interfaz cambió a "Escuchando"');
    } else {
      logWarning('Interfaz no cambió como se esperaba');
    }
  } else {
    logError('No se pudo encontrar botón "Iniciar Voz"');
  }
}

async function testAudioVisualization(page) {
  logInfo('Probando visualización de audio...');
  // Buscar elementos canvas o divs que puedan ser visualizadores
  const canvasCount = await page.$$eval('canvas', els => els.length);
  if (canvasCount > 0) {
    logSuccess(`Canvas encontrados: ${canvasCount} (posible visualizador de audio)`);
  } else {
    logWarning('No se encontraron canvas (puede que la visualización sea via CSS)');
  }
  
  // Buscar elementos con clases relacionadas a audio
  const audioVizSelectors = ['.visualizer', '.waveform', '.vu-meter', '.level', '.audio-viz'];
  for (const selector of audioVizSelectors) {
    const element = await page.$(selector);
    if (element) {
      logSuccess(`Elemento visualizador encontrado: ${selector}`);
    }
  }
}

async function testErrorScenarios(page) {
  logInfo('Probando escenarios de error...');
  
  // 1. Simular denegación de micrófono
  await page.evaluateOnNewDocument(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new Error('Permission denied');
    };
  });
  await page.reload({ waitUntil: 'networkidle2' });
  
  const startButton = await page.$('button:has-text("Iniciar Voz")');
  if (startButton) {
    await startButton.click();
    await sleep(500);
    // Verificar si aparece mensaje de error
    const outputText = await page.$eval('#output', el => el.textContent);
    if (outputText.toLowerCase().includes('denegado') || outputText.toLowerCase().includes('error')) {
      logSuccess('Mensaje de error por permiso denegado detectado');
    } else {
      logWarning('No se detectó mensaje de error por permiso denegado');
    }
  }
  
  // 2. Simular red caída (desconectar antes de enviar)
  // Podemos interceptar fetch/XMLHttpRequest y rechazar
  await page.evaluateOnNewDocument(() => {
    window.__networkDown = true;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      if (window.__networkDown) {
        throw new Error('Network error');
      }
      return originalFetch(...args);
    };
  });
  
  logWarning('Pruebas de error de red requieren más implementación');
}

async function takeScreenshot(page, name) {
  const screenshotDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const filePath = path.join(screenshotDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  logSuccess(`Captura guardada: ${filePath}`);
  return filePath;
}

async function main() {
  let browser;
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  try {
    logInfo(`Iniciando pruebas de frontend en ${URL}`);
    logInfo(`Headless: ${HEADLESS}`);
    
    // Lanzar navegador
    browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream'] // Fake UI para micrófono
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(TIMEOUT);
    
    // Capturar console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logError(`Console error: ${msg.text()}`);
      }
    });
    
    // 1. Carga de página
    try {
      await testPageLoad(page);
      await takeScreenshot(page, 'page-loaded');
      passed++;
    } catch (error) {
      logError(`Fallo carga de página: ${error.message}`);
      failed++;
    }
    
    // 2. Permisos de micrófono
    try {
      await testMicrophonePermission(page);
      await takeScreenshot(page, 'microphone-click');
      passed++;
    } catch (error) {
      logError(`Fallo prueba de micrófono: ${error.message}`);
      failed++;
    }
    
    // 3. Visualización de audio
    try {
      await testAudioVisualization(page);
      passed++;
    } catch (error) {
      logWarning(`Advertencia en visualización: ${error.message}`);
      warnings++;
    }
    
    // 4. Escenarios de error (opcional)
    try {
      await testErrorScenarios(page);
      passed++;
    } catch (error) {
      logWarning(`Advertencia en escenarios de error: ${error.message}`);
      warnings++;
    }
    
    // 5. Compatibilidad básica (viewport, responsive)
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.content : null;
    });
    if (viewport) {
      logSuccess(`Viewport meta: ${viewport}`);
      passed++;
    } else {
      logWarning('Viewport meta no encontrado');
      warnings++;
    }
    
    // Resumen
    logInfo('\n=== Resumen de Pruebas de Frontend ===');
    logSuccess(`Pasadas: ${passed}`);
    logError(`Fallidas: ${failed}`);
    logWarning(`Advertencias: ${warnings}`);
    
    if (failed === 0) {
      logSuccess('¡Todas las pruebas críticas pasaron!');
    } else {
      logError('Algunas pruebas críticas fallaron');
    }
    
  } catch (error) {
    logError(`Error general: ${error.message}`);
    console.error(error);
    failed++;
  } finally {
    if (browser) {
      await browser.close();
      logInfo('Navegador cerrado');
    }
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };