<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "components_db";

// Cria a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Falha na conexão com o banco de dados: ' . $conn->connect_error
    ]));
}

// Define o charset para utf8
$conn->set_charset("utf8");
