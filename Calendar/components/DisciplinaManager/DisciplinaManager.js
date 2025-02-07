class DisciplinaManager {
    constructor(containerId) {
        this.$container = $(`#${containerId}`);
        this.isOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDisciplinas();
        this.$container.hide();
    }

    setupEventListeners() {
        this.$container.on('click', '.btn-adicionar-disciplina', () => {
            this.handleAdicionarDisciplina();
        });

        this.$container.on('click', '.btn-editar-disciplina', (e) => {
            this.handleEditarDisciplina(e);
        });

        this.$container.on('click', '.btn-excluir-disciplina', (e) => {
            this.handleExcluirDisciplina(e);
        });
    }

    toggleDisciplinaManager() {
        if (this.isOpen) {
            this.$container.slideUp(200);
            this.isOpen = false;
        } else {
            this.$container.slideDown(200);
            this.isOpen = true;
            this.loadDisciplinas();
        }
    }

    loadDisciplinas() {
        loader.show('Carregando disciplinas...', 500).then(() => {
            fetch('api/listar-disciplinas.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const $list = this.$container.find('.disciplinas-list');
                        $list.empty();
                        data.disciplinas.forEach(disciplina => {
                            $list.append(`
                                <div class="disciplina-item" data-id="${disciplina.id}">
                                    <span class="disciplina-nome">${disciplina.nome}</span>
                                    <button class="btn-editar-disciplina"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn-excluir-disciplina"><i class="fas fa-trash-alt"></i> Excluir</button>
                                </div>
                            `);
                        });
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar disciplinas:', error);
                    notifications.error('Erro ao carregar disciplinas. Tente novamente.');
                });
        });
    }

    handleAdicionarDisciplina() {
        const $button = this.$container.find('.btn-adicionar-disciplina');
        const novaDisciplina = this.$container.find('#nova-disciplina').val().trim();
        if (!novaDisciplina) {
            notifications.warning('Por favor, insira o nome da disciplina.');
            return;
        }

        $button.prop('disabled', true);

        loader.show('Adicionando disciplina...', 500).then(() => {
            fetch('api/adicionar-disciplina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome: novaDisciplina })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        notifications.success('Disciplina adicionada com sucesso!');
                        this.$container.find('#nova-disciplina').val('');
                        this.loadDisciplinas();
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao adicionar disciplina:', error);
                    notifications.error('Erro ao adicionar disciplina. Tente novamente.');
                })
                .finally(() => {
                    $button.prop('disabled', false);
                });
        });
    }

    async handleEditarDisciplina(event) {
        const $item = $(event.currentTarget).closest('.disciplina-item');
        const disciplinaId = $item.data('id');
        const nomeAtual = $item.find('.disciplina-nome').text();

        // Criar o modal
        const modal = document.createElement('div');
        modal.className = 'modal-editar-disciplina';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Editar Disciplina</h2>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="nome-disciplina">Nome da Disciplina</label>
                        <input type="text" id="nome-disciplina" class="form-control" value="${nomeAtual}" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancelar"><i class="fas fa-times"></i> Cancelar</button>
                    <button class="btn-salvar"><i class="fas fa-check"></i> Salvar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focar no input
        const input = modal.querySelector('#nome-disciplina');
        input.focus();
        input.select();

        // Função para fechar o modal
        const fecharModal = () => {
            modal.remove();
        };

        // Eventos dos botões
        modal.querySelector('.close-modal').addEventListener('click', fecharModal);
        modal.querySelector('.btn-cancelar').addEventListener('click', fecharModal);

        // Retornar uma Promise que será resolvida quando o usuário confirmar ou cancelar
        return new Promise((resolve, reject) => {
            modal.querySelector('.btn-salvar').addEventListener('click', async () => {
                const novoNome = input.value.trim();

                if (!novoNome) {
                    notifications.error('O nome da disciplina não pode estar vazio.');
                    return;
                }

                if (novoNome === nomeAtual) {
                    fecharModal();
                    resolve(null);
                    return;
                }

                loader.show('Atualizando disciplina...');

                try {
                    const response = await fetch('api/editar-disciplina.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: disciplinaId,
                            nome: novoNome
                        })
                    });

                    const data = await response.json();

                    if (data.status === 'success') {
                        notifications.success('Disciplina atualizada com sucesso!');
                        fecharModal();
                        resolve(novoNome);
                    } else {
                        notifications.error(data.message || 'Erro ao atualizar disciplina.');
                    }
                } catch (error) {
                    console.error('Erro ao atualizar disciplina:', error);
                    notifications.error('Erro ao atualizar disciplina. Por favor, tente novamente.');
                } finally {
                    loader.hide();
                }
            });

            // Fechar modal ao pressionar ESC
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    fecharModal();
                    resolve(null);
                }
            });

            // Submeter formulário ao pressionar Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    modal.querySelector('.btn-salvar').click();
                }
            });
        });
    }

    async handleExcluirDisciplina(event) {
        const $item = $(event.currentTarget).closest('.disciplina-item');
        const disciplinaId = $item.data('id');
        const nomeDisciplina = $item.find('.disciplina-nome').text();

        const confirmou = await notifications.confirm(`Tem certeza que deseja excluir a disciplina "${nomeDisciplina}"?`);
        if (!confirmou) return;

        loader.show('Excluindo disciplina...', 500).then(() => {
            fetch('api/remover-disciplina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: disciplinaId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        notifications.success('Disciplina excluída com sucesso!');
                        this.loadDisciplinas();
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir disciplina:', error);
                    notifications.error('Erro ao excluir disciplina. Tente novamente.');
                });
        });
    }
}

// Registra o plugin jQuery para o componente DisciplinaManager
$.fn.disciplinaManager = function () {
    return this.each(function () {
        const disciplinaManager = new DisciplinaManager(this.id);
        $(this).data('disciplinaManager', disciplinaManager);
    });
}; 