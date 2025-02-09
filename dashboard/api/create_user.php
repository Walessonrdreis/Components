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

error_log('Requisição de criação de usuário recebida');

// Recebe os dados do POST
$input = file_get_contents('php://input');
error_log('Dados recebidos: ' . $input);
$data = json_decode($input, true);

if (!$data || !isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
    error_log('Dados inválidos');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dados inválidos'
    ]);
    exit;
}

// Para teste, vamos criar o usuário sem banco de dados
$user = [
    'id' => rand(1000, 9999),
    'name' => $data['name'],
    'email' => $data['email'],
    'role' => 'user'
];

// Gera um token simples
$token = base64_encode(json_encode([
    'user_id' => $user['id'],
    'email' => $user['email'],
    'role' => $user['role'],
    'exp' => time() + 3600
]));

$response = [
    'success' => true,
    'message' => 'Usuário criado com sucesso',
    'data' => [
        'token' => $token,
        'user' => $user
    ]
];

error_log('Resposta de sucesso: ' . json_encode($response));
echo json_encode($response);
