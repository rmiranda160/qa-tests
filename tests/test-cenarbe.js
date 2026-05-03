const { chromium } = require('playwright');

const BASE_URL = 'https://dev1.cenarbe.com';
const BIKE_NAMES = ['Rockhopper', 'Talon', 'Roadmaster'];

async function runTests() {
  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  const page = await browser.newPage();
  const results = [];

  try {
    // 1. Home page loads
    console.log('1. Cargando página principal...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const title = await page.title();
    if (title.includes('Cenarbe')) {
      console.log('   ✓ Página principal cargada:', title);
      results.push({ test: 'Home page', passed: true });
    } else {
      console.log('   ✗ Título inesperado:', title);
      results.push({ test: 'Home page', passed: false });
    }

    // 2. Login form with invalid credentials
    console.log('2. Probando formulario de login...');
    try {
      await page.click('a[href*="login.php"]');
      await page.waitForSelector('input[name="email"]', { timeout: 5000 });
      await page.fill('input[name="email"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      await page.waitForSelector('.alert-danger', { timeout: 5000 });
      console.log('   ✓ Alerta de error mostrada (login inválido)');
      results.push({ test: 'Login form error', passed: true });
    } catch (e) {
      console.log('   ✗ Login form test failed:', e.message);
      results.push({ test: 'Login form error', passed: false });
    }

    // 3. Bicicletas listado
    console.log('3. Verificando listado de bicicletas...');
    await page.goto(`${BASE_URL}/bicicletas.php`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const content = await page.content();
    const found = [];
    const missing = [];
    for (const bike of BIKE_NAMES) {
      if (content.includes(bike)) {
        found.push(bike);
      } else {
        missing.push(bike);
      }
    }
    if (found.length > 0) console.log(`   ✓ Bicicletas encontradas: ${found.join(', ')}`);
    if (missing.length > 0) console.log(`   ✗ Bicicletas faltantes: ${missing.join(', ')}`);
    results.push({ test: 'Bicicletas listado', passed: missing.length === 0, found, missing });

    // 4. Critical pages accessibility (reservar.php, mi_cuenta.php)
    console.log('4. Verificando páginas críticas...');
    const criticalPages = ['/reservar.php', '/mi_cuenta.php'];
    for (const cp of criticalPages) {
      try {
        const response = await page.goto(`${BASE_URL}${cp}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const status = response.status();
        if (status >= 200 && status < 400) {
          console.log(`   ✓ ${cp} carga (status ${status})`);
          results.push({ test: `Page ${cp}`, passed: true, status });
        } else {
          console.log(`   ✗ ${cp} status error: ${status}`);
          results.push({ test: `Page ${cp}`, passed: false, status });
        }
      } catch (e) {
        console.log(`   ✗ ${cp} no carga:`, e.message);
        results.push({ test: `Page ${cp}`, passed: false, error: e.message });
      }
    }

    // 5. Full flow simulation (click through navigation)
    console.log('5. Simulando flujo de navegación...');
    try {
      await page.goto(BASE_URL);
      // Click on Bicicletas link
      await page.click('a[href*="bicicletas.php"]');
      await page.waitForLoadState('domcontentloaded');
      // Click on Reservas link
      await page.click('a[href*="reservas.php"]');
      await page.waitForLoadState('domcontentloaded');
      console.log('   ✓ Navegación básica funciona');
      results.push({ test: 'Navigation flow', passed: true });
    } catch (e) {
      console.log('   ✗ Navigation flow failed:', e.message);
      results.push({ test: 'Navigation flow', passed: false });
    }

  } catch (error) {
    console.error('Error general:', error);
  } finally {
    await browser.close();
  }

  // Report
  console.log('\n=== REPORTE QA ===');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`Pasaron ${passedCount} de ${totalCount} pruebas`);
  results.forEach(r => {
    const icon = r.passed ? '✓' : '✗';
    console.log(`${icon} ${r.test}`);
    if (r.found) console.log(`   Encontradas: ${r.found}`);
    if (r.missing) console.log(`   Faltantes: ${r.missing}`);
  });

  const allPassed = results.every(r => r.passed);
  console.log(`\nEstado QA: ${allPassed ? 'PASS' : 'FAIL'}`);
  console.log(`Criterio de salida: ${allPassed ? 'Puede cerrarse' : 'Debe volver a desarrollo'}`);
}

runTests();