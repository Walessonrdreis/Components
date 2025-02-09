class ComponentAPI {
    constructor() {
        this.baseUrl = '/Components/dashboard/api';
        this.endpoints = {
            login: '/login.php',
            register: '/register.php',
            users: '/get_users.php',
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

    async login(data) {
        try {
            console.log('Fazendo requisição de login para:', this.baseUrl + this.endpoints.login);
            console.log('Dados enviados:', data);

            const response = await fetch(this.baseUrl + this.endpoints.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro detalhado no login:', error);
            return {
                success: false,
                message: 'Erro ao fazer login: ' + error.message
            };
        }
    }

    async createUser(data) {
        try {
            console.log('Criando usuário...');
            console.log('Dados enviados:', data);

            const response = await fetch(this.baseUrl + this.endpoints.createUser, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return {
                success: false,
                message: 'Erro ao criar usuário: ' + error.message
            };
        }
    }

    async register(data) {
        return this.createUser(data);
    }

    async getUsers() {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                console.log('Token não encontrado em getUsers');
                return {
                    success: false,
                    message: 'Token não encontrado'
                };
            }

            console.log('Fazendo requisição getUsers com token:', token);
            const response = await fetch(this.baseUrl + this.endpoints.users, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Status da resposta getUsers:', response.status);

            // Se receber 401, retorna erro de autenticação
            if (response.status === 401) {
                console.log('Token inválido em getUsers (401)');
                return {
                    success: false,
                    message: 'Sessão expirada'
                };
            }

            const responseData = await response.json();
            console.log('Dados recebidos de getUsers:', responseData);

            return responseData;

        } catch (error) {
            console.error('Erro em getUsers:', error);
            return {
                success: false,
                message: error.message
            };
        }
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

    async checkSession() {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                return {
                    success: false,
                    message: 'Token não encontrado'
                };
            }

            console.log('Verificando sessão com token:', token);
            const response = await fetch(this.baseUrl + this.endpoints.checkSession, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = await response.json();
            console.log('Resposta da verificação de sessão:', responseData);

            // Se receber 401 ou a resposta indicar falha
            if (response.status === 401 || !responseData.success) {
                console.log('Sessão inválida ou expirada');
                return {
                    success: false,
                    message: responseData.message || 'Sessão expirada'
                };
            }

            return responseData;
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            return {
                success: false,
                message: 'Erro ao verificar sessão: ' + error.message
            };
        }
    }

    async logout() {
        try {
            console.log('Fazendo logout...');
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(this.baseUrl + '/logout.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            sessionStorage.clear();

            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return {
                success: false,
                message: 'Erro ao fazer logout: ' + error.message
            };
        }
    }

    async getUser(userId) {
        try {
            console.log('Buscando usuário...');
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Token encontrado:', token);
            const response = await fetch(this.baseUrl + this.endpoints.getUser, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: userId })
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return {
                success: false,
                message: 'Erro ao buscar usuário: ' + error.message
            };
        }
    }

    async updateUser(userId, data) {
        try {
            console.log('Atualizando usuário...');
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Token encontrado:', token);
            const response = await fetch(this.baseUrl + this.endpoints.updateUser, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: userId, ...data })
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return {
                success: false,
                message: 'Erro ao atualizar usuário: ' + error.message
            };
        }
    }

    async deleteUser(userId) {
        try {
            console.log('Deletando usuário...');
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Token encontrado:', token);
            const response = await fetch(this.baseUrl + this.endpoints.deleteUser, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: userId })
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return {
                success: false,
                message: 'Erro ao deletar usuário: ' + error.message
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

    async updateUserRole(userId, role) {
        try {
            console.log('Atualizando tipo do usuário...');
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Token encontrado:', token);
            const response = await fetch(this.baseUrl + '/update_user_role.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: userId, role: role })
            });

            console.log('Status da resposta:', response.status);
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            return responseData;
        } catch (error) {
            console.error('Erro ao atualizar tipo do usuário:', error);
            return {
                success: false,
                message: 'Erro ao atualizar tipo do usuário: ' + error.message
            };
        }
    }
}
