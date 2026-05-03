const fs = require('fs');
const input = fs.readFileSync('/home/node/.openclaw/workspace-tester/agents/tester/new_functionality.txt', 'utf8');
const lines = input.split('\n');
// Asegurar que cada línea empiece con 6 espacios (excepto líneas vacías)
const adjusted = lines.map(line => {
  if (line.trim() === '') return line;
  // Si ya comienza con 6 espacios, dejarla
  if (line.startsWith('      ')) return line;
  // Si comienza con menos espacios, agregar hasta 6
  const match = line.match(/^(\s*)/);
  const existing = match[0].length;
  if (existing < 6) {
    return ' '.repeat(6 - existing) + line;
  }
  // Si tiene más, dejarla
  return line;
});
fs.writeFileSync('/home/node/.openclaw/workspace-tester/agents/tester/new_functionality_adjusted.txt', adjusted.join('\n'));
console.log('Adjusted lines:', adjusted.length);