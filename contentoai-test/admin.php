<?php
/**
 * Panel de administración básico para ContentoAI
 * Ver lista de espera y estadísticas.
 */

require_once 'api/config.php';

// Configuración de autenticación
define('ADMIN_TOKEN', 'contentoai_admin_token_2024'); // Cambiar en producción
$token = $_GET['token'] ?? '';

if ($token !== ADMIN_TOKEN) {
    header('HTTP/1.0 401 Unauthorized');
    echo '<h1>Acceso no autorizado</h1>';
    echo '<p>Se requiere token válido.</p>';
    echo '<p>Ejemplo: admin.php?token=contentoai_admin_token_2024</p>';
    exit;
}

// Conexión a la base de datos
try {
    $db = getDB();
} catch (Exception $e) {
    die('Error al conectar con la base de datos: ' . $e->getMessage());
}

// Obtener estadísticas
$total_query = $db->querySingle("SELECT COUNT(*) FROM " . TABLE_WAITLIST);
$por_plan_query = $db->query("SELECT plan, COUNT(*) as cantidad FROM " . TABLE_WAITLIST . " GROUP BY plan ORDER BY cantidad DESC");
$planes = [];
while ($row = $por_plan_query->fetchArray(SQLITE3_ASSOC)) {
    $planes[] = $row;
}

// Obtener lista de emails (paginación simple)
$pagina = intval($_GET['pagina'] ?? 1);
$por_pagina = 50;
$offset = ($pagina - 1) * $por_pagina;

$stmt = $db->prepare("SELECT id, nombre, email, plan, fecha_inscripcion, ip, user_agent FROM " . TABLE_WAITLIST . " ORDER BY fecha_inscripcion DESC LIMIT :limit OFFSET :offset");
$stmt->bindValue(':limit', $por_pagina, SQLITE3_INTEGER);
$stmt->bindValue(':offset', $offset, SQLITE3_INTEGER);
$result = $stmt->execute();

$registros = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $registros[] = $row;
}

// Datos para gráfico de inscripciones por día (últimos 30 días)
$chart_query = $db->query("SELECT substr(fecha_inscripcion, 1, 10) as dia, COUNT(*) as cantidad FROM " . TABLE_WAITLIST . " GROUP BY dia ORDER BY dia DESC LIMIT 30");
$datos_diarios = [];
while ($row = $chart_query->fetchArray(SQLITE3_ASSOC)) {
    $datos_diarios[$row['dia']] = $row['cantidad'];
}

// Preparar arrays para Chart.js (últimos 30 días calendario)
$fechas = [];
$cantidades = [];
for ($i = 29; $i >= 0; $i--) {
    $fecha = date('Y-m-d', strtotime("-$i days"));
    $fechas[] = $fecha;
    $cantidades[] = $datos_diarios[$fecha] ?? 0;
}

