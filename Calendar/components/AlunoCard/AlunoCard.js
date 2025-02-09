/**
 * @class AlunoCard
 * @description Componente responsável por renderizar e gerenciar o card de informações do aluno
 */
class AlunoCard {
    /**
     * @constructor
     * @param {HTMLElement} element - Elemento onde o card será renderizado
     * @param {Object} options - Opções de configuração do componente
     */
    constructor(element, options = {}) {
        if (!element) throw new Error('Elemento container é obrigatório');

        this.$container = $(element);
        this.options = this._mergeOptions(options);
        this.state = {
            aluno: null,
            isLoading: false,
            error: null
        };

        this.init();
    }

    /**
     * @private
     * Mescla as opções padrão com as opções fornecidas
     */
    _mergeOptions(options) {
        const defaults = {
            aluno: null,
            onVerAulas: null,
            onVisualizarPDF: null,
            onEditar: null,
            animationDuration: 200,
            tooltipDelay: 300,
            classes: {
                container: 'aluno-card',
                info: 'aluno-info',
                matricula: 'matricula-container',
                disciplina: 'disciplina',
                proximaAula: 'proxima-aula',
                actions: 'aluno-actions',
                loading: 'aluno-card-loading',
                error: 'aluno-card-error'
            }
        };

        return $.extend(true, {}, defaults, options);
    }

    /**
     * @private
     * Inicializa o componente
     */
    init() {
        try {
            this._validateOptions();
            this._setState({ aluno: this.options.aluno });
            this._render();
            this._setupEventListeners();
            this._initTooltips();
        } catch (error) {
            console.error('Erro ao inicializar AlunoCard:', error);
            this._setState({ error: error.message });
            this._renderError();
        }
    }

    /**
     * @private
     * Valida as opções fornecidas
     */
    _validateOptions() {
        const { aluno, onVerAulas, onVisualizarPDF, onEditar } = this.options;

        if (aluno && typeof aluno !== 'object') {
            throw new Error('Opção aluno deve ser um objeto');
        }

        const callbacks = { onVerAulas, onVisualizarPDF, onEditar };
        Object.entries(callbacks).forEach(([name, callback]) => {
            if (callback && typeof callback !== 'function') {
                throw new Error(`${name} deve ser uma função`);
            }
        });
    }

    /**
     * @private
     * Atualiza o estado do componente
     */
    _setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    /**
     * @private
     * Renderiza o componente
     */
    _render() {
        const { aluno } = this.state;
        if (!aluno) return;

        const html = this._generateTemplate();
        this.$container
            .hide()
            .html(html)
            .fadeIn(this.options.animationDuration);
    }

    /**
     * @private
     * Gera o template HTML do card
     */
    _generateTemplate() {
        const { aluno } = this.state;
        const { classes } = this.options;

        return `
            <div class="${classes.container}" data-aluno-id="${aluno.id}">
                <div class="${classes.info}">
                    <h4 class="aluno-nome">${this._escapeHtml(aluno.nome)}</h4>
                    <div class="${classes.matricula}">
                        <span class="matricula-label">Matrícula:</span>
                        <span class="matricula-valor">${this._escapeHtml(aluno.matricula || 'Não informada')}</span>
                    </div>
                    <p class="${classes.disciplina}">
                        <i class="fas fa-book"></i>
                        ${this._escapeHtml(aluno.disciplina || 'Sem disciplina')}
                    </p>
                    <p class="${classes.proximaAula}">
                        <i class="fas fa-calendar"></i>
                        Próxima aula: ${this._formatarData(aluno.proxima_aula)}
                    </p>
                </div>
                ${this._generateActionsTemplate()}
            </div>
        `;
    }

    /**
     * @private
     * Gera o template HTML das ações do card
     */
    _generateActionsTemplate() {
        const { classes } = this.options;

        return `
            <div class="${classes.actions}">
                <button class="btn-action btn-pdf" data-action="pdf" data-tooltip="Visualizar PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn-action btn-aulas" data-action="aulas" data-tooltip="Ver aulas">
                    <i class="fas fa-calendar-alt"></i>
                </button>
                <button class="btn-action btn-editar" data-action="editar" data-tooltip="Editar aluno">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    /**
     * @private
     * Configura os event listeners
     */
    _setupEventListeners() {
        this.$container.on('click', '.btn-action', (e) => {
            const $button = $(e.currentTarget);
            const action = $button.data('action');
            const alunoId = this._getAlunoId();

            if (!alunoId) return;

            const actionHandlers = {
                'pdf': () => this._handlePDFClick(alunoId),
                'aulas': () => this._handleAulasClick(alunoId),
                'editar': () => this._handleEditarClick(alunoId)
            };

            const handler = actionHandlers[action];
            if (handler) {
                handler();
                this._animateButtonClick($button);
            }
        });
    }

    /**
     * @private
     * Inicializa os tooltips
     */
    _initTooltips() {
        const { tooltipDelay } = this.options;

        this.$container.find('[data-tooltip]').each((_, element) => {
            const $element = $(element);
            const tooltip = $element.data('tooltip');

            $element.tooltip({
                title: tooltip,
                placement: 'top',
                delay: { show: tooltipDelay, hide: 0 }
            });
        });
    }

    /**
     * @private
     * Handlers dos eventos de clique
     */
    _handlePDFClick(alunoId) {
        const { onVisualizarPDF } = this.options;
        if (onVisualizarPDF) onVisualizarPDF(alunoId);
    }

    _handleAulasClick(alunoId) {
        const { onVerAulas } = this.options;
        if (onVerAulas) onVerAulas(alunoId);
    }

    _handleEditarClick(alunoId) {
        const { onEditar } = this.options;
        if (onEditar) onEditar(alunoId);
    }

    /**
     * @private
     * Métodos utilitários
     */
    _getAlunoId() {
        return this.$container.find(`.${this.options.classes.container}`).data('aluno-id');
    }

    _animateButtonClick($button) {
        $button.addClass('btn-clicked');
        setTimeout(() => $button.removeClass('btn-clicked'), 200);
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    _formatarData(data) {
        if (!data) return 'Não agendada';
        try {
            const date = new Date(data + 'T12:00:00Z');
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data inválida';
        }
    }

    _renderError() {
        const { error } = this.state;
        const { classes } = this.options;

        this.$container.html(`
            <div class="${classes.error}">
                <i class="fas fa-exclamation-circle"></i>
                <p>${this._escapeHtml(error)}</p>
            </div>
        `);
    }

    /**
     * Métodos públicos
     */
    atualizarDados(aluno) {
        if (!aluno || typeof aluno !== 'object') {
            throw new Error('Dados do aluno inválidos');
        }

        this._setState({ aluno });
        this._render();
        this._initTooltips();
    }

    destruir() {
        this.$container.find('[data-tooltip]').tooltip('dispose');
        this.$container.off().empty();
    }
}

// Registra como plugin jQuery
$.fn.alunoCard = function (options) {
    return this.each(function () {
        const $this = $(this);
        let instance = $this.data('alunoCard');

        if (!instance) {
            instance = new AlunoCard(this, options);
            $this.data('alunoCard', instance);
        } else if (options.aluno) {
            instance.atualizarDados(options.aluno);
        }
    });
}; 