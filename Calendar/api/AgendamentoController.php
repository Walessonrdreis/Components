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

            // Insere ou busca o aluno
            $stmt = $this->conn->prepare("
                INSERT INTO alunos (nome) 
                VALUES (:nome)
                ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
            ");
            $stmt->bindParam(':nome', $dados['nome']);
            $stmt->execute();
            $aluno_id = $this->conn->lastInsertId();

            // Busca o ID do tipo de aula
            $stmt = $this->conn->prepare("
                SELECT id FROM tipos_aula 
                WHERE nome = :tipo_aula
            ");
            $stmt->bindParam(':tipo_aula', $dados['tipoAula']);
            $stmt->execute();
            $tipo_aula_id = $stmt->fetchColumn();

            // Insere os agendamentos
            $stmt = $this->conn->prepare("
                INSERT INTO agendamentos 
                (aluno_id, tipo_aula_id, data_aula, horario) 
                VALUES (:aluno_id, :tipo_aula_id, :data_aula, :horario)
            ");

            foreach ($dados['aulas'] as $aula) {
                $stmt->bindParam(':aluno_id', $aluno_id);
                $stmt->bindParam(':tipo_aula_id', $tipo_aula_id);
                $stmt->bindParam(':data_aula', $aula['data']);
                $stmt->bindParam(':horario', $aula['horario']);
                $stmt->execute();
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
                    ta.nome as tipo_aula,
                    MIN(ag.data_aula) as proxima_aula
                FROM alunos a
                LEFT JOIN agendamentos ag ON a.id = ag.aluno_id
                LEFT JOIN tipos_aula ta ON ag.tipo_aula_id = ta.id
                WHERE ag.data_aula >= CURRENT_DATE
                    OR ag.data_aula IS NULL
                GROUP BY a.id, a.nome, ta.nome
                ORDER BY a.nome
            ");
            
            $stmt->execute();
            $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return ['success' => true, 'alunos' => $alunos];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
?> 