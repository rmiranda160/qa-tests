const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const baseUrl = 'https://dev1.cenarbe.com';
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test';
  const testSurname = 'User';
  const testPhone = '123456789';

  try {
    console.log('Testing login with auto registration');
    console.log(`Test email: ${testEmail}`);

    // 1. Go to registration page
    await page.goto(`${baseUrl}/register.php`, { waitUntil: 'networkidle' });
    console.log('Loaded register page');

    // Fill registration form
    await page.fill('input[name="nombre"]', testName);
    await page.fill('input[name="apellidos"]', testSurname);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="telefono"]', testPhone);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirm_password"]', testPassword);

    // Submit registration
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    console.log('Registration submitted');

    // Check for errors
    const errorAlert = await page.$('.alert-danger');
    if (errorAlert) {
      const errorText = await errorAlert.textContent();
      console.log(`Registration error: ${errorText}`);
    } else {
      console.log('Registration likely successful');
    }

    // 2. Now login with the new credentials
    await page.goto(`${baseUrl}/login.php`, { waitUntil: 'networkidle' });
    console.log('Loaded login page');

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    console.log('Login submitted');

    // Check for login success (look for logout link or welcome message)
    const logoutLink = await page.$('a[href*="logout"]');
    const welcomeText = await page.textContent('body');
    const success = logoutLink || welcomeText.includes('Bienvenido') || welcomeText.includes('Mi cuenta');

    if (success) {
      console.log('Login successful!');
      // Take screenshot
      const screenshotPath = '/home/node/.openclaw/workspace-coordinator/login_success.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to ${screenshotPath}`);
      // Also save a copy in current workspace
      await page.screenshot({ path: './login_success.png', fullPage: true });
      console.log('Screenshot also saved locally');
    } else {
      console.log('Login may have failed');
      // Take screenshot anyway for debugging
      const debugPath = '/home/node/.openclaw/workspace-coordinator/login_debug.png';
      await page.screenshot({ path: debugPath, fullPage: true });
      console.log(`Debug screenshot saved to ${debugPath}`);
    }
  } catch (error) {
    console.error('Error during test:', error);
    // Capture screenshot on error
    try {
      await page.screenshot({ path: '/home/node/.openclaw/workspace-coordinator/login_error.png', fullPage: true });
    } catch (e) {}
  } finally {
    await browser.close();
  }
})();