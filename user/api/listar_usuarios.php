<?php
header('Content-Type: application/json');
require_once '../usuarios.php';

try {
    $usuarios = new Usuarios();
    $lista = $usuarios->listarUsuarios();
    echo json_encode($lista);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
}
?> 