<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database/Database.php';

try {
    // Recebe e decodifica os dados do POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Dados inválidos');
    }

    // Sanitiza e valida os campos obrigatórios
    $nome = trim($input['nome'] ?? '');
    $email = trim($input['email'] ?? '');
    if (empty($nome) || empty($email)) {
        throw new Exception('Nome e email são obrigatórios');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
         throw new Exception('Email inválido');
    }

    // Opcional: disciplina
    $disciplinaNome = !empty($input['disciplina']) ? trim($input['disciplina']) : null;

    $database = new Database();
    $conn = $database->getConnection();
    $conn->beginTransaction();

    try {
        // Verifica se o aluno já existe usando uma consulta única
        $stmt = $conn->prepare('INSERT INTO alunos (nome, email) 
            SELECT :nome, :email 
            WHERE NOT EXISTS (
                SELECT 1 FROM alunos 
                WHERE LOWER(nome) = LOWER(:nome) 
                AND LOWER(email) = LOWER(:email)
            )');
        
        $stmt->execute([
            ':nome'  => $nome,
            ':email' => $email
        ]);

        if ($stmt->rowCount() === 0) {
            // Se nenhuma linha foi inserida, significa que o aluno já existe
            throw new Exception('Aluno já cadastrado com o mesmo nome e email.');
        }

        $alunoId = $conn->lastInsertId();
        $maxAttempts = 10;
        do {
            $matricula = mt_rand(1000, 9999);
            $stmtCheck = $conn->prepare("SELECT id FROM alunos WHERE matricula = :matricula");
            $stmtCheck->execute([':matricula' => $matricula]);
            $existe = $stmtCheck->fetch();
            $maxAttempts--;
        } while ($existe && $maxAttempts > 0);

        if ($existe) {
            throw new Exception("Não foi possível gerar uma matrícula única. Tente novamente.");
        }

        $stmtUpdate = $conn->prepare("UPDATE alunos SET matricula = :matricula WHERE id = :id");
        $stmtUpdate->execute([
            ':matricula' => $matricula,
            ':id' => $alunoId
        ]);

        // Se a disciplina for informada, busca seu ID
        $disciplinaId = null;
        if (!is_null($disciplinaNome)) {
            $stmt = $conn->prepare('SELECT id FROM disciplinas WHERE nome = :nome');
            $stmt->execute([':nome' => $disciplinaNome]);
            $disciplina = $stmt->fetch();
            if ($disciplina) {
                $disciplinaId = $disciplina['id'];
            }
        }

        // Insere os agendamentos (aulas) se existirem
        if (!empty($input['aulas']) && is_array($input['aulas'])) {
            $stmtAula = $conn->prepare('INSERT INTO agendamentos (aluno_id, disciplina_id, data_aula, horario, status) VALUES (:aluno_id, :disciplina_id, :data_aula, :horario, "agendado")');
            foreach ($input['aulas'] as $aula) {
                $data = trim($aula['data'] ?? '');
                $horario = trim($aula['horario'] ?? '');
                
                // Valida o formato da data (esperado: YYYY-MM-DD)
                $d = DateTime::createFromFormat('Y-m-d', $data);
                if (!$d || $d->format('Y-m-d') !== $data) {
                    throw new Exception("Data inválida: $data");
                }
                
                // Valida o formato do horário (esperado: HH:MM)
                if (!preg_match('/^\d{2}:\d{2}$/', $horario)) {
                    throw new Exception("Horário inválido: $horario");
                }
                
                $stmtAula->execute([
                    ':aluno_id'    => $alunoId,
                    ':disciplina_id' => $disciplinaId,
                    ':data_aula'   => $data,
                    ':horario'     => $horario
                ]);
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