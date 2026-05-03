const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class CoherenceTester {
  constructor() {
    this.reportsDir = path.join(__dirname, 'coherence-reports');
    this.screenshotsDir = path.join(__dirname, 'coherence-screenshots');
    this.ensureDirectories();
  }
  
  ensureDirectories() {
    [this.reportsDir, this.screenshotsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  async testCenarbeCoherence() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const report = {
      timestamp: new Date().toISOString(),
      application: 'Cenarbe Bike Rental',
      url: 'https://dev1.cenarbe.com',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        incoherences: []
      }
    };
    
    try {
      const page = await browser.newPage();
      
      // 1. Login primero
      console.log('🔐 Iniciando sesión en Cenarbe...');
      await page.goto('https://dev1.cenarbe.com/login.php', { waitUntil: 'networkidle' });
      
      // Buscar y rellenar formulario de login
      const emailField = await page.$('input[name="email"], input[type="email"]');
      const passwordField = await page.$('input[name="password"], input[type="password"]');
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      
      if (emailField && passwordField && submitButton) {
        await emailField.fill(process.env.TEST_EMAIL || 'test@cenarbe.com');
        await passwordField.fill(process.env.TEST_PASSWORD || 'Test123!');
        await submitButton.click();
        await page.waitForTimeout(3000);
      }
      
      // 2. Definir pruebas de coherencia
      const coherenceTests = [
        {
          name: 'Botón "Mis Reservas" → Página de reservas',
          buttonSelector: 'a[href*="reservas"], button:has-text("Reservas"), :text("Mis Reservas")',
          expectedUrl: 'reservas',
          expectedTitle: 'reserva',
          expectedElements: ['reserva', 'alquiler', 'bicicleta']
        },
        {
          name: 'Botón "Mi Perfil" → Página de perfil',
          buttonSelector: 'a[href*="perfil"], button:has-text("Perfil"), :text("Mi Perfil")',
          expectedUrl: 'perfil',
          expectedTitle: 'perfil',
          expectedElements: ['perfil', 'usuario', 'datos', 'información']
        },
        {
          name: 'Botón "Historial" → Historial de actividades',
          buttonSelector: 'a[href*="historial"], button:has-text("Historial")',
          expectedUrl: 'historial',
          expectedTitle: 'historial',
          expectedElements: ['historial', 'actividad', 'anterior', 'pasado']
        },
        {
          name: 'Enlace "Configuración" → Opciones de configuración',
          buttonSelector: 'a[href*="config"], :text("Configuración")',
          expectedUrl: 'config',
          expectedTitle: 'config',
          expectedElements: ['configuración', 'opciones', 'ajustes', 'preferencias']
        },
        {
          name: 'Menú "Ayuda" → Página de ayuda/soporte',
          buttonSelector: 'a[href*="ayuda"], :text("Ayuda"), :text("Soporte")',
          expectedUrl: 'ayuda',
          expectedTitle: 'ayuda',
          expectedElements: ['ayuda', 'soporte', 'faq', 'preguntas']
        }
      ];
      
      // 3. Ejecutar cada prueba de coherencia
      for (const test of coherenceTests) {
        console.log(`\n🧪 Probando: ${test.name}`);
        report.summary.total++;
        
        const testResult = {
          testName: test.name,
          timestamp: new Date().toISOString(),
          passed: false,
          incoherences: [],
          screenshots: []
        };
        
        try {
          // Buscar el botón/enlace
          const button = await page.$(test.buttonSelector);
          
          if (!button) {
            testResult.incoherences.push(`No se encontró el elemento: ${test.buttonSelector}`);
            testResult.passed = false;
          } else {
            // Capturar screenshot antes del click
            const beforeScreenshot = path.join(this.screenshotsDir, `before-${test.name.replace(/\s+/g, '-')}-${timestamp}.png`);
            await page.screenshot({ path: beforeScreenshot });
            testResult.screenshots.push(beforeScreenshot);
            
            // Hacer click
            // Abrir dropdown si es Mi Perfil
            if (test.name.includes('Mi Perfil')) {
              const dropdownToggle = await page.$('button.dropdown-toggle');
              if (dropdownToggle) {
                await dropdownToggle.click();
                await page.waitForTimeout(500);
              }
            }
            await button.click();
            await page.waitForTimeout(2000);
            
            // Capturar screenshot después del click
            const afterScreenshot = path.join(this.screenshotsDir, `after-${test.name.replace(/\s+/g, '-')}-${timestamp}.png`);
            await page.screenshot({ path: afterScreenshot, fullPage: true });
            testResult.screenshots.push(afterScreenshot);
            
            // Verificar coherencia
            const currentUrl = page.url().toLowerCase();
            const pageTitle = (await page.title()).toLowerCase();
            const pageContent = (await page.content()).toLowerCase();
            
            // Verificar URL
            if (!currentUrl.includes(test.expectedUrl)) {
              testResult.incoherences.push(`URL incoherente: Esperaba "${test.expectedUrl}" en URL, pero es "${currentUrl}"`);
            }
            
            // Verificar título
            if (!pageTitle.includes(test.expectedTitle)) {
              testResult.incoherences.push(`Título incoherente: Esperaba "${test.expectedTitle}" en título, pero es "${pageTitle}"`);
            }
            
            // Verificar contenido esperado
            for (const expectedElement of test.expectedElements) {
              if (!pageContent.includes(expectedElement)) {
                testResult.incoherences.push(`Contenido faltante: No se encontró "${expectedElement}" en la página`);
              }
            }
            
            // Determinar si pasó la prueba
            testResult.passed = testResult.incoherences.length === 0;
            
            if (testResult.passed) {
              console.log(`   ✅ COHERENTE: ${test.name}`);
              report.summary.passed++;
            } else {
              console.log(`   ❌ INCOHERENTE: ${test.name}`);
              console.log(`      Errores: ${testResult.incoherences.join(', ')}`);
              report.summary.failed++;
              report.summary.incoherences.push({
                test: test.name,
                errors: testResult.incoherences
              });
              
              // Capturar screenshot de la incoherencia
              const incoherenceScreenshot = path.join(this.screenshotsDir, `incoherence-${test.name.replace(/\s+/g, '-')}-${timestamp}.png`);
              await page.screenshot({ path: incoherenceScreenshot, fullPage: true });
              testResult.screenshots.push(incoherenceScreenshot);
            }
          }
          
        } catch (error) {
          testResult.incoherences.push(`Error durante la prueba: ${error.message}`);
          testResult.passed = false;
          report.summary.failed++;
        }
        
        report.tests.push(testResult);
        
        // Volver a página principal para siguiente prueba
        await page.goto('https://dev1.cenarbe.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      }
      
      // 4. Generar reporte final
      this.saveReport(report, timestamp);
      
      // 5. Si hay incoherencias, preparar para alerta
      if (report.summary.failed > 0) {
        await this.prepareIncoherenceAlert(report, timestamp);
      }
      
      return report;
      
    } catch (error) {
      console.error('❌ Error en pruebas de coherencia:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
  
  saveReport(report, timestamp) {
    const reportFile = path.join(this.reportsDir, `coherence-report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // También crear versión resumida para alertas
    const summary = {
      timestamp: report.timestamp,
      application: report.application,
      summary: report.summary,
      incoherences: report.summary.incoherences
    };
    
    const summaryFile = path.join(this.reportsDir, `coherence-summary-${timestamp}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log(`\n📊 Reporte de coherencia guardado: ${reportFile}`);
    console.log(`📋 Resumen: ${report.summary.passed} pasados, ${report.summary.failed} fallados`);
  }
  
  async prepareIncoherenceAlert(report, timestamp) {
    // Preparar archivos para enviar al coordinator
    const alertDir = path.join(__dirname, 'alerts');
    if (!fs.existsSync(alertDir)) {
      fs.mkdirSync(alertDir, { recursive: true });
    }
    
    // Copiar el primer screenshot de incoherencia para alerta
    const incoherenceTests = report.tests.filter(t => !t.passed && t.screenshots.length > 0);
    if (incoherenceTests.length > 0 && incoherenceTests[0].screenshots.length > 0) {
      const sourceScreenshot = incoherenceTests[0].screenshots[incoherenceTests[0].screenshots.length - 1];
      const alertScreenshot = path.join(alertDir, `incoherence-alert-${timestamp}.png`);
      
      fs.copyFileSync(sourceScreenshot, alertScreenshot);
      
      // También copiar a workspace raíz para Telegram
      const telegramScreenshot = `/home/node/.openclaw/workspace-coordinator/incoherence-${timestamp}.png`;
      fs.copyFileSync(sourceScreenshot, telegramScreenshot);
      
      console.log(`🚨 Screenshot de incoherencia preparado para alerta: ${telegramScreenshot}`);
    }
    
    // Crear mensaje de alerta
    const alertMessage = {
      type: 'coherence_incoherence',
      timestamp: new Date().toISOString(),
      application: report.application,
      incoherences: report.summary.incoherences.map(i => ({
        test: i.test,
        errorCount: i.errors.length
      })),
      screenshot: `/home/node/.openclaw/workspace-coordinator/incoherence-${timestamp}.png`
    };
    
    const alertFile = path.join(alertDir, `alert-${timestamp}.json`);
    fs.writeFileSync(alertFile, JSON.stringify(alertMessage, null, 2));
  }
  
  async runDailyCoherenceTests() {
    console.log('🔍 INICIANDO PRUEBAS DIARIAS DE COHERENCIA');
    console.log('='.repeat(60));
    
    try {
      const report = await this.testCenarbeCoherence();
      
      console.log('\n' + '='.repeat(60));
      console.log('📈 RESUMEN PRUEBAS DE COHERENCIA');
      console.log('='.repeat(60));
      console.log(`Aplicación: ${report.application}`);
      console.log(`Total pruebas: ${report.summary.total}`);
      console.log(`✅ Coherentes: ${report.summary.passed}`);
      console.log(`❌ Incoherentes: ${report.summary.failed}`);
      
      if (report.summary.failed > 0) {
        console.log('\n🚨 INCOHERENCIAS DETECTADAS:');
        report.summary.incoherences.forEach((inc, idx) => {
          console.log(`   ${idx + 1}. ${inc.test}`);
          inc.errors.forEach((err, errIdx) => {
            console.log(`      - ${err}`);
          });
        });
        
        // Preparar para notificar al coordinator
        console.log(`\n📤 Screenshot preparado en workspace raíz para alerta`);
      }
      
      console.log('='.repeat(60));
      
      return report;
      
    } catch (error) {
      console.error('❌ Error ejecutando pruebas de coherencia:', error);
      throw error;
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const tester = new CoherenceTester();
  tester.runDailyCoherenceTests()
    .then(report => {
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = CoherenceTester;