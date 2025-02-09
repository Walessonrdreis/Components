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
    error_log('Iniciando processo de login');
    
    // Pega os dados do POST
    $input = file_get_contents('php://input');
    error_log('Dados recebidos: ' . $input);
    
    $data = json_decode($input, true);
    if (!$data) {
        throw new Exception('Dados inválidos');
    }
    
    // Valida os campos obrigatórios
    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception('Email e senha são obrigatórios');
    }
    
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('Email inválido');
    }
    
    error_log('Email validado: ' . $email);
    
    // Conecta ao banco de dados
    $db = getConnection();
    error_log('Conexão com o banco estabelecida');
    
    // Busca o usuário
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ? AND status = "active"');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        error_log('Usuário não encontrado: ' . $email);
        throw new Exception('Usuário não encontrado ou inativo');
    }
    
    error_log('Usuário encontrado, verificando senha');
    
    // Verifica a senha
    if (!password_verify($data['password'], $user['password'])) {
        error_log('Senha incorreta para o usuário: ' . $email);
        throw new Exception('Senha incorreta');
    }
    
    error_log('Senha verificada com sucesso');
    
    // Gera o token JWT
    $token = generateJWT($user);
    error_log('Token gerado: ' . $token);
    
    // Atualiza último login
    $stmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);
    error_log('Último login atualizado');
    
    // Remove a senha dos dados do usuário
    unset($user['password']);
    
    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'data' => [
            'token' => $token,
            'user' => $user
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro no login: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
