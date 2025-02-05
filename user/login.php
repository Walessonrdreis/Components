<?php
require_once 'includes/layout.php';
require_once 'usuarios.php';

session_start();

// Se já estiver logado, redireciona para o dashboard
if (isset($_SESSION['usuario'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

// Processar o formulário de login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    
    if (empty($email) || empty($senha)) {
        $error = 'Por favor, preencha todos os campos';
    } else {
        try {
            $usuarios = new Usuarios();
            $usuario = $usuarios->autenticar($email, $senha);
            
            if ($usuario) {
                $_SESSION['usuario'] = $usuario;
                header('Location: dashboard.php');
                exit;
            } else {
                $error = 'Email ou senha inválidos';
            }
        } catch (Exception $e) {
            $error = 'Erro ao fazer login: ' . $e->getMessage();
        }
    }
}

renderHeader('Login - Sistema de Usuários');
?>

<h2>Login</h2>

<?php if ($error): ?>
    <?php showMessage($error, 'danger'); ?>
<?php endif; ?>

<form method="POST" action="">
    <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
    </div>
    
    <div class="form-group">
        <label for="senha">Senha:</label>
        <input type="password" id="senha" name="senha" required>
    </div>
    
    <button type="submit" class="btn">Entrar</button>
</form>

<p style="text-align: center; margin-top: 20px;">
    Não tem uma conta? <a href="cadastro.php">Cadastre-se</a>
</p>

<?php renderFooter(); ?> 