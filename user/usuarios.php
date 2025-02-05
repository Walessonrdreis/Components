<?php
require_once 'config/database.php';

class Usuarios {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getPDO();
    }

    public function listarUsuarios() {
        try {
            $stmt = $this->db->query("SELECT id, nome, email, telefone, tipo_usuario, data_cadastro FROM usuarios ORDER BY nome");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Erro ao listar usuários: " . $e->getMessage());
        }
    }

    public function adicionarUsuario($nome, $email, $senha, $telefone, $tipo = 'usuario') {
        try {
            // Verificar se o email já existe
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetchColumn() > 0) {
                throw new Exception("Este email já está cadastrado");
            }

            // Hash da senha
            $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
            
            $stmt = $this->db->prepare("INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario) VALUES (?, ?, ?, ?, ?)");
            $resultado = $stmt->execute([$nome, $email, $senha_hash, $telefone, $tipo]);
            
            if (!$resultado) {
                throw new Exception("Erro ao inserir usuário no banco de dados");
            }
            
            return true;
        } catch (PDOException $e) {
            throw new Exception("Erro ao cadastrar usuário: " . $e->getMessage());
        }
    }

    public function autenticar($email, $senha) {
        try {
            error_log("Tentando autenticar usuário - Email: " . $email);
            
            $stmt = $this->db->prepare("SELECT id, nome, email, senha, tipo_usuario FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$usuario) {
                error_log("Usuário não encontrado - Email: " . $email);
                return false;
            }
            
            error_log("Usuário encontrado - Email: " . $email . ", Hash: " . $usuario['senha']);
            
            if (password_verify($senha, $usuario['senha'])) {
                error_log("Senha válida - Email: " . $email);
                unset($usuario['senha']); // Remove a senha do array
                return $usuario;
            }
            
            error_log("Senha inválida - Email: " . $email);
            return false;
        } catch (PDOException $e) {
            error_log("Erro na autenticação: " . $e->getMessage());
            throw new Exception("Erro ao autenticar usuário: " . $e->getMessage());
        }
    }

    public function excluirUsuario($id, $usuario_logado) {
        try {
            // Apenas administradores podem excluir usuários
            if ($usuario_logado['tipo_usuario'] !== 'admin') {
                throw new Exception("Apenas administradores podem excluir usuários");
            }

            // Não permitir excluir o próprio usuário admin
            if ($id == $usuario_logado['id']) {
                throw new Exception("Não é possível excluir o próprio usuário administrador");
            }

            $stmt = $this->db->prepare("DELETE FROM usuarios WHERE id = ?");
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new Exception("Erro ao excluir usuário: " . $e->getMessage());
        }
    }

    public function alterarTipoUsuario($id, $novo_tipo, $usuario_logado) {
        try {
            // Apenas administradores podem alterar tipos de usuário
            if ($usuario_logado['tipo_usuario'] !== 'admin') {
                throw new Exception("Apenas administradores podem alterar tipos de usuário");
            }

            // Não permitir alterar o próprio tipo
            if ($id == $usuario_logado['id']) {
                throw new Exception("Não é possível alterar o próprio tipo de usuário");
            }

            $stmt = $this->db->prepare("UPDATE usuarios SET tipo_usuario = ? WHERE id = ?");
            return $stmt->execute([$novo_tipo, $id]);
        } catch (PDOException $e) {
            throw new Exception("Erro ao alterar tipo de usuário: " . $e->getMessage());
        }
    }

    public function getPDO() {
        return $this->db;
    }
}
?> 