class AlunoCard {
    constructor(containerId, options = {}) {
        this.$container = $(`#${containerId}`);
        this.options = $.extend({}, AlunoCard.defaults, options);
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const { aluno } = this.options;
        if (!aluno) return;

        this.$container.html(`
            <div class="aluno-card" data-aluno-id="${aluno.id}">
                <div class="aluno-info">
                    <h4>${aluno.nome}</h4>
                    <p class="disciplina">${aluno.disciplina || 'Sem disciplina'}</p>
                    <p class="proxima-aula">Próxima aula: ${this.formatarData(aluno.proxima_aula)}</p>
                </div>
                <div class="aluno-actions">
                    <button class="btn-pdf" data-tooltip="Visualizar PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn-ver-aulas" data-tooltip="Ver aulas">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                    <button class="btn-editar" data-tooltip="Editar aluno">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `);
    }

    setupEventListeners() {
        this.$container.on('click', '.btn-ver-aulas', () => {
            const alunoId = this.$container.find('.aluno-card').data('aluno-id');
            this.options.onVerAulas && this.options.onVerAulas(alunoId);
        });

        this.$container.on('click', '.btn-editar', () => {
            const alunoId = this.$container.find('.aluno-card').data('aluno-id');
            this.options.onEditar && this.options.onEditar(alunoId);
        });

        this.$container.on('click', '.btn-pdf', () => {
            const alunoId = this.$container.find('.aluno-card').data('aluno-id');
            this.options.onVisualizarPDF && this.options.onVisualizarPDF(alunoId);
        });
    }

    formatarData(data) {
        if (!data) return 'Não agendada';
        const date = new Date(data + 'T12:00:00Z');
        return date.toLocaleDateString('pt-BR');
    }

    // Método para atualizar os dados do aluno
    atualizarDados(aluno) {
        this.options.aluno = aluno;
        this.render();
    }
}

// Configurações padrão
AlunoCard.defaults = {
    aluno: null,
    onVerAulas: null,
    onEditar: null,
    onVisualizarPDF: null
};

// Registra como plugin jQuery
$.fn.alunoCard = function (options) {
    return this.each(function () {
        if (!$.data(this, 'alunoCard')) {
            $.data(this, 'alunoCard', new AlunoCard(this.id, options));
        } else if (options.aluno) {
            // Se já existe uma instância e novos dados foram passados, atualiza
            $.data(this, 'alunoCard').atualizarDados(options.aluno);
        }
    });
}; 