<?php
require_once '../database/Database.php';

class AgendamentoController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function cadastrarAulas($dados) {
        try {
            $this->conn->beginTransaction();

            // Sanitiza e valida os dados do aluno
            $nome = trim($dados['nome'] ?? '');
            $email = trim($dados['email'] ?? '');
            if (empty($nome) || empty($email)) {
                throw new Exception("Nome e email são obrigatórios");
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Email inválido");
            }

            // Insere ou busca o aluno utilizando parâmetros nomeados
            $stmt = $this->conn->prepare("INSERT INTO alunos (nome, email) VALUES (:nome, :email) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
            $stmt->execute([
                ':nome' => $nome,
                ':email' => $email
            ]);
            $aluno_id = $this->conn->lastInsertId();

            $disciplina_id = null;
            if (!empty($dados['disciplina'])) {
                $disciplinaNome = trim($dados['disciplina']);
                $stmt = $this->conn->prepare("SELECT id FROM disciplinas WHERE nome = :disciplina");
                $stmt->execute([':disciplina' => $disciplinaNome]);
                $disciplina_id = $stmt->fetchColumn();
            }

            // Insere os agendamentos (aulas) se existirem
            if (isset($dados['aulas']) && is_array($dados['aulas'])) {
                $stmtAula = $this->conn->prepare("INSERT INTO agendamentos (aluno_id, disciplina_id, data_aula, horario) VALUES (:aluno_id, :disciplina_id, :data_aula, :horario)");
                foreach ($dados['aulas'] as $aula) {
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
                        ':aluno_id' => $aluno_id,
                        ':disciplina_id' => $disciplina_id,
                        ':data_aula' => $data,
                        ':horario' => $horario
                    ]);
                }
            }

