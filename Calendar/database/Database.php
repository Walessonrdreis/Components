<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: 'db';
        $this->db_name = getenv('DB_NAME') ?: 'calendar';
        $this->username = getenv('DB_USER') ?: 'user';
        $this->password = getenv('DB_PASSWORD') ?: 'password';
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Erro na conexão com o banco de dados: ' . $e->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?> 