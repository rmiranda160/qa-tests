#!/usr/bin/env node

/**
 * Button Action Verifier - Script para verificar funcionalidad de botones/acciones
 * Cumple con regla obligatoria de Miranda (CEO): "Siempre que haya un botón o una acción en el código,
 * se debe comprobar si se encuentra desarrollada la funcionalidad."
 * 
 * Uso: node button-action-verifier.js <url> [--output report.json]
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const WS_ENDPOINT = 'ws://51.254.244.216:3000/';

class ButtonActionVerifier {
  constructor(url, outputPath = null) {
    this.url = url;
    this.outputPath = outputPath;
    this.results = {
      url,
      timestamp: new Date().toISOString(),
      totalButtons: 0,
      totalActions: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
  }

  async run() {
    console.log(`\n🔍 Button Action Verifier - ${this.url}`);
    console.log(`📋 Cumpliendo regla Miranda: Verificar funcionalidad de cada botón/acción`);
    
    let browser;
    try {
      browser = await playwright.chromium.connect(WS_ENDPOINT);
      const page = await browser.newPage();
      await page.goto(this.url, { waitUntil: 'networkidle' });
      
      // 1. Identificar todos los botones/acciones
      const buttons = await this.collectButtons(page);
      const actions = await this.collectActions(page);
      
      this.results.totalButtons = buttons.length;
      this.results.totalActions = actions.length;
      
      console.log(`📊 Encontrados: ${buttons.length} botones, ${actions.length} acciones`);
      
      // 2. Verificar botones
      for (const button of buttons) {
        await this.testButton(page, button);
      }
      
      // 3. Verificar acciones
      for (const action of actions) {
        await this.testAction(page, action);
      }
      
      // 4. Generar resumen
      this.printSummary();
      
      // 5. Guardar reporte si se especificó
      if (this.outputPath) {
        this.saveReport();
      }
      
      await browser.close();
      return this.results;
      
    } catch (error) {
      console.error('❌ Error:', error);
      if (browser) await browser.close();
      throw error;
    }
  }

  async collectButtons(page) {
    // Seleccionar todos los elementos que pueden ser botones
    const buttonSelectors = [
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      'a.btn',
      'a.button',
      '[role="button"]',
      '[onclick]'
    ];
    
    const buttons = [];
    for (const selector of buttonSelectors) {
      const elements = await page.$$(selector);
      for (const element of elements) {
        const text = await element.textContent() || await element.getAttribute('value') || '';
        const id = await element.getAttribute('id') || '';
        const classes = await element.getAttribute('class') || '';
        const isVisible = await element.isVisible();
        
        if (isVisible && !this.isDuplicate(buttons, element, page)) {
          buttons.push({
            type: 'button',
            selector,
            text: text.trim().substring(0, 50),
            id,
            classes,
            element
          });
        }
      }
    }
    return buttons;
  }

  async collectActions(page) {
    // Acciones: forms, links con funcionalidad específica, elementos interactivos
    const actions = [];
    
    // Forms
    const forms = await page.$$('form');
    for (const form of forms) {
      const id = await form.getAttribute('id') || '';
      const action = await form.getAttribute('action') || '';
      if (await form.isVisible()) {
        actions.push({
          type: 'form',
          selector: 'form',
          description: `Formulario ${id || action ? `(${id || action})` : ''}`,
          element: form
        });
      }
    }
    
    // Links importantes (no solo navegación)
    const links = await page.$$('a[href]:not([href="#"])');
    for (const link of links) {
      const href = await link.getAttribute('href') || '';
      const text = await link.textContent() || '';
      // Identificar links que parecen acciones (no solo navegación)
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        if (await link.isVisible()) {
          actions.push({
            type: 'link',
            selector: 'a[href]',
            description: `Enlace: "${text.substring(0, 30)}" → ${href}`,
            element: link
          });
        }
      }
    }
    
    return actions;
  }

  async testButton(page, button) {
    const result = {
      type: button.type,
      selector: button.selector,
      text: button.text,
      id: button.id,
      status: 'SKIPPED',
      issues: []
    };
    
    try {
      // Verificar que existe en DOM
      const exists = await button.element.isVisible();
      if (!exists) {
        result.status = 'FAIL';
        result.issues.push('No visible en DOM');
        this.recordResult(result);
        return;
      }
      
      // Verificar que no está disabled
      const isDisabled = await button.element.isDisabled();
      if (isDisabled) {
        result.status = 'FAIL';
        result.issues.push('Botón deshabilitado');
        this.recordResult(result);
        return;
      }
      
      // Verificar que es clickeable
      const boundingBox = await button.element.boundingBox();
      if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
        result.status = 'FAIL';
        result.issues.push('Sin área clickeable');
        this.recordResult(result);
        return;
      }
      
      // Test de click básico (capturar posibles errores)
      const initialUrl = page.url();
      
      // Configurar handler para diálogos
      page.on('dialog', async dialog => {
        console.log(`  ⚠️  Diálogo detectado: ${dialog.type()} - ${dialog.message()}`);
        await dialog.dismiss();
      });
      
      // Hacer click
      await button.element.click({ timeout: 5000 }).catch(error => {
        result.issues.push(`Error al hacer click: ${error.message}`);
      });
      
      // Pequeña pausa para que ocurran efectos
      await page.waitForTimeout(1000);
      
      // Verificar cambios
      const newUrl = page.url();
      if (newUrl !== initialUrl) {
        result.issues.push(`Cambio de URL detectado: ${newUrl}`);
      }
      
      // Verificar que no hay errores JS en consola
      // (esto es básico, se puede expandir)
      
      // Si pasó todas las verificaciones básicas
      if (result.issues.length === 0) {
        result.status = 'PASS';
        this.results.passed++;
      } else {
        result.status = 'FAIL';
        this.results.failed++;
      }
      
    } catch (error) {
      result.status = 'ERROR';
      result.issues.push(`Excepción: ${error.message}`);
      this.results.failed++;
    }
    
    this.recordResult(result);
    
    // Volver a página original si cambió
    if (page.url() !== this.url) {
      await page.goto(this.url, { waitUntil: 'networkidle' });
    }
  }

  async testAction(page, action) {
    const result = {
      type: action.type,
      selector: action.selector,
      description: action.description,
      status: 'SKIPPED',
      issues: []
    };
    
    try {
      // Verificar que existe en DOM
      const exists = await action.element.isVisible();
      if (!exists) {
        result.status = 'FAIL';
        result.issues.push('No visible en DOM');
        this.recordResult(result);
        return;
      }
      
      // Dependiendo del tipo de acción, verificar diferente
      if (action.type === 'form') {
        // Verificar que el form tiene campos
        const inputs = await action.element.$$('input, textarea, select');
        if (inputs.length === 0) {
          result.issues.push('Formulario sin campos de entrada');
        }
        
        // Verificar que tiene método de envío
        const method = await action.element.getAttribute('method') || 'GET';
        result.issues.push(`Método: ${method}`);
        
      } else if (action.type === 'link') {
        // Verificar que el enlace no está roto (status HTTP)
        // Esto requeriría request separado, por ahora solo verificar href
        const href = await action.element.getAttribute('href');
        if (!href) {
          result.issues.push('Enlace sin href');
        }
      }
      
      if (result.issues.length === 0) {
        result.status = 'PASS';
        this.results.passed++;
      } else {
        result.status = 'FAIL';
        this.results.failed++;
      }
      
    } catch (error) {
      result.status = 'ERROR';
      result.issues.push(`Excepción: ${error.message}`);
      this.results.failed++;
    }
    
    this.recordResult(result);
  }

  isDuplicate(buttons, element, page) {
    // Implementación básica para evitar duplicados
    return false;
  }

  recordResult(result) {
    this.results.details.push(result);
    console.log(`  ${this.getStatusIcon(result.status)} ${result.type}: ${result.text || result.description}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`    ⚠️  ${issue}`));
    }
  }

  getStatusIcon(status) {
    const icons = {
      'PASS': '✅',
      'FAIL': '❌',
      'ERROR': '💥',
      'SKIPPED': '⏭️'
    };
    return icons[status] || '❓';
  }

  printSummary() {
    console.log('\n📋 RESUMEN DE VERIFICACIÓN');
    console.log('=' .repeat(50));
    console.log(`URL: ${this.url}`);
    console.log(`Total verificados: ${this.results.details.length}`);
    console.log(`✅ PASS: ${this.results.passed}`);
    console.log(`❌ FAIL: ${this.results.failed}`);
    console.log(`⏭️  SKIPPED: ${this.results.skipped}`);
    
    // Mostrar fallos críticos
    const failures = this.results.details.filter(d => d.status === 'FAIL' || d.status === 'ERROR');
    if (failures.length > 0) {
      console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
      failures.forEach(f => {
        console.log(`  ${f.type}: ${f.text || f.description}`);
        f.issues.forEach(issue => console.log(`    • ${issue}`));
      });
    }
  }

  saveReport() {
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.outputPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Reporte guardado en: ${this.outputPath}`);
  }
}

// Ejecución desde línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Uso: node button-action-verifier.js <url> [--output report.json]');
    process.exit(1);
  }
  
  const url = args[0];
  let outputPath = null;
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      outputPath = args[i + 1];
      break;
    }
  }
  
  const verifier = new ButtonActionVerifier(url, outputPath);
  verifier.run().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

module.exports = ButtonActionVerifier;