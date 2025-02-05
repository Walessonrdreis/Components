<?php
header('Content-Type: application/json');
require_once '../usuarios.php';

try {
    // Log dos dados recebidos
    error_log("Dados recebidos: " . print_r($_POST, true));
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido: ' . $_SERVER['REQUEST_METHOD']);
    }

    $nome = $_POST['nome'] ?? null;
    $email = $_POST['email'] ?? null;
    $senha = $_POST['senha'] ?? null;
    $telefone = $_POST['telefone'] ?? null;

    // Log dos dados processados
    error_log("Dados processados - Nome: $nome, Email: $email, Telefone: $telefone");

    if (empty($nome)) {
        throw new Exception('Nome é obrigatório');
    }
    if (empty($email)) {
        throw new Exception('Email é obrigatório');
    }
    if (empty($senha)) {
        throw new Exception('Senha é obrigatória');
    }

    $usuarios = new Usuarios();
    $resultado = $usuarios->adicionarUsuario($nome, $email, $senha, $telefone);

    if (!$resultado) {
        throw new Exception('Erro ao cadastrar usuário');
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log("Erro no cadastro: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'error' => true, 
        'message' => $e->getMessage(),
        'post_data' => $_POST
    ]);
}
?> 