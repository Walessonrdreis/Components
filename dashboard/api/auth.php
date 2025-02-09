<?php
require_once 'config.php';

// Chave secreta para o JWT
define('JWT_SECRET', 'sua_chave_secreta_muito_segura_2024');

// Função para validar o token JWT
function validateJWT() {
    error_log('Iniciando validação do token JWT');
    
    // Pega o token do header
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        error_log('Token não encontrado no header');
        throw new Exception('Token não fornecido');
    }

    $token = $matches[1];
    error_log('Token recebido: ' . $token);
    
    try {
        // Decodifica o token
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception('Token inválido');
        }

        $header = json_decode(base64_decode($parts[0]), true);
        $payload = json_decode(base64_decode($parts[1]), true);
        $signature = $parts[2];

        // Verifica a assinatura
        $valid_signature = base64_encode(hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET, true));
        if ($signature !== $valid_signature) {
            error_log('Assinatura do token inválida');
            throw new Exception('Token inválido');
        }

        error_log('Payload decodificado: ' . print_r($payload, true));
        
        // Verifica se o token expirou
        if (!isset($payload['exp']) || $payload['exp'] < time()) {
            error_log('Token expirado. Expira em: ' . date('Y-m-d H:i:s', $payload['exp']));
            throw new Exception('Token expirado');
        }
        
        // Verifica se o usuário existe no banco
        $db = getConnection();
        $stmt = $db->prepare('SELECT * FROM users WHERE id = ? AND email = ? AND status = "active"');
        $stmt->execute([$payload['user_id'], $payload['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            error_log('Usuário não encontrado ou inativo');
            throw new Exception('Usuário não encontrado ou inativo');
        }
        
        error_log('Token validado com sucesso');
        return $user;
        
    } catch (Exception $e) {
        error_log('Erro na validação do token: ' . $e->getMessage());
        throw new Exception('Token inválido: ' . $e->getMessage());
    }
}

// Função para gerar o token JWT
function generateJWT($user) {
    error_log('Gerando token JWT para usuário: ' . $user['email']);
    
    // Define o header
    $header = [
        'typ' => 'JWT',
        'alg' => 'HS256'
    ];
    
    // Define o payload
    $payload = [
        'user_id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24) // 24 horas
    ];
    
    error_log('Payload do token: ' . print_r($payload, true));
    
    // Codifica header e payload
    $base64Header = base64_encode(json_encode($header));
    $base64Payload = base64_encode(json_encode($payload));
    
    // Gera a assinatura
    $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, JWT_SECRET, true);
    $base64Signature = base64_encode($signature);
    
    // Monta o token
    $token = $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    
    error_log('Token gerado com sucesso');
    return $token;
}

// Função para verificar se o usuário tem permissão de admin
function requireAdmin() {
    $user = validateJWT();
    
    if ($user['role'] !== 'admin') {
        throw new Exception('Acesso negado');
    }
    
    return $user;
}

// Função para fazer hash da senha
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Função para verificar a senha
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Função para validar email
function validateEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }
    return $email;
}

// Função para validar senha
function validatePassword($password) {
    if (strlen($password) < 6) {
        throw new Exception('A senha deve ter no mínimo 6 caracteres');
    }
    return $password;
}

// Função para validar nome
function validateName($name) {
    if (strlen($name) < 3) {
        throw new Exception('O nome deve ter no mínimo 3 caracteres');
    }
    return $name;
}

// Função para validar role
function validateRole($role) {
    $valid_roles = ['admin', 'user'];
    if (!in_array($role, $valid_roles)) {
        throw new Exception('Tipo de usuário inválido');
    }
    return $role;
}

// Função para validar status
function validateStatus($status) {
    $valid_status = ['active', 'inactive'];
    if (!in_array($status, $valid_status)) {
        throw new Exception('Status inválido');
    }
    return $status;
} 