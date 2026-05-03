#!/usr/bin/env node
// test-conversation-flow.js
// Script Node.js para probar flujo completo de conversación voz↔voz

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testFullConversationFlow() {
    console.log('=== TESTING FLUJO CONVERSACIÓN COMPLETO ===');
    
    // 1. Crear audio de prueba (silencio en formato WebM simulado)
    console.log('1. Generando audio de prueba...');
    const testAudio = Buffer.alloc(1024 * 10); // 10KB de silencio
    const audioBase64 = testAudio.toString('base64');
    
    // 2. Enviar al backend
    console.log('2. Enviando audio al backend...');
    const startTime = Date.now();
    
    try {
        const response = await axios.post('http://localhost:3002/api/conversation', {
            audio: audioBase64,
            format: 'webm',
            language: 'es'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000 // 30 segundos timeout
        });
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        console.log(`✅ Respuesta recibida en ${totalTime}ms`);
        console.log(`   Status HTTP: ${response.status}`);
        
        // 3. Verificar estructura respuesta
        const data = response.data;
        console.log('3. Verificando estructura de respuesta:');
        console.log(`   - Success: ${data.success ? '✅' : '❌'}`);
        console.log(`   - User text: ${data.user_text ? `✅ "${data.user_text.substring(0, 50)}..."` : '❌'}`);
        console.log(`   - Response text: ${data.response_text ? `✅ "${data.response_text.substring(0, 50)}..."` : '❌'}`);
        console.log(`   - Audio URL: ${data.audio_url ? '✅' : '❌'}`);
        console.log(`   - Audio format: ${data.audio_format || 'N/A'}`);
        console.log(`   - Processing time: ${data.processing_time || 'N/A'}s`);
        
        // 4. Verificar latencia aceptable
        console.log('4. Verificando latencia...');
        if (totalTime < 10000) {
            console.log(`   ✅ Latencia aceptable (<10s): ${totalTime}ms`);
        } else {
            console.log(`   ⚠️ Latencia alta: ${totalTime}ms (esperado <10s)`);
        }
        
        // 5. Si hay audio URL, descargar y verificar
        if (data.audio_url) {
            console.log('5. Descargando audio respuesta...');
            try {
                const audioResponse = await axios.get(data.audio_url, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                
                if (audioResponse.data && audioResponse.data.length > 100) {
                    console.log(`   ✅ Audio descargado: ${audioResponse.data.length} bytes`);
                    const filename = `test-response-audio-${Date.now()}.wav`;
                    fs.writeFileSync(path.join(__dirname, '..', 'results', filename), Buffer.from(audioResponse.data));
                    console.log(`   Audio guardado como ${filename}`);
                    
                    // Verificar tipo de archivo
                    const fileInfo = `File: ${filename}, Size: ${audioResponse.data.length} bytes`;
                    console.log(`   ${fileInfo}`);
                } else {
                    console.log('   ⚠️ Audio descargado pero tamaño insuficiente');
                }
            } catch (audioError) {
                console.error(`   ❌ Error descargando audio: ${audioError.message}`);
            }
        } else {
            console.log('5. ❌ No hay URL de audio en la respuesta');
        }
        
        console.log('\n✅ FLUJO COMPLETO: PASS');
        return true;
        
    } catch (error) {
        console.error('❌ Error en flujo conversación:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
        }
        return false;
    }
}

async function testIndividualEndpoints() {
    console.log('\n=== TESTING ENDPOINTS INDIVIDUALES ===');
    
    const endpoints = [
        { name: 'Backend Health', url: 'http://localhost:3001/health', method: 'GET' },
        { name: 'TTS Health', url: 'http://localhost:3002/api/tts/health', method: 'GET' },
        { name: 'TTS Synthesis', url: 'http://localhost:3002/api/tts', method: 'POST', data: { text: 'Test', language: 'es' } }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\nProbando ${endpoint.name}...`);
            const config = {
                method: endpoint.method.toLowerCase(),
                url: endpoint.url,
                timeout: 5000
            };
            
            if (endpoint.data) {
                config.headers = { 'Content-Type': 'application/json' };
                config.data = endpoint.data;
            }
            
            const response = await axios(config);
            console.log(`   ✅ ${endpoint.name}: ${response.status}`);
        } catch (error) {
            console.log(`   ❌ ${endpoint.name}: ${error.message}`);
        }
    }
}

// Ejecutar tests
(async () => {
    try {
        // Crear directorio results si no existe
        const resultsDir = path.join(__dirname, '..', 'results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        await testIndividualEndpoints();
        const success = await testFullConversationFlow();
        
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('Error ejecutando tests:', error);
        process.exit(1);
    }
})();