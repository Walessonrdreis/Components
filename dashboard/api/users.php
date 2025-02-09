<?php
require_once 'config.php';
require_once 'auth.php';

// Configura os headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Se for uma requisição OPTIONS, retorna os headers e encerra
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $db = getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Verifica se é admin
            $user = requireAdmin();
            
            // Busca todos os usuários
            $stmt = $db->query('SELECT id, name, email, role, status, created_at, last_login FROM users ORDER BY created_at DESC');
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuários encontrados com sucesso',
                'data' => $users
            ]);
            break;
            
        case 'POST':
            // Verifica se é admin
            $user = requireAdmin();
            
            // Pega os dados do corpo da requisição
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Valida os dados
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['role'])) {
                throw new Exception('Dados inválidos');
            }
            
            // Valida os campos
            $name = validateName($data['name']);
            $email = validateEmail($data['email']);
            $password = validatePassword($data['password']);
            $role = validateRole($data['role']);
            
            // Verifica se o email já existe
            $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                throw new Exception('Email já cadastrado');
            }
            
            // Insere o usuário
            $stmt = $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
            $stmt->execute([$name, $email, hashPassword($password), $role]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuário criado com sucesso',
                'data' => [
                    'id' => $db->lastInsertId(),
                    'name' => $name,
                    'email' => $email,
                    'role' => $role
                ]
            ]);
            break;
            
        case 'PUT':
            // Verifica se é admin
            $user = requireAdmin();
            
            // Pega o ID do usuário
            if (!isset($_GET['id'])) {
                throw new Exception('ID não fornecido');
            }
            $id = (int) $_GET['id'];
            
            // Pega os dados do corpo da requisição
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Prepara os campos para atualização
            $fields = [];
            $values = [];
            
            if (isset($data['name'])) {
                $fields[] = 'name = ?';
                $values[] = validateName($data['name']);
            }
            
            if (isset($data['email'])) {
                // Verifica se o email já existe para outro usuário
                $stmt = $db->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
                $stmt->execute([$data['email'], $id]);
                if ($stmt->fetch()) {
                    throw new Exception('Email já cadastrado para outro usuário');
                }
                
                $fields[] = 'email = ?';
                $values[] = validateEmail($data['email']);
            }
            
            if (isset($data['password'])) {
                $fields[] = 'password = ?';
                $values[] = hashPassword(validatePassword($data['password']));
            }
            
            if (isset($data['role'])) {
                $fields[] = 'role = ?';
                $values[] = validateRole($data['role']);
            }
            
            if (isset($data['status'])) {
                $fields[] = 'status = ?';
                $values[] = validateStatus($data['status']);
            }
            
            if (empty($fields)) {
                throw new Exception('Nenhum campo para atualizar');
            }
            
            // Adiciona o ID no final do array de valores
            $values[] = $id;
            
            // Atualiza o usuário
            $stmt = $db->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('Usuário não encontrado');
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuário atualizado com sucesso'
            ]);
            break;
            
        case 'DELETE':
            // Verifica se é admin
            $user = requireAdmin();
            
            // Pega o ID do usuário
            if (!isset($_GET['id'])) {
                throw new Exception('ID não fornecido');
            }
            $id = (int) $_GET['id'];
            
            // Verifica se não está tentando deletar o próprio usuário
            if ($id === $user['id']) {
                throw new Exception('Não é possível deletar o próprio usuário');
            }
            
            // Deleta o usuário
            $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('Usuário não encontrado');
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuário deletado com sucesso'
            ]);
            break;
            
        default:
            throw new Exception('Método não permitido');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
