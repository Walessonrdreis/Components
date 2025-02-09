import { ALUNO_CARD_DEFAULTS, CSS_CLASSES } from './constants';
import { renderAlunoCard } from './templates';
import { domUtils } from './utils';

class AlunoCard {
    constructor(element, options = {}) {
        this.$container = $(element);
        this.options = $.extend({}, ALUNO_CARD_DEFAULTS, options);
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const { aluno } = this.options;
        if (!aluno) return;

        console.log('Dados do aluno recebidos:', aluno);
        console.log('Matrícula do aluno:', aluno.matricula);

        const html = renderAlunoCard(aluno);
        console.log('HTML gerado:', html);

        this.$container.html(html);
        console.log('HTML renderizado:', this.$container.html());

        // Verificar se o elemento da matrícula está presente
        const matriculaElement = this.$container.find('.matricula-container');
        console.log('Elemento da matrícula:', matriculaElement.length ? 'encontrado' : 'não encontrado');
    }

    setupEventListeners() {
        const { onVerAulas, onVisualizarPDF, onEditar } = this.options;

        this.$container.on('click', `.${CSS_CLASSES.buttons.verAulas}`, () => {
            const alunoId = domUtils.findAlunoId(this.$container);
            onVerAulas && onVerAulas(alunoId);
        });

        this.$container.on('click', `.${CSS_CLASSES.buttons.editar}`, () => {
            const alunoId = domUtils.findAlunoId(this.$container);
            onEditar && onEditar(alunoId);
        });

        this.$container.on('click', `.${CSS_CLASSES.buttons.pdf}`, () => {
            const alunoId = domUtils.findAlunoId(this.$container);
            onVisualizarPDF && onVisualizarPDF(alunoId);
        });
    }

    atualizarDados(aluno) {
        this.options.aluno = aluno;
        this.render();
    }
}

// Registra como plugin jQuery
$.fn.alunoCard = function (options) {
    return this.each(function () {
        if (!$.data(this, 'alunoCard')) {
            $.data(this, 'alunoCard', new AlunoCard(this, options));
        } else if (options.aluno) {
            $.data(this, 'alunoCard').atualizarDados(options.aluno);
        }
    });
}; 