<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    echo "<h2>Teste de Conexão com o Banco de Dados</h2>";
    
    // 1. Verificar extensões do PHP
    echo "<h3>1. Verificando extensões PHP:</h3>";
    echo "PDO instalado: " . (extension_loaded('pdo') ? 'Sim' : 'Não') . "<br>";
    echo "SQLite3 instalado: " . (extension_loaded('pdo_sqlite') ? 'Sim' : 'Não') . "<br>";
    
    // 2. Verificar diretório do banco
    echo "<h3>2. Verificando diretório:</h3>";
    $db_file = __DIR__ . '/database/usuarios.sqlite';
    $dir = dirname($db_file);
    
    echo "Diretório do banco: " . $dir . "<br>";
    echo "Diretório existe: " . (file_exists($dir) ? 'Sim' : 'Não') . "<br>";
    if (file_exists($dir)) {
        echo "Permissões do diretório: " . substr(sprintf('%o', fileperms($dir)), -4) . "<br>";
        echo "É gravável: " . (is_writable($dir) ? 'Sim' : 'Não') . "<br>";
    }
    
    // 3. Verificar arquivo do banco
    echo "<h3>3. Verificando arquivo do banco:</h3>";
    echo "Arquivo existe: " . (file_exists($db_file) ? 'Sim' : 'Não') . "<br>";
    if (file_exists($db_file)) {
        echo "Tamanho do arquivo: " . filesize($db_file) . " bytes<br>";
        echo "Permissões do arquivo: " . substr(sprintf('%o', fileperms($db_file)), -4) . "<br>";
        echo "É gravável: " . (is_writable($db_file) ? 'Sim' : 'Não') . "<br>";
    }
    
    // 4. Tentar conexão
    echo "<h3>4. Testando conexão:</h3>";
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Conexão estabelecida com sucesso!<br>";
    
    // 5. Verificar estrutura da tabela
    echo "<h3>5. Verificando estrutura da tabela:</h3>";
    $result = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'");
    echo "Tabela 'usuarios' existe: " . ($result->fetchColumn() ? 'Sim' : 'Não') . "<br>";
    
    if ($result->fetchColumn()) {
        echo "<h4>Colunas da tabela:</h4>";
        $colunas = $pdo->query("PRAGMA table_info(usuarios)")->fetchAll(PDO::FETCH_ASSOC);
        echo "<pre>";
        print_r($colunas);
        echo "</pre>";
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