/**
 * Script de ejemplo para verificación de botones/acciones según nueva regla obligatoria.
 * Este módulo exporta funciones que pueden ser usadas en tests de Playwright para verificar
 * sistemáticamente cada botón/acción en una página.
 */

const { expect } = require('@playwright/test');

/**
 * Verifica un botón/acción específico en la página
 * @param {Page} page - Objeto page de Playwright
 * @param {Object} config - Configuración del botón/acción
 * @param {string} config.selector - Selector CSS/XPath del elemento
 * @param {string} config.name - Nombre descriptivo del botón/acción
 * @param {string} config.expectedAction - Descripción de la acción esperada
 * @param {Function} config.verificationFn - Función que ejecuta la verificación específica
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function verifyButtonAction(page, config) {
  const result = {
    name: config.name,
    selector: config.selector,
    timestamp: new Date().toISOString(),
    checks: {},
    passed: false,
    evidence: {}
  };

  try {
    // 1. Verificar presencia del elemento
    const element = page.locator(config.selector);
    result.checks.presence = await element.isVisible();
    if (!result.checks.presence) {
      throw new Error(`Elemento no visible: ${config.selector}`);
    }

    // 2. Verificar que el elemento es interactivo (no disabled)
    result.checks.interactive = await element.isEnabled();
    if (!result.checks.interactive) {
      throw new Error(`Elemento no interactivo (disabled): ${config.selector}`);
    }

    // 3. Ejecutar acción (click por defecto, pero puede ser hover, type, etc.)
    console.log(`Verificando botón: ${config.name}`);
    
    // Capturar screenshot antes (opcional)
    // result.evidence.screenshotBefore = await page.screenshot({ fullPage: false });

    // Ejecutar la acción específica si se proporciona
    if (config.actionFn) {
      await config.actionFn(page, element);
    } else {
      // Acción por defecto: click
      await element.click();
    }

    // 4. Ejecutar función de verificación personalizada
    if (config.verificationFn) {
      const verificationResult = await config.verificationFn(page, element);
      result.checks.verification = verificationResult;
    } else {
      // Verificación por defecto: esperar que algo cambie (timeout corto)
      // Esto es un placeholder - deberías definir verificaciones específicas
      await page.waitForTimeout(500);
      result.checks.verification = { default: true };
    }

    // 5. Verificar coherencia UI (si se proporciona)
    if (config.coherenceCheck) {
      result.checks.coherence = await config.coherenceCheck(page);
    }

    // Capturar screenshot después
    // result.evidence.screenshotAfter = await page.screenshot({ fullPage: false });

    // 6. Determinar si pasó todas las verificaciones
    const allChecksPassed = Object.values(result.checks).every(check => {
      if (typeof check === 'object') return true; // objeto de verificación complejo
      return check === true;
    });
    
    result.passed = allChecksPassed;
    
    if (result.passed) {
      console.log(`✅ ${config.name}: PASS`);
    } else {
      console.log(`❌ ${config.name}: FAIL`);
    }

  } catch (error) {
    result.error = error.message;
    result.passed = false;
    console.log(`❌ ${config.name}: ERROR - ${error.message}`);
  }

  return result;
}

/**
 * Verificación específica para botones de navegación
 * @param {Page} page - Objeto page
 * @param {string} selector - Selector del botón
 * @param {RegExp|string} expectedUrlPattern - Patrón de URL esperado después del click
 * @param {string} buttonName - Nombre del botón (opcional)
 */
async function verifyNavigationButton(page, selector, expectedUrlPattern, buttonName = selector) {
  return verifyButtonAction(page, {
    selector,
    name: buttonName,
    expectedAction: `Navegar a página que coincida con ${expectedUrlPattern}`,
    async verificationFn(page) {
      if (typeof expectedUrlPattern === 'string') {
        await expect(page).toHaveURL(expectedUrlPattern);
      } else {
        await expect(page).toHaveURL(expectedUrlPattern);
      }
      return true;
    }
  });
}

/**
 * Verificación específica para botones que muestran/ocultan elementos
 * @param {Page} page - Objeto page
 * @param {string} buttonSelector - Selector del botón
 * @param {string} targetSelector - Selector del elemento que debe hacerse visible/oculto
 * @param {boolean} shouldBeVisible - Si el target debe mostrarse (true) u ocultarse (false)
 */
