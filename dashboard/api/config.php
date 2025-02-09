<?php
// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'dashboard');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Função para conectar ao banco de dados
function getConnection() {
    try {
        error_log('Tentando conectar ao banco de dados...');
        error_log('Host: ' . DB_HOST);
        error_log('Database: ' . DB_NAME);
        error_log('User: ' . DB_USER);
        
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        error_log('Conexão estabelecida com sucesso');
        return $pdo;
        
    } catch (PDOException $e) {
        error_log('Erro de conexão: ' . $e->getMessage());
        throw new Exception("Erro de conexão com o banco de dados: " . $e->getMessage());
    }
}

// Função para tratar erros
function handleError($e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
    exit();
}

// Função para validar dados
function validateData($data, $required = []) {
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("O campo '$field' é obrigatório");
        }
    }
    return $data;
}

// Função para sanitizar dados
function sanitizeData($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = sanitizeData($value);
        }
    } else {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    return $data;
}

// Função para formatar resposta
function formatResponse($success = true, $message = '', $data = null) {
    return [
        'success' => $success,
        'message' => $message,
        'data' => $data
    ];
}

// Função para verificar se é uma requisição AJAX
function isAjaxRequest() {
    return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
}

// Função para verificar o método da requisição
function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

// Função para obter os dados da requisição
function getRequestData() {
    $method = getRequestMethod();
    $data = [];
    
    switch ($method) {
        case 'GET':
            $data = $_GET;
            break;
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $data = $_POST;
            }
            break;
        case 'PUT':
        case 'DELETE':
            parse_str(file_get_contents('php://input'), $data);
            break;
    }
    
    return sanitizeData($data);
} 