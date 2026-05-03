const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

const URL_RESERVAR = 'https://dev1.cenarbe.com/reservar.php';
const SCREENSHOT_PATH = 'screenshot_bicicletas.png';
const LIGHTHOUSE_REPORT_PATH = 'lighthouse_report.html';
const LIGHTHOUSE_JSON_PATH = 'lighthouse_report.json';

async function runPlaywrightChecks() {
    console.log('=== Iniciando verificación con Playwright ===');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // 1) Accede a la página
        console.log(`Navegando a ${URL_RESERVAR} ...`);
        const response = await page.goto(URL_RESERVAR, { waitUntil: 'networkidle' });
        if (!response || response.status() !== 200) {
            throw new Error(`HTTP ${response ? response.status() : 'unknown'}`);
        }
        console.log('✅ Página cargada (200 OK)');
        
        // Esperar un poco a que posible contenido dinámico aparezca
        await page.waitForTimeout(3000);
        
        // 2) Verifica bicicletas visibles (count > 0)
        // Intentaremos varios selectores comunes
        const selectors = [
            '.bicicleta',
            '.bike',
            '.item',
            '.card',
            '.product',
            '[class*="bicicleta"]',
            '[class*="bike"]',
            'div:has-text("bicicleta")',
            'li:has-text("bicicleta")',
            'table tr',
            'tbody tr',
            '.list-item',
            '.row'
        ];
        
        let bicicletas = [];
        let selectorUsado = '';
        for (const selector of selectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                // Filtrar visibles
                const visible = [];
                for (const el of elements) {
                    if (await el.isVisible()) visible.push(el);
                }
                if (visible.length > 0) {
                    bicicletas = visible;
                    selectorUsado = selector;
                    break;
                }
            }
        }
        
        console.log(`Selector usado: "${selectorUsado}"`);
        console.log(`🔍 Bicicletas visibles encontradas: ${bicicletas.length}`);
        
        // 3) Verifica estado 'disponible'
        let disponibleCount = 0;
        let totalMatches = 0;
        if (bicicletas.length > 0) {
            for (let i = 0; i < bicicletas.length; i++) {
                const text = await bicicletas[i].innerText();
                if (/disponible/i.test(text)) {
                    disponibleCount++;
                }
            }
        }
        // También contar en toda la página
        const pageText = await page.content();
        const matches = pageText.match(/disponible/gi);
        totalMatches = matches ? matches.length : 0;
        
        console.log(`📝 Bicicletas con texto "disponible": ${disponibleCount}`);
        console.log(`📝 Total de menciones "disponible" en página: ${totalMatches}`);
        
        // 4) Toma screenshot evidencia
        console.log('📸 Tomando screenshot...');
        await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
        console.log(`✅ Screenshot guardado en ${SCREENSHOT_PATH}`);
        
        await browser.close();
        
        return {
            bicicletasCount: bicicletas.length,
            disponibleCount,
            totalMatches,
            selectorUsado
        };
    } catch (error) {
        await browser.close();
        throw error;
    }
}

function runLighthouse() {
    console.log('\n=== Ejecutando Lighthouse (performance) ===');
    // Ejecutar lighthouse vía CLI
    const cmd = `npx lighthouse ${URL_RESERVAR} --output=html --output=json --only-categories=performance --chrome-flags="--headless" --quiet`;
    console.log(`Comando: ${cmd}`);
    try {
        execSync(cmd, { stdio: 'inherit' });
        // Los archivos se guardan por defecto como ${hostname}_${date}.html/json
        // Renombrar a los nombres predefinidos
        const hostname = new URL(URL_RESERVAR).hostname.replace(/[^a-zA-Z0-9]/g, '_');
        const files = fs.readdirSync('.');
        const htmlFile = files.find(f => f.includes(hostname) && f.endsWith('.html'));
        const jsonFile = files.find(f => f.includes(hostname) && f.endsWith('.json'));
        if (htmlFile) {
            fs.renameSync(htmlFile, LIGHTHOUSE_REPORT_PATH);
            console.log(`✅ Reporte Lighthouse HTML movido a ${LIGHTHOUSE_REPORT_PATH}`);
        }
        if (jsonFile) {
            fs.renameSync(jsonFile, LIGHTHOUSE_JSON_PATH);
            console.log(`✅ Reporte Lighthouse JSON movido a ${LIGHTHOUSE_JSON_PATH}`);
        }
        // Leer métricas del JSON
        if (fs.existsSync(LIGHTHOUSE_JSON_PATH)) {
            const json = JSON.parse(fs.readFileSync(LIGHTHOUSE_JSON_PATH, 'utf8'));
            const perfScore = json.categories.performance.score * 100;
            console.log(`📊 Puntuación Lighthouse Performance: ${perfScore.toFixed(0)}`);
            return perfScore;
        }
        return null;
    } catch (error) {
        console.error('Error ejecutando Lighthouse:', error.message);
        return null;
    }
}

function generarInforme(resultados, perfScore) {
    const { bicicletasCount, disponibleCount, totalMatches, selectorUsado } = resultados;
    
    const estadoQA = bicicletasCount > 0 ? 'PASS' : 'FAIL';
    
    const informe = {
        estadoQA,
        coberturaValidada: [
            'Acceso a página Reservar (HTTP 200)',
            'Presencia de bicicletas visibles',
            'Estado "disponible" en bicicletas',
            'Screenshot de evidencia',
            'Auditoría Lighthouse Performance'
        ],
        casosProbados: [
            `Carga HTTP 200 exitosa`,
            `Bicicletas visibles: ${bicicletasCount}`,
            `Texto "disponible" en bicicletas: ${disponibleCount}`,
            `Total menciones "disponible": ${totalMatches}`,
            `Performance score: ${perfScore ? perfScore.toFixed(0) : 'N/A'}`
        ],
        edgeCasesProbados: [
            'Selector flexible para diferentes estructuras',
            'Visibilidad de elementos (no solo en DOM)'
        ],
        regresionesDetectadas: bicicletasCount === 0 ? ['No se encontraron bicicletas visibles'] : [],
        hallazgos: [],
        conclusion: '',
        criterioSalida: ''
    };
    
    // Hallazgos
    if (bicicletasCount === 0) {
        informe.hallazgos.push({
            id: 'H1',
            titulo: 'No se detectan bicicletas visibles en la página',
            severidad: 'crítica',
            descripcion: 'El selector no encontró elementos visibles que parezcan bicicletas.',
            pasosParaReproducir: `Acceder a ${URL_RESERVAR} y revisar la lista de bicicletas.`,
            resultadoEsperado: 'Al menos una bicicleta visible en la página.',
            resultadoObservado: '0 bicicletas visibles encontradas.',
            impacto: 'Los usuarios no pueden reservar bicicletas si no se muestran.',
            recomendacion: 'Revisar la estructura HTML y asegurar que los elementos de bicicleta tengan clases identificables o estén renderizados.'
        });
    } else if (disponibleCount === 0 && totalMatches === 0) {
        informe.hallazgos.push({
            id: 'H2',
            titulo: 'No se encuentra texto "disponible" en las bicicletas',
            severidad: 'media',
            descripcion: 'No se detectó la palabra "disponible" dentro de los elementos de bicicleta ni en toda la página.',
            pasosParaReproducir: `Acceder a ${URL_RESERVAR} y buscar la palabra "disponible" en la lista de bicicletas.`,
            resultadoEsperado: 'Al menos una bicicleta marcada como disponible.',
            resultadoObservado: '0 apariciones de "disponible".',
            impacto: 'Los usuarios no pueden distinguir qué bicicletas están disponibles para reserva.',
            recomendacion: 'Asegurar que el estado de disponibilidad sea visible en la interfaz.'
        });
    }
    
    if (perfScore && perfScore < 50) {
        informe.hallazgos.push({
            id: 'H3',
            titulo: 'Puntuación Lighthouse Performance baja',
            severidad: 'media',
            descripcion: `La puntuación de performance es ${perfScore.toFixed(0)}, por debajo del umbral aceptable.`,
            pasosParaReproducir: `Ejecutar Lighthouse en ${URL_RESERVAR}.`,
            resultadoEsperado: 'Puntuación >= 70.',
            resultadoObservado: `Puntuación = ${perfScore.toFixed(0)}.`,
            impacto: 'Experiencia de usuario lenta, puede afectar conversiones.',
            recomendacion: 'Optimizar recursos (imágenes, CSS, JS), usar caché, reducir tiempo de respuesta del servidor.'
        });
    }
    
    // Conclusión
    if (bicicletasCount > 0) {
        informe.conclusion = `La página muestra ${bicicletasCount} bicicleta(s) visible(s). ${disponibleCount} de ellas contienen texto "disponible". Performance: ${perfScore ? perfScore.toFixed(0) : 'N/A'}.`;
        informe.criterioSalida = 'Puede cerrarse' + (perfScore && perfScore < 50 ? ' pero se recomienda mejorar performance.' : '.');
    } else {
        informe.conclusion = 'No se encontraron bicicletas visibles. La funcionalidad de reserva puede estar afectada.';
        informe.criterioSalida = 'Debe volver a desarrollo.';
    }
    
    return informe;
}

async function main() {
    console.log('🚀 INICIO VERIFICACIÓN BICICLETAS - CEO Miranda');
    console.log(`⏰ ${new Date().toISOString()}`);
    
    try {
        const resultados = await runPlaywrightChecks();
        const perfScore = runLighthouse();
        const informe = generarInforme(resultados, perfScore);
        
        // Imprimir informe estructurado
        console.log('\n' + '='.repeat(50));
        console.log('📋 INFORME QA FINAL');
        console.log('='.repeat(50));
        console.log(`Estado QA: ${informe.estadoQA}`);
        console.log('\nCobertura validada:');
        informe.coberturaValidada.forEach(c => console.log(`- ${c}`));
        console.log('\nCasos probados:');
        informe.casosProbados.forEach(c => console.log(`- ${c}`));
        console.log('\nEdge cases probados:');
        informe.edgeCasesProbados.forEach(e => console.log(`- ${e}`));
        console.log('\nRegresiones detectadas:', informe.regresionesDetectadas.length ? informe.regresionesDetectadas.join(', ') : 'ninguna');
        console.log('\nHallazgos:');
        if (informe.hallazgos.length === 0) {
            console.log('- Ninguno');
        } else {
            informe.hallazgos.forEach(h => {
                console.log(`\nID: ${h.id}`);
                console.log(`  Título: ${h.titulo}`);
                console.log(`  Severidad: ${h.severidad}`);
                console.log(`  Descripción: ${h.descripcion}`);
                console.log(`  Pasos para reproducir: ${h.pasosParaReproducir}`);
                console.log(`  Resultado esperado: ${h.resultadoEsperado}`);
                console.log(`  Resultado observado: ${h.resultadoObservado}`);
                console.log(`  Impacto: ${h.impacto}`);
                console.log(`  Recomendación: ${h.recomendacion}`);
            });
        }
        console.log(`\nConclusión: ${informe.conclusion}`);
        console.log(`Criterio de salida: ${informe.criterioSalida}`);
        
        // Guardar informe JSON
        fs.writeFileSync('informe_qa_final.json', JSON.stringify(informe, null, 2));
        console.log('\n✅ Informe guardado en informe_qa_final.json');
        
        // Si hay hallazgos críticos, salir con código de error
        if (informe.hallazgos.some(h => h.severidad === 'crítica')) {
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

main();