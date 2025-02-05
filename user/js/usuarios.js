document.addEventListener('DOMContentLoaded', function() {
    carregarUsuarios();

    document.getElementById('usuarioForm').addEventListener('submit', function(e) {
        e.preventDefault();
        cadastrarUsuario();
    });
});

function carregarUsuarios() {
    fetch('api/listar_usuarios.php')
        .then(response => response.json())
        .then(usuarios => {
            const tbody = document.querySelector('#tabelaUsuarios tbody');
            tbody.innerHTML = '';
            
            usuarios.forEach(usuario => {
                tbody.innerHTML += `
                    <tr>
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.telefone}</td>
                        <td>${usuario.data_cadastro}</td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error('Erro:', error));
}

function cadastrarUsuario() {
    const formData = new FormData();
    formData.append('nome', document.getElementById('nome').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('telefone', document.getElementById('telefone').value);

    fetch('api/cadastrar_usuario.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuário cadastrado com sucesso!');
            document.getElementById('usuarioForm').reset();
            carregarUsuarios();
        } else {
            alert('Erro ao cadastrar usuário');
        }
    })
    .catch(error => console.error('Erro:', error));
} 