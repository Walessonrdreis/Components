class ComponentAPI {
    constructor() {
        this.baseUrl = '/Components/dashboard/api';
        this.endpoints = {
            login: '/login.php',
            register: '/register.php',
            users: '/users.php',
            createUser: '/create_user.php',
            updateUser: '/update_user.php',
            deleteUser: '/delete_user.php',
            getUser: '/get_user.php',
            updateProfile: '/update_profile.php',
            createAdmin: '/create_admin.php',
            checkSession: '/check_session.php',
            verifyToken: '/verify_token.php',
            logout: '/logout.php'
        };
    }

    async makeRequest(endpoint, options = {}) {
        try {
            console.log('Fazendo requisição para:', endpoint);

            // Adiciona o token de autenticação se existir
            const token = localStorage.getItem('userToken');
            if (token) {
                console.log('Token encontrado:', token);
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };
            }

            // Faz a requisição
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            console.log('Status da resposta:', response.status);

            // Converte a resposta para JSON
            const data = await response.json();
            console.log('Dados da resposta:', data);

            // Verifica se houve erro de autenticação
            if (response.status === 401) {
                console.log('Erro de autenticação (401)');

                // Se não for uma requisição de logout, limpa os dados e redireciona
                if (!endpoint.includes('logout.php')) {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');

                    // Só redireciona se não estiver na página de login e não for uma requisição de login
                    const isLoginPage = window.location.pathname.toLowerCase().includes('login.html');
                    const isLoginRequest = endpoint.includes('login.php');

                    if (!isLoginPage && !isLoginRequest) {
                        window.location.replace('./login.html');
                    }
                }

                throw new Error(data.message || 'Sessão expirada');
            }

            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // Verifica a sessão do usuário
    async checkSession() {
        return this.makeRequest('/check_session.php');
    }

    // Faz login
    async login(credentials) {
        return this.makeRequest('/login.php', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    // Faz logout
    async logout() {
        try {
            console.log('Iniciando processo de logout na API...');
            const token = localStorage.getItem('userToken');

            if (!token) {
                console.warn('Token não encontrado para logout');
                return { success: true, message: 'Logout realizado' };
            }

            const response = await this.makeRequest('/logout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Resposta do logout na API:', response);
            return response;
        } catch (error) {
            console.error('Erro no logout da API:', error);
            // Retorna sucesso mesmo com erro para garantir que o usuário seja deslogado localmente
            return { success: true, message: 'Logout realizado com erro na API' };
        }
    }

    // Busca todos os usuários
    async getUsers() {
        return this.makeRequest('/users.php');
    }

    // Busca um usuário específico
    async getUser(id) {
        return this.makeRequest(`/users.php?id=${id}`);
    }

    // Cria um novo usuário
    async createUser(userData) {
        return this.makeRequest('/users.php', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Atualiza um usuário
    async updateUser(id, userData) {
        return this.makeRequest(`/users.php?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Deleta um usuário
    async deleteUser(id) {
        return this.makeRequest(`/users.php?id=${id}`, {
            method: 'DELETE'
        });
    }

    async register(data) {
        return this.createUser(data);
    }

    async createAdmin(data) {
        try {
            console.log('Criando admin...');
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Token encontrado:', token);
            const response = await fetch(this.baseUrl + this.endpoints.createAdmin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro detalhado ao criar admin:', error);
            return {
                success: false,
                message: 'Erro ao criar admin: ' + error.message
            };
        }
    }

    async verifyToken(token) {
        try {
            if (!token) {
                console.log('Token não fornecido');
                return {
                    success: false,
                    message: 'Token não fornecido',
                    data: null
                };
            }

            console.log('Verificando token:', token);
            const response = await fetch(this.baseUrl + '/verify_token.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Log da resposta para debug
            console.log('Status da verificação:', response.status);
            console.log('Headers:', Object.fromEntries(response.headers.entries()));

            // Se receber 401, retorna erro de autenticação
            if (response.status === 401) {
                console.log('Token inválido (401)');
                return {
                    success: false,
                    message: 'Token inválido ou expirado',
                    data: null
                };
            }

            const responseData = await response.json();
            console.log('Dados da verificação:', responseData);

            // Garante uma estrutura de resposta consistente
            return {
                success: responseData.success || false,
                message: responseData.message || 'Erro na verificação do token',
                data: responseData.data || null
            };

        } catch (error) {
            console.error('Erro ao verificar token:', error);
            return {
                success: false,
                message: 'Erro ao verificar token: ' + error.message,
                data: null
            };
        }
    }

    async updateProfile(data) {
        try {
            console.log('Atualizando perfil...');
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Token encontrado:', token);
            const response = await fetch(this.baseUrl + this.endpoints.updateProfile, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            // Se a atualização foi bem sucedida, atualiza os dados do usuário no localStorage
            if (responseData.success) {
                localStorage.setItem('userToken', responseData.token);
                localStorage.setItem('userData', JSON.stringify(responseData.data));
            }

            return responseData;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return {
                success: false,
                message: 'Erro ao atualizar perfil: ' + error.message
            };
        }
    }
}
