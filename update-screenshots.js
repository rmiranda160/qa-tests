const fs = require('fs');
const path = require('path');

// Rutas
const dashboardDataPath = '/tmp/dashboard-repo/dashboard_data.json';
const sharedDataPath = 'shared-memory/dashboard_data.json';
const screenshotsDir = '/tmp/dashboard-repo/screenshots';

// Mapeo de nombres de app
const appMap = {
  'cenarbe': 'Cenarbe Bike Rental',
  'cntai': 'ContentoAI',
  'villazocotin': 'Villa Zocotin'
};

// Obtener lista de archivos PNG en screenshots
const files = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
console.log(`Found ${files.length} screenshot files`);

// Construir array de screenshots
const recentScreenshots = files.map(filename => {
  // Ejemplo: cenarbe-mobile-20260320-1636.png
  const parts = filename.split('-');
  const appKey = parts[0]; // cenarbe, cntai, villazocotin
  const mode = parts[1]; // mobile, tablet, desktop
  const appName = appMap[appKey] || appKey;
  
  return {
    app: appName,
    mode: 'responsive',
    name: mode,
    path: `screenshots/${filename}`,
    timestamp: new Date().toISOString()
  };
});

// Ordenar por app y mode
recentScreenshots.sort((a, b) => {
  if (a.app < b.app) return -1;
  if (a.app > b.app) return 1;
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});

// Leer JSON original
function updateFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.recent_screenshots = recentScreenshots;
  data.generated_at = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${filePath}`);
}

// Actualizar ambos archivos
updateFile(dashboardDataPath);
updateFile(sharedDataPath);

console.log('Done.');