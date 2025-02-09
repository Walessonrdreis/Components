<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log('Requisição de exclusão de usuário recebida');

// Verifica o token
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    error_log('Token não encontrado no header');
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Token não fornecido'
    ]);
    exit;
}

$token = $matches[1];
error_log('Token recebido: ' . $token);

try {
    // Decodifica o token
    $payload = json_decode(base64_decode($token), true);
    error_log('Payload do token: ' . json_encode($payload));

    // Verifica se o token expirou
    if (!isset($payload['exp']) || $payload['exp'] < time()) {
        error_log('Token expirado');
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Token expirado'
        ]);
        exit;
    }

    // Verifica se é admin
    if (!isset($payload['role']) || $payload['role'] !== 'admin') {
        error_log('Usuário não é admin');
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Acesso negado'
        ]);
        exit;
    }

    // Recebe os dados do DELETE
    $input = file_get_contents('php://input');
    error_log('Dados recebidos: ' . $input);
    $data = json_decode($input, true);

    if (!$data || !isset($data['id'])) {
        error_log('ID do usuário não fornecido');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID do usuário não fornecido'
        ]);
        exit;
    }

    // Conexão com o banco de dados
    require_once 'db_connection.php';

    // Verifica se o usuário existe
    $stmt = $conn->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->bind_param('i', $data['id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        error_log('Usuário não encontrado');
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Usuário não encontrado'
        ]);
        exit;
    }

    // Deleta o usuário
    $stmt = $conn->prepare('DELETE FROM users WHERE id = ?');
    $stmt->bind_param('i', $data['id']);

    if (!$stmt->execute()) {
        throw new Exception("Erro ao deletar usuário: " . $conn->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Usuário deletado com sucesso'
    ]);

} catch (Exception $e) {
    error_log('Erro ao deletar usuário: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao deletar usuário: ' . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
} 