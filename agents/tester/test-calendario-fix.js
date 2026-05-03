const { runCoherenceTest } = require('../../continuous-testing/coherence.js');
const coherenceTests = require('../../continuous-testing/coherence.js').coherenceTests;
// Nota: coherenceTests no está exportado actualmente, necesitamos definirlo localmente o extraerlo del archivo.
// Vamos a copiar la definición localmente.
const coherenceTestsLocal = {
  'Calendario Cenarbe': {
    url: 'https://dev1.cenarbe.com/calendario/',
    selectors: [
      '.calendar', // calendar element
      'table', // likely calendar table
      'a[href*="eventos"]',
      'a[href*="bicicletas"]'
    ],
    loginRequired: true
  }
};

async function main() {
  console.log('Testing Calendario Cenarbe with login...');
  const result = await runCoherenceTest('Calendario Cenarbe', coherenceTestsLocal['Calendario Cenarbe']);
  console.log('Result:', JSON.stringify(result, null, 2));
  if (result.passed) {
    console.log('✅ Calendario coherence test PASSED');
    process.exit(0);
  } else {
    console.log('❌ Calendario coherence test FAILED');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});