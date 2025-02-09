class User {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            onLogin: null,
            onLogout: null,
            onRegister: null,
            ...options
        };
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            console.log('Iniciando componente User...');

            // Verifica autenticação
            this.currentUser = await auth.checkAuthAndRedirect();

            // Renderiza a interface
            this.render();

            // Configura os eventos
            this.setupEventListeners();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            // Em caso de erro, renderiza o formulário de login
            this.currentUser = null;
            this.render();
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
            const email = formData.get('email');
            const password = formData.get('password');

            if (!email || !password) {
                throw new Error('Todos os campos são obrigatórios');
            }

            // Mostra loading
            Swal.fire({
                title: 'Aguarde...',
                text: 'Fazendo login...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            console.log('Tentando login com:', { email });

            // Tenta fazer login
            const user = await auth.login(email, password);
            console.log('Login bem sucedido:', user);

            // Mostra sucesso
            await Swal.fire({
                title: 'Sucesso!',
                text: 'Login realizado com sucesso!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Aguarda um momento para garantir que os dados foram salvos
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verifica se os dados foram salvos
            const savedToken = localStorage.getItem('userToken');
            const savedUser = localStorage.getItem('userData');

            if (!savedToken || !savedUser) {
                throw new Error('Erro ao salvar dados de autenticação');
            }

            // Redireciona
            console.log('Redirecionando para:', user.role === 'admin' ? 'dashboard.html' : 'home.html');
            window.location.href = user.role === 'admin' ? 'dashboard.html' : 'home.html';

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
            const result = await Swal.fire({
                title: 'Confirmar Logout',
                text: 'Você realmente deseja sair?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não'
            });

            if (result.isConfirmed) {
                await auth.logout();
            }
        } catch (error) {
            console.error('Erro no logout:', error);
            await auth.logout(); // Força logout mesmo com erro
        }
    }
}

// Exporta a classe User (manter APENAS esta linha no final do arquivo)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = User;
}
