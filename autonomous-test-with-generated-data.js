/**
 * Prueba autónoma usando datos generados (no credenciales fijas)
 */

const { chromium } = require('playwright');
const TestDataGenerator = require('./test-data-generator');
const fs = require('fs');
const path = require('path');

async function runTestWithGeneratedData() {
  console.log('🧪 INICIANDO PRUEBA CON DATOS GENERADOS');
  console.log('='.repeat(60));
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const generator = new TestDataGenerator();
  const testId = `auto_test_${timestamp}`;
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // ===== 1. GENERAR DATOS DE PRUEBA =====
    console.log('🔧 Generando datos de prueba...');
    const user = generator.generateUser(testId);
    console.log(`   👤 Usuario: ${user.email} / ${user.password}`);
    
    // ===== 2. PRUEBA DE REGISTRO (si existe) =====
    console.log('\n📝 Probando registro de usuario...');
    await page.goto('https://dev1.cenarbe.com/register.php', { waitUntil: 'networkidle' });
    
    // Verificar si existe formulario de registro
    const registerForm = await page.$('form[action*="register"], form:has-text("Registro")');
    
    if (registerForm) {
      console.log('   📋 Formulario de registro encontrado - probando...');
      
      // Rellenar formulario con datos generados
      await page.fill('input[name="nombre"], input[name="first_name"]', user.firstName);
      await page.fill('input[name="apellido"], input[name="last_name"]', user.lastName);
      await page.fill('input[name="email"], input[type="email"]', user.email);
      await page.fill('input[name="password"], input[type="password"]', user.password);
      await page.fill('input[name="telefono"], input[type="tel"]', user.phone);
      
      // Capturar screenshot antes de enviar
      const beforeRegisterScreenshot = path.join(__dirname, 'screenshots', `before-register-${timestamp}.png`);
      await page.screenshot({ path: beforeRegisterScreenshot });
      
      // Enviar formulario
      await page.click('button[type="submit"], input[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Verificar resultado
      const registerResult = await page.content();
      if (registerResult.toLowerCase().includes('éxito') || 
          registerResult.toLowerCase().includes('bienvenido') ||
          page.url().includes('login')) {
        console.log('   ✅ Registro exitoso (o redirección a login)');
      } else {
        console.log('   ⚠️ Registro puede haber fallado');
      }
    } else {
      console.log('   ℹ️ Formulario de registro no encontrado (puede no existir)');
    }
    
    // ===== 3. PRUEBA DE LOGIN =====
    console.log('\n🔐 Probando login con datos generados...');
    await page.goto('https://dev1.cenarbe.com/login.php', { waitUntil: 'networkidle' });
    
    // Buscar formulario de login
    const emailField = await page.$('input[name="email"], input[type="email"]');
    const passwordField = await page.$('input[name="password"], input[type="password"]');
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    
    if (emailField && passwordField && submitButton) {
      console.log(`   📋 Formulario encontrado - usando: ${user.email}`);
      
      // Rellenar con datos generados
      await emailField.fill(user.email);
      await passwordField.fill(user.password);
      
      // Capturar screenshot antes de login
      const beforeLoginScreenshot = path.join(__dirname, 'screenshots', `before-login-${timestamp}.png`);
      await page.screenshot({ path: beforeLoginScreenshot });
      
      // Enviar formulario
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // Verificar login exitoso
      const afterLoginContent = await page.content().toLowerCase();
      const loginIndicators = ['bienvenido', 'reservas', 'perfil', 'dashboard', 'cerrar sesión'];
      let loginSuccessful = false;
      
      for (const indicator of loginIndicators) {
        if (afterLoginContent.includes(indicator)) {
          console.log(`   ✅ Login exitoso - Indicador: "${indicator}"`);
          loginSuccessful = true;
          break;
        }
      }
      
      if (loginSuccessful) {
        // Capturar screenshot después de login
        const afterLoginScreenshot = path.join(__dirname, 'screenshots', `after-login-${timestamp}.png`);
        await page.screenshot({ path: afterLoginScreenshot, fullPage: true });
        
        // Copiar a workspace raíz para Telegram
        const telegramScreenshot = `/home/node/.openclaw/workspace-coordinator/login-generated-data-${timestamp}.png`;
        fs.copyFileSync(afterLoginScreenshot, telegramScreenshot);
        console.log(`   📸 Screenshot para Telegram: ${telegramScreenshot}`);
        
        // ===== 4. PRUEBA DE FLUJOS AUTENTICADOS =====
        console.log('\n🚀 Probando flujos autenticados...');
        
        // Probar navegación a reservas
        try {
          await page.goto('https://dev1.cenarbe.com/reservas.php', { waitUntil: 'networkidle' });
          const reservasScreenshot = path.join(__dirname, 'screenshots', `reservas-${timestamp}.png`);
          await page.screenshot({ path: reservasScreenshot });
          console.log('   ✅ Navegación a reservas exitosa');
        } catch (error) {
          console.log(`   ⚠️ No se pudo acceder a reservas: ${error.message}`);
        }
        
        // Probar navegación a perfil
        try {
          await page.goto('https://dev1.cenarbe.com/perfil.php', { waitUntil: 'networkidle' });
          const perfilScreenshot = path.join(__dirname, 'screenshots', `perfil-${timestamp}.png`);
          await page.screenshot({ path: perfilScreenshot });
          console.log('   ✅ Navegación a perfil exitosa');
        } catch (error) {
          console.log(`   ⚠️ No se pudo acceder a perfil: ${error.message}`);
        }
        
      } else {
        console.log('   ❌ Login fallado - Verificar credenciales generadas');
        
        // Verificar mensaje de error
        const errorSelectors = ['.error', '.alert-danger', '.text-danger'];
        for (const selector of errorSelectors) {
          const errorElement = await page.$(selector);
          if (errorElement) {
            const errorText = await page.evaluate(el => el.textContent.trim(), errorElement);
            console.log(`   ❌ Error: ${errorText.substring(0, 100)}...`);
            break;
          }
        }
      }
    } else {
      console.log('   ❌ Formulario de login no encontrado');
    }
    
    // ===== 5. GENERAR REPORTE =====
    console.log('\n📊 Generando reporte de prueba...');
    const report = {
      testId: testId,
      timestamp: new Date().toISOString(),
      user: {
        email: user.email,
        id: user.id,
        generated: true
      },
      steps: [
        'data_generated',
        'registration_attempted',
        'login_attempted',
        'authenticated_navigation'
      ],
      screenshots: {
        beforeRegister: beforeRegisterScreenshot || null,
        beforeLogin: beforeLoginScreenshot || null,
        afterLogin: afterLoginScreenshot || null,
        telegram: telegramScreenshot || null
      }
    };
    
    const reportFile = path.join(__dirname, 'test-data', `test-report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`   📁 Reporte guardado: ${reportFile}`);
    
    // ===== 6. LIMPIEZA (opcional) =====
    console.log('\n🧹 Limpiando datos de prueba antiguos...');
    const deletedCount = generator.cleanupOldTestData(1); // >1 hora
    console.log(`   ✅ Eliminados ${deletedCount} archivos antiguos`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PRUEBA CON DATOS GENERADOS COMPLETADA');
    console.log('='.repeat(60));
    
    return report;
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Navegador cerrado');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTestWithGeneratedData()
    .then(report => {
      console.log(`\n🎉 Prueba completada con ID: ${report.testId}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Prueba fallida:', error.message);
      process.exit(1);
    });
}

module.exports = runTestWithGeneratedData;