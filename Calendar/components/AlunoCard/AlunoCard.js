class AlunoCard {
    constructor(element, options = {}) {
        this.$container = $(element);
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

    carregarDadosParaEdicao(alunoId) {
        // Primeiro, desabilita o botão de cadastro
        const $btnCadastrar = $('.btn-cadastrar');
        $btnCadastrar.prop('disabled', true).css('opacity', '0.5');

        // Carrega os dados do aluno
        fetch(`api/buscar-aluno.php?aluno_id=${alunoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Busca as aulas do aluno
                    return fetch(`api/buscar-aulas-aluno.php?aluno_id=${alunoId}`)
                        .then(response => response.json())
                        .then(aulasData => {
                            if (aulasData.success) {
                                this.preencherFormulario(data.aluno, aulasData.aulas, alunoId);
                            }
                            return aulasData;
                        });
                }
                throw new Error(data.message);
            })
            .catch(error => {
                console.error('Erro ao carregar dados do aluno:', error);
                alert('Erro ao carregar dados do aluno. Tente novamente.');
                $btnCadastrar.prop('disabled', false).css('opacity', '1');
            });
    }

    preencherFormulario(aluno, aulas, alunoId) {
        // Atualiza o título do formulário
        $('#form-container .section-title').html('<i class="fas fa-user-edit"></i> Editar Aluno');

        // Preenche os campos do formulário
        $('#nome').val(aluno.nome);
        $('#email').val(aluno.email);
        $('#disciplina').val(aluno.disciplina);

        // Atualiza o calendário com as aulas existentes
        const calendar = $('#meu-calendario').data('calendar');
        if (calendar) {
            calendar.selectedDates.clear();
            calendar.selectedDateTimes.clear();

            aulas.forEach(aula => {
                calendar.selectedDates.add(aula.data_aula);
                calendar.selectedDateTimes.set(aula.data_aula, aula.horario);
            });

            calendar.updateCalendar();
            calendar.updateSelectedDatesList();
        }

        // Adiciona os botões de edição e exclusão
        const $formContainer = $('#form-container');
        const $botoesAntigos = $formContainer.find('.form-buttons, .btn-cadastrar');
        $botoesAntigos.hide();

        // Cria os novos botões se ainda não existirem
        if (!$formContainer.find('.botoes-edicao').length) {
            const $botoesEdicao = $('<div>', {
                class: 'botoes-edicao',
                style: 'display: flex; gap: 10px; justify-content: center; margin-top: 20px;'
            }).appendTo($formContainer);

            $('<button>', {
                type: 'button',
                class: 'btn-editar-confirmar',
                html: '<i class="fas fa-save"></i> Confirmar Edição',
                click: () => this.confirmarEdicao(alunoId)
            }).appendTo($botoesEdicao);

            $('<button>', {
                type: 'button',
                class: 'btn-deletar',
                html: '<i class="fas fa-trash"></i> Deletar Aluno',
                click: () => this.deletarAluno(alunoId)
            }).appendTo($botoesEdicao);
        }

        // Rola até o formulário
        $('html, body').animate({
            scrollTop: $formContainer.offset().top - 20
        }, 500);
    }

    confirmarEdicao(alunoId) {
        const nome = $('#nome').val();
        const email = $('#email').val();
        const disciplina = $('#disciplina').val();
        const calendar = $('#meu-calendario').data('calendar');

        const aulas = [];
        if (calendar) {
            calendar.selectedDates.forEach(dateStr => {
                aulas.push({
                    data: dateStr,
                    horario: calendar.selectedDateTimes.get(dateStr) || calendar.defaultTime
                });
            });
        }

        fetch(`api/editar-aluno.php?aluno_id=${alunoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, disciplina, aulas })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Aluno atualizado com sucesso!');
                    this.limparFormulario();
                    if (window.alunosList) {
                        window.alunosList.loadAlunos();
                    }
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao atualizar aluno:', error);
                alert('Erro ao atualizar aluno. Tente novamente.');
            });
    }

    deletarAluno(alunoId) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            fetch(`api/excluir-aluno.php?aluno_id=${alunoId}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Aluno excluído com sucesso!');
                        this.limparFormulario();
                        if (window.alunosList) {
                            window.alunosList.loadAlunos();
                        }
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir aluno:', error);
                    alert('Erro ao excluir aluno. Tente novamente.');
                });
        }
    }

    limparFormulario() {
        // Restaura o título original
        $('#form-container .section-title').html('<i class="fas fa-user-plus"></i> Cadastrar Novo Aluno');

        // Limpa os campos
        $('#form-container form')[0].reset();

        // Limpa o calendário
        const calendar = $('#meu-calendario').data('calendar');
        if (calendar) {
            calendar.selectedDates.clear();
            calendar.selectedDateTimes.clear();
            calendar.updateCalendar();
            calendar.updateSelectedDatesList();
        }

        // Remove os botões de edição e mostra o botão de cadastro
        $('.botoes-edicao').remove();
        $('.btn-cadastrar').prop('disabled', false).css('opacity', '1').show();
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
    onVisualizarPDF: null,
    onEditar: null
};

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