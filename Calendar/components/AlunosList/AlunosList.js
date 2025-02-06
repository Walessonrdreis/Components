; (function ($) {
    'use strict';

    class AlunosList {
        constructor(config) {
            this.$container = $(`#${config.containerId}`);
            this.options = $.extend({}, AlunosList.defaults, config.options);
            this.init();
        }

        init() {
            this.setupStructure();
            this.loadAlunos();
            this.setupEventListeners();
        }

        setupStructure() {
            this.$container.html(`
                <div class="alunos-list-header">
                    <h3>Alunos Cadastrados</h3>
                    <div class="alunos-search">
                        <input type="text" placeholder="Buscar aluno..." class="search-input">
                    </div>
                </div>
                <div class="alunos-list-content">
                    <div class="alunos-grid">
                        <!-- Alunos serão inseridos aqui -->
                    </div>
                    <div class="loading-spinner">Carregando...</div>
                </div>
            `);
        }

        loadAlunos() {
            this.$container.find('.loading-spinner').show();

            fetch('api/listar-alunos.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.renderAlunos(data.alunos);
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar alunos:', error);
                    this.$container.find('.alunos-grid').html(
                        '<div class="error-message">Erro ao carregar alunos. Tente novamente.</div>'
                    );
                })
                .finally(() => {
                    this.$container.find('.loading-spinner').hide();
                });
        }

        renderAlunos(alunos) {
            const $grid = this.$container.find('.alunos-grid');
            $grid.empty();

            alunos.forEach(aluno => {
                const $alunoCard = $(`
                    <div class="aluno-card" data-aluno-id="${aluno.id}">
                        <div class="aluno-info">
                            <h4>${aluno.nome}</h4>
                            <p class="tipo-aula">${aluno.tipo_aula}</p>
                            <p class="proxima-aula">Próxima aula: ${this.formatarData(aluno.proxima_aula)}</p>
                        </div>
                        <div class="aluno-actions">
                            <button class="btn-pdf" title="Visualizar PDF">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="btn-ver-aulas" title="Ver aulas">
                                <i class="fas fa-calendar-alt"></i>
                            </button>
                            <button class="btn-editar" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `);

                $grid.append($alunoCard);
            });
        }

        setupEventListeners() {
            // Busca de alunos
            this.$container.find('.search-input').on('input', $.debounce(300, (e) => {
                const searchTerm = e.target.value.toLowerCase();
                this.filterAlunos(searchTerm);
            }));

            // Ações dos botões
            this.$container.on('click', '.btn-ver-aulas', (e) => {
                const alunoId = $(e.target).closest('.aluno-card').data('aluno-id');
                this.verAulas(alunoId);
            });

            this.$container.on('click', '.btn-editar', (e) => {
                const alunoId = $(e.target).closest('.aluno-card').data('aluno-id');
                this.editarAluno(alunoId);
            });

            this.$container.on('click', '.btn-pdf', (e) => {
                const alunoId = $(e.target).closest('.aluno-card').data('aluno-id');
                window.pdfViewer.showPdf(alunoId);
            });
        }

        filterAlunos(searchTerm) {
            const $cards = this.$container.find('.aluno-card');
            $cards.each(function () {
                const $card = $(this);
                const nome = $card.find('h4').text().toLowerCase();
                if (nome.includes(searchTerm)) {
                    $card.show();
                } else {
                    $card.hide();
                }
            });
        }

        formatarData(data) {
            if (!data) return 'Não agendada';
            return new Date(data).toLocaleDateString('pt-BR');
        }

        verAulas(alunoId) {
            // Implementar visualização de aulas
            console.log('Ver aulas do aluno:', alunoId);
        }

        editarAluno(alunoId) {
            // Implementar edição de aluno
            console.log('Editar aluno:', alunoId);
        }
    }

    // Configurações padrão
    AlunosList.defaults = {
        itemsPerPage: 10,
        autoRefresh: false,
        refreshInterval: 60000 // 1 minuto
    };

    // Registra como plugin jQuery
    $.fn.alunosList = function (options) {
        return this.each(function () {
            if (!$.data(this, 'alunosList')) {
                $.data(this, 'alunosList', new AlunosList({
                    containerId: this.id,
                    options: options
                }));
            }
        });
    };

})(jQuery); 