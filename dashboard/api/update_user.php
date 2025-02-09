<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log('Requisição de atualização de usuário recebida');

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

    // Recebe os dados do POST
    $input = file_get_contents('php://input');
    error_log('Dados recebidos: ' . $input);
    $data = json_decode($input, true);

    if (!$data || !isset($data['id'])) {
        error_log('Dados inválidos');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Dados inválidos'
        ]);
        exit;
    }

    // Conexão com o banco de dados
    require_once 'db_connection.php';

    // Prepara a query de atualização
    $updates = [];
    $params = [];
    $types = '';

    if (isset($data['name']) && !empty($data['name'])) {
        $updates[] = 'name = ?';
        $params[] = $data['name'];
        $types .= 's';
    }

    if (isset($data['email']) && !empty($data['email'])) {
        $updates[] = 'email = ?';
        $params[] = $data['email'];
        $types .= 's';
    }

    if (isset($data['password']) && !empty($data['password'])) {
        $updates[] = 'password = ?';
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        $types .= 's';
    }

    if (isset($data['role'])) {
        $updates[] = 'role = ?';
        $params[] = $data['role'];
        $types .= 's';
    }

    if (isset($data['status'])) {
        $updates[] = 'status = ?';
        $params[] = $data['status'];
        $types .= 's';
    }

    if (empty($updates)) {
        error_log('Nenhum dado para atualizar');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Nenhum dado para atualizar'
        ]);
        exit;
    }

    // Adiciona o ID no final dos parâmetros
    $params[] = $data['id'];
    $types .= 'i';

    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception("Erro ao atualizar usuário: " . $conn->error);
    }

    if ($stmt->affected_rows === 0) {
        error_log('Nenhum usuário atualizado');
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Usuário não encontrado'
        ]);
        exit;
    }

    // Busca os dados atualizados do usuário
    $stmt = $conn->prepare('SELECT id, name, email, role, status, last_login FROM users WHERE id = ?');
    $stmt->bind_param('i', $data['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'message' => 'Usuário atualizado com sucesso',
        'data' => $user
    ]);

} catch (Exception $e) {
    error_log('Erro ao atualizar usuário: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao atualizar usuário: ' . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
} 