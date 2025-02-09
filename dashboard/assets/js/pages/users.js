class Users {
    constructor() {
        this.api = new ComponentAPI();
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Verifica autenticação
            const token = localStorage.getItem('userToken');
            console.log('[Users] Token encontrado:', !!token);

            if (!token) {
                console.log('[Users] Sem token, redirecionando para login');
                this.redirectToLogin();
                return;
            }

            // Verifica sessão
            console.log('[Users] Verificando sessão com a API...');
            const response = await this.api.checkSession();
            console.log('[Users] Resposta da API:', response);

            if (!response.success) {
                console.log('[Users] Sessão inválida, redirecionando para login');
                localStorage.removeItem('userToken');
                this.redirectToLogin();
                return;
            }

            // Verifica se é admin
            this.currentUser = response.data.user;
            if (this.currentUser.role !== 'admin') {
                console.log('[Users] Usuário não é admin, redirecionando para home');
                window.location.href = 'home.html';
                return;
            }

            // Atualiza interface
            console.log('[Users] Sessão válida, atualizando interface');
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('user-role').textContent = this.currentUser.role;

            // Carrega usuários
            await this.loadUsers();

            // Configura eventos
            this.setupEvents();

        } catch (error) {
            console.error('[Users] Erro ao inicializar:', error);
            localStorage.removeItem('userToken');
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    async loadUsers() {
        try {
            console.log('[Users] Carregando usuários...');
            const loading = document.getElementById('loading');
            loading.classList.add('active');

            const response = await this.api.getUsers();
            console.log('[Users] Resposta da API:', response);

            if (!response.success) {
                throw new Error(response.message);
            }

            // Verifica se data existe e é um array
            if (!response.data || !Array.isArray(response.data)) {
                console.error('[Users] Dados inválidos:', response.data);
                throw new Error('Formato de dados inválido');
            }

            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = '';

            // Adiciona cada usuário à tabela
            response.data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="badge badge-${user.role || 'user'}">${user.role === 'admin' ? 'Administrador' : 'Usuário'}</span></td>
                    <td><span class="badge badge-${user.status || 'inactive'}">${user.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                    <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}</td>
                    <td class="actions">
                        <button class="btn btn-edit" onclick="users.editUser(${user.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-delete" onclick="users.deleteUser(${user.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Se não houver usuários, mostra mensagem
            if (response.data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">Nenhum usuário encontrado</td>
                    </tr>
                `;
            }

        } catch (error) {
            console.error('[Users] Erro ao carregar usuários:', error);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao carregar usuários: ' + error.message,
                icon: 'error'
            });

            // Mostra mensagem de erro na tabela
            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: red;">
                        Erro ao carregar usuários: ${error.message}
                    </td>
                </tr>
            `;
        } finally {
            const loading = document.getElementById('loading');
            loading.classList.remove('active');
        }
    }

    async editUser(userId) {
        try {
            console.log('[Users] Buscando dados do usuário:', userId);
            const response = await this.api.getUser(userId);

            if (!response.success) {
                throw new Error(response.message);
            }

            const user = response.data;
            const { value: formData } = await Swal.fire({
                title: 'Editar Usuário',
                html: `
                    <input id="name" class="swal2-input" placeholder="Nome" value="${user.name}">
                    <input id="email" class="swal2-input" placeholder="Email" value="${user.email}">
                    <input id="password" type="password" class="swal2-input" placeholder="Nova senha (opcional)">
                    <select id="role" class="swal2-select">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuário</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                    <select id="status" class="swal2-select">
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Ativo</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                    </select>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        role: document.getElementById('role').value,
                        status: document.getElementById('status').value
                    }
                }
            });

            if (formData) {
                // Remove senha se estiver vazia
                if (!formData.password) {
                    delete formData.password;
                }

                const updateResponse = await this.api.updateUser(userId, formData);
                if (!updateResponse.success) {
                    throw new Error(updateResponse.message);
                }

                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Usuário atualizado com sucesso',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                await this.loadUsers();
            }

        } catch (error) {
            console.error('[Users] Erro ao editar usuário:', error);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao editar usuário: ' + error.message,
                icon: 'error'
            });
        }
    }

    async deleteUser(userId) {
        try {
            const result = await Swal.fire({
                title: 'Confirmar exclusão',
                text: 'Tem certeza que deseja excluir este usuário?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const response = await this.api.deleteUser(userId);
                if (!response.success) {
                    throw new Error(response.message);
                }

                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Usuário excluído com sucesso',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                await this.loadUsers();
            }

        } catch (error) {
            console.error('[Users] Erro ao excluir usuário:', error);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao excluir usuário: ' + error.message,
                icon: 'error'
            });
        }
    }

    async addUser() {
        try {
            const { value: formData } = await Swal.fire({
                title: 'Novo Usuário',
                html: `
                    <input id="name" class="swal2-input" placeholder="Nome">
                    <input id="email" class="swal2-input" placeholder="Email">
                    <input id="password" type="password" class="swal2-input" placeholder="Senha">
                    <select id="role" class="swal2-select">
                        <option value="user">Usuário</option>
                        <option value="admin">Administrador</option>
                    </select>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Criar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        role: document.getElementById('role').value
                    }
                }
            });

            if (formData) {
                const response = await this.api.createUser(formData);
                if (!response.success) {
                    throw new Error(response.message);
                }

                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Usuário criado com sucesso',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                await this.loadUsers();
            }

        } catch (error) {
            console.error('[Users] Erro ao criar usuário:', error);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao criar usuário: ' + error.message,
                icon: 'error'
            });
        }
    }

    setupEvents() {
        // Botão de logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            try {
                const response = await this.api.logout();
                if (!response.success) {
                    throw new Error(response.message);
                }
                window.location.href = 'login.html';
            } catch (error) {
                console.error('[Users] Erro ao fazer logout:', error);
                window.location.href = 'login.html';
            }
        });

        // Menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const nav = document.getElementById('nav');
        const overlay = document.getElementById('overlay');
        const main = document.querySelector('main');

        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            main.classList.toggle('nav-active');

            // Atualiza o título do botão
            const isOpen = nav.classList.contains('active');
            menuToggle.title = isOpen ? 'Fechar menu' : 'Abrir menu';
        });

        overlay.addEventListener('click', () => {
            nav.classList.remove('active');
            overlay.classList.remove('active');
            main.classList.remove('nav-active');
            menuToggle.title = 'Abrir menu';
        });

        // Fecha o menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('active');
                    overlay.classList.remove('active');
                    main.classList.remove('nav-active');
                    menuToggle.title = 'Abrir menu';
                }
            });
        });

        // Botão de adicionar usuário
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.addUser();
        });
    }

    updateRecentUsersTable(users) {
        console.log('Atualizando tabela de usuários recentes com:', users);
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');

            // Formata a data do último login
            const lastLogin = user.last_login ? new Date(user.last_login) : new Date();
            const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(lastLogin);

            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <select class="role-select" data-user-id="${user.id}" onchange="users.changeUserRole(${user.id}, this.value)">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuário</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </td>
                <td><span class="status ${user.status}">${user.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <button class="btn btn-edit" onclick="users.editUser(${user.id})" title="Editar usuário">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="users.deleteUser(${user.id})" title="Excluir usuário">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    async changeUserRole(userId, newRole) {
        try {
            const result = await Swal.fire({
                title: 'Confirmar alteração',
                text: `Deseja realmente alterar o tipo do usuário para ${newRole === 'admin' ? 'Administrador' : 'Usuário'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não'
            });

            if (result.isConfirmed) {
                const response = await this.api.updateUserRole(userId, newRole);

                if (!response.success) {
                    throw new Error(response.message);
                }

                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Tipo de usuário atualizado com sucesso',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Recarrega a lista de usuários
                await this.loadUsers();
            } else {
                // Restaura o valor anterior do select
                await this.loadUsers();
            }
        } catch (error) {
            console.error('Erro ao alterar tipo do usuário:', error);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao alterar tipo do usuário: ' + error.message,
                icon: 'error'
            });
            // Restaura o valor anterior do select
            await this.loadUsers();
        }
    }
}

// Inicializa a classe
const users = new Users(); 