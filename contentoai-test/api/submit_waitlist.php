<?php
require_once 'config.php';

// Inicializar BD si no existe
initDB();

header('Content-Type: application/json');

// Validar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener datos JSON o form-data
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    // Si no es JSON, asumir form-data
    $input = $_POST;
}

$nombre = trim($input['nombre'] ?? '');
$email = trim($input['email'] ?? '');
$plan = trim($input['plan'] ?? '');

// Validaciones básicas
if (empty($nombre) || empty($email) || empty($plan)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos obligatorios']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

// Sanitizar (eliminar etiquetas HTML y espacios extra)
$nombre = trim(strip_tags($nombre));
$plan = trim(strip_tags($plan));
$email = strtolower(trim($email));

// Validar longitud
if (strlen($nombre) > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre demasiado largo (máx. 100 caracteres)']);
    exit;
}
if (strlen($email) > 255) {
    http_response_code(400);
    echo json_encode(['error' => 'Email demasiado largo']);
    exit;
}
if (strlen($plan) > 50) {
    http_response_code(400);
    echo json_encode(['error' => 'Plan demasiado largo']);
    exit;
}

// Validar plan
$planes_permitidos = ['basic', 'professional', 'enterprise'];
if (!in_array($plan, $planes_permitidos)) {
    http_response_code(400);
    echo json_encode(['error' => 'Plan no válido']);
    exit;
}

// Obtener IP y User-Agent (limpiar)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
$ip = filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'IP inválida';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'desconocido';
$user_agent = substr(trim($user_agent), 0, 500); // limitar longitud

// Rate limiting (solo después de validaciones correctas)
if (!checkRateLimit($ip)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.']);
    exit;
}

try {
    $db = getDB();
    
    // Insertar (ignore duplicados por UNIQUE constraint)
    $stmt = $db->prepare("INSERT INTO " . TABLE_WAITLIST . " (nombre, email, plan, ip, user_agent) VALUES (:nombre, :email, :plan, :ip, :user_agent)");
    $stmt->bindValue(':nombre', $nombre, SQLITE3_TEXT);
    $stmt->bindValue(':email', $email, SQLITE3_TEXT);
    $stmt->bindValue(':plan', $plan, SQLITE3_TEXT);
    $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
    $stmt->bindValue(':user_agent', $user_agent, SQLITE3_TEXT);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Te has unido a la lista de espera correctamente.']);
    } else {
        throw new Exception('Error al insertar');
    }
    
    $db->close();
} catch (Exception $e) {
    // Verificar si es violación de UNIQUE
    if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
        http_response_code(409);
        echo json_encode(['error' => 'Este email ya está registrado en la lista de espera.']);
    } else {
        http_response_code(500);
        error_log("Error en submit_waitlist: " . $e->getMessage());
        echo json_encode(['error' => 'Error interno del servidor']);
    }
}
?>