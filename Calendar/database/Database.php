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
        try {
            if ($this->conn === null) {
                $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
                $this->conn = new PDO($dsn, $this->username, $this->password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]);
            }
            return $this->conn;
        } catch(PDOException $e) {
            throw new Exception("Erro na conexão: " . $e->getMessage());
        }
    }
}
?> 