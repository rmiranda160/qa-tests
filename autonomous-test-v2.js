const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runAutonomousTest() {
  console.log('🚀 Iniciando prueba autónoma con navegador headless...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotDir = path.join(__dirname, 'screenshots');
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
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
    
    let loginSuccessful = false;
    let errorMessage = null;
    
    // 5. Intentar login (si tenemos credenciales configuradas)
    if (emailField && passwordField && submitButton) {
      const testEmail = process.env.TEST_EMAIL || 'test@cenarbe.com';
      const testPassword = process.env.TEST_PASSWORD || 'Test123!';
      
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
        'Cerrar sesión', 'Logout', 'Mi cuenta', 'Reservas'
      ];
      
      const pageContent = await page.content();
      
      for (const indicator of loginIndicators) {
        if (pageContent.toLowerCase().includes(indicator.toLowerCase())) {
          console.log(`✅ Indicador de login encontrado: "${indicator}"`);
          loginSuccessful = true;
          break;
        }
      }
      
      if (!loginSuccessful) {
        console.log('⚠️ Login puede haber fallado. Verificar credenciales.');
        
        // Verificar mensajes de error
        const errorSelectors = [
          '.error', '.alert-danger', '.text-danger',
          '[class*="error"]', '[class*="alert"]', '.invalid-feedback'
        ];
        
        for (const selector of errorSelectors) {
          const errorElements = await page.$$(selector);
          if (errorElements.length > 0) {
            errorMessage = await page.evaluate(el => el.textContent.trim(), errorElements[0]);
            console.log(`❌ Error detectado: ${errorMessage.substring(0, 100)}...`);
            break;
          }
        }
        
        // Si no encontramos elementos de error específicos, buscar texto general
        if (!errorMessage) {
          const bodyText = await page.textContent('body');
          const errorKeywords = ['incorrecto', 'inválido', 'error', 'failed', 'invalid'];
          for (const keyword of errorKeywords) {
            if (bodyText.toLowerCase().includes(keyword)) {
              const start = bodyText.toLowerCase().indexOf(keyword);
              errorMessage = bodyText.substring(start, Math.min(start + 100, bodyText.length)).trim();
              console.log(`❌ Posible error: ${errorMessage}...`);
              break;
            }
          }
        }
      }
      
      // 8. Si login exitoso, probar navegación autenticada
      if (loginSuccessful) {
        console.log('🎉 ¡Login exitoso! Sesión activa mantenida.');
        
        console.log('🧪 Probando navegación autenticada...');
        await page.goto('https://dev1.cenarbe.com/reservas.php', { waitUntil: 'networkidle' });
        
        const reservasScreenshot = path.join(screenshotDir, `reservas-${timestamp}.png`);
        await page.screenshot({ path: reservasScreenshot, fullPage: true });
        console.log(`📸 Screenshot de reservas: ${reservasScreenshot}`);
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
      loginAttempted: !!(emailField && passwordField && submitButton),
      loginSuccessful,
      errorMessage,
      screenshots: {
        login: loginScreenshot,
        beforeLogin: beforeLoginScreenshot || null,
        afterLogin: afterLoginScreenshot || null
      }
    };
    
    const reportFile = path.join(screenshotDir, `report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📊 Reporte guardado: ${reportFile}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    // Capturar screenshot de error si la página existe
    try {
      const errorScreenshot = path.join(screenshotDir, `error-${timestamp}.png`);
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
  .then((report) => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ PRUEBA AUTÓNOMA COMPLETADA');
    console.log('='.repeat(50));
    console.log(`Resultado: ${report.loginSuccessful ? 'LOGIN EXITOSO 🎉' : 'LOGIN FALLIDO ⚠️'}`);
    console.log(`Título: ${report.pageTitle}`);
    console.log(`Elementos encontrados: ${report.elementsFound.emailField ? '✅' : '❌'} Email | ${report.elementsFound.passwordField ? '✅' : '❌'} Password | ${report.elementsFound.submitButton ? '✅' : '❌'} Submit`);
    if (report.errorMessage) {
      console.log(`Error: ${report.errorMessage}`);
    }
    console.log(`Screenshots: ${Object.values(report.screenshots).filter(Boolean).length} capturados`);
    console.log('='.repeat(50));
    
    process.exit(report.loginSuccessful ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ PRUEBA AUTÓNOMA FALLÓ:', error.message);
    process.exit(1);
  });