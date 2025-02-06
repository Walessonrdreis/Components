<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'AgendamentoController.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    
    if (isset($dados['nome'])) {
        $controller = new AgendamentoController();
        $resultado = $controller->adicionarDisciplina($dados['nome']);
        
        echo json_encode($resultado);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Nome da disciplina não fornecido'
        ]);
    }
}
?> 