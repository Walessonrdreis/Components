class ModalEditarAluno {
    constructor(containerId, options = {}) {
        this.$container = $(`#${containerId}`);
        this.options = $.extend({}, ModalEditarAluno.defaults, options);
        this.calendar = null;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.loadDisciplinas();
    }

    render() {
        this.$container.html(`
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user-edit"></i> Editar Aluno</h2>
                    <button type="button" class="close-modal" title="Fechar modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="form-editar-aluno" class="modal-form">
                        <input type="hidden" name="aluno_id">
                        <div class="form-group">
                            <label for="edit-nome"><i class="fas fa-user"></i> Nome do Aluno</label>
                            <input type="text" id="edit-nome" name="nome" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-email"><i class="fas fa-envelope"></i> Email</label>
                            <input type="email" id="edit-email" name="email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-disciplina"><i class="fas fa-book"></i> Disciplina</label>
                            <select id="edit-disciplina" name="disciplina" class="form-control select-disciplina">
                                <option value="">Selecione uma disciplina</option>
                            </select>
                        </div>
                        <div class="calendar-edit-container">
                            <h3><i class="fas fa-calendar-alt"></i> Datas das Aulas</h3>
                            <div class="default-time-control">
                                <label for="defaultTimeEdit">
                                    <i class="fas fa-clock"></i> Horário padrão:
                                    <input type="time" id="defaultTimeEdit" value="09:00">
                                </label>
                                <label class="toggle-switch" for="useDefaultTimeEdit">
                                    <input type="checkbox" id="useDefaultTimeEdit">
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-label">Usar horário padrão</span>
                                </label>
                            </div>
                            <div id="calendario-edicao"></div>
                            <div id="datas-selecionadas-edicao" class="selected-dates-container">
                                <div class="selected-dates-list"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-cancelar">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="submit" class="btn-salvar">
                                <i class="fas fa-save"></i> Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `);

        // Inicializa o calendário
        this.calendar = $('#calendario-edicao').calendar({
            firstDayOfWeek: 0,
            dateFormat: 'dd/mm/yy',
            showSelectedDates: true,
            defaultTime: '09:00'
        }).data('calendar');

        // Inicializa o container de datas selecionadas
        $('#datas-selecionadas-edicao').selectedDates();
    }

    setupEventListeners() {
        // Fechar modal
        this.$container.on('click', '.close-modal, .btn-cancelar', () => this.fecharModal());

        // Fechar ao clicar fora do modal
        this.$container.on('click', (e) => {
            if ($(e.target).is(this.$container)) {
                this.fecharModal();
            }
        });

        // Submit do formulário
        this.$container.on('submit', '#form-editar-aluno', (e) => {
            e.preventDefault();
            this.salvarEdicao();
        });

        // Controle de horário padrão
        this.$container.on('change', '#useDefaultTimeEdit', (e) => {
            const useDefault = e.target.checked;
            if (this.calendar) {
                this.calendar.useDefaultTime = useDefault;
                const defaultTime = this.$container.find('#defaultTimeEdit').val();

                if (useDefault) {
                    this.calendar.defaultTime = defaultTime;
                    this.calendar.applyDefaultTimeToAll();
                }

                // Atualiza a lista de datas selecionadas
                this.updateSelectedDatesList();

                // Atualiza estado visual dos inputs de tempo
                this.$container.find('.time-input').prop('disabled', useDefault);
            }
        });

        // Mudança no horário padrão
        this.$container.on('change', '#defaultTimeEdit', (e) => {
            if (this.calendar && this.$container.find('#useDefaultTimeEdit').is(':checked')) {
                this.calendar.defaultTime = e.target.value;
                this.calendar.applyDefaultTimeToAll();
                this.updateSelectedDatesList();
            }
        });

        // Atualização de horários individuais
        this.$container.on('change', '.time-input', (e) => {
            if (this.calendar && !this.$container.find('#useDefaultTimeEdit').is(':checked')) {
                const $dateItem = $(e.target).closest('.selected-date-item');
                const dateStr = $dateItem.data('date');
                this.calendar.selectedDateTimes.set(dateStr, e.target.value);
            }
        });
    }

    updateSelectedDatesList() {
        if (this.calendar) {
            const selectedDates = Array.from(this.calendar.selectedDates);
            const selectedDateTimes = this.calendar.selectedDateTimes;
            const defaultTime = this.calendar.defaultTime;
            const useDefaultTime = this.calendar.useDefaultTime;

            const $list = this.$container.find('.selected-dates-list');
            $list.empty();

            if (selectedDates.length === 0) {
                $list.html('<p>Nenhuma data selecionada</p>');
                return;
            }

            selectedDates.sort().forEach(dateStr => {
                const [year, month, day] = dateStr.split('-');
                const formattedDate = new Date(year, parseInt(month) - 1, parseInt(day))
                    .toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                const time = selectedDateTimes.get(dateStr) || defaultTime;

                const $dateItem = $('<div>', {
                    class: 'selected-date-item',
                    'data-date': dateStr
                }).append(
                    $('<span>', { text: formattedDate }),
                    $('<input>', {
                        type: 'time',
                        value: time,
                        class: 'time-input',
                        disabled: useDefaultTime
                    }),
                    $('<button>', {
                        type: 'button',
                        class: 'remove-date',
                        html: '<i class="fas fa-times"></i>',
                        click: () => {
                            this.calendar.selectedDates.delete(dateStr);
                            this.calendar.selectedDateTimes.delete(dateStr);
                            this.calendar.updateCalendar();
                            this.updateSelectedDatesList();
                        }
                    })
                );

                $list.append($dateItem);
            });
        }
    }

    loadDisciplinas() {
        fetch('api/listar-disciplinas.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const $select = this.$container.find('#edit-disciplina');
                    $select.find('option:not(:first)').remove();
                    data.disciplinas.forEach(disciplina => {
                        $select.append(`<option value="${disciplina.nome}">${disciplina.nome}</option>`);
                    });
                }
            })
            .catch(error => console.error('Erro ao carregar disciplinas:', error));
    }

    carregarDadosAluno(alunoId) {
        fetch(`api/buscar-aluno.php?aluno_id=${alunoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.preencherFormulario(data.aluno);
                    this.carregarAulas(alunoId);
                    this.abrirModal();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar dados do aluno:', error);
                alert('Erro ao carregar dados do aluno. Tente novamente.');
            });
    }

    carregarAulas(alunoId) {
        fetch(`api/buscar-aulas-aluno.php?aluno_id=${alunoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && this.calendar) {
                    this.calendar.selectedDates.clear();
                    this.calendar.selectedDateTimes.clear();

                    data.aulas.forEach(aula => {
                        const [year, month, day] = aula.data_aula.split('-').map(Number);
                        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                        const dateStr = date.toISOString().slice(0, 10);

                        this.calendar.selectedDates.add(dateStr);
                        this.calendar.selectedDateTimes.set(dateStr, aula.horario);
                    });

                    this.calendar.updateCalendar();
                }
            })
            .catch(error => {
                console.error('Erro ao carregar aulas:', error);
            });
    }

    preencherFormulario(aluno) {
        this.$container.find('[name="aluno_id"]').val(aluno.id);
        this.$container.find('[name="nome"]').val(aluno.nome);
        this.$container.find('[name="email"]').val(aluno.email || '');
        this.$container.find('[name="disciplina"]').val(aluno.disciplina || '');
    }

    salvarEdicao() {
        const form = this.$container.find('#form-editar-aluno')[0];
        const alunoId = form.querySelector('[name="aluno_id"]').value;
        const nome = form.querySelector('[name="nome"]').value;
        const email = form.querySelector('[name="email"]').value;
        const disciplina = form.querySelector('[name="disciplina"]').value;

        const aulas = [];
        if (this.calendar) {
            this.calendar.selectedDates.forEach(dateStr => {
                aulas.push({
                    data: dateStr,
                    horario: this.calendar.selectedDateTimes.get(dateStr) || this.calendar.defaultTime
                });
            });
        }

        fetch(`api/editar-aluno.php?aluno_id=${alunoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                email,
                disciplina,
                aulas
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Aluno atualizado com sucesso!');
                    this.fecharModal();
                    this.options.onSave && this.options.onSave();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao atualizar aluno:', error);
                alert('Erro ao atualizar aluno. Tente novamente.');
            });
    }

    abrirModal() {
        this.$container.addClass('show');
        $('body').addClass('modal-open');
    }

    fecharModal() {
        this.$container.removeClass('show');
        $('body').removeClass('modal-open');

        // Limpa o formulário
        this.$container.find('#form-editar-aluno')[0].reset();

        // Limpa o calendário
        if (this.calendar) {
            this.calendar.selectedDates.clear();
            this.calendar.selectedDateTimes.clear();
            this.calendar.updateCalendar();
            this.updateSelectedDatesList();
        }
    }
}

// Configurações padrão
ModalEditarAluno.defaults = {
    onSave: null
};

// Registra como plugin jQuery
$.fn.modalEditarAluno = function (options) {
    return this.each(function () {
        if (!$.data(this, 'modalEditarAluno')) {
            $.data(this, 'modalEditarAluno', new ModalEditarAluno(this.id, options));
        }
    });
}; 