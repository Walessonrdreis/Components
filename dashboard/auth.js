class Auth {
    constructor() {
        this.api = new ComponentAPI();
        this.TOKEN_KEY = 'userToken';
        this.USER_KEY = 'userData';
        this.isCheckingAuth = false;
    }

    // Verifica se o usuário está autenticado
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    // Obtém o token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Obtém os dados do usuário
    getUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    // Salva os dados de autenticação
    setAuth(token, user) {
        console.log('Salvando dados de autenticação:', { token: !!token, user });
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    // Remove os dados de autenticação
    clearAuth() {
        console.log('Limpando dados de autenticação');
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.clear();

        // Limpa cookies
        document.cookie.split(";").forEach(c => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    }

    // Faz login
    async login(email, password) {
        try {
            console.log('Iniciando processo de login para:', email);
            const response = await this.api.login({ email, password });

            if (response.success) {
                console.log('Login bem sucedido:', { user: response.data.user });
                this.setAuth(response.data.token, response.data.user);
                return response.data.user;
            }

            throw new Error(response.message || 'Erro ao fazer login');
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    // Faz logout
    async logout() {
        try {
            console.log('Iniciando processo de logout');

            // Limpa dados locais primeiro
            this.clearAuth();

            // Tenta fazer logout na API
            try {
                await this.api.logout();
            } catch (error) {
                console.warn('Erro ao fazer logout na API:', error);
            }

            // Força redirecionamento para login
            console.log('Redirecionando para página de login');
            window.location.href = 'login.html';

            // Força recarregamento
            setTimeout(() => {
                window.location.reload(true);
            }, 100);
        } catch (error) {
            console.error('Erro no logout:', error);
            this.clearAuth();
            window.location.href = 'login.html';
        }
    }

    // Verifica a sessão atual
    async checkSession() {
        if (this.isCheckingAuth) {
            console.log('Já existe uma verificação em andamento');
            return null;
        }

        try {
            this.isCheckingAuth = true;
            console.log('Iniciando verificação de sessão');

            const token = this.getToken();
            const user = this.getUser();

            if (!token || !user) {
                console.log('Sem token ou dados do usuário');
                return null;
            }

            console.log('Verificando sessão com a API');
            const response = await this.api.checkSession();

            if (!response.success) {
                console.log('Sessão inválida:', response.message);
                this.clearAuth();
                return null;
            }

            console.log('Sessão válida:', response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('Erro na verificação de sessão:', error);
            this.clearAuth();
            return null;
        } finally {
            this.isCheckingAuth = false;
        }
    }

    // Verifica e redireciona baseado na autenticação
    async checkAuthAndRedirect() {
        const currentPath = window.location.pathname.toLowerCase();
        const isLoginPage = currentPath.includes('login.html');

        try {
            console.log('Verificando autenticação para:', currentPath);

            // Se estiver na página de login, não precisa verificar a sessão
            if (isLoginPage) {
                console.log('Página de login, não precisa verificar sessão');
                return null;
            }

            const user = await this.checkSession();

            // Se não estiver na página de login e não tiver usuário, redireciona
            if (!isLoginPage && !user) {
                console.log('Usuário não autenticado em página protegida, redirecionando para login');
                window.location.href = 'login.html';
                return null;
            }

            console.log('Autenticação OK:', user);
            return user;
        } catch (error) {
            console.error('Erro na verificação de autenticação:', error);
            if (!isLoginPage) {
                window.location.href = 'login.html';
            }
            return null;
        }
    }
}

// Cria uma instância global
const auth = new Auth(); 