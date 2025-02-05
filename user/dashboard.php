<?php
require_once 'includes/layout.php';
require_once 'usuarios.php';

$usuario = checkAuth();
$success = '';
$error = '';

// Processar ações de administrador
if (isAdmin($usuario)) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            $usuarios = new Usuarios();
            
            if (isset($_POST['excluir'])) {
                $id = $_POST['id'];
                $usuarios->excluirUsuario($id, $usuario);
                $success = 'Usuário excluído com sucesso!';
            }
            
            if (isset($_POST['alterar_tipo'])) {
                $id = $_POST['id'];
                $novo_tipo = $_POST['tipo'];
                $usuarios->alterarTipoUsuario($id, $novo_tipo, $usuario);
                $success = 'Tipo de usuário alterado com sucesso!';
            }
        } catch (Exception $e) {
            $error = $e->getMessage();
        }
    }
}

renderHeader('Dashboard - Sistema de Usuários');
?>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
    <div>
        <h2 style="margin: 0;">Bem-vindo, <?php echo htmlspecialchars($usuario['nome']); ?>!</h2>
        <small><?php echo $usuario['tipo_usuario'] === 'admin' ? 'Administrador' : 'Usuário'; ?></small>
    </div>
    <form method="POST" action="logout.php" style="margin: 0;">
        <button type="submit" class="btn btn-danger">Sair</button>
    </form>
</div>

<?php if ($success): ?>
    <?php showMessage($success, 'success'); ?>
<?php endif; ?>

<?php if ($error): ?>
    <?php showMessage($error, 'danger'); ?>
<?php endif; ?>

<h3>Lista de Usuários</h3>

<table>
    <thead>
        <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Tipo</th>
            <th>Data Cadastro</th>
            <?php if (isAdmin($usuario)): ?>
                <th>Ações</th>
            <?php endif; ?>
        </tr>
    </thead>
    <tbody>
        <?php
        $usuarios = new Usuarios();
        $lista = $usuarios->listarUsuarios();
        foreach ($lista as $user):
            $data = date('d/m/Y H:i', strtotime($user['data_cadastro']));
        ?>
            <tr>
                <td><?php echo htmlspecialchars($user['nome']); ?></td>
                <td><?php echo htmlspecialchars($user['email']); ?></td>
                <td><?php echo htmlspecialchars($user['telefone'] ?: '-'); ?></td>
                <td><?php echo htmlspecialchars($user['tipo_usuario']); ?></td>
                <td><?php echo $data; ?></td>
                <?php if (isAdmin($usuario) && $user['id'] != $usuario['id']): ?>
                    <td>
                        <form method="POST" action="" style="display: inline;">
                            <input type="hidden" name="id" value="<?php echo $user['id']; ?>">
                            <?php if ($user['tipo_usuario'] === 'usuario'): ?>
                                <input type="hidden" name="tipo" value="admin">
                                <button type="submit" name="alterar_tipo" class="btn" onclick="return confirm('Promover usuário para administrador?')">Promover</button>
                            <?php else: ?>
                                <input type="hidden" name="tipo" value="usuario">
                                <button type="submit" name="alterar_tipo" class="btn" onclick="return confirm('Rebaixar administrador para usuário?')">Rebaixar</button>
                            <?php endif; ?>
                            <button type="submit" name="excluir" class="btn btn-danger" onclick="return confirm('Tem certeza que deseja excluir este usuário?')">Excluir</button>
                        </form>
                    </td>
                <?php endif; ?>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<?php renderFooter(); ?> 