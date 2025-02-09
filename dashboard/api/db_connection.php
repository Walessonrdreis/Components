<?php
// Configurações do banco de dados
$db_host = 'localhost';
$db_name = 'dashboard';
$db_user = 'root';
$db_pass = '';

try {
    // Cria a conexão com o banco de dados
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

    // Verifica se houve erro na conexão
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco de dados: " . $conn->connect_error);
    }

    // Define o charset para utf8
    $conn->set_charset("utf8");

    // Configura o timezone
    date_default_timezone_set('America/Sao_Paulo');

} catch (Exception $e) {
    error_log("Erro na conexão com o banco de dados: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
    exit;
} 