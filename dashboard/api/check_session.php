<?php
header('Content-Type: application/json');
require_once 'auth.php';
require_once 'config.php';

try {
    error_log('Iniciando verificação de sessão');
    
    // Valida o token JWT
    $user = validateJWT();
    error_log('Token validado com sucesso. Usuário: ' . $user['email']);
    
    // Remove a senha dos dados do usuário
    unset($user['password']);
    
    // Retorna os dados do usuário
    echo json_encode([
        'success' => true,
        'message' => 'Sessão válida',
        'data' => [
            'user' => $user
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro na verificação da sessão: ' . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}