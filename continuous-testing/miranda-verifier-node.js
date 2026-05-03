#!/usr/bin/env node

/**
 * Miranda Rule Verifier - Node.js version
 * Integración con sistema testing continuo existente
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = 'ws://51.254.244.216:3000/';

class MirandaVerifier {
  constructor(configPath) {
    this.config = this.loadConfig(configPath);
    this.results = {
      timestamp: new Date().toISOString(),
      rule: 'Miranda Button/Action Verification',
      summary: {
        totalApps: 0,
        totalButtons: 0,
        passedButtons: 0,
        failedButtons: 0,
        appsWithIssues: 0
      },
      applications: []
    };
  }

  loadConfig(configPath) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`✅ Configuración cargada: ${config.applications.length} aplicaciones`);
      return config;
    } catch (error) {
      console.error(`❌ Error cargando configuración: ${error}`);
      process.exit(1);
    }
  }

  async run() {
    console.log('🧪 EJECUTANDO VERIFICACIÓN REGLA MIRANDA');
    console.log('=' .repeat(60));
    
    for (const app of this.config.applications) {
      console.log(`\n🔍 Verificando: ${app.name} (${app.url})`);
      const result = await this.verifyApplication(app);
      this.results.applications.push(result);
    }

    this.generateSummary();
    this.saveResults();
    this.printReport();
    
    // Retornar código de salida según resultados
    const hasCriticalIssues = this.results.applications.some(app => 
      app.critical_buttons?.some(btn => 
        btn.critical && btn.status !== 'pass'
      )
    );
    
    return hasCriticalIssues ? 1 : 0;
  }

  async verifyApplication(app) {
    const result = {
      name: app.name,
      url: app.url,
      timestamp: new Date().toISOString(),
      critical_buttons: [],
      issues_found: 0
    };

    let browser;
    try {
      browser = await playwright.chromium.connect(WS_ENDPOINT);
      const page = await browser.newPage();
      
      console.log(`   🌐 Navegando a ${app.url}`);
      await page.goto(app.url, { waitUntil: 'networkidle' });

      // Verificar cada botón crítico
      for (const buttonConfig of app.critical_buttons || []) {
        const buttonResult = await this.testButton(page, buttonConfig);
        result.critical_buttons.push(buttonResult);
        
        if (buttonResult.status !== 'pass') {
          result.issues_found++;
        }
      }

      await browser.close();

    } catch (error) {
      console.error(`   ❌ Error verificando ${app.name}: ${error.message}`);
      result.error = error.message;
    }

    return result;
  }

  async testButton(page, buttonConfig) {
    const result = {
      name: buttonConfig.name,
      selector: buttonConfig.selector,
      type: buttonConfig.type || 'button',
      critical: buttonConfig.critical || false,
      status: 'error',
      exists: false,
      visible: false,
      clickable: false,
      functional: false,
      issues: []
    };

    try {
      // Verificar existencia
      const element = await page.$(buttonConfig.selector);
      if (!element) {
        result.issues.push('No encontrado en DOM');
        return result;
      }
      result.exists = true;

      // Verificar visibilidad
      const isVisible = await element.isVisible();
      if (!isVisible) {
        result.issues.push('No visible (puede estar oculto)');
      }
      result.visible = isVisible;

      // Verificar si no está disabled
      if (result.type === 'button') {
        const isDisabled = await element.isDisabled();
        if (isDisabled) {
          result.issues.push('Botón deshabilitado');
        } else {
          result.clickable = true;
        }
      }

      // Verificar área clickeable
      const boundingBox = await element.boundingBox();
      if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
        result.clickable = true;
      } else {
        result.issues.push('Sin área clickeable');
      }

      // Probar funcionalidad (para botones clickeables) con detección AJAX mejorada
      if (result.clickable && result.type === 'button') {
        const initialUrl = page.url();
        const selector = buttonConfig.selector;
        
        try {
          // Indicadores de funcionalidad
          const indicators = {
            urlChanged: false,
            domChanged: false,
            networkRequest: false,
            downloadTriggered: false,
            modalOpened: false,
            stateChanged: false
          };
          
          // Registrar listeners para eventos de red y descargas
          const requests = [];
          const requestListener = request => requests.push(request.url());
          page.on('request', requestListener);
          
          let downloadDetected = false;
          const downloadListener = download => { downloadDetected = true; };
          page.on('download', downloadListener);
          
          // Capturar estado inicial del botón
          const initialClass = await element.evaluate(btn => btn.className);
          
          // Hacer click
          await element.click({ timeout: 5000 });
          await page.waitForTimeout(1000); // Esperar efectos AJAX
          
          // 1. URL cambio
          const newUrl = page.url();
          indicators.urlChanged = newUrl !== initialUrl;
          
          // 2. DOM cambio (elementos nuevos/ocultos)
          try {
            await page.waitForSelector(`${selector} + *`, { timeout: 1000 });
            indicators.domChanged = true;
          } catch {}
          
          // 3. Network requests (AJAX)
          indicators.networkRequest = requests.length > 0;
          
          // 4. Download triggered
          indicators.downloadTriggered = downloadDetected;
          
          // 5. Modal/overlay abierto
          const modals = await page.$$('.modal, .overlay, [role="dialog"]');
          for (const modal of modals) {
            if (await modal.isVisible()) {
              indicators.modalOpened = true;
              break;
            }
          }
          
          // 6. State changed (clases CSS, atributos)
          const buttonAfter = await page.$(selector);
          if (buttonAfter) {
            const newClass = await buttonAfter.evaluate(btn => btn.className);
            indicators.stateChanged = newClass !== initialClass;
          }
          
          // Remover listeners
          page.removeListener('request', requestListener);
          page.removeListener('download', downloadListener);
          
          // Determinar si es funcional (al menos un indicador positivo)
          const isFunctional = Object.values(indicators).some(v => v === true);
          
          if (isFunctional) {
            result.functional = true;
            // Agregar detalles de indicadores positivos
            const activeIndicators = Object.entries(indicators)
              .filter(([k, v]) => v)
              .map(([k]) => k);
            result.issues.push(`Funcionalidad detectada: ${activeIndicators.join(', ')}`);
            
            // Si cambió URL, agregar redirección
            if (indicators.urlChanged) {
              result.issues.push(`Redirige a: ${newUrl}`);
            }
          } else {
            // Ningún indicador activo
            result.issues.push('Click sin cambio detectable en URL, DOM, red, descarga, modal o estado');
          }
          
          // Volver si cambió URL (para mantener estado inicial)
          if (indicators.urlChanged) {
            await page.goto(initialUrl, { waitUntil: 'networkidle' });
          }

        } catch (clickError) {
          result.issues.push(`Error al hacer click: ${clickError.message}`);
        }
      }

      // Determinar estado final (actualizado para considerar funcionalidad AJAX)
      if (result.functional) {
        result.status = 'pass';
      } else if (result.exists && result.clickable) {
        // Si es clickeable pero no se detectó funcionalidad, warning
        result.status = 'warning';
      } else {
        result.status = 'fail';
      }

    } catch (error) {
      result.issues.push(`Error general: ${error.message}`);
    }

    return result;
  }

  generateSummary() {
    this.results.summary.totalApps = this.results.applications.length;
    
    for (const app of this.results.applications) {
      for (const btn of app.critical_buttons || []) {
        this.results.summary.totalButtons++;
        
        if (btn.status === 'pass') {
          this.results.summary.passedButtons++;
        } else if (btn.status === 'fail' || btn.status === 'error') {
          this.results.summary.failedButtons++;
        }
      }
      
      if (app.issues_found > 0) {
        this.results.summary.appsWithIssues++;
      }
    }
  }

  saveResults() {
    const outputPath = path.join(__dirname, 'results', `miranda-${Date.now()}.json`);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Reporte detallado guardado en: ${outputPath}`);
    
    // También guardar versión resumida
    const summaryPath = path.join(__dirname, 'results', 'miranda-latest.json');
    fs.writeFileSync(summaryPath, JSON.stringify(this.results, null, 2));
  }

  printReport() {
    const s = this.results.summary;
    
    console.log('\n📊 INFORME EJECUTIVO REGLA MIRANDA');
    console.log('=' .repeat(60));
    console.log(`📅 Fecha: ${new Date().toISOString()}`);
    console.log(`📱 Aplicaciones verificadas: ${s.totalApps}`);
    console.log(`🔘 Botones totales verificados: ${s.totalButtons}`);
    console.log(`✅ Botones funcionales: ${s.passedButtons} (${s.totalButtons > 0 ? Math.round(s.passedButtons/s.totalButtons*100) : 0}%)`);
    console.log(`❌ Botones con problemas: ${s.failedButtons} (${s.totalButtons > 0 ? Math.round(s.failedButtons/s.totalButtons*100) : 0}%)`);
    console.log(`⚠️  Aplicaciones con issues: ${s.appsWithIssues}`);
    
    // Mostrar issues críticos
    console.log('\n🚨 BOTONES CRÍTICOS CON PROBLEMAS:');
    let hasCriticalIssues = false;
    
    for (const app of this.results.applications) {
      const criticalIssues = (app.critical_buttons || []).filter(
        btn => btn.critical && btn.status !== 'pass'
      );
      
      if (criticalIssues.length > 0) {
        hasCriticalIssues = true;
        console.log(`\n   ${app.name}:`);
        for (const btn of criticalIssues) {
          console.log(`     • ${btn.name} (${btn.status}): ${btn.issues.join(', ')}`);
        }
      }
    }
    
    if (!hasCriticalIssues) {
      console.log('   ✅ Ningún botón crítico tiene problemas');
    }
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. Corregir botones críticos con problemas (alta prioridad)');
    console.log('   2. Investigar botones con estado "warning"');
    console.log('   3. Actualizar selectores si no encuentran elementos');
    console.log('   4. Integrar esta verificación en cada ciclo de testing');
  }
}

// Ejecución desde línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Uso: node miranda-verifier-node.js <config-path>');
    process.exit(1);
  }
  
  const configPath = args[0];
  const verifier = new MirandaVerifier(configPath);
  
  verifier.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

module.exports = MirandaVerifier;