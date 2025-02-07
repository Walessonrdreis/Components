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
            .catch(error => console.error('Erro ao carregar disciplinas:', error));
    }

    handleAdicionarDisciplina() {
        const $button = this.$container.find('.btn-adicionar-disciplina');
        const novaDisciplina = this.$container.find('#nova-disciplina').val().trim();
        if (!novaDisciplina) {
            alert('Por favor, insira o nome da disciplina.');
            return;
        }

        $button.prop('disabled', true); // Desabilita o botão temporariamente

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
                    alert('Disciplina adicionada com sucesso!');
                    this.$container.find('#nova-disciplina').val('');
                    this.loadDisciplinas();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao adicionar disciplina:', error);
                alert('Erro ao adicionar disciplina. Tente novamente.');
            })
            .finally(() => {
                $button.prop('disabled', false); // Reabilita o botão
            });
    }

    handleEditarDisciplina(event) {
        const $item = $(event.currentTarget).closest('.disciplina-item');
        const disciplinaId = $item.data('id');
        const novoNome = prompt('Editar nome da disciplina:', $item.find('.disciplina-nome').text());
        if (!novoNome) return;

        fetch('api/editar-disciplina.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: disciplinaId, nome: novoNome })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Disciplina editada com sucesso!');
                    this.loadDisciplinas();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao editar disciplina:', error);
                alert('Erro ao editar disciplina. Tente novamente.');
            });
    }

    handleExcluirDisciplina(event) {
        const $item = $(event.currentTarget).closest('.disciplina-item');
        const disciplinaId = $item.data('id');
        if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;

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
                    alert('Disciplina excluída com sucesso!');
                    this.loadDisciplinas();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao excluir disciplina:', error);
                alert('Erro ao excluir disciplina. Tente novamente.');
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