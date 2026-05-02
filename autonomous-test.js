const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runAutonomousTest() {
  console.log('🚀 Iniciando prueba autónoma con navegador headless...');
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // 1. Navegar a login page
    console.log('🌐 Navegando a login page...');
    await page.goto('https://dev1.cenarbe.com/login.php', { waitUntil: 'networkidle' });
    
    // 2. Verificar que la página carga
    const pageTitle = await page.title();
    console.log(`📄 Título de página: ${pageTitle}`);
    
    // 3. Capturar screenshot de login page
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const loginScreenshot = path.join(screenshotDir, `login-${timestamp}.png`);
    await page.screenshot({ path: loginScreenshot, fullPage: true });
    console.log(`📸 Screenshot guardado: ${loginScreenshot}`);
    
    // 4. Verificar elementos del formulario
    const emailField = await page.$('input[name="email"], input[type="email"], #email');
    const passwordField = await page.$('input[name="password"], input[type="password"], #password');
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    
    console.log(`🔍 Elementos encontrados:`);
    console.log(`   - Email field: ${emailField ? '✅' : '❌'}`);
    console.log(`   - Password field: ${passwordField ? '✅' : '❌'}`);
    console.log(`   - Submit button: ${submitButton ? '✅' : '❌'}`);
    
    // 5. Intentar login (si tenemos credenciales configuradas)
    const testEmail = process.env.TEST_EMAIL || 'test@cenarbe.com';
    const testPassword = process.env.TEST_PASSWORD || 'Test123!';
    
    if (emailField && passwordField && submitButton) {
      console.log(`🔐 Intentando login con: ${testEmail}`);
      
      await emailField.fill(testEmail);
      await passwordField.fill(testPassword);
      
      // Capturar screenshot antes de submit
      const beforeLoginScreenshot = path.join(screenshotDir, `before-login-${timestamp}.png`);
      await page.screenshot({ path: beforeLoginScreenshot });
      
      await submitButton.click();
      
      // Esperar navegación o cambio de estado
      await page.waitForTimeout(3000);
      
      // 6. Verificar resultado del login
      const currentUrl = page.url();
      console.log(`📍 URL después de login: ${currentUrl}`);
      
      // Capturar screenshot después de login
      const afterLoginScreenshot = path.join(screenshotDir, `after-login-${timestamp}.png`);
      await page.screenshot({ path: afterLoginScreenshot, fullPage: true });
      
      // 7. Verificar indicadores de login exitoso
      const loginIndicators = [
        'Bienvenido', 'Welcome', 'Dashboard', 'Perfil',
        'Cerrar sesión', 'Logout', 'Mi cuenta'
      ];
      
      const pageContent = await page.content();
      let loginSuccessful = false;
      
      for (const indicator of loginIndicators) {
        if (pageContent.includes(indicator)) {
          console.log(`✅ Indicador de login encontrado: "${indicator}"`);
          loginSuccessful = true;
          break;
        }
      }
      
      if (loginSuccessful) {
        console.log('🎉 ¡Login exitoso! Sesión activa mantenida.');
        
        // 8. Probar navegación autenticada
        console.log('🧪 Probando navegación autenticada...');
        await page.goto('https://dev1.cenarbe.com/reservas.php', { waitUntil: 'networkidle' });
        
        const reservasScreenshot = path.join(screenshotDir, `reservas-${timestamp}.png`);
        await page.screenshot({ path: reservasScreenshot, fullPage: true });
        console.log(`📸 Screenshot de reservas: ${reservasScreenshot}`);
        
      } else {
        console.log('⚠️ Login puede haber fallado. Verificar credenciales.');
        
        // Verificar mensajes de error
        const errorSelectors = [
          '.error', '.alert-danger', '.text-danger',
          '[class*="error"]', '[class*="alert"]'
        ];
        
        for (const selector of errorSelectors) {
          const errorElements = await page.$$(selector);
          if (errorElements.length > 0) {
            const errorText = await page.evaluate(el => el.textContent, errorElements[0]);
            console.log(`❌ Error detectado: ${errorText.trim().substring(0, 100)}...`);
            break;
          }
        }
      }
    } else {
      console.log('⚠️ Formulario de login no encontrado o incompleto.');
    }
    
    // 9. Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      url: 'https://dev1.cenarbe.com/login.php',
      pageTitle,
      elementsFound: {
        emailField: !!emailField,
        passwordField: !!passwordField,
        submitButton: !!submitButton
      },
      screenshots: {
        login: loginScreenshot,
        beforeLogin: beforeLoginScreenshot,
        afterLogin: afterLoginScreenshot,
        reservas: loginSuccessful ? reservasScreenshot : null
      },
      loginAttempted: !!(emailField && passwordField && submitButton),
      loginSuccessful: loginSuccessful || false
    };
    
    const reportFile = path.join(screenshotDir, `report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📊 Reporte guardado: ${reportFile}`);
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    // Capturar screenshot de error
    const errorScreenshot = path.join(__dirname, 'screenshots', `error-${timestamp}.png`);
    try {
      await page.screenshot({ path: errorScreenshot });
      console.log(`📸 Screenshot de error: ${errorScreenshot}`);
    } catch (e) {
      console.error('No se pudo capturar screenshot de error:', e.message);
    }
    
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Navegador cerrado.');
  }
}

// Ejecutar prueba
runAutonomousTest()
  .then(() => {
    console.log('✅ Prueba autónoma completada exitosamente.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Prueba autónoma falló:', error);
    process.exit(1);
  });