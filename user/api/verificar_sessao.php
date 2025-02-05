<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['usuario'])) {
    echo json_encode([
        'logado' => true,
        'usuario' => $_SESSION['usuario']
    ]);
} else {
    echo json_encode([
        'logado' => false
    ]);
} 