<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

class Database {
    private $db_file;
    private $pdo;

    public function __construct() {
        try {
            $this->db_file = __DIR__ . '/../database/usuarios.sqlite';
            error_log("Tentando conectar ao banco de dados: " . $this->db_file);
            $this->conectar();
        } catch (Exception $e) {
            error_log("Erro no construtor do Database: " . $e->getMessage());
            throw $e;
        }
    }

    private function conectar() {
        try {
            $dir = dirname($this->db_file);
            error_log("Diretório do banco: " . $dir);
            
            if (!file_exists($dir)) {
                error_log("Criando diretório: " . $dir);
                if (!mkdir($dir, 0777, true)) {
                    throw new Exception("Não foi possível criar o diretório do banco de dados: " . $dir);
                }
                chmod($dir, 0777);
            }
            
            $dbExistia = file_exists($this->db_file);
            error_log("Banco de dados existe? " . ($dbExistia ? "Sim" : "Não"));
            
            if (!$dbExistia) {
                error_log("Criando arquivo do banco: " . $this->db_file);
                touch($this->db_file);
                chmod($this->db_file, 0777);
            } else {
                error_log("Verificando permissões do arquivo: " . $this->db_file);
                if (!is_writable($this->db_file)) {
                    chmod($this->db_file, 0777);
                    if (!is_writable($this->db_file)) {
                        throw new Exception("O arquivo do banco de dados não tem permissão de escrita: " . $this->db_file);
                    }
                }
            }
            
            error_log("Tentando criar conexão PDO");
            $this->pdo = new PDO("sqlite:" . $this->db_file);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            if ($dbExistia) {
                error_log("Verificando estrutura da tabela");
                // Verificar se a tabela usuarios existe
                $tabelaExiste = $this->pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'")->fetchColumn();
                error_log("Tabela existe? " . ($tabelaExiste ? "Sim" : "Não"));
                
                if ($tabelaExiste) {
                    // Verificar se a coluna tipo_usuario existe
                    $colunas = $this->pdo->query("PRAGMA table_info(usuarios)")->fetchAll(PDO::FETCH_ASSOC);
                    $temColunaTipo = false;
                    foreach ($colunas as $coluna) {
                        if ($coluna['name'] === 'tipo_usuario') {
                            $temColunaTipo = true;
                            break;
                        }
                    }
                    error_log("Coluna tipo_usuario existe? " . ($temColunaTipo ? "Sim" : "Não"));
                    
                    if (!$temColunaTipo) {
                        error_log("Atualizando estrutura da tabela");
                        // Backup dos dados antigos
                        $this->pdo->exec("CREATE TABLE IF NOT EXISTS usuarios_backup AS SELECT * FROM usuarios");
                        
                        // Criar nova tabela com a estrutura atualizada
                        $this->pdo->exec("DROP TABLE IF EXISTS usuarios");
                        $this->criarTabelaUsuarios();
                        
                        // Inserir dados antigos
                        $this->pdo->exec("INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario, data_cadastro)
                            SELECT nome, email, senha, telefone, 'usuario', data_cadastro 
                            FROM usuarios_backup");
                    }
                } else {
                    error_log("Criando tabela usuarios");
                    $this->criarTabelaUsuarios();
                }
            } else {
                error_log("Criando tabela usuarios em novo banco");
                $this->criarTabelaUsuarios();
            }
            
        } catch(Exception $e) {
            error_log("Erro na conexão: " . $e->getMessage());
            throw $e;
        }
    }

    private function criarTabelaUsuarios() {
        try {
            error_log("Iniciando criação da tabela usuarios");
            // Criar tabela com a estrutura completa
            $this->pdo->exec("CREATE TABLE usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'usuario',
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            
            error_log("Criando usuário admin padrão");
            // Criar usuário admin padrão
            $senhaAdmin = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $this->pdo->prepare("INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)");
            $stmt->execute(['Administrador', 'admin@sistema.com', $senhaAdmin, 'admin']);
            error_log("Usuário admin criado com sucesso");
        } catch (Exception $e) {
            error_log("Erro ao criar tabela: " . $e->getMessage());
            throw $e;
        }
    }

    public function getPDO() {
        return $this->pdo;
    }
}
?> 