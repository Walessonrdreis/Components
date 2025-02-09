<?php
require_once 'config.php';
require_once 'auth.php';

// Configura os headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Se for uma requisição OPTIONS, retorna os headers e encerra
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Verifica se é uma requisição POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    // Verifica o token JWT
    $user = validateJWT();
    
    if (!$user) {
        throw new Exception('Sessão inválida');
    }
    
    // Atualiza o último acesso do usuário
    $db = getConnection();
    $stmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);
    
    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Logout realizado com sucesso'
    ]);
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 