class User {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            onLogin: null,
            onLogout: null,
            onRegister: null,
            ...options
        };
        this.api = new ComponentAPI();
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.render();
        this.setupEventListeners();
    }

    async checkAuth() {
        console.log('Verificando autenticação...');

        const token = localStorage.getItem('userToken');
        const currentPath = window.location.pathname.toLowerCase();
        const isLoginPage = currentPath.includes('login.html') || currentPath.includes('index.html');
        const isDashboardPage = currentPath.includes('dashboard.html');
        const isUsersPage = currentPath.includes('users.html');
        const isHomePage = currentPath.includes('home.html');

        console.log('Estado atual:', {
            hasToken: !!token,
            currentPath,
            isLoginPage,
            isDashboardPage,
            isUsersPage,
            isHomePage
        });

        // Se não tem token e está na página de login, permanece
        if (!token && isLoginPage) {
            console.log('Sem token na página de login, permanece aqui');
            return;
        }

        // Se não tem token e está em outra página, redireciona para login
        if (!token && (isDashboardPage || isHomePage || isUsersPage)) {
            console.log('Sem token em página protegida, redirecionando para login');
            window.location.replace('./login.html');
            return;
        }

        // Se tem token, verifica se é válido
        if (token) {
            try {
                console.log('Verificando token com a API...');
                const response = await this.api.checkSession();

                if (response.success) {
                    console.log('Token válido, usuário:', response.data.user);
                    this.currentUser = response.data.user;

                    // Se está na página de login com token válido
                    if (isLoginPage) {
                        const redirectUrl = this.currentUser.role === 'admin' ? 'dashboard.html' : 'home.html';
                        console.log(`Usuário autenticado na página de login, redirecionando para ${redirectUrl}`);
                        window.location.replace(`./${redirectUrl}`);
                        return;
                    }

                    // Verifica permissões baseadas no papel do usuário
                    if (this.currentUser.role === 'user') {
                        // Usuários normais só podem acessar a home
                        if (!isHomePage) {
                            console.log('Usuário normal tentando acessar página restrita, redirecionando para home');
                            window.location.replace('./home.html');
                            return;
                        }
                    } else if (this.currentUser.role === 'admin') {
                        // Admins podem acessar qualquer página
                        console.log('Admin autenticado, permitindo acesso');
                    }

                    // Se chegou aqui, o usuário tem permissão para a página atual
                    console.log('Usuário tem permissão para esta página');
                    this.render();
                    return;

                } else {
                    console.log('Token inválido:', response.message);
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');
                    this.currentUser = null;

                    if (!isLoginPage) {
                        console.log('Token inválido em página protegida, redirecionando para login');
                        window.location.replace('./login.html');
                        return;
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar token:', error);
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
                this.currentUser = null;

                if (!isLoginPage) {
                    window.location.replace('./login.html');
                    return;
                }
            }
        }
    }

    render() {
        if (!this.container) return;

        if (this.currentUser) {
            this.renderUserInfo();
        } else {
            this.renderLoginForm();
        }
    }

    renderLoginForm() {
        this.container.innerHTML = `
            <div class="login-form">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Entrar</button>
                </form>
                <div class="form-links">
                    <p>Não tem uma conta? <a href="#" id="show-register">Cadastre-se</a></p>
                </div>
            </div>
        `;
    }

    renderRegisterForm() {
        this.container.innerHTML = `
            <div class="register-form active">
                <h2>Cadastro</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="name">Nome:</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirmar Senha:</label>
                        <input type="password" id="confirm-password" name="confirm-password" required>
                    </div>
                    <button type="submit">Cadastrar</button>
                </form>
                <div class="form-links">
                    <p>Já tem uma conta? <a href="#" id="show-login">Fazer Login</a></p>
                </div>
            </div>
        `;
    }

    renderUserInfo() {
        this.container.innerHTML = `
            <div class="user-info">
                <h3>Bem-vindo, ${this.currentUser.name}!</h3>
                <button id="logout-btn">Sair</button>
            </div>
        `;
    }

    setupEventListeners() {
        if (!this.container) return;

        console.log('Configurando event listeners...');

        // Login form
        const loginForm = this.container.querySelector('#login-form');
        if (loginForm) {
            console.log('Form de login encontrado');
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                await this.handleLogin(formData);
            });
        }

        // Register form
        const registerForm = this.container.querySelector('#register-form');
        if (registerForm) {
            console.log('Form de registro encontrado');
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                await this.handleRegister(formData);
            });
        }

        // Show register form
        const showRegister = this.container.querySelector('#show-register');
        if (showRegister) {
            console.log('Link para registro encontrado');
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mostrando formulário de registro');
                this.renderRegisterForm();
                this.setupEventListeners();
            });
        }

        // Show login form
        const showLogin = this.container.querySelector('#show-login');
        if (showLogin) {
            console.log('Link para login encontrado');
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mostrando formulário de login');
                this.renderLoginForm();
                this.setupEventListeners();
            });
        }

        // Logout button
        const logoutBtn = this.container.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.handleLogout();
            });
        }
    }

    validateLoginForm(formData) {
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            throw new Error('Todos os campos são obrigatórios');
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error('Email inválido');
        }

        if (password.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres');
        }

        return true;
    }

    validateRegisterForm(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if (!name || !email || !password || !confirmPassword) {
            throw new Error('Todos os campos são obrigatórios');
        }

        if (name.length < 3) {
            throw new Error('O nome deve ter no mínimo 3 caracteres');
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error('Email inválido');
        }

        if (password.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres');
        }

        if (password !== confirmPassword) {
            throw new Error('As senhas não conferem');
        }

        return true;
    }

    async handleLogin(formData) {
        try {
            // Validar formulário
            this.validateLoginForm(formData);

            console.log('Iniciando login...');
            const response = await this.api.login({
                email: formData.get('email'),
                password: formData.get('password')
            });

            console.log('Resposta do login:', response);

            if (response.success) {
                console.log('Login bem sucedido:', response.data);

                // Armazena o token e dados do usuário
                const token = response.data.token;
                const userData = response.data.user;

                // Mostra mensagem de sucesso
                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Login realizado com sucesso!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Armazena os dados após mostrar a mensagem
                localStorage.setItem('userToken', token);
                localStorage.setItem('userData', JSON.stringify(userData));
                this.currentUser = userData;

                console.log('Dados salvos no localStorage');
                console.log('Token:', token);
                console.log('User:', userData);

                // Determina a URL de redirecionamento
                const redirectUrl = `./${userData.role === 'admin' ? 'dashboard' : 'home'}.html`;
                console.log('Redirecionando para:', redirectUrl);

                // Aguarda um pequeno intervalo antes de redirecionar
                await new Promise(resolve => setTimeout(resolve, 100));
                window.location.href = redirectUrl;
            } else {
                console.error('Erro no login:', response.message);
                await Swal.fire({
                    title: 'Erro!',
                    text: response.message || 'Erro ao fazer login',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Erro no login:', error);
            await Swal.fire({
                title: 'Erro!',
                text: error.message,
                icon: 'error'
            });
        }
    }

    async handleRegister(formData) {
        try {
            // Validar formulário
            this.validateRegisterForm(formData);

            const response = await this.api.createUser({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            });

            if (response.success) {
                // Armazena o token
                if (response.data && response.data.token) {
                    localStorage.setItem('userToken', response.data.token);
                    this.currentUser = response.data.user;

                    await Swal.fire({
                        title: 'Sucesso!',
                        text: 'Cadastro realizado com sucesso!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });

                    // Redireciona para a home
                    window.location.href = './home.html';
                } else {
                    throw new Error('Token não encontrado na resposta');
                }
            } else {
                await Swal.fire({
                    title: 'Erro!',
                    text: response.message || 'Erro ao fazer cadastro',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            await Swal.fire({
                title: 'Erro!',
                text: error.message,
                icon: 'error'
            });
        }
    }

    async handleLogout() {
        try {
            if (window.Swal) {
                const result = await Swal.fire({
                    title: 'Confirmar Logout',
                    text: 'Você realmente deseja sair?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sim',
                    cancelButtonText: 'Não'
                });

                if (!result.isConfirmed) {
                    return;
                }
            }

            const response = await this.api.logout();

            if (response.success) {
                localStorage.removeItem('userToken');
                this.currentUser = null;
                this.render();

                if (this.options.onLogout) {
                    this.options.onLogout();
                }

                if (window.Swal) {
                    await Swal.fire({
                        title: 'Sucesso!',
                        text: 'Logout realizado com sucesso',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    alert('Logout realizado com sucesso');
                }

                window.location.href = './index.html';
            } else {
                if (window.Swal) {
                    await Swal.fire({
                        title: 'Erro!',
                        text: response.message || 'Erro ao fazer logout',
                        icon: 'error'
                    });
                } else {
                    alert(response.message || 'Erro ao fazer logout');
                }
            }
        } catch (error) {
            console.error('Erro no logout:', error);
            if (window.Swal) {
                await Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao fazer logout',
                    icon: 'error'
                });
            } else {
                alert('Erro ao fazer logout');
            }
        }
    }
}

// Exporta a classe User (manter APENAS esta linha no final do arquivo)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = User;
}
