#!/usr/bin/env node
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const RESULTS_DIR = path.join(__dirname, 'coherence-results');
const SCREENSHOTS_DIR = path.join(__dirname, 'coherence-screenshots');
const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT || 'ws://51.254.244.216:3000/';

// Ensure directories
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Coherence tests per application
const coherenceTests = {
  'Cenarbe Bike Rental': {
    url: 'https://dev1.cenarbe.com/',
    selectors: [
      'a[href*="reservas"]', // Reservas link
      'button, input[type="submit"]', // Some interactive element
      '.card', // Bootstrap card
      'nav' // Navigation
    ],
    loginRequired: false
  },
  'Calendario Cenarbe': {
    url: 'https://dev1.cenarbe.com/calendario/',
    selectors: [
      '#calendar', // calendar element (ID)
      'table', // likely calendar table
      'a[href*="bicicletas"]'
    ],
    loginRequired: true
  },
  'ContentoAI': {
    url: 'https://cntai.cenarbe.com/',
    selectors: [
      'body',                      // Body siempre presente
      'h1',                        // Título principal
      'a[href="/"]',               // Enlace a home
      'a[href*="demo"]',           // Enlace a demo IA
      'a[href*="waitlist"]',       // Enlace a waitlist
      'form',                      // Formularios
      'button',                    // Botones interactivos
      'input[type="text"]',        // Campos de texto
      'input[type="email"]'        // Campos de email
    ],
    loginRequired: false
  },
  'Dashboard': {
    url: 'https://dashboard.cenarbe.com/',
    selectors: [
      '.card', // dashboard cards
      'table', // history table
      'h1' // header
    ],
    loginRequired: false
  },
  'Villa Zocotin': {
    url: 'https://villazocotin.cenarbe.com/',
    selectors: [
      'header',
      'nav',
      'footer',
      'form',                     // formulario de reserva
      '.calendar',                // calendario (si existe)
      'input[type="submit"]'      // botón de enviar
    ],
    loginRequired: false
  }
};

async function performLogin(page) {
  try {
    console.log('   🔐 Attempting login...');
    await page.goto('https://dev1.cenarbe.com/login.php', { waitUntil: 'networkidle', timeout: 15000 });
    
    const emailField = await page.$('input[name="email"], input[type="email"]');
    const passwordField = await page.$('input[name="password"], input[type="password"]');
    const submitButton = await page.$('button[type="submit"], input[type="submit"]');
    
    if (!emailField || !passwordField || !submitButton) {
      throw new Error('Login form fields not found');
    }
    
    await emailField.fill(process.env.TEST_EMAIL || 'test@cenarbe.com');
    await passwordField.fill(process.env.TEST_PASSWORD || 'Test123!');
    await submitButton.click();
    
    // Wait for navigation or some indication of success
    await page.waitForTimeout(3000);
    
    // Check if login succeeded by looking for logout link or user menu
    const logoutLink = await page.$('a[href*="logout"], :text("Logout"), :text("Salir")');
    if (logoutLink) {
      console.log('   ✅ Login successful');
      return true;
    } else {
      // Maybe we're still on login page with error
      const errorAlert = await page.$('.alert-danger, .error');
      if (errorAlert) {
        throw new Error('Login failed - credentials rejected');
      }
      // Assume login succeeded (maybe no logout link visible)
      console.log('   ✅ Login likely successful (no logout link detected)');
      return true;
    }
  } catch (error) {
    console.error('   ❌ Login failed:', error.message);
    return false;
  }
}

async function runCoherenceTest(appName, testDef) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const browser = await playwright.chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();
  const result = {
    app: appName,
    url: testDef.url,
    timestamp: new Date().toISOString(),
    passed: false,
    errors: [],
    screenshots: []
  };

  try {
    console.log(`🔍 Testing coherence for ${appName} (${testDef.url})`);
    if (testDef.loginRequired) {
      const loginSuccess = await performLogin(page);
      if (!loginSuccess) {
        result.errors.push('Login failed');
        return result;
      }
    }
    await page.goto(testDef.url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${appName.replace(/\s+/g, '-')}-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);
    
    // Check selectors
    for (const selector of testDef.selectors) {
      const elements = await page.$$(selector);
      if (elements.length === 0) {
        result.errors.push(`Selector not found: ${selector}`);
      } else {
        console.log(`   ✅ Found ${elements.length} element(s) for "${selector}"`);
      }
    }
    
    // Additional sanity checks
    const title = await page.title();
    if (!title || title.trim().length === 0) {
      result.errors.push('Page title is empty');
    }
    
    const bodyText = await page.textContent('body');
    if (!bodyText || bodyText.trim().length < 10) {
      result.errors.push('Body content too short');
    }
    
    // Determine pass/fail
    if (result.errors.length === 0) {
      result.passed = true;
      console.log(`   ✅ All coherence checks passed for ${appName}`);
    } else {
      console.log(`   ❌ Coherence failures for ${appName}:`, result.errors);
    }
    
  } catch (error) {
    result.errors.push(`Page load error: ${error.message}`);
    console.error(`   💥 Error loading ${appName}:`, error.message);
  } finally {
    await browser.close();
  }
  
  return result;
}

async function main() {
  console.log('🚀 Starting extended coherence cycle for all applications');
  // Use the same config but filter to ensure we have all apps
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const apps = config.applications;
  // Ensure Villa Zocotin is included
  const allApps = apps.slice();
  if (!apps.find(a => a.name === 'Villa Zocotin')) {
    allApps.push({ name: 'Villa Zocotin', url: 'https://villazocotin.cenarbe.com/' });
  }
  
  const results = [];
  let criticalErrors = false;
  
  for (const app of allApps) {
    const testDef = coherenceTests[app.name];
    if (!testDef) {
      console.warn(`No coherence test definition for ${app.name}, skipping`);
      continue;
    }
    const result = await runCoherenceTest(app.name, testDef);
    results.push(result);
    if (!result.passed) {
      // Determine if critical: page load error or missing essential selectors
      const isCritical = result.errors.some(e => e.includes('Page load error') || e.includes('Body content too short'));
      if (isCritical) {
        criticalErrors = true;
      }
    }
  }
  
  // Save results
  const cycleId = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(RESULTS_DIR, `coherence-cycle-extended-${cycleId}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify({ cycleId, results }, null, 2));
  console.log(`\n📊 Coherence results saved to ${resultsFile}`);
  
  // Generate summary
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`\n📈 SUMMARY: ${passed}/${total} applications passed coherence, ${failed} failed.`);
  
  // If critical errors, prepare alert
  if (criticalErrors) {
    console.log('🚨 CRITICAL ERRORS DETECTED - Alerting coordinator');
    const alert = {
      type: 'coherence_critical',
      timestamp: new Date().toISOString(),
      message: 'Critical coherence failures detected in one or more applications',
      results: results.filter(r => !r.passed && r.errors.some(e => e.includes('Page load error') || e.includes('Body content too short'))).map(r => ({
        app: r.app,
        url: r.url,
        errors: r.errors
      }))
    };
    const alertFile = path.join(RESULTS_DIR, `coherence-alert-extended-${cycleId}.json`);
    fs.writeFileSync(alertFile, JSON.stringify(alert, null, 2));
    
    // Send to coordinator via sessions_send (could be done by parent)
    console.log(`📤 Alert saved to ${alertFile}`);
  }
  
  // Exit code
  process.exit(criticalErrors ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error in coherence cycle:', error);
    process.exit(1);
  });
}

module.exports = { runCoherenceTest };