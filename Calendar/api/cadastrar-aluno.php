<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database/Database.php';

try {
    // Recebe os dados do POST
    $dados = json_decode(file_get_contents('php://input'), true);
    
    if (!$dados) {
        throw new Exception('Dados inválidos');
    }

    // Valida os campos obrigatórios
    if (empty($dados['nome']) || empty($dados['email'])) {
        throw new Exception('Nome e email são obrigatórios');
    }

    $database = new Database();
    $conn = $database->getConnection();
    $conn->beginTransaction();

    // Insere o aluno
    $stmt = $conn->prepare('INSERT INTO alunos (nome, email) VALUES (?, ?)');
    $stmt->execute([$dados['nome'], $dados['email']]);
    $alunoId = $conn->lastInsertId();

    // Se tiver disciplina, busca o ID dela
    $disciplinaId = null;
    if (!empty($dados['disciplina'])) {
        $stmt = $conn->prepare('SELECT id FROM disciplinas WHERE nome = ?');
        $stmt->execute([$dados['disciplina']]);
        $disciplina = $stmt->fetch();
        if ($disciplina) {
            $disciplinaId = $disciplina['id'];
        }
    }

    // Insere os agendamentos se houver
    if (!empty($dados['aulas'])) {
        $stmt = $conn->prepare('INSERT INTO agendamentos (aluno_id, disciplina_id, data_aula, horario, status) VALUES (?, ?, ?, ?, "agendado")');
        foreach ($dados['aulas'] as $aula) {
            $stmt->execute([$alunoId, $disciplinaId, $aula['data'], $aula['horario']]);
        }
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Aluno cadastrado com sucesso',
        'aluno_id' => $alunoId
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 