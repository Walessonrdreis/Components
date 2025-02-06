<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'AgendamentoController.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['aluno_id'])) {
    $controller = new AgendamentoController();
    $resultado = $controller->buscarAulasAluno($_GET['aluno_id']);
    
    echo json_encode($resultado);
}
?> 