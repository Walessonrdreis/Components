<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'AgendamentoController.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    
    $controller = new AgendamentoController();
    $resultado = $controller->cadastrarAulas($dados);
    
    echo json_encode($resultado);
}
?> 