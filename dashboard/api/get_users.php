<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log('Requisição de listagem de usuários recebida');

// Verifica o token
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    error_log('Token não encontrado no header');
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Token não fornecido'
    ]);
    exit;
}

$token = $matches[1];
error_log('Token recebido: ' . $token);

try {
    // Decodifica o token
    $payload = json_decode(base64_decode($token), true);
    error_log('Payload do token: ' . json_encode($payload));

    // Verifica se o token expirou
    if (!isset($payload['exp']) || $payload['exp'] < time()) {
        error_log('Token expirado');
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Token expirado'
        ]);
        exit;
    }

    // Verifica se é admin
    if (!isset($payload['role']) || $payload['role'] !== 'admin') {
        error_log('Usuário não é admin');
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Acesso negado'
        ]);
        exit;
    }

    // Conexão com o banco de dados
    require_once 'db_connection.php';

    // Prepara a query para buscar todos os usuários
    $sql = 'SELECT id, name, email, role, status, last_login FROM users ORDER BY name';
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Erro ao buscar usuários: " . $conn->error);
    }

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);

} catch (Exception $e) {
    error_log('Erro ao listar usuários: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar usuários: ' . $e->getMessage()
    ]);
} finally {
    if (isset($result)) {
        $result->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
} 