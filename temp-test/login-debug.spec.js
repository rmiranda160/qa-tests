const { test, expect } = require('@playwright/test');

test('login debug', async ({ page }) => {
  // 1. Navegar a la página de login
  await page.goto('https://dev1.cenarbe.com/login.php', { waitUntil: 'networkidle' });
  console.log('Página de login cargada');
  
  // Tomar screenshot de login
  await page.screenshot({ path: '/home/node/.openclaw/workspace-tester/temp-test/login-page.png', fullPage: true });
  
  // 2. Rellenar formulario
  await page.fill('input[name="email"]', 'test@cenarbe.com');
  await page.fill('input[name="password"]', 'Test123!');
  console.log('Credenciales insertadas');
  
  // 3. Enviar formulario
  await page.click('button[type="submit"]');
  console.log('Formulario enviado');
  
  // Esperar cualquier navegación
  await page.waitForLoadState('networkidle');
  console.log('Nueva página cargada');
  
  // Capturar screenshot después del login
  await page.screenshot({ path: '/home/node/.openclaw/workspace-tester/temp-test/post-login.png', fullPage: true });
  
  // Imprimir URL actual
  console.log('URL actual:', page.url());
  
  // Imprimir contenido de la página (primeros 500 caracteres)
  const content = await page.content();
  console.log('Primeros 500 chars:', content.substring(0, 500));
  
  // Buscar cualquier mensaje de error
  const errorMsg = await page.locator('.alert-danger, .error, .text-danger').first();
  if (await errorMsg.isVisible()) {
    console.log('Mensaje de error:', await errorMsg.textContent());
  } else {
    console.log('No se encontraron mensajes de error');
  }
  
  // Buscar cualquier elemento que indique éxito (bienvenida, etc.)
  const welcome = await page.locator('h1, h2, .welcome, .user-name').first();
  if (await welcome.isVisible()) {
    console.log('Posible elemento de bienvenida:', await welcome.textContent());
  }
});