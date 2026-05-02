// Verificación rápida del cambio en coherence-tests.js
const fs = require('fs');
const path = require('path');

// Leer el archivo modificado
const filePath = path.join(__dirname, '..', '..', 'coherence-tests.js');
const content = fs.readFileSync(filePath, 'utf8');

// Buscar la definición de coherenceTests
const testBlockMatch = content.match(/const coherenceTests = \[(.*?)\];/s);
if (!testBlockMatch) {
  console.error('❌ No se encontró coherenceTests en el archivo');
  process.exit(1);
}

const testBlock = testBlockMatch[1];

// Buscar el test de "Mis Reservas"
const misReservasMatch = testBlock.match(/name: 'Botón "Mis Reservas" → Página de reservas'.*?expectedElements: \[(.*?)\]/s);
if (!misReservasMatch) {
  console.error('❌ No se encontró el test de Mis Reservas');
  process.exit(1);
}

const elementsStr = misReservasMatch[1];
const elements = elementsStr.replace(/'/g, '').split(',').map(s => s.trim());

console.log('🔍 Elementos esperados en test "Mis Reservas":', elements);

// Verificar que contenga los términos esenciales y no los eliminados
const expectedPresent = ['reserva', 'alquiler', 'bicicleta'];
const expectedAbsent = ['booking', 'fecha'];

let allOk = true;

for (const term of expectedPresent) {
  if (!elements.includes(term)) {
    console.error(`❌ Falta término esencial: "${term}"`);
    allOk = false;
  } else {
    console.log(`✅ Presente: "${term}"`);
  }
}

for (const term of expectedAbsent) {
  if (elements.includes(term)) {
    console.error(`❌ Término no deseado presente: "${term}"`);
    allOk = false;
  } else {
    console.log(`✅ Ausente (correcto): "${term}"`);
  }
}

if (allOk) {
  console.log('\n✅ Verificación exitosa: El cambio se aplicó correctamente.');
  process.exit(0);
} else {
  console.log('\n❌ Verificación fallida: Revisar el cambio.');
  process.exit(1);
}