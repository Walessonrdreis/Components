<?php
header('Content-Type: application/json');
require_once '../usuarios.php';
session_start();

try {
    if (!isset($_SESSION['usuario'])) {
        throw new Exception('Usuário não está logado');
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    // Ler o corpo da requisição JSON
    $json = file_get_contents('php://input');
    $dados = json_decode($json, true);

    if (!isset($dados['id'])) {
        throw new Exception('ID do usuário não fornecido');
    }

    $usuarios = new Usuarios();
    $resultado = $usuarios->excluirUsuario($dados['id'], $_SESSION['usuario']);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
} 