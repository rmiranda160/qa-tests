# Testing Setup for Cenarbe

This project includes automated testing tools for the Cenarbe platform:
- **Playwright** for end-to-end (E2E) testing
- **Lighthouse** for performance, accessibility, SEO, and best practices audits

## Installation

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers (optional, if using system Chromium):
   ```bash
   npx playwright install
   ```

3. System dependencies (Linux):
   - Chromium browser (`apt-get install chromium`)
   - Libraries required by Playwright (see [Playwright docs](https://playwright.dev/docs/library#linux))

   On Debian/Ubuntu, you can run:
   ```bash
   sudo apt-get update
   sudo apt-get install -y chromium
   ```

## Configuration

### Environment Variables

- `BASE_URL`: Target base URL for Playwright tests (default: `https://dev1.cenarbe.com`)
- `TARGET_URL`: Target URL for Lighthouse audits (default: `https://dev1.cenarbe.com`)
- `CHROMIUM_PATH`: Path to Chromium executable (default: `/usr/bin/chromium`)

### Playwright

Configuration file: `playwright.config.js`
- Uses system Chromium by default
- Test directory: `./tests`
- HTML reporter enabled

### Lighthouse

Script: `tests/lighthouse-audit.js`
- Generates HTML reports in `./reports/`
- Audits performance, accessibility, best practices, and SEO

## Usage

### Running Playwright Tests

```bash
# Run all Playwright tests
npm run test:playwright

# Run with UI mode
npm run test:playwright:ui

# Debug mode
npm run test:playwright:debug
```

### Running Lighthouse Audits

```bash
# Audit default URL
npm run audit:lighthouse

# Audit custom URL
TARGET_URL=https://dev1.cenarbe.com/login.php npm run audit:lighthouse
```

### Run All Tests

```bash
npm run test:all
```

## Test Structure

- `tests/playwright-basic.spec.js`: Basic smoke tests for Cenarbe (homepage, login, register)
- `tests/lighthouse-audit.js`: Programmatic Lighthouse audit script
- `reports/`: Generated Lighthouse HTML reports

## Adding New Tests

### Playwright
Create new `.spec.js` files in the `tests/` directory. Use the `@playwright/test` API.

Example:
```js
const { test, expect } = require('@playwright/test');

test('new feature', async ({ page }) => {
  await page.goto('/some-page');
  // assertions
});
```

### Lighthouse
Import the `runLighthouse` function from `tests/lighthouse-audit.js` or run the script directly.

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Run Playwright tests
  run: npm run test:playwright
  env:
    BASE_URL: ${{ secrets.BASE_URL }}

- name: Run Lighthouse audit
  run: npm run audit:lighthouse
  env:
    TARGET_URL: ${{ secrets.TARGET_URL }}
```

## Troubleshooting

### Playwright cannot find browsers
- Ensure Chromium is installed (`which chromium`)
- Set `CHROMIUM_PATH` environment variable
- Alternatively, install Playwright's bundled browsers with `npx playwright install`

### Lighthouse fails to launch Chrome
- Check Chromium installation
- Add `--no-sandbox` flag (already included)
- Run with `xvfb-run` on headless systems if needed

### Tests fail due to timeouts
- Increase timeout in `playwright.config.js`
- Check network connectivity to the target URL

## License

ISC