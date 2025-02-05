<?php
require_once 'includes/layout.php';
require_once 'usuarios.php';

session_start();

// Se já estiver logado, redireciona para o dashboard
if (isset($_SESSION['usuario'])) {
    header('Location: dashboard.php');
    exit;
}

$success = '';
$error = '';

// Processar o formulário de cadastro
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    
    if (empty($nome) || empty($email) || empty($senha)) {
        $error = 'Por favor, preencha todos os campos obrigatórios';
    } else {
        try {
            $usuarios = new Usuarios();
            $usuarios->adicionarUsuario($nome, $email, $senha, $telefone);
            $success = 'Usuário cadastrado com sucesso! Redirecionando para o login...';
            header('Refresh: 2; URL=login.php');
        } catch (Exception $e) {
            $error = 'Erro ao cadastrar: ' . $e->getMessage();
        }
    }
}

renderHeader('Cadastro - Sistema de Usuários');
?>

<h2>Cadastro de Usuários</h2>

<?php if ($success): ?>
    <?php showMessage($success, 'success'); ?>
<?php endif; ?>

<?php if ($error): ?>
    <?php showMessage($error, 'danger'); ?>
<?php endif; ?>

<form method="POST" action="">
    <div class="form-group">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required value="<?php echo isset($_POST['nome']) ? htmlspecialchars($_POST['nome']) : ''; ?>">
    </div>
    
    <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
    </div>
    
    <div class="form-group">
        <label for="senha">Senha:</label>
        <input type="password" id="senha" name="senha" required>
    </div>
    
    <div class="form-group">
        <label for="telefone">Telefone:</label>
        <input type="tel" id="telefone" name="telefone" value="<?php echo isset($_POST['telefone']) ? htmlspecialchars($_POST['telefone']) : ''; ?>">
    </div>
    
    <button type="submit" class="btn">Cadastrar</button>
</form>

<p style="text-align: center; margin-top: 20px;">
    Já tem uma conta? <a href="login.php">Faça login</a>
</p>

<?php renderFooter(); ?> 