async function verifyToggleButton(page, buttonSelector, targetSelector, shouldBeVisible = true, buttonName = buttonSelector) {
  return verifyButtonAction(page, {
    selector: buttonSelector,
    name: buttonName,
    expectedAction: `${shouldBeVisible ? 'Mostrar' : 'Ocultar'} elemento ${targetSelector}`,
    async verificationFn(page) {
      const target = page.locator(targetSelector);
      if (shouldBeVisible) {
        await expect(target).toBeVisible();
      } else {
        await expect(target).toBeHidden();
      }
      return true;
    }
  });
}

/**
 * Verificación específica para formularios
 * @param {Page} page - Objeto page
 * @param {string} submitSelector - Selector del botón submit
 * @param {string} successSelector - Selector que indica éxito (mensaje, redirección, etc.)
 */
async function verifyFormSubmit(page, submitSelector, successSelector, buttonName = submitSelector) {
  return verifyButtonAction(page, {
    selector: submitSelector,
    name: buttonName,
    expectedAction: `Enviar formulario y mostrar ${successSelector}`,
    async verificationFn(page) {
      // Esperar que aparezca el indicador de éxito
      const successElement = page.locator(successSelector);
      await expect(successElement).toBeVisible();
      return true;
    }
  });
}

/**
 * Verificación específica para botones de copiar al portapapeles
 * @param {Page} page - Objeto page
 * @param {string} buttonSelector - Selector del botón copiar
 * @param {string} textToCopySelector - Selector del texto que debe copiarse
 */
async function verifyCopyButton(page, buttonSelector, textToCopySelector, buttonName = buttonSelector) {
  return verifyButtonAction(page, {
    selector: buttonSelector,
    name: buttonName,
    expectedAction: `Copiar texto al portapapeles`,
    async actionFn(page, element) {
      // Hacer click en el botón copiar
      await element.click();
    },
    async verificationFn(page) {
      // Verificar clipboard usando API de Playwright (solo en Chrome)
      // Nota: requiere permisos de clipboard
      try {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        const expectedText = await page.locator(textToCopySelector).textContent();
        return clipboardText.includes(expectedText.trim());
      } catch (error) {
        // Fallback: verificar que el botón muestra feedback (ej: "Copiado!")
        const feedback = await page.locator('.copy-feedback').isVisible();
        return feedback;
      }
    }
  });
}

/**
 * Ejecuta verificación de múltiples botones/acciones y genera reporte
 * @param {Page} page - Objeto page
 * @param {Array<Object>} buttonConfigs - Array de configuraciones de botones
 * @returns {Promise<Object>} Reporte consolidado
 */
async function verifyMultipleButtons(page, buttonConfigs) {
  const report = {
    timestamp: new Date().toISOString(),
    total: buttonConfigs.length,
    passed: 0,
    failed: 0,
    results: []
  };

  for (const config of buttonConfigs) {
    const result = await verifyButtonAction(page, config);
    report.results.push(result);
    if (result.passed) {
      report.passed++;
    } else {
      report.failed++;
    }
  }

  console.log(`\n=== REPORTE DE VERIFICACIÓN DE BOTONES ===`);
  console.log(`Total: ${report.total} | PASS: ${report.passed} | FAIL: ${report.failed}`);
  
  if (report.failed > 0) {
    console.log(`\nBotones con fallos:`);
    report.results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}: ${r.error || 'Verificación fallida'}`);
    });
  }

  return report;
}

// Ejemplos de uso (comentados)
/*
// Ejemplo 1: Verificar botón de login
const loginButtonConfig = {
  selector: 'button[type="submit"]',
  name: 'Botón de Login',
  expectedAction: 'Iniciar sesión y redirigir a dashboard',
  async verificationFn(page) {
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.welcome-message')).toBeVisible();
    return true;
  }
};

// Ejemplo 2: Verificar botón "Mis Reservas" en Cenarbe
const misReservasConfig = {
  selector: 'a[href*="reservas.php"]',
  name: 'Botón Mis Reservas',
  expectedAction: 'Mostrar lista de reservas del usuario',
  async verificationFn(page) {
    await expect(page).toHaveURL(/reservas\.php/);
    await expect(page.locator('.reserva-item')).toBeVisible({ timeout: 5000 });
    return true;
  }
};

// Uso en un test:
test('Verificar botones principales', async ({ page }) => {
  await page.goto('https://dev1.cenarbe.com');
  
  const report = await verifyMultipleButtons(page, [
    loginButtonConfig,
    misReservasConfig
    // ... más configuraciones
  ]);
  
  expect(report.failed).toBe(0);
});
*/

module.exports = {
  verifyButtonAction,
  verifyNavigationButton,
  verifyToggleButton,
  verifyFormSubmit,
  verifyCopyButton,
  verifyMultipleButtons
};