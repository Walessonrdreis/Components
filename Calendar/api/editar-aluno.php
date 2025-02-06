<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'AgendamentoController.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['aluno_id'])) {
    $dados = json_decode(file_get_contents('php://input'), true);
    $aluno_id = $_GET['aluno_id'];
    
    $controller = new AgendamentoController();
    $resultado = $controller->editarAluno($aluno_id, $dados);
    
    echo json_encode($resultado);
}
?> 