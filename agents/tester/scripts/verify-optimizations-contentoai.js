#!/usr/bin/env node

const https = require('https');

const SITE_URL = 'https://contentoai.cenarbe.com';

/**
 * Fetch HTML content from URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Check minified CSS and JS sizes
 */
async function checkMinification() {
  console.log('=== Verificación Minificación CSS/JS ===');
  
  const assets = [
    { path: '/css/style.min.css', maxSize: 10 * 1024 }, // 10KB
    { path: '/css/style.css', maxSize: 12 * 1024 }, // 12KB (original)
    { path: '/js/script.min.js', maxSize: 5 * 1024 },   // 5KB
    { path: '/js/script.js', maxSize: 6 * 1024 },   // 6KB (original)
  ];
  
  for (const asset of assets) {
    const url = SITE_URL + asset.path;
    try {
      const size = await getContentLength(url);
      console.log(`${asset.path}: ${size} bytes (max ${asset.maxSize} bytes)`);
      if (size <= asset.maxSize) {
        console.log('✅ Tamaño OK');
      } else {
        console.log('❌ Tamaño EXCEDIDO');
      }
    } catch (error) {
      console.log(`❌ No se pudo obtener ${url}: ${error.message}`);
    }
  }
}

/**
 * Get Content-Length via HEAD request
 */
function getContentLength(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      const length = parseInt(res.headers['content-length']) || 0;
      resolve(length);
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Check lazy loading attributes
 */
async function checkLazyLoading() {
  console.log('\n=== Verificación Lazy Loading ===');
  const html = await fetchHTML(SITE_URL);
  
  // Contar todas las etiquetas <img
  const imgRegex = /<img\s[^>]*>/gi;
  const imgTags = html.match(imgRegex) || [];
  console.log(`Total imágenes: ${imgTags.length}`);
  
  // Contar imágenes con loading="lazy"
  let lazyCount = 0;
  imgTags.forEach(tag => {
    const loadingMatch = tag.match(/loading\s*=\s*["']?lazy["']?/i);
    if (loadingMatch) {
      lazyCount++;
    }
  });
  
  console.log(`Imágenes con loading="lazy": ${lazyCount}`);
  
  // Verificar que al menos hay imágenes lazy (esperado en testimonios)
  if (lazyCount > 0) {
    console.log('✅ Lazy loading detectado');
  } else {
    console.log('⚠️  No se encontraron imágenes con lazy loading');
  }
}

/**
 * Check preconnect tags
 */
async function checkPreconnect() {
  console.log('\n=== Verificación Preconnect CDNs ===');
  const html = await fetchHTML(SITE_URL);
  
  // Buscar tags <link rel="preconnect" href="...">
  const preconnectRegex = /<link\s[^>]*rel\s*=\s*["']?preconnect["']?[^>]*>/gi;
  const preconnectTags = html.match(preconnectRegex) || [];
  
  // Buscar tags <link rel="dns-prefetch" href="...">
  const dnsPrefetchRegex = /<link\s[^>]*rel\s*=\s*["']?dns-prefetch["']?[^>]*>/gi;
  const dnsPrefetchTags = html.match(dnsPrefetchRegex) || [];
  
  console.log(`Preconnect tags: ${preconnectTags.length}`);
  preconnectTags.forEach(tag => {
    const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : 'unknown';
    console.log(`  - ${href}`);
  });
  
  console.log(`DNS-prefetch tags: ${dnsPrefetchTags.length}`);
  dnsPrefetchTags.forEach(tag => {
    const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : 'unknown';
    console.log(`  - ${href}`);
  });
  
  // CDNs esperados
  const expectedCDNs = ['cloudflare.com', 'jsdelivr.net', 'randomuser.me'];
  const foundCDNs = [];
  
  const allTags = [...preconnectTags, ...dnsPrefetchTags];
  allTags.forEach(tag => {
    const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      expectedCDNs.forEach(cdn => {
        if (href.includes(cdn)) {
          foundCDNs.push(cdn);
        }
      });
    }
  });
  
  console.log('\nCDNs encontrados:', [...new Set(foundCDNs)]);
  
  const missing = expectedCDNs.filter(cdn => !foundCDNs.includes(cdn));
  if (missing.length === 0) {
    console.log('✅ Todos los CDNs tienen preconnect/dns-prefetch');
  } else {
    console.log(`⚠️  CDNs sin preconnect: ${missing.join(', ')}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Iniciando verificación de optimizaciones para ContentoAI (contentoai.cenarbe.com)');
  console.log(`Sitio: ${SITE_URL}\n`);
  
  try {
    await checkMinification();
    await checkLazyLoading();
    await checkPreconnect();
    
    console.log('\n=== Resumen ===');
    console.log('Verificación completada. Revisar logs arriba.');
  } catch (error) {
    console.error('Error durante la verificación:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}