$db->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin ContentoAI - Lista de espera</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #333; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        header { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .subtitle { font-size: 1.1rem; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .stat-card h3 { color: #6a11cb; font-size: 1.8rem; margin-bottom: 0.5rem; }
        .stat-card p { color: #666; }
        .plan-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
        .badge { background: #eef4ff; color: #2575fc; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.9rem; }
        table { width: 100%; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-collapse: collapse; }
        thead { background: #6a11cb; color: white; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
        tbody tr:hover { background: #f9f9ff; }
        .email { font-family: monospace; color: #2575fc; }
        .pagination { margin-top: 2rem; display: flex; justify-content: center; gap: 0.5rem; }
        .pagination a { display: inline-block; padding: 0.5rem 1rem; background: white; border-radius: 5px; text-decoration: none; color: #6a11cb; border: 1px solid #ddd; }
        .pagination a:hover { background: #6a11cb; color: white; }
        .pagination .active { background: #6a11cb; color: white; }
        .export { margin-top: 1rem; }
        .export a { display: inline-block; padding: 0.7rem 1.5rem; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
        .export a:hover { background: #218838; }
        .token-warning { background: #fff3cd; color: #856404; padding: 1rem; border-radius: 5px; margin-bottom: 1rem; border: 1px solid #ffeaa7; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-robot"></i> Admin ContentoAI</h1>
            <p class="subtitle">Panel de administración de la lista de espera</p>
        </header>

        <div class="token-warning">
            <i class="fas fa-exclamation-triangle"></i> <strong>ADVERTENCIA:</strong> Este panel está protegido únicamente por token de URL. En producción, implementar autenticación robusta (HTTPS, contraseña segura).
        </div>

        <section class="stats">
            <div class="stat-card">
                <h3><?= $total_query ?></h3>
                <p>Total de inscripciones</p>
            </div>
            <div class="stat-card">
                <h3><?= count($planes) ?></h3>
                <p>Planes distintos</p>
                <div class="plan-badges">
                    <?php foreach ($planes as $p): ?>
                        <span class="badge"><?= htmlspecialchars($p['plan']) ?>: <?= $p['cantidad'] ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
            <div class="stat-card">
                <h3><?= $por_pagina ?></h3>
                <p>Registros por página</p>
            </div>
        </section>

        <section class="export">
            <a href="admin.php?token=<?= urlencode($token) ?>&export=csv"><i class="fas fa-file-csv"></i> Exportar a CSV</a>
            <a href="admin.php?token=<?= urlencode($token) ?>&export=json" style="margin-left: 10px; background: #17a2b8;"><i class="fas fa-file-code"></i> Exportar a JSON</a>
        </section>

        <section class="tabla">
            <h2><i class="fas fa-list"></i> Lista de espera</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Plan</th>
                        <th>Fecha inscripción</th>
                        <th>IP</th>
                        <th>User Agent</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($registros as $r): ?>
                    <tr>
                        <td><?= htmlspecialchars($r['id']) ?></td>
                        <td><?= htmlspecialchars($r['nombre']) ?></td>
                        <td class="email"><?= htmlspecialchars($r['email']) ?></td>
                        <td><span class="badge"><?= htmlspecialchars($r['plan']) ?></span></td>
                        <td><?= htmlspecialchars($r['fecha_inscripcion']) ?></td>
                        <td><?= htmlspecialchars($r['ip']) ?></td>
                        <td title="<?= htmlspecialchars($r['user_agent']) ?>"><?= htmlspecialchars(substr($r['user_agent'], 0, 50)) ?>...</td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <div class="pagination">
                <?php if ($pagina > 1): ?>
                    <a href="admin.php?token=<?= urlencode($token) ?>&pagina=<?= $pagina - 1 ?>">Anterior</a>
                <?php endif; ?>
                <a href="admin.php?token=<?= urlencode($token) ?>&pagina=<?= $pagina ?>" class="active"><?= $pagina ?></a>
                <?php if (count($registros) == $por_pagina): ?>
                    <a href="admin.php?token=<?= urlencode($token) ?>&pagina=<?= $pagina + 1 ?>">Siguiente</a>
                <?php endif; ?>
            </div>
        </section>

        <footer style="margin-top: 3rem; text-align: center; color: #888; font-size: 0.9rem;">
            <p>ContentoAI Admin &copy; <?= date('Y') ?> | <?= $total_query ?> inscripciones totales</p>
        </footer>
    </div>

    <?php
    // Exportación de datos
    if (isset($_GET['export'])) {
        $export_type = $_GET['export'];
        if ($export_type === 'csv') {
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="contentoai_waitlist_' . date('Y-m-d') . '.csv"');
            $output = fopen('php://output', 'w');
            fputcsv($output, ['ID', 'Nombre', 'Email', 'Plan', 'Fecha inscripción', 'IP', 'User Agent']);
            $db = getDB();
            $stmt = $db->prepare("SELECT id, nombre, email, plan, fecha_inscripcion, ip, user_agent FROM " . TABLE_WAITLIST . " ORDER BY fecha_inscripcion");
            $result = $stmt->execute();
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                fputcsv($output, $row);
            }
            $db->close();
            exit;
        } elseif ($export_type === 'json') {
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="contentoai_waitlist_' . date('Y-m-d') . '.json"');
            $db = getDB();
            $stmt = $db->prepare("SELECT id, nombre, email, plan, fecha_inscripcion, ip, user_agent FROM " . TABLE_WAITLIST . " ORDER BY fecha_inscripcion");
            $result = $stmt->execute();
            $data = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $data[] = $row;
            }
            $db->close();
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    ?>
</body>
</html>