            $this->conn->commit();
            return ['success' => true, 'message' => 'Aulas cadastradas com sucesso'];
        } catch (Exception $e) {
            $this->conn->rollBack();
            return ['success' => false, 'message' => 'Erro ao cadastrar: ' . $e->getMessage()];
        }
    }

    public function listarAgendamentos($data_inicio, $data_fim) {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    a.id,
                    al.nome as aluno,
                    ta.nome as tipo_aula,
                    a.data_aula,
                    a.horario,
                    a.status
                FROM agendamentos a
                JOIN alunos al ON a.aluno_id = al.id
                JOIN tipos_aula ta ON a.tipo_aula_id = ta.id
                WHERE a.data_aula BETWEEN :data_inicio AND :data_fim
                ORDER BY a.data_aula, a.horario
            ");

            $stmt->bindParam(':data_inicio', $data_inicio);
            $stmt->bindParam(':data_fim', $data_fim);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function listarAlunos() {
        try {
            $stmt = $this->conn->prepare("
                SELECT DISTINCT
                    a.id,
                    a.nome,
                    d.nome as disciplina,
                    MIN(ag.data_aula) as proxima_aula
                FROM alunos a
                LEFT JOIN agendamentos ag ON a.id = ag.aluno_id
                LEFT JOIN disciplinas d ON ag.disciplina_id = d.id
                WHERE ag.data_aula >= CURRENT_DATE
                    OR ag.data_aula IS NULL
                GROUP BY a.id, a.nome, d.nome
                ORDER BY a.nome
            ");
            
            $stmt->execute();
            $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return ['success' => true, 'alunos' => $alunos];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function getDadosAlunoPDF($aluno_id) {
        try {
            // Busca dados do aluno
            $stmt = $this->conn->prepare("
                SELECT 
                    a.id,
                    a.nome,
                    a.email,
                    d.nome as disciplina
                FROM alunos a
                LEFT JOIN agendamentos ag ON a.id = ag.aluno_id
                LEFT JOIN disciplinas d ON ag.disciplina_id = d.id
                WHERE a.id = :aluno_id
                LIMIT 1
            ");
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();
            $aluno = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$aluno) {
                throw new Exception('Aluno não encontrado');
            }

            // Busca aulas do aluno
            $stmt = $this->conn->prepare("
                SELECT 
                    data_aula,
                    horario,
                    status
                FROM agendamentos
                WHERE aluno_id = :aluno_id
                ORDER BY data_aula, horario
            ");
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();
            $aulas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'aluno' => $aluno,
                'aulas' => $aulas
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function buscarAulasAluno($aluno_id) {
        try {
            // Busca dados do aluno
            $stmt = $this->conn->prepare("
                SELECT 
                    a.id,
                    a.nome,
                    d.nome as disciplina
                FROM alunos a
                LEFT JOIN agendamentos ag ON a.id = ag.aluno_id
                LEFT JOIN disciplinas d ON ag.disciplina_id = d.id
                WHERE a.id = :aluno_id
                LIMIT 1
            ");
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();
            $aluno = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$aluno) {
                throw new Exception('Aluno não encontrado');
            }

            // Busca aulas do aluno
            $stmt = $this->conn->prepare("
                SELECT 
                    ag.id,
                    ag.data_aula,
                    ag.horario,
                    ag.status
                FROM agendamentos ag
                WHERE ag.aluno_id = :aluno_id
                ORDER BY ag.data_aula, ag.horario
            ");
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();
            $aulas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'aluno' => $aluno,
                'aulas' => $aulas
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function buscarAluno($aluno_id) {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    a.id,
                    a.nome,
                    a.email,
                    d.nome as disciplina
                FROM alunos a
                LEFT JOIN agendamentos ag ON a.id = ag.aluno_id
                LEFT JOIN disciplinas d ON ag.disciplina_id = d.id
                WHERE a.id = :aluno_id
                LIMIT 1
            ");
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();
            $aluno = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$aluno) {
                throw new Exception('Aluno não encontrado');
            }

            return [
                'success' => true,
                'aluno' => $aluno
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function atualizarStatusAula($aula_id, $novo_status) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE agendamentos 
                SET status = :status 
                WHERE id = :aula_id
            ");
            
            $stmt->bindParam(':status', $novo_status);
            $stmt->bindParam(':aula_id', $aula_id);
            $stmt->execute();

            return [
                'success' => true,
                'message' => 'Status atualizado com sucesso'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function excluirAula($aula_id) {
        try {
            $stmt = $this->conn->prepare("
                DELETE FROM agendamentos 
                WHERE id = :aula_id
            ");
            
            $stmt->bindParam(':aula_id', $aula_id);
            $stmt->execute();

            return [
                'success' => true,
                'message' => 'Aula excluída com sucesso'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function editarAluno($aluno_id, $dados) {
        try {
            $this->conn->beginTransaction();

            // Verifica se o aluno existe
            $stmt = $this->conn->prepare("
                SELECT id FROM alunos 
                WHERE id = :aluno_id
            ");
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                throw new Exception('Aluno não encontrado');
            }

            // Busca o ID da disciplina se foi informada
            $disciplina_id = null;
            if (!empty($dados['disciplina'])) {
                $stmt = $this->conn->prepare("
                    SELECT id FROM disciplinas 
                    WHERE nome = :disciplina
                ");
                $stmt->bindParam(':disciplina', $dados['disciplina']);
                $stmt->execute();
                $disciplina_id = $stmt->fetchColumn();
            }

            // Atualiza os dados do aluno
            $stmt = $this->conn->prepare("
                UPDATE alunos 
                SET nome = :nome,
                    email = :email
                WHERE id = :aluno_id
            ");
            
            $stmt->bindParam(':nome', $dados['nome']);
            $stmt->bindParam(':email', $dados['email']);
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();

            // Remove aulas futuras existentes
            $stmt = $this->conn->prepare("
                DELETE FROM agendamentos 
                WHERE aluno_id = :aluno_id 
                AND data_aula >= CURRENT_DATE
            ");
            $stmt->bindParam(':aluno_id', $aluno_id);
            $stmt->execute();

            // Insere as novas aulas
            if (isset($dados['aulas']) && !empty($dados['aulas'])) {
                $stmt = $this->conn->prepare("
                    INSERT INTO agendamentos 
                    (aluno_id, disciplina_id, data_aula, horario) 
                    VALUES (:aluno_id, :disciplina_id, :data_aula, :horario)
                ");

                foreach ($dados['aulas'] as $aula) {
                    $stmt->bindParam(':aluno_id', $aluno_id);
                    $stmt->bindParam(':disciplina_id', $disciplina_id);
                    $stmt->bindParam(':data_aula', $aula['data']);
                    $stmt->bindParam(':horario', $aula['horario']);
                    $stmt->execute();
                }
            }

            $this->conn->commit();
            return [
                'success' => true,
                'message' => 'Aluno atualizado com sucesso'
            ];

        } catch (Exception $e) {
            $this->conn->rollBack();
            return [
                'success' => false,
                'message' => 'Erro ao atualizar aluno: ' . $e->getMessage()
            ];
        }
    }

    public function listarDisciplinas() {
        try {
            $stmt = $this->conn->prepare("
                SELECT id, nome
                FROM disciplinas
                ORDER BY nome
            ");
            
            $stmt->execute();
            $disciplinas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'disciplinas' => $disciplinas
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao listar disciplinas: ' . $e->getMessage()
            ];
        }
    }

    public function adicionarDisciplina($nome) {
        try {
            // Verifica se a disciplina já existe
            $stmt = $this->conn->prepare("
                SELECT id FROM disciplinas WHERE nome = :nome
            ");
            $stmt->bindParam(':nome', $nome);
            $stmt->execute();
            
            if ($stmt->fetch()) {
                throw new Exception('Esta disciplina já existe');
            }

            // Insere a nova disciplina
            $stmt = $this->conn->prepare("
                INSERT INTO disciplinas (nome) VALUES (:nome)
            ");
            $stmt->bindParam(':nome', $nome);
            $stmt->execute();

            return [
                'success' => true,
                'message' => 'Disciplina adicionada com sucesso',
                'id' => $this->conn->lastInsertId()
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao adicionar disciplina: ' . $e->getMessage()
            ];
        }
    }

    public function removerDisciplina($id) {
        try {
            // Verifica se existem alunos usando esta disciplina
            $stmt = $this->conn->prepare("
                SELECT COUNT(*) FROM agendamentos WHERE disciplina_id = :id
            ");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            if ($stmt->fetchColumn() > 0) {
                throw new Exception('Não é possível remover esta disciplina pois existem aulas agendadas para ela');
            }

            // Remove a disciplina
            $stmt = $this->conn->prepare("
                DELETE FROM disciplinas WHERE id = :id
            ");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return [
                'success' => true,
                'message' => 'Disciplina removida com sucesso'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao remover disciplina: ' . $e->getMessage()
            ];
        }
    }
}
?> 