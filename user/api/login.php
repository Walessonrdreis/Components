<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../usuarios.php';

try {
    error_log('=== Nova tentativa de login ===');
    error_log('Método da requisição: ' . $_SERVER['REQUEST_METHOD']);
    error_log('Headers recebidos: ' . print_r(getallheaders(), true));
    error_log('POST data: ' . print_r($_POST, true));
    error_log('Raw input: ' . file_get_contents('php://input'));

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido: ' . $_SERVER['REQUEST_METHOD']);
    }

    // Tentar pegar dados do POST
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    // Se não houver dados no POST, tentar pegar do input raw (para requests JSON)
    if (empty($email) || empty($senha)) {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $email = $input['email'] ?? '';
            $senha = $input['senha'] ?? '';
        }
    }

    error_log("Dados processados - Email: " . $email);

    if (empty($email) || empty($senha)) {
        throw new Exception('Email e senha são obrigatórios');
    }

    $usuarios = new Usuarios();
    $usuario = $usuarios->autenticar($email, $senha);

    if (!$usuario) {
        error_log("Falha na autenticação - Email: " . $email);
        throw new Exception('Email ou senha inválidos');
    }

    error_log("Login bem-sucedido - Email: " . $email . ", Tipo: " . $usuario['tipo_usuario']);

    session_start();
    $_SESSION['usuario'] = $usuario;

    echo json_encode(['success' => true, 'usuario' => $usuario]);
} catch (Exception $e) {
    error_log("Erro no login: " . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        'error' => true, 
        'message' => $e->getMessage(),
        'debug' => [
            'request_method' => $_SERVER['REQUEST_METHOD'],
            'headers' => getallheaders(),
            'post_data' => $_POST,
            'raw_input' => file_get_contents('php://input'),
            'error_details' => $e->getMessage()
        ]
    ]);
} 