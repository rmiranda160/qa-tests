const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

class AutonomousTestingSystem {
  constructor() {
    this.screenshotDir = path.join(__dirname, 'screenshots');
    this.reportsDir = path.join(__dirname, 'reports');
    this.ensureDirectories();
  }
  
  ensureDirectories() {
    [this.screenshotDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  async launchBrowser(browserType = 'chromium') {
    const browsers = {
      chromium: chromium,
      firefox: firefox,
      webkit: webkit
    };
    
    const browser = browsers[browserType];
    if (!browser) {
      throw new Error(`Browser type ${browserType} not supported`);
    }
    
    return await browser.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080'
      ]
    });
  }
  
  async testLogin(url, credentials) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const browser = await this.launchBrowser();
    const report = {
      timestamp: new Date().toISOString(),
      url,
      credentials: { email: credentials.email, password: '***' },
      success: false,
      error: null,
      screenshots: {},
      metrics: {}
    };
    
    try {
      const page = await browser.newPage();
      const startTime = Date.now();
      
      // Navegar a URL
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      report.metrics.pageLoadTime = Date.now() - startTime;
      
      // Capturar screenshot inicial
      const initialScreenshot = path.join(this.screenshotDir, `initial-${timestamp}.png`);
      await page.screenshot({ path: initialScreenshot, fullPage: true });
      report.screenshots.initial = initialScreenshot;
      
      // Buscar formulario de login
      const formData = await this.findLoginForm(page);
      report.formFound = formData.found;
      
      if (formData.found) {
        // Rellenar formulario
        await formData.emailField.fill(credentials.email);
        await formData.passwordField.fill(credentials.password);
        
        // Screenshot antes de submit
        const beforeSubmitScreenshot = path.join(this.screenshotDir, `before-submit-${timestamp}.png`);
        await page.screenshot({ path: beforeSubmitScreenshot });
        report.screenshots.beforeSubmit = beforeSubmitScreenshot;
        
        // Enviar formulario
        await formData.submitButton.click();
        await page.waitForTimeout(2000);
        
        // Verificar resultado
        const loginResult = await this.verifyLoginResult(page);
        report.success = loginResult.success;
        report.error = loginResult.error;
        report.loginIndicators = loginResult.indicators;
        
        // Screenshot después de login
        const afterLoginScreenshot = path.join(this.screenshotDir, `after-login-${timestamp}.png`);
        await page.screenshot({ path: afterLoginScreenshot, fullPage: true });
        report.screenshots.afterLogin = afterLoginScreenshot;
        
        // Si login exitoso, probar navegación autenticada
        if (loginResult.success) {
          await this.testAuthenticatedNavigation(page, timestamp);
        }
      } else {
        report.error = 'Formulario de login no encontrado';
      }
      
      await browser.close();
      
    } catch (error) {
      report.error = error.message;
      await browser.close().catch(() => {});
    }
    
    // Guardar reporte
    this.saveReport(report, timestamp);
    return report;
  }
  
  async findLoginForm(page) {
    const selectors = {
      email: [
        'input[name="email"]',
        'input[type="email"]',
        '#email',
        'input[placeholder*="email" i]',
        'input[placeholder*="correo" i]'
      ],
      password: [
        'input[name="password"]',
        'input[type="password"]',
        '#password',
        'input[placeholder*="password" i]',
        'input[placeholder*="contraseña" i]'
      ],
      submit: [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Iniciar")',
        'button:has-text("Login")',
        'button:has-text("Entrar")'
      ]
    };
    
    let emailField = null;
    let passwordField = null;
    let submitButton = null;
    
    // Buscar campo email
    for (const selector of selectors.email) {
      emailField = await page.$(selector);
      if (emailField) break;
    }
    
    // Buscar campo password
    for (const selector of selectors.password) {
      passwordField = await page.$(selector);
      if (passwordField) break;
    }
    
    // Buscar botón submit
    for (const selector of selectors.submit) {
      submitButton = await page.$(selector);
      if (submitButton) break;
    }
    
    return {
      found: !!(emailField && passwordField && submitButton),
      emailField,
      passwordField,
      submitButton
    };
  }
  
  async verifyLoginResult(page) {
    const indicators = {
      success: [
        'bienvenido', 'welcome', 'dashboard', 'perfil',
        'cerrar sesión', 'logout', 'mi cuenta', 'reservas',
        'dashboard', 'panel', 'account'
      ],
      error: [
        'incorrecto', 'inválido', 'error', 'failed',
        'invalid', 'no encontrado', 'no existe'
      ]
    };
    
    const content = (await page.content()).toLowerCase();
    const currentUrl = page.url();
    
    // Verificar indicadores de éxito
    for (const indicator of indicators.success) {
      if (content.includes(indicator)) {
        return {
          success: true,
          indicators: [indicator],
          error: null
        };
      }
    }
    
    // Verificar indicadores de error
    for (const indicator of indicators.error) {
      if (content.includes(indicator)) {
        return {
          success: false,
          indicators: [],
          error: `Indicador de error encontrado: "${indicator}"`
        };
      }
    }
    
    // Verificar cambio de URL (login exitoso suele redirigir)
    if (!currentUrl.includes('login') && !currentUrl.includes('signin')) {
      return {
        success: true,
        indicators: ['URL cambiada (posible redirección exitosa)'],
        error: null
      };
    }
    
    return {
      success: false,
      indicators: [],
      error: 'No se pudo determinar el resultado del login'
    };
  }
  
  async testAuthenticatedNavigation(page, timestamp) {
    // Probar acceso a páginas que requieren autenticación
    const authenticatedPages = [
      'https://dev1.cenarbe.com/reservas.php',
      'https://dev1.cenarbe.com/perfil.php',
      'https://dev1.cenarbe.com/historial.php'
    ];
    
    for (const pageUrl of authenticatedPages) {
      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 10000 });
        const screenshotPath = path.join(this.screenshotDir, `auth-${path.basename(pageUrl)}-${timestamp}.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`✅ Acceso autenticado a: ${pageUrl}`);
      } catch (error) {
        console.log(`⚠️ No se pudo acceder a: ${pageUrl} - ${error.message}`);
      }
    }
  }
  
  saveReport(report, timestamp) {
    const reportFile = path.join(this.reportsDir, `report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📊 Reporte guardado: ${reportFile}`);
  }
  
  async runFullTestSuite() {
    console.log('🚀 EJECUTANDO SUITE COMPLETA DE TESTING AUTÓNOMO');
    console.log('='.repeat(60));
    
    const testCases = [
      {
        name: 'Cenarbe Bike Rental Login',
        url: 'https://dev1.cenarbe.com/login.php',
        credentials: {
          email: process.env.TEST_EMAIL || 'test@cenarbe.com',
          password: process.env.TEST_PASSWORD || 'Test123!'
        }
      },
      {
        name: 'Villa Zocotin (si tiene login)',
        url: 'https://villazocotin.cenarbe.com/',
        credentials: {
          email: process.env.TEST_EMAIL_VZ || 'test@villazocotin.com',
          password: process.env.TEST_PASSWORD_VZ || 'Test123!'
        }
      }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Ejecutando: ${testCase.name}`);
      console.log(`   URL: ${testCase.url}`);
      
      try {
        const result = await this.testLogin(testCase.url, testCase.credentials);
        results.push({
          testCase: testCase.name,
          success: result.success,
          error: result.error
        });
        
        console.log(`   Resultado: ${result.success ? '✅ ÉXITO' : '❌ FALLO'}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        console.log(`   Screenshots: ${Object.keys(result.screenshots).length} capturados`);
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.push({
          testCase: testCase.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL DE TESTING AUTÓNOMO');
    console.log('='.repeat(60));
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total tests: ${totalTests}`);
    console.log(`✅ Pasados: ${passedTests}`);
    console.log(`❌ Fallados: ${failedTests}`);
    console.log(`📈 Tasa de éxito: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (failedTests > 0) {
      console.log('\n🔍 Tests fallados:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.testCase}: ${r.error}`);
      });
    }
    
    console.log('\n📁 Reportes guardados en:', this.reportsDir);
    console.log('📸 Screenshots guardados en:', this.screenshotDir);
    console.log('='.repeat(60));
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      results
    };
  }
}

// Ejecutar suite completa si se llama directamente
if (require.main === module) {
  const tester = new AutonomousTestingSystem();
  tester.runFullTestSuite()
    .then(result => {
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Error ejecutando suite de testing:', error);
      process.exit(1);
    });
}

module.exports = AutonomousTestingSystem;