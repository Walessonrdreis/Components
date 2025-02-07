<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database/Database.php';

try {
    // Verifica se o ID do aluno foi fornecido
    $alunoId = isset($_GET['aluno_id']) ? (int)$_GET['aluno_id'] : null;
    if (!$alunoId) {
        throw new Exception('ID do aluno não fornecido');
    }

    $database = new Database();
    $conn = $database->getConnection();
    $conn->beginTransaction();

    try {
        // Primeiro, exclui todas as aulas do aluno
        $stmt = $conn->prepare('DELETE FROM agendamentos WHERE aluno_id = :aluno_id');
        $stmt->execute([':aluno_id' => $alunoId]);

        // Depois, exclui o aluno
        $stmt = $conn->prepare('DELETE FROM alunos WHERE id = :aluno_id');
        $stmt->execute([':aluno_id' => $alunoId]);

        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Aluno excluído com sucesso'
        ]);

    } catch (Exception $e) {
        $conn->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 