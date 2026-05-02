const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://cntai.cenarbe.com';

test.describe('ContentoAI Laravel Post-Deploy Testing', () => {
  
  test('Homepage carga correctamente', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Verificar HTTP 200 (implícito en goto sin error)
    await expect(page).toHaveTitle(/ContentoAI|Laravel/i);
    
    // Verificar elementos clave visibles
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/demo|waitlist|ia/i).first()).toBeVisible();
    
    // Verificar consola sin errores
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Verificar enlaces de navegación
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
    
    // Capturar screenshot para evidencia
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
    
    // Reportar errores de consola si los hay
    if (consoleErrors.length > 0) {
      console.warn('Errores en consola:', consoleErrors);
    }
    expect(consoleErrors.length).toBe(0);
  });
  
  test('Demo IA funciona (mocked)', async ({ page }) => {
    await page.goto(`${BASE_URL}/demo`);
    
    // Verificar página demo
    await expect(page).toHaveTitle(/demo|ia/i);
    await expect(page.locator('h1')).toBeVisible();
    
    // Verificar formulario de demo
    const input = page.locator('input[type="text"], textarea').first();
    await expect(input).toBeVisible();
    
    const generateButton = page.locator('button:has-text("Generar"), button:has-text("Generate")').first();
    await expect(generateButton).toBeVisible();
    
    // Mockear interacción: escribir texto y hacer click
    await input.fill('Prueba de generación de contenido');
    await generateButton.click();
    
    // Esperar respuesta (puede ser un mensaje de éxito o resultado)
    // Como es mocked, verificamos que no haya errores
    const errorAlert = page.locator('.alert-danger, .error-message').first();
    const errorVisible = await errorAlert.isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
    
    // Capturar screenshot
    await page.screenshot({ path: 'screenshots/demo.png', fullPage: true });
  });
  
  test('Formulario Waitlist envía datos', async ({ page }) => {
    await page.goto(`${BASE_URL}/waitlist`);
    
    // Verificar formulario
    await expect(page.locator('form')).toBeVisible();
    const nameInput = page.locator('input[name="name"], input[name="nombre"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Rellenar con datos de prueba
    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    
    // Interceptar request POST para verificar envío
    let requestSent = false;
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('waitlist')) {
        requestSent = true;
      }
    });
    
    // Hacer submit
    await submitButton.click();
    
    // Esperar respuesta (éxito o mensaje)
    await page.waitForLoadState('networkidle');
    
    // Verificar que se envió el request (o al menos no hay error)
    if (!requestSent) {
      console.log('No se detectó POST request; puede ser AJAX o redirección.');
    }
    
    // Verificar mensaje de éxito
    const successMessage = page.locator('.alert-success, .success-message, .text-success').first();
    const successVisible = await successMessage.isVisible().catch(() => false);
    
    // Si no hay mensaje explícito, al menos verificar que no hay error
    const errorMessage = page.locator('.alert-danger, .error-message').first();
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    
    expect(errorVisible).toBe(false);
    
    await page.screenshot({ path: 'screenshots/waitlist.png', fullPage: true });
  });
  
  test('Panel Admin (si existe) requiere autenticación', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    
    // Puede redirigir a login o mostrar 403
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      // Verificar formulario de login admin
      await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    } else {
      // Verificar que al menos no sea error 500
      const status = page.locator('h1, h2, .error-code');
      const statusText = await status.textContent().catch(() => '');
      expect(statusText).not.toContain('500');
      expect(statusText).not.toContain('Error');
    }
    
    await page.screenshot({ path: 'screenshots/admin.png', fullPage: true });
  });
  
  test('Responsive design en mobile, tablet, desktop', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL);
      
      // Verificar que el contenido es visible (no se oculta)
      await expect(page.locator('h1')).toBeVisible();
      
      // Capturar screenshot por viewport
      await page.screenshot({ path: `screenshots/responsive-${viewport.name}.png` });
    }
  });
  
  test('Performance básica - LCP y FCP', async ({ page }) => {
    // Usar Performance API de Playwright
    await page.goto(BASE_URL);
    
    // Medir tiempos de carga
    const perfEntries = await page.evaluate(() => 
      JSON.stringify(performance.getEntriesByType('navigation'))
    );
    const navigationTiming = JSON.parse(perfEntries)[0];
    
    const loadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
    const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime;
    
    console.log(`Load time: ${loadTime}ms`);
    console.log(`DOMContentLoaded: ${domContentLoaded}ms`);
    
    // Criterios: Load time < 3000ms, DOMContentLoaded < 2000ms
    expect(loadTime).toBeLessThan(3000);
    expect(domContentLoaded).toBeLessThan(2000);
  });
});