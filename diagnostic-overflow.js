const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://villazocotin.cenarbe.com');
  
  // Función para verificar overflow
  const checkOverflow = async () => {
    return await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
  };
  
  console.log('Overflow antes:', await checkOverflow());
  
  // Identificar elemento más ancho
  const widestElement = await page.evaluate(() => {
    let maxWidth = 0;
    let elementTag = '';
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > maxWidth && rect.width > window.innerWidth) {
        maxWidth = rect.width;
        elementTag = el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className : '');
      }
    });
    return { elementTag, maxWidth };
  });
  
  console.log('Elemento más ancho:', widestElement);
  
  // Obtener ancho de algunos elementos clave
  const widths = await page.evaluate(() => {
    const selectors = ['.calendar-container', '.calendar-grid', '.container', 'body', 'html'];
    const result = {};
    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        const rect = el.getBoundingClientRect();
        result[sel] = { width: rect.width, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
      }
    });
    return result;
  });
  
  console.log('Anchos:', widths);
  
  // Intentar inyectar CSS fixes uno por uno
  const fixes = [
    { name: 'body overflow hidden', css: 'body { overflow-x: hidden !important; }' },
    { name: 'calendar-container max-width', css: '.calendar-container { max-width: 100% !important; overflow-x: hidden !important; }' },
    { name: 'calendar-grid width', css: '.calendar-grid { width: 100% !important; grid-template-columns: repeat(7, minmax(0, 1fr)) !important; }' },
    { name: 'calendar-day box-sizing', css: '.calendar-day { box-sizing: border-box !important; max-width: 100% !important; }' },
    { name: 'container padding reduce', css: '.container { padding-left: 10px !important; padding-right: 10px !important; }' },
  ];
  
  for (const fix of fixes) {
    await page.addStyleTag({ content: fix.css });
    console.log(`Applied ${fix.name}, overflow:`, await checkOverflow());
  }
  
  await browser.close();
})();