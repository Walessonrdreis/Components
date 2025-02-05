<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config/database.php';

try {
    $database = new Database();
    $pdo = $database->getPDO();
    
    echo "<h2>Verificação do Usuário Admin</h2>";
    
    // Verificar se o admin existe
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute(['admin@sistema.com']);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo "Usuário admin encontrado:<br>";
        echo "ID: " . $admin['id'] . "<br>";
        echo "Nome: " . $admin['nome'] . "<br>";
        echo "Email: " . $admin['email'] . "<br>";
        echo "Tipo: " . $admin['tipo_usuario'] . "<br>";
        
        // Recriar a senha do admin
        $senhaAdmin = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE email = ?");
        $stmt->execute([$senhaAdmin, 'admin@sistema.com']);
        
        echo "<br>Senha do admin foi redefinida para: admin123";
    } else {
        echo "Usuário admin não encontrado. Criando...<br>";
        
        // Criar usuário admin
        $senhaAdmin = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Administrador', 'admin@sistema.com', $senhaAdmin, 'admin']);
        
        echo "Usuário admin criado com sucesso!<br>";
        echo "Email: admin@sistema.com<br>";
        echo "Senha: admin123";
    }
    
    // Verificar a tabela usuarios
    echo "<h3>Estrutura da tabela usuarios:</h3>";
    $colunas = $pdo->query("PRAGMA table_info(usuarios)")->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($colunas);
    echo "</pre>";
    
    // Listar todos os usuários
    echo "<h3>Usuários cadastrados:</h3>";
    $usuarios = $pdo->query("SELECT id, nome, email, tipo_usuario FROM usuarios")->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($usuarios);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "<h3>ERRO:</h3>";
    echo "<pre>";
    echo "Mensagem: " . $e->getMessage() . "\n";
    echo "Arquivo: " . $e->getFile() . "\n";
    echo "Linha: " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString();
    echo "</pre>";
} 