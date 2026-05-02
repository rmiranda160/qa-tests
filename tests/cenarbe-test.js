const { chromium } = require('playwright');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://dev1.cenarbe.com';
const LIGHTHOUSE_PAGES = ['/reservar.php', '/mi_cuenta.php'];
const BIKE_NAMES = ['Rockhopper', 'Talon', 'Roadmaster'];

async function runLighthouse(url, outputPath) {
  console.log(`Running Lighthouse for ${url}`);
  const command = `npx lighthouse ${BASE_URL}${url} --output=json --output-path=${outputPath} --chrome-flags="--headless"`;
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 60000 });
    if (stderr) console.error(`Lighthouse stderr: ${stderr}`);
    console.log(`Lighthouse report saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Lighthouse failed for ${url}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('=== CENARBE CRISIS TESTING ===');
  console.log(`Base URL: ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = {
    'Mi cuenta login': { passed: false, details: '' },
    'Bicicletas listado': { passed: false, details: [] },
    'Lighthouse audits': { passed: false, details: [] },
    'Flujo completo': { passed: false, details: '' }
  };

  try {
    // 1. Test página principal
    console.log('1. Cargando página principal...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`   Título: ${title}`);
    if (title.includes('Cenarbe')) {
      console.log('   ✓ Página principal cargada');
    } else {
      console.log('   ✗ Título no coincide');
    }

    // 2. Test login (invalid credentials)
    console.log('2. Probando formulario de login...');
    await page.click('a[href*="login.php"]');
    await page.waitForSelector('form[method="POST"]');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Esperar alerta de error
    try {
      await page.waitForSelector('.alert-danger', { timeout: 5000 });
      console.log('   ✓ Alerta de error mostrada (login inválido)');
      results['Mi cuenta login'].passed = true;
      results['Mi cuenta login'].details = 'Formulario de login funciona, muestra error para credenciales incorrectas';
    } catch (e) {
      console.log('   ✗ No se mostró alerta de error');
    }

    // 3. Test listado de bicicletas
    console.log('3. Navegando a bicicletas.php...');
    await page.goto(`${BASE_URL}/bicicletas.php`, { waitUntil: 'networkidle' });
    const content = await page.content();
    const foundBikes = [];
    for (const bike of BIKE_NAMES) {
      if (content.includes(bike)) {
        foundBikes.push(bike);
        console.log(`   ✓ Bicicleta "${bike}" encontrada`);
      } else {
        console.log(`   ✗ Bicicleta "${bike}" NO encontrada`);
      }
    }
    if (foundBikes.length === BIKE_NAMES.length) {
      results['Bicicletas listado'].passed = true;
    }
    results['Bicicletas listado'].details = foundBikes;

    // 4. Lighthouse audits
    console.log('4. Ejecutando auditorías Lighthouse...');
    const reportsDir = path.join(__dirname, 'lighthouse-reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
    for (const lhPage of LIGHTHOUSE_PAGES) {
      const reportPath = path.join(reportsDir, `${lhPage.replace('/', '')}-report.json`);
      const reportFile = await runLighthouse(lhPage, reportPath);
      if (reportFile) {
        const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        const score = report.categories.performance.score * 100;
        console.log(`   ${lhPage}: Performance score ${score.toFixed(0)}`);
        results['Lighthouse audits'].details.push({ page: lhPage, score });
      }
    }
    results['Lighthouse audits'].passed = results['Lighthouse audits'].details.length === LIGHTHOUSE_PAGES.length;

    // 5. Flujo completo (simulación de reserva sin login)
    console.log('5. Probando flujo de reserva (sin login)...');
    try {
      await page.goto(`${BASE_URL}/reservar.php`, { waitUntil: 'networkidle' });
      const pageTitle = await page.title();
      if (!pageTitle.includes('Error')) {
        console.log('   ✓ Página reservar.php carga sin errores');
        results['Flujo completo'].passed = true;
        results['Flujo completo'].details = 'Página de reserva accesible';
      } else {
        console.log('   ✗ Página reservar.php muestra error');
      }
    } catch (e) {
      console.log('   ✗ Error al cargar reservar.php:', e.message);
    }

    // Resumen
    console.log('\n=== RESUMEN ===');
    for (const [test, result] of Object.entries(results)) {
      const status = result.passed ? '✓' : '✗';
      console.log(`${status} ${test}: ${JSON.stringify(result.details)}`);
    }

    const allPassed = Object.values(results).every(r => r.passed);
    console.log(`\nEstado QA: ${allPassed ? 'PASS' : 'FAIL'}`);
    if (!allPassed) {
      console.log('Criterio de salida: Debe volver a desarrollo');
    } else {
      console.log('Criterio de salida: Puede cerrarse');
    }

  } catch (error) {
    console.error('Error durante el testing:', error);
  } finally {
    await browser.close();
  }
}

main();