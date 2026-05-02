const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const applications = config.applications;

const results = [];
let criticalErrors = false;

function runWebTest(appName, url, mode) {
  console.log(`🚀 Running ${mode} test for ${appName} (${url})`);
  const start = Date.now();
  try {
    // Use compat.js directly
    const stdout = execSync(`node ${path.join(__dirname, 'playwright-tester/compat.js')} "${url}" "${mode}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname,
      env: { ...process.env, RESULTS_DIR: path.join(__dirname, 'playwright-tester/results') }
    });
    const result = JSON.parse(stdout);
    const elapsed = Date.now() - start;
    console.log(`   ${result.ok ? '✅' : '❌'} ${mode} test ${result.ok ? 'passed' : 'failed'} in ${elapsed}ms`);
    return result;
  } catch (error) {
    const elapsed = Date.now() - start;
    console.error(`   💥 Error running ${mode} test: ${error.message}`);
    return { ok: false, error: error.message, stdout: '', stderr: error.stderr ? error.stderr.toString() : '' };
  }
}

for (const app of applications) {
  console.log(`\n📱 Application: ${app.name}`);
  const appResults = { app: app.name, url: app.url, modes: {} };
  for (const mode of app.modes) {
    const result = runWebTest(app.name, app.url, mode);
    appResults.modes[mode] = result;
    if (!result.ok) {
      // Determine criticality: smoke failures are critical
      if (mode === 'smoke') {
        criticalErrors = true;
      }
      // Also consider API failures critical for Calendario
      if (mode === 'api' && app.name.includes('Calendario')) {
        criticalErrors = true;
      }
    }
  }
  results.push(appResults);
}

// Save summary
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const summaryFile = path.join(__dirname, 'results', `test-cycle-${timestamp}.json`);
fs.writeFileSync(summaryFile, JSON.stringify({ timestamp, results, criticalErrors }, null, 2));
console.log(`\n📊 Test cycle summary saved to ${summaryFile}`);

// Exit with appropriate code
if (criticalErrors) {
  console.log('🚨 CRITICAL ERRORS DETECTED - Alerting coordinator');
  // Prepare alert data
  const alert = {
    type: 'web_test_critical',
    timestamp: new Date().toISOString(),
    message: 'Critical web test failures detected',
    results: results.filter(r => Object.values(r.modes).some(m => !m.ok)).map(r => ({
      app: r.app,
      url: r.url,
      failedModes: Object.entries(r.modes).filter(([mode, result]) => !result.ok).map(([mode]) => mode)
    }))
  };
  const alertFile = path.join(__dirname, 'results', `alert-${timestamp}.json`);
  fs.writeFileSync(alertFile, JSON.stringify(alert, null, 2));
  console.log(`📤 Alert saved to ${alertFile}`);
  // In a real scenario, we would send to coordinator via sessions_send
  process.exit(1);
} else {
  console.log('✅ All tests passed or only non-critical failures');
  process.exit(0);
}