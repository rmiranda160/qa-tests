<?php
/**
 * Configuración de SQLite para ContentoAI Waitlist
 */
define('DB_PATH', __DIR__ . '/../private/database.sqlite');
define('TABLE_WAITLIST', 'waitlist_emails');

// Headers para CORS (si es necesario)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Función para conectar a SQLite
function getDB() {
    try {
        $db = new SQLite3(DB_PATH);
        $db->enableExceptions(true);
        return $db;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión a la base de datos']);
        exit;
    }
}

// Función para inicializar la tabla si no existe
function initDB() {
    $db = getDB();
    // Tabla de lista de espera
    $query = "CREATE TABLE IF NOT EXISTS " . TABLE_WAITLIST . " (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        plan TEXT NOT NULL,
        fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip TEXT,
        user_agent TEXT
    )";
    $db->exec($query);
    
    // Tabla para rate limiting (intentos por IP)
    $query = "CREATE TABLE IF NOT EXISTS rate_limit (
        ip TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        count INTEGER DEFAULT 1
    )";
    $db->exec($query);
    
    // Índice para búsquedas rápidas
    $db->exec("CREATE INDEX IF NOT EXISTS idx_ip ON rate_limit (ip)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_timestamp ON rate_limit (timestamp)");
    
    // Limpiar registros antiguos (más de 1 hora)
    $db->exec("DELETE FROM rate_limit WHERE timestamp < " . (time() - 3600));
    
    $db->close();
}

// Función para verificar rate limit (máximo 5 intentos por IP en 1 minuto)
function checkRateLimit($ip) {
    $db = getDB();
    $now = time();
    $window = 60; // 1 minuto en segundos
    $max_attempts = 5;
    
    // Eliminar intentos fuera de la ventana
    $db->exec("DELETE FROM rate_limit WHERE timestamp < " . ($now - $window));
    
    // Contar intentos recientes de esta IP
    $stmt = $db->prepare("SELECT SUM(count) as total FROM rate_limit WHERE ip = :ip");
    $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $total = $row['total'] ?? 0;
    
    if ($total >= $max_attempts) {
        $db->close();
        return false;
    }
    
    // Registrar nuevo intento
    $stmt = $db->prepare("INSERT INTO rate_limit (ip, timestamp, count) VALUES (:ip, :timestamp, 1)");
    $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
    $stmt->bindValue(':timestamp', $now, SQLITE3_INTEGER);
    $stmt->execute();
    
    $db->close();
    return true;
}
?>