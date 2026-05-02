const fs = require('fs');
const path = require('path');

const dashboardPath = '/tmp/dashboard-repo/dashboard_proactive.html';
let html = fs.readFileSync(dashboardPath, 'utf8');

// Reemplazar función renderScreenshots
const oldFunction = `        function renderScreenshots(screenshots) {
            const container = document.getElementById('screenshots');
            if (screenshots.length === 0) {
                container.innerHTML = '<p>No recent screenshots available.</p>';
                return;
            }

            container.innerHTML = '';
            screenshots.forEach(ss => {
                const card = document.createElement('div');
                card.className = 'screenshot-card';
                card.innerHTML = \`
                    <div style="background:#eee;height:150px;display:flex;align-items:center;justify-content:center;color:#666;">
                        📸 Screenshot (\${ss.name})
                    </div>
                    <div class="screenshot-info">
                        <strong>\${ss.app}</strong><br>
                        <small>\${ss.mode} - \${ss.name}</small>
                    </div>
                \`;
                container.appendChild(card);
            });
        }`;

const newFunction = `        function renderScreenshots(screenshots) {
            const container = document.getElementById('screenshots');
            if (screenshots.length === 0) {
                container.innerHTML = '<p>No recent screenshots available.</p>';
                return;
            }

            container.innerHTML = '';
            screenshots.forEach(ss => {
                const card = document.createElement('div');
                card.className = 'screenshot-card';
                card.innerHTML = \`
                    <img src="\${ss.path}" alt="\${ss.app} - \${ss.name}" style="width:100%;height:150px;object-fit:cover;">
                    <div class="screenshot-info">
                        <strong>\${ss.app}</strong><br>
                        <small>\${ss.mode} - \${ss.name}</small>
                    </div>
                \`;
                container.appendChild(card);
            });
        }`;

if (html.includes(oldFunction)) {
    html = html.replace(oldFunction, newFunction);
    console.log('Replaced renderScreenshots in dashboard_proactive.html');
} else {
    console.log('Old function not found, trying alternative pattern...');
    // Buscar por línea de función
    const lines = html.split('\n');
    let inFunction = false;
    let start = -1, end = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('function renderScreenshots')) {
            start = i;
            inFunction = true;
        }
        if (inFunction && lines[i].trim() === '}' && i > start) {
            // Verificar que no sea un cierre interno
            let braceCount = 0;
            for (let j = start; j <= i; j++) {
                braceCount += (lines[j].match(/{/g) || []).length;
                braceCount -= (lines[j].match(/}/g) || []).length;
            }
            if (braceCount === 0) {
                end = i;
                break;
            }
        }
    }
    if (start !== -1 && end !== -1) {
        const before = lines.slice(0, start).join('\n');
        const after = lines.slice(end + 1).join('\n');
        html = before + '\n' + newFunction + '\n' + after;
        console.log('Replaced using line detection');
    } else {
        console.error('Could not find function');
        process.exit(1);
    }
}

fs.writeFileSync(dashboardPath, html);
console.log('Updated dashboard_proactive.html');

// También actualizar dashboard.html y dashboard_dynamic.html si existen
const otherFiles = ['dashboard.html', 'dashboard_dynamic.html'];
otherFiles.forEach(file => {
    const filePath = path.join('/tmp/dashboard-repo', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('function renderScreenshots')) {
            // Reemplazo simple basado en patrón similar
            content = content.replace(
                /<div style="[^"]*background:[^"]*height:[^"]*display:[^"]*">[^<]*📸 Screenshot[^<]*<\/div>/g,
                '<img src="${ss.path}" alt="${ss.app} - ${ss.name}" style="width:100%;height:150px;object-fit:cover;">'
            );
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file}`);
        }
    }
});