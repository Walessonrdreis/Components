<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'AgendamentoController.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controller = new AgendamentoController();
    $alunos = $controller->listarAlunos();
    
    error_log('Resposta da API listar-alunos: ' . print_r($alunos, true));
    
    echo json_encode($alunos);
}
?> 