class Dashboard {
    constructor() {
        this.api = new ComponentAPI();
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Verifica autenticação
            const token = localStorage.getItem('userToken');
            console.log('[Dashboard] Token encontrado:', !!token);
            
            if (!token) {
                console.log('[Dashboard] Sem token, redirecionando para login');
                this.redirectToLogin();
                return;
            }

            // Verifica sessão
            console.log('[Dashboard] Verificando sessão com a API...');
            const response = await this.api.checkSession();
            console.log('[Dashboard] Resposta da API:', response);

            if (!response.success) {
                console.log('[Dashboard] Sessão inválida, redirecionando para login');
                localStorage.removeItem('userToken');
                this.redirectToLogin();
                return;
            }

            // Atualiza interface
            console.log('[Dashboard] Sessão válida, atualizando interface');
            this.currentUser = response.data.user;
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('loading').style.display = 'none';
            
            // Configura logout
            this.setupLogout();
            
        } catch (error) {
            console.error('[Dashboard] Erro ao inicializar:', error);
            localStorage.removeItem('userToken');
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        console.log('[Dashboard] Redirecionando para login...');
        window.location.replace('./index.html');
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
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
                        console.log('[Dashboard] Iniciando logout...');
                        const response = await this.api.logout();
                        
                        if (response.success) {
                            console.log('[Dashboard] Logout realizado com sucesso');
                            localStorage.removeItem('userToken');
                            await Swal.fire({
                                title: 'Sucesso!',
                                text: 'Logout realizado com sucesso!',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            this.redirectToLogin();
                        } else {
                            throw new Error(response.message || 'Erro ao fazer logout');
                        }
                    }
                } catch (error) {
                    console.error('[Dashboard] Erro ao fazer logout:', error);
                    await Swal.fire({
                        title: 'Erro!',
                        text: error.message || 'Erro ao fazer logout',
                        icon: 'error'
                    });
                }
            });
        } else {
            console.error('[Dashboard] Botão de logout não encontrado');
        }
    }
}
