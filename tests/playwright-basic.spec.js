const { test, expect } = require('@playwright/test');
const { verifyMultipleButtons, verifyNavigationButton } = require('./button-action-verification');

const BASE_URL = process.env.BASE_URL || 'https://dev1.cenarbe.com';

test('Cenarbe homepage loads', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Cenarbe/);
});

test('Cenarbe login page accessible', async ({ page }) => {
  await page.goto(`${BASE_URL}/login.php`);
  await expect(page).toHaveTitle(/Iniciar Sesión/);
  // Check for login form
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test('Cenarbe register page accessible', async ({ page }) => {
  await page.goto(`${BASE_URL}/register.php`);
  await expect(page).toHaveTitle(/Registrarse/);
  await expect(page.locator('input[name="nombre"]')).toBeVisible();
});

test('Verificar botones principales en homepage', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Configuración de botones a verificar
  const buttonConfigs = [
    {
      selector: 'a[href*="login.php"]',
      name: 'Botón Login',
      expectedAction: 'Navegar a página de login',
      async verificationFn(page) {
        // Verificar que estamos en login.php
        await expect(page).toHaveURL(/login\.php/);
        await expect(page.locator('input[name="email"]')).toBeVisible();
        return true;
      }
    },
    {
      selector: 'a[href*="register.php"]',
      name: 'Botón Registro',
      expectedAction: 'Navegar a página de registro',
      async verificationFn(page) {
        await expect(page).toHaveURL(/register\.php/);
        await expect(page.locator('input[name="nombre"]')).toBeVisible();
        return true;
      }
    },
    {
      selector: 'a[href*="bicicletas.php"]',
      name: 'Botón Bicicletas',
      expectedAction: 'Navegar a listado de bicicletas',
      async verificationFn(page) {
        await expect(page).toHaveURL(/bicicletas\.php/);
        // Verificar que hay al menos una bicicleta listada
        const bikeItems = page.locator('.bicicleta-item, .producto, table tbody tr');
        await expect(bikeItems.first()).toBeVisible({ timeout: 5000 });
        return true;
      }
    }
  ];

  // Verificar cada botón (hacemos click y luego volvemos atrás para no perder contexto)
  for (const config of buttonConfigs) {
    // Hacer click en el botón
    await page.locator(config.selector).first().click();
    
    // Ejecutar verificación
    const result = await config.verificationFn(page);
    expect(result).toBe(true);
    
    // Volver a homepage para siguiente verificación
    await page.goBack();
    await page.waitForURL(BASE_URL);
  }
});

test('Verificar funcionalidad de formulario login', async ({ page }) => {
  await page.goto(`${BASE_URL}/login.php`);
  
  // Verificar que el botón submit funciona (con credenciales inválidas)
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'wrongpassword');
  
  const submitButtonConfig = {
    selector: 'button[type="submit"]',
    name: 'Botón Submit Login',
    expectedAction: 'Mostrar mensaje de error con credenciales inválidas',
    async verificationFn(page) {
      // Esperar mensaje de error (debería aparecer)
      const errorAlert = page.locator('.alert-danger, .error-message, .text-danger');
      await expect(errorAlert).toBeVisible({ timeout: 5000 });
      return true;
    }
  };
  
  await page.locator(submitButtonConfig.selector).click();
  const result = await submitButtonConfig.verificationFn(page);
  expect(result).toBe(true);
});