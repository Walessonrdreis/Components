<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log('Verificando token...');

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

// Decodifica o token
try {
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

    // Token válido
    echo json_encode([
        'success' => true,
        'message' => 'Token válido',
        'data' => [
            'user_id' => $payload['user_id'],
            'email' => $payload['email'],
            'role' => $payload['role'],
            'exp' => $payload['exp']
        ]
    ]);

} catch (Exception $e) {
    error_log('Erro ao processar token: ' . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Token inválido'
    ]);
} 