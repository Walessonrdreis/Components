<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'AgendamentoController.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controller = new AgendamentoController();
    $alunos = $controller->listarAlunos();
    
    echo json_encode($alunos);
}
?> 