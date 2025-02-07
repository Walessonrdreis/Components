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
                    <button class="close-modal" title="Fechar modal"><i class="fas fa-times"></i></button>
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
                                    <input type="time" id="defaultTimeEdit" value="09:00"
                                        title="Selecione o horário padrão">
                                </label>
                                <label class="toggle-switch" for="useDefaultTimeEdit">
                                    <input type="checkbox" id="useDefaultTimeEdit" title="Usar horário padrão">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>Usar horário padrão</span>
                            </div>
                            <div id="calendario-edicao"></div>
                            <div class="selected-dates-list"></div>
                        </div>
                        <button type="submit" class="btn-salvar">
                            <i class="fas fa-save"></i> Salvar Alterações
                        </button>
                    </form>
                </div>
            </div>
        `);

        // Inicializa o calendário
        this.calendar = $('#calendario-edicao').calendar({
            firstDayOfWeek: 0,
            dateFormat: 'dd/mm/yy',
            showSelectedDates: false
        }).data('calendar');
    }

    setupEventListeners() {
        // Fechar modal
        this.$container.on('click', '.close-modal', () => this.fecharModal());
        this.$container.on('click', function (e) {
            if (e.target === this) {
                this.fecharModal();
            }
        }.bind(this));

        // Submit do formulário
        this.$container.on('submit', '#form-editar-aluno', (e) => {
            e.preventDefault();
            this.salvarEdicao();
        });

        // Controle de horário padrão
        this.$container.on('change', '#useDefaultTimeEdit', (e) => {
            const useDefault = e.target.checked;
            if (useDefault && this.calendar) {
                const defaultTime = this.$container.find('#defaultTimeEdit').val();
                this.calendar.defaultTime = defaultTime;
                this.calendar.useDefaultTime = true;
                this.calendar.applyDefaultTimeToAll();
                this.calendar.updateSelectedDatesList();
            } else if (this.calendar) {
                this.calendar.useDefaultTime = false;
                this.calendar.updateSelectedDatesList();
            }
        });

        this.$container.on('change', '#defaultTimeEdit', (e) => {
            if (this.calendar && this.$container.find('#useDefaultTimeEdit').is(':checked')) {
                this.calendar.defaultTime = e.target.value;
                this.calendar.applyDefaultTimeToAll();
                this.calendar.updateSelectedDatesList();
            }
        });
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
        this.$container.show();
    }

    fecharModal() {
        this.$container.hide();
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