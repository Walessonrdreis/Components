class ModalAulas {
    constructor(containerId, options = {}) {
        this.$container = $(`#${containerId}`);
        this.options = $.extend({}, ModalAulas.defaults, options);
        this.currentAlunoId = null;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.$container.html(`
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-alt"></i> Aulas do Aluno</h2>
                    <button class="close-modal" title="Fechar"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="aluno-info"></div>
                    <div class="aulas-grid"></div>
                </div>
            </div>
        `);
    }

    setupEventListeners() {
        // Fechar modal
        this.$container.on('click', '.close-modal', () => this.fecharModal());
        this.$container.on('click', (e) => {
            if (e.target === this.$container[0]) {
                this.fecharModal();
            }
        });

        // Eventos para os botões da tabela de aulas
        this.$container.on('change', '.status-select', (e) => {
            const aulaId = $(e.target).data('aula-id');
            const novoStatus = e.target.value;
            this.atualizarStatusAula(aulaId, novoStatus);
        });

        this.$container.on('click', '.btn-excluir', (e) => {
            const aulaId = $(e.target).closest('.btn-excluir').data('aula-id');
            if (confirm('Tem certeza que deseja excluir esta aula?')) {
                this.excluirAula(aulaId);
            }
        });
    }

    carregarAulas(alunoId) {
        this.currentAlunoId = alunoId;

        fetch(`api/buscar-aulas-aluno.php?aluno_id=${alunoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.preencherDadosAluno(data.aluno);
                    this.atualizarTabelaAulas(data.aulas);
                    this.abrirModal();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar aulas:', error);
                alert('Erro ao carregar as aulas. Tente novamente.');
            });
    }

    preencherDadosAluno(aluno) {
        const alunoInfo = this.$container.find('.aluno-info');
        alunoInfo.html(`
            <div class="info-aluno-container">
                <div class="info-aluno-detalhes">
                    <h3><i class="fas fa-user-circle"></i> ${aluno.nome}</h3>
                    <p><i class="fas fa-book"></i> Disciplina: ${aluno.disciplina || 'Sem disciplina'}</p>
                </div>
            </div>
        `);
    }

    atualizarTabelaAulas(aulas) {
        const aulasGrid = this.$container.find('.aulas-grid');
        aulasGrid.html(`
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${aulas.map(aula => {
            const date = new Date(aula.data_aula + 'T12:00:00Z');
            const formattedDate = date.toLocaleDateString('pt-BR');
            return `
                            <tr>
                                <td>${formattedDate}</td>
                                <td>${aula.horario}</td>
                                <td>
                                    <select class="status-select" data-aula-id="${aula.id}">
                                        <option value="agendado" ${aula.status === 'agendado' ? 'selected' : ''}>Agendado</option>
                                        <option value="realizado" ${aula.status === 'realizado' ? 'selected' : ''}>Realizado</option>
                                        <option value="cancelado" ${aula.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                                    </select>
                                </td>
                                <td>
                                    <button class="btn-excluir" data-aula-id="${aula.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `);
    }

    atualizarStatusAula(aulaId, novoStatus) {
        fetch('api/atualizar-status-aula.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aula_id: aulaId,
                status: novoStatus
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Status atualizado com sucesso!');
                    this.options.onStatusChange && this.options.onStatusChange(aulaId, novoStatus);
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao atualizar status:', error);
                alert('Erro ao atualizar status. Tente novamente.');
            });
    }

    excluirAula(aulaId) {
        fetch('api/excluir-aula.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aula_id: aulaId
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Recarrega as aulas do aluno atual
                    if (this.currentAlunoId) {
                        this.carregarAulas(this.currentAlunoId);
                    }
                    alert('Aula excluída com sucesso!');
                    this.options.onDelete && this.options.onDelete(aulaId);
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao excluir aula:', error);
                alert('Erro ao excluir aula. Tente novamente.');
            });
    }

    abrirModal() {
        this.$container.show();
    }

    fecharModal() {
        this.$container.hide();
        this.currentAlunoId = null;
    }
}

// Configurações padrão
ModalAulas.defaults = {
    onStatusChange: null,
    onDelete: null
};

// Registra como plugin jQuery
$.fn.modalAulas = function (options) {
    return this.each(function () {
        if (!$.data(this, 'modalAulas')) {
            $.data(this, 'modalAulas', new ModalAulas(this.id, options));
        }
    });
}; 