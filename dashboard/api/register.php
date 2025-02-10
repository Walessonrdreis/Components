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

require_once 'config.php';
require_once 'auth.php';

try {
    error_log('Iniciando processo de registro');
    
    // Pega os dados do POST
    $input = file_get_contents('php://input');
    error_log('Dados recebidos: ' . $input);
    
    $data = json_decode($input, true);
    if (!$data) {
        throw new Exception('Dados inválidos');
    }
    
    // Valida os campos obrigatórios
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        throw new Exception('Nome, email e senha são obrigatórios');
    }
    
    // Valida o email
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('Email inválido');
    }
    
    // Valida o nome
    if (strlen($data['name']) < 3) {
        throw new Exception('O nome deve ter no mínimo 3 caracteres');
    }
    
    // Valida a senha
    if (strlen($data['password']) < 6) {
        throw new Exception('A senha deve ter no mínimo 6 caracteres');
    }
    
    // Conecta ao banco de dados
    $db = getConnection();
    
    // Verifica se o email já existe
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception('Email já cadastrado');
    }
    
    // Define o papel do usuário como 'user'
    $role = 'user';
    
    // Faz hash da senha
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insere o usuário
    $stmt = $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$data['name'], $email, $password, $role]);
    
    // Busca os dados do usuário inserido
    $userId = $db->lastInsertId();
    $stmt = $db->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Gera o token JWT
    $token = generateJWT($user);
    
    // Retorna sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Usuário registrado com sucesso',
        'data' => [
            'token' => $token,
            'user' => $user
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro no registro: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 