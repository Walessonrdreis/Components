<?php
// Configurações do banco de dados
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'dashboard';

try {
    // Conecta ao MySQL sem selecionar um banco de dados
    $conn = new mysqli($db_host, $db_user, $db_pass);

    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o MySQL: " . $conn->connect_error);
    }

    // Cria o banco de dados se não existir
    $sql = "CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    if (!$conn->query($sql)) {
        throw new Exception("Erro ao criar banco de dados: " . $conn->error);
    }
    echo "Banco de dados criado ou já existente.\n";

    // Seleciona o banco de dados
    $conn->select_db($db_name);

    // Criação da tabela de usuários
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('active', 'inactive') DEFAULT 'active',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    if (!$conn->query($sql)) {
        throw new Exception("Erro ao criar tabela users: " . $conn->error);
    }
    echo "Tabela users criada com sucesso.\n";

    // Criação da tabela de sessões
    $sql = "CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    if (!$conn->query($sql)) {
        throw new Exception("Erro ao criar tabela user_sessions: " . $conn->error);
    }
    echo "Tabela user_sessions criada com sucesso.\n";

    // Inserir ou atualizar usuário admin
    $admin_email = 'admin@admin.com';
    $admin_password = password_hash('password', PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO users (name, email, password, role) 
            VALUES ('Administrador', ?, ?, 'admin')
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                password = VALUES(password),
                role = VALUES(role)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $admin_email, $admin_password);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao inserir usuário admin: " . $stmt->error);
    }
    echo "Usuário admin criado/atualizado com sucesso.\n";

    // Inserir alguns usuários de teste
    $test_users = [
        ['João Silva', 'joao@teste.com', 'user'],
        ['Maria Santos', 'maria@teste.com', 'user'],
        ['Pedro Souza', 'pedro@teste.com', 'admin'],
        ['Ana Oliveira', 'ana@teste.com', 'user']
    ];

    $sql = "INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    foreach ($test_users as $user) {
        $password = password_hash('123456', PASSWORD_DEFAULT);
        $stmt->bind_param("ssss", $user[0], $user[1], $password, $user[2]);
        
        if (!$stmt->execute()) {
            echo "Aviso: Usuário {$user[1]} já existe.\n";
        } else {
            echo "Usuário {$user[1]} criado com sucesso.\n";
        }
    }

    echo "\nConfigurações concluídas!\n";
    echo "Você pode fazer login com:\n";
    echo "Admin principal:\n";
    echo "Email: admin@admin.com\n";
    echo "Senha: password\n\n";
    echo "Usuários de teste:\n";
    echo "Email: joao@teste.com (ou qualquer outro email listado acima)\n";
    echo "Senha: 123456\n";

} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
} 