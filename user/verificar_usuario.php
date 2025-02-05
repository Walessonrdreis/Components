<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'usuarios.php';

try {
    echo "<h2>Verificação Detalhada do Usuário Admin</h2>";
    
    $usuarios = new Usuarios();
    $pdo = $usuarios->getPDO();
    
    // 1. Verificar se o usuário existe
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute(['admin@sistema.com']);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo "<h3>Usuário encontrado:</h3>";
        echo "ID: " . $admin['id'] . "<br>";
        echo "Nome: " . $admin['nome'] . "<br>";
        echo "Email: " . $admin['email'] . "<br>";
        echo "Tipo: " . $admin['tipo_usuario'] . "<br>";
        
        // 2. Testar autenticação
        echo "<h3>Teste de autenticação:</h3>";
        
        // Teste com senha correta
        $senha_teste = 'admin123';
        $resultado = password_verify($senha_teste, $admin['senha']);
        echo "Teste com senha 'admin123': " . ($resultado ? 'SUCESSO' : 'FALHA') . "<br>";
        
        // Mostrar hash atual
        echo "<br>Hash atual da senha: " . $admin['senha'] . "<br>";
        
        // 3. Recriar senha
        echo "<h3>Recriando senha:</h3>";
        $nova_senha = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE email = ?");
        $stmt->execute([$nova_senha, 'admin@sistema.com']);
        
        echo "Nova senha definida.<br>";
        echo "Novo hash: " . $nova_senha . "<br>";
        
        // 4. Testar nova senha
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE email = ?");
        $stmt->execute(['admin@sistema.com']);
        $novo_admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $resultado = password_verify('admin123', $novo_admin['senha']);
        echo "<br>Teste com nova senha: " . ($resultado ? 'SUCESSO' : 'FALHA') . "<br>";
        
    } else {
        echo "<h3>Usuário admin não encontrado!</h3>";
        echo "Criando novo usuário admin...<br>";
        
        $senha_hash = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Administrador', 'admin@sistema.com', $senha_hash, 'admin']);
        
        echo "Usuário admin criado com sucesso!<br>";
        echo "Email: admin@sistema.com<br>";
        echo "Senha: admin123<br>";
        echo "Hash: " . $senha_hash;
    }
    
    // 5. Listar todos os usuários
    echo "<h3>Todos os usuários cadastrados:</h3>";
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