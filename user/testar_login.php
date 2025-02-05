<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'usuarios.php';

try {
    echo "<h2>Teste de Login</h2>";
    
    $email = 'admin@sistema.com';
    $senha = 'admin123';
    
    echo "Tentando fazer login com:<br>";
    echo "Email: " . $email . "<br>";
    echo "Senha: " . $senha . "<br><br>";
    
    $usuarios = new Usuarios();
    
    // Verificar dados do usuário no banco
    $pdo = $usuarios->getPDO();
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($usuario) {
        echo "Usuário encontrado no banco:<br>";
        echo "ID: " . $usuario['id'] . "<br>";
        echo "Nome: " . $usuario['nome'] . "<br>";
        echo "Email: " . $usuario['email'] . "<br>";
        echo "Tipo: " . $usuario['tipo_usuario'] . "<br>";
        echo "Hash da senha: " . $usuario['senha'] . "<br><br>";
        
        // Testar verificação de senha
        echo "Testando senha:<br>";
        $senha_valida = password_verify($senha, $usuario['senha']);
        echo "password_verify() retornou: " . ($senha_valida ? 'true' : 'false') . "<br><br>";
        
        // Testar método de autenticação
        echo "Testando método autenticar():<br>";
        $resultado = $usuarios->autenticar($email, $senha);
        if ($resultado) {
            echo "Autenticação bem-sucedida!<br>";
            echo "Dados retornados:<br>";
            echo "<pre>";
            print_r($resultado);
            echo "</pre>";
        } else {
            echo "Autenticação falhou!<br>";
        }
    } else {
        echo "Usuário não encontrado no banco!<br>";
    }
    
} catch (Exception $e) {
    echo "<h3>ERRO:</h3>";
    echo "<pre>";
    echo "Mensagem: " . $e->getMessage() . "\n";
    echo "Arquivo: " . $e->getFile() . "\n";
    echo "Linha: " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString();
    echo "</pre>";
} 