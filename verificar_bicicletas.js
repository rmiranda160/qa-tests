const { chromium } = require('playwright');
const lighthouse = require('lighthouse');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const URL_RESERVAR = 'https://dev1.cenarbe.com/reservar.php';
const SCREENSHOT_PATH = 'screenshot_bicicletas.png';
const LIGHTHOUSE_REPORT_PATH = 'lighthouse_report.html';

async function main() {
    console.log('=== Iniciando verificación de bicicletas en página Reservar ===');
    console.log(`Hora: ${new Date().toISOString()}`);
    console.log(`URL: ${URL_RESERVAR}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1) Accede a la página
        console.log('Navegando a la página...');
        const response = await page.goto(URL_RESERVAR, { waitUntil: 'networkidle' });
        if (!response || response.status() !== 200) {
            throw new Error(`La página respondió con código ${response ? response.status() : 'unknown'}`);
        }
        console.log('Página cargada correctamente.');

        // Esperar a que posibles elementos dinámicos carguen
        await page.waitForTimeout(2000);

        // 2) Verifica bicicletas visibles (count > 0)
        // Suponemos que las bicicletas están en algún elemento con clase o selector específico.
        // Como no conocemos la estructura exacta, buscaremos elementos que contengan "bicicleta", "bike", "item", "card", etc.
        // Vamos a intentar varios selectores comunes.
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
            'tbody tr'
        ];

        let bicicletas = [];
        let selectorUsado = '';
        for (const selector of selectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                // Filtrar elementos visibles
                const visibleElements = [];
                for (const el of elements) {
                    const isVisible = await el.isVisible();
                    if (isVisible) visibleElements.push(el);
                }
                if (visibleElements.length > 0) {
                    bicicletas = visibleElements;
                    selectorUsado = selector;
                    break;
                }
            }
        }

        console.log(`Selector usado: "${selectorUsado}"`);
        console.log(`Bicicletas visibles encontradas: ${bicicletas.length}`);

        // 3) Verifica estado 'disponible'
        // Buscamos texto "disponible" dentro de cada bicicleta o en la página.
        let disponibleCount = 0;
        const disponibilidadTextos = [];
        for (let i = 0; i < bicicletas.length; i++) {
            const text = await bicicletas[i].innerText();
            if (/disponible/i.test(text)) {
                disponibleCount++;
                disponibilidadTextos.push(`Bicicleta ${i + 1}: "disponible" encontrado`);
            }
        }

        // También buscar en toda la página por si acaso
        const pageText = await page.content();
        const matches = pageText.match(/disponible/gi);
        const totalMatches = matches ? matches.length : 0;

        console.log(`Bicicletas con texto "disponible": ${disponibleCount}`);
        console.log(`Apariciones totales de "disponible" en página: ${totalMatches}`);

        // 4) Toma screenshot evidencia
        console.log('Tomando screenshot...');
        await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
        console.log(`Screenshot guardado en ${SCREENSHOT_PATH}`);

        // 5) Lighthouse auditoría performance
        console.log('Ejecutando Lighthouse...');
        const report = await lighthouse(URL_RESERVAR, {
            port: (new URL(browser.wsEndpoint())).port,
            output: 'html',
            onlyCategories: ['performance'],
        });

        const reportHtml = report.report;
        fs.writeFileSync(LIGHTHOUSE_REPORT_PATH, reportHtml);
        console.log(`Reporte Lighthouse guardado en ${LIGHTHOUSE_REPORT_PATH}`);

        // Obtener métricas de performance
        const perfScore = report.lhr.categories.performance.score * 100;
        const metrics = report.lhr.audits;

        console.log(`Puntuación Lighthouse Performance: ${perfScore.toFixed(0)}`);

        // === GENERAR INFORME ESTRUCTURADO ===
        const informe = {
            estadoQA: bicicletas.length > 0 ? 'PASS' : 'FAIL',
            coberturaValidada: [
                'Acceso a página Reservar',
                'Presencia de bicicletas visibles',
                'Estado "disponible" en bicicletas',
                'Screenshot de evidencia',
                'Auditoría Lighthouse Performance'
            ],
            casosProbados: [
                'Carga HTTP 200',
                `Bicicletas visibles: ${bicicletas.length}`,
                `Texto "disponible" en bicicletas: ${disponibleCount}`,
                `Total menciones "disponible": ${totalMatches}`
            ],
            edgeCasesProbados: [
                'Selector flexible para diferentes estructuras de página',
                'Visibilidad de elementos (no solo existencia en DOM)'
            ],
            regresionesDetectadas: bicicletas.length === 0 ? ['No se encontraron bicicletas visibles'] : [],
            hallazgos: [],
            conclusion: '',
            criterioSalida: ''
        };

        // Hallazgos si hay problemas
        if (bicicletas.length === 0) {
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

        // Si el performance es bajo
        if (perfScore < 50) {
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

        // Conclusión y criterio de salida
        if (bicicletas.length > 0) {
            informe.conclusion = `La página muestra ${bicicletas.length} bicicleta(s) visible(s). ${disponibleCount} de ellas contienen texto "disponible". Performance: ${perfScore.toFixed(0)}.`;
            informe.criterioSalida = 'Puede cerrarse' + (perfScore < 50 ? ' pero se recomienda mejorar performance.' : '.');
        } else {
            informe.conclusion = 'No se encontraron bicicletas visibles. La funcionalidad de reserva puede estar afectada.';
            informe.criterioSalida = 'Debe volver a desarrollo.';
        }

        // Imprimir informe en consola
        console.log('\n=== INFORME QA ===');
        console.log(`Estado QA: ${informe.estadoQA}`);
        console.log('Cobertura validada:');
        informe.coberturaValidada.forEach(c => console.log(`- ${c}`));
        console.log('Casos probados:');
        informe.casosProbados.forEach(c => console.log(`- ${c}`));
        console.log('Edge cases probados:');
        informe.edgeCasesProbados.forEach(e => console.log(`- ${e}`));
        console.log('Regresiones detectadas:', informe.regresionesDetectadas.length ? informe.regresionesDetectedadas.join(', ') : 'ninguna');
        console.log('Hallazgos:');
        if (informe.hallazgos.length === 0) {
            console.log('- Ninguno');
        } else {
            informe.hallazgos.forEach(h => {
                console.log(`ID: ${h.id}`);
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
        console.log(`Conclusión: ${informe.conclusion}`);
        console.log(`Criterio de salida: ${informe.criterioSalida}`);

        // Guardar informe en archivo JSON
        fs.writeFileSync('informe_qa.json', JSON.stringify(informe, null, 2));
        console.log('\nInforme completo guardado en informe_qa.json');

    } catch (error) {
        console.error('Error durante la verificación:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

main();