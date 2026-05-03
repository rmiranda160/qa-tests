#!/usr/bin/env node

/**
 * Test específico para demostrar aplicación Regla Miranda
 * Verifica botones críticos en Cenarbe Bike Rental
 */

const playwright = require('playwright');

const WS_ENDPOINT = 'ws://51.254.244.216:3000/';

// Botones críticos a verificar según regla Miranda
const CRITICAL_BUTTONS = [
  { name: 'Botón "Login"', selector: 'a.btn:has-text("Login")' },
  { name: 'Botón "Registro"', selector: 'a.btn:has-text("Registro")' },
  { name: 'Botón "Buscar Disponibilidad"', selector: 'button:has-text("Buscar Disponibilidad")' },
  { name: 'Botón "Ver Bicicletas"', selector: 'a:has-text("Ver Bicicletas")' },
  { name: 'Botón "Explorar Rutas"', selector: 'a:has-text("Explorar Rutas")' },
  { name: 'Botón "Reservar" (primero)', selector: 'a.btn-success:has-text("Reservar"):nth(0)' },
  { name: 'Botón "Detalles" (primero)', selector: 'a.btn-outline-primary:has-text("Detalles"):nth(0)' },
  { name: 'Botón "Carrito"', selector: 'a[href="/carrito.php"]' },
];

async function testButton(page, button) {
  console.log(`\n🔍 Testing: ${button.name}`);
  console.log(`   Selector: ${button.selector}`);
  
  const result = {
    name: button.name,
    selector: button.selector,
    exists: false,
    visible: false,
    clickable: false,
    functional: false,
    issues: [],
    urlAfterClick: null
  };
  
  try {
    // 1. Verificar que existe en DOM
    const element = await page.$(button.selector);
    if (!element) {
      result.issues.push('No encontrado en DOM');
      return result;
    }
    result.exists = true;
    
    // 2. Verificar que es visible
    const isVisible = await element.isVisible();
    if (!isVisible) {
      result.issues.push('No visible (puede estar oculto por CSS)');
      // Continuamos de todos modos
    }
    result.visible = isVisible;
    
    // 3. Verificar que no está disabled
    const isDisabled = await element.isDisabled();
    if (isDisabled) {
      result.issues.push('Está deshabilitado (disabled attribute)');
    } else {
      result.clickable = true;
    }
    
    // 4. Verificar área clickeable
    const boundingBox = await element.boundingBox();
    if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
      result.clickable = true;
    } else {
      result.issues.push('Sin área clickeable (width/height = 0)');
    }
    
    // 5. Hacer click y verificar funcionalidad
    const initialUrl = page.url();
    const initialTitle = await page.title();
    
    try {
      await element.click({ timeout: 5000 });
      await page.waitForTimeout(2000); // Esperar efectos
      
      result.urlAfterClick = page.url();
      const newTitle = await page.title();
      
      // Verificar si algo cambió
      if (result.urlAfterClick !== initialUrl) {
        console.log(`   ✅ Cambio de URL: ${initialUrl} → ${result.urlAfterClick}`);
        result.functional = true;
        result.issues.push(`Redirige a: ${result.urlAfterClick}`);
      } else if (newTitle !== initialTitle) {
        console.log(`   ✅ Cambio de título: ${initialTitle} → ${newTitle}`);
        result.functional = true;
        result.issues.push(`Actualiza contenido (título cambiado)`);
      } else {
        result.issues.push('Click no produjo cambio detectable (¿modal? ¿SPA?)');
      }
      
    } catch (clickError) {
      result.issues.push(`Error al hacer click: ${clickError.message}`);
    }
    
    // 6. Volver a página original si cambió
    if (result.urlAfterClick && result.urlAfterClick !== initialUrl) {
      await page.goto(initialUrl, { waitUntil: 'networkidle' });
    }
    
  } catch (error) {
    result.issues.push(`Error general: ${error.message}`);
  }
  
  return result;
}

async function main() {
  console.log('🧪 TEST REGLA MIRANDA - Verificación Botones/Acciones');
  console.log('=' .repeat(60));
  console.log('📋 Regla: "Siempre que haya un botón o acción en el código,');
  console.log('          se debe comprobar si se encuentra desarrollada la funcionalidad."');
  console.log('=' .repeat(60));
  
  let browser;
  try {
    browser = await playwright.chromium.connect(WS_ENDPOINT);
    const page = await browser.newPage();
    
    console.log(`\n🌐 Navegando a: https://dev1.cenarbe.com/`);
    await page.goto('https://dev1.cenarbe.com/', { waitUntil: 'networkidle' });
    
    const results = [];
    
    for (const button of CRITICAL_BUTTONS) {
      const result = await testButton(page, button);
      results.push(result);
      
      // Resumen rápido
      const status = result.functional ? '✅ FUNCIONAL' : 
                    result.exists ? '⚠️  PROBLEMA' : '❌ NO EXISTE';
      console.log(`   ${status}: ${button.name}`);
      if (result.issues.length > 0 && !result.functional) {
        result.issues.forEach(issue => console.log(`      • ${issue}`));
      }
    }
    
    // Resumen final
    console.log('\n📊 RESUMEN EJECUTIVO:');
    console.log('=' .repeat(60));
    
    const total = results.length;
    const functional = results.filter(r => r.functional).length;
    const exists = results.filter(r => r.exists).length;
    const visible = results.filter(r => r.visible).length;
    const clickable = results.filter(r => r.clickable).length;
    
    console.log(`Total botones verificados: ${total}`);
    console.log(`✅ Con funcionalidad desarrollada: ${functional}/${total}`);
    console.log(`📌 Existen en DOM: ${exists}/${total}`);
    console.log(`👁️  Visibles: ${visible}/${total}`);
    console.log(`🖱️  Clickeables: ${clickable}/${total}`);
    
    // Botones con problemas
    const problemButtons = results.filter(r => !r.functional && r.exists);
    if (problemButtons.length > 0) {
      console.log('\n🚨 BOTONES CON PROBLEMAS (requieren atención):');
      problemButtons.forEach(b => {
        console.log(`   • ${b.name}`);
        b.issues.forEach(issue => console.log(`     - ${issue}`));
      });
    }
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES (Regla Miranda):');
    console.log('1. Para cada botón/acción nuevo, verificar funcionalidad inmediatamente');
    console.log('2. Documentar PASS/FAIL con evidencia (screenshots, logs)');
    console.log('3. Reportar incoherencias al equipo de desarrollo');
    console.log('4. Integrar esta verificación en testing continuo');
    
    await browser.close();
    
    // Guardar reporte
    const report = {
      timestamp: new Date().toISOString(),
      url: 'https://dev1.cenarbe.com/',
      rule: 'Miranda Button/Action Verification',
      results
    };
    
    const fs = require('fs');
    fs.writeFileSync('miranda-rule-report.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 Reporte detallado guardado en: miranda-rule-report.json`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();