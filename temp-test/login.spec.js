const { test, expect } = require('@playwright/test');

test('login con credenciales de prueba', async ({ page }) => {
  // 1. Navegar a la página de login
  await page.goto('https://dev1.cenarbe.com/login.php', { waitUntil: 'networkidle' });
  
  // 2. Rellenar formulario
  await page.fill('input[name="email"]', 'test@cenarbe.com');
  await page.fill('input[name="password"]', 'Test123!');
  
  // 3. Enviar formulario
  await page.click('button[type="submit"]');
  
  // 4. Verificar redirección (esperar a que la URL cambie)
  await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {
    // Si no redirige a dashboard, verificar que haya algún elemento de sesión activa
  });
  
  // 5. Verificar sesión activa (elementos de usuario logueado)
  const userMenu = page.locator('.user-menu, .dropdown-toggle, .navbar-user, [data-testid="user-menu"]');
  await expect(userMenu.first()).toBeVisible({ timeout: 5000 });
  
  // 6. Capturar pantallazo
  const screenshotPath = `/home/node/.openclaw/workspace-tester/temp-test/login-success-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  console.log(`Screenshot guardado en: ${screenshotPath}`);
  console.log('Login exitoso. Sesión activa verificada.');
});