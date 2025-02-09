<?php
require_once 'db_connection.php';

try {
    // Verifica se já existe um admin
    $stmt = $conn->prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
    $email = 'admin@admin.com';
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $exists = $row['count'];
    
    if (!$exists) {
        // Cria usuário admin
        $stmt = $conn->prepare('
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        ');
        
        $name = 'Administrador';
        $password = password_hash('admin123', PASSWORD_DEFAULT);
        $role = 'admin';
        
        $stmt->bind_param("ssss", $name, $email, $password, $role);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            echo "Usuário admin criado com sucesso!\n";
            echo "Email: admin@admin.com\n";
            echo "Senha: admin123\n";
        } else {
            echo "Erro ao criar usuário admin\n";
        }
    } else {
        echo "Usuário admin já existe!\n";
    }
    
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
