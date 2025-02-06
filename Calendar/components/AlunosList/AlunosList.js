; (function ($) {
    'use strict';

    class AlunosList {
        constructor(config) {
            this.$container = $(`#${config.containerId}`);
            this.options = $.extend({}, AlunosList.defaults, config.options);
            this.init();
            this.carregarDisciplinas();
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
            // Ajusta a data para meio-dia UTC para evitar problemas com fuso horário
            const date = new Date(data + 'T12:00:00Z');
            return date.toLocaleDateString('pt-BR');
        }

        verAulas(alunoId) {
            // Busca as aulas do aluno
            fetch(`api/buscar-aulas-aluno.php?aluno_id=${alunoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.mostrarModalAulas(data.aulas, data.aluno);
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar aulas:', error);
                    alert('Erro ao carregar as aulas. Tente novamente.');
                });
        }

        mostrarModalAulas(aulas, aluno) {
            this.currentAlunoId = aluno.id; // Armazena o ID do aluno atual

            // Cria o modal se não existir
            if (!document.getElementById('modal-aulas')) {
                const modalHtml = `
                    <div id="modal-aulas" class="modal-aulas">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2>Aulas do Aluno</h2>
                                <button class="close-modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <div class="aluno-info"></div>
                                <div class="aulas-grid"></div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);

                // Adiciona evento para fechar
                const modal = document.getElementById('modal-aulas');
                modal.querySelector('.close-modal').addEventListener('click', () => {
                    modal.style.display = 'none';
                    this.currentAlunoId = null; // Limpa o ID do aluno ao fechar
                });
            }

            // Preenche o modal com os dados
            const modal = document.getElementById('modal-aulas');
            const alunoInfo = modal.querySelector('.aluno-info');
            const aulasGrid = modal.querySelector('.aulas-grid');

            alunoInfo.innerHTML = `
                <h3>${aluno.nome}</h3>
                <p>Disciplina: ${aluno.disciplina || 'Sem disciplina'}</p>
            `;

            this.atualizarTabelaAulas(aulas, modal);

            modal.style.display = 'block';
        }

        atualizarTabelaAulas(aulas, modal) {
            const aulasGrid = modal.querySelector('.aulas-grid');
            aulasGrid.innerHTML = `
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
            `;

            // Reaplica os eventos aos novos elementos
            aulasGrid.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', (e) => {
                    const aulaId = e.target.dataset.aulaId;
                    const novoStatus = e.target.value;
                    this.atualizarStatusAula(aulaId, novoStatus);
                });
            });

            aulasGrid.querySelectorAll('.btn-excluir').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const aulaId = e.target.closest('.btn-excluir').dataset.aulaId;
                    if (confirm('Tem certeza que deseja excluir esta aula?')) {
                        this.excluirAula(aulaId);
                    }
                });
            });
        }

        editarAluno(alunoId) {
            fetch(`api/buscar-aluno.php?aluno_id=${alunoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.mostrarModalEditar(data.aluno);
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar aluno:', error);
                    alert('Erro ao carregar dados do aluno. Tente novamente.');
                });
        }

        mostrarModalEditar(aluno) {
            let calendarEdit; // Declara a variável no escopo correto
            let isCalendarInitialized = false;

            const initializeCalendar = () => {
                const calendarConfig = {
                    firstDayOfWeek: 0,
                    dateFormat: 'dd/mm/yy',
                    updateCalendar: function () {
                        const year = this.currentDate.getFullYear();
                        const month = this.currentDate.getMonth();

                        // Atualiza o cabeçalho do mês
                        const monthName = this.currentDate.toLocaleString('pt-BR', { month: 'long' });
                        this.$container.find('.current-month')
                            .text(`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`);

                        const $daysContainer = this.$container.find('.days');
                        $daysContainer.empty();

                        // Gera os dias do mês
                        const firstDay = new Date(year, month, 1);
                        const lastDay = new Date(year, month + 1, 0);

                        // Adiciona os dias vazios no início
                        let firstDayOfWeek = firstDay.getDay() - this.options.firstDayOfWeek;
                        if (firstDayOfWeek < 0) firstDayOfWeek += 7;

                        for (let i = 0; i < firstDayOfWeek; i++) {
                            $daysContainer.append($('<div>'));
                        }

                        // Adiciona os dias do mês
                        for (let day = 1; day <= lastDay.getDate(); day++) {
                            // Ajusta para meio-dia para evitar problemas com fuso horário
                            const currentDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
                            const dateStr = currentDate.toISOString().slice(0, 10);

                            const $dayElement = $('<div>', {
                                class: 'calendar-day',
                                'data-date': dateStr,
                                text: day,
                                style: 'cursor: pointer;'
                            });

                            if (this.isToday(currentDate)) {
                                $dayElement.addClass('today');
                            }

                            if (this.selectedDates.has(dateStr)) {
                                $dayElement.addClass('selected');
                            }

                            $daysContainer.append($dayElement);
                        }
                    }
                };

                calendarEdit = $('#calendario-edicao').calendar(calendarConfig).data('calendar');

                // Configura os eventos do calendário
                calendarEdit.$container
                    .off()
                    .on('click', '.prev-month', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentMonth = calendarEdit.currentDate.getMonth();
                        calendarEdit.currentDate = new Date(
                            calendarEdit.currentDate.getFullYear(),
                            currentMonth - 1,
                            1
                        );
                        calendarEdit.updateCalendar();
                        return false; // Impede a propagação do evento
                    })
                    .on('click', '.next-month', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentMonth = calendarEdit.currentDate.getMonth();
                        calendarEdit.currentDate = new Date(
                            calendarEdit.currentDate.getFullYear(),
                            currentMonth + 1,
                            1
                        );
                        calendarEdit.updateCalendar();
                        return false; // Impede a propagação do evento
                    })
                    .on('click', '.calendar-day', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const $dayElement = $(this);
                        const dateStr = $dayElement.data('date');
                        if (!dateStr) return;

                        if (calendarEdit.selectedDates.has(dateStr)) {
                            calendarEdit.selectedDates.delete(dateStr);
                            calendarEdit.selectedDateTimes.delete(dateStr);
                            $dayElement.removeClass('selected');
                        } else {
                            calendarEdit.selectedDates.add(dateStr);
                            if (calendarEdit.useDefaultTime) {
                                calendarEdit.selectedDateTimes.set(dateStr, calendarEdit.defaultTime);
                            }
                            $dayElement.addClass('selected');
                        }

                        calendarEdit.updateSelectedDatesList();
                    });

                // Adiciona método para atualizar a lista de datas selecionadas
                calendarEdit.updateSelectedDatesList = function () {
                    const $list = this.$container.find('.selected-dates-list');
                    $list.empty();

                    if (this.selectedDates.size === 0) {
                        $list.html('<p>Nenhuma data selecionada</p>');
                        return;
                    }

                    const datesList = Array.from(this.selectedDates).sort();
                    datesList.forEach(dateStr => {
                        const date = new Date(dateStr + 'T12:00:00Z');
                        const formattedDate = date.toLocaleDateString('pt-BR');
                        const time = this.selectedDateTimes.get(dateStr) || this.defaultTime;

                        const $dateItem = $('<div>', {
                            class: 'selected-date-item',
                            style: 'display: flex; justify-content: space-between; align-items: center; margin: 5px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;'
                        }).append(
                            $('<div>', {
                                class: 'date-info',
                                style: 'display: flex; align-items: center; gap: 10px;'
                            }).append(
                                $('<span>', {
                                    text: formattedDate,
                                    style: 'font-weight: 500;'
                                }),
                                $('<input>', {
                                    type: 'time',
                                    value: time,
                                    class: 'time-input',
                                    disabled: this.useDefaultTime,
                                    style: 'padding: 2px 5px; border: 1px solid #ddd; border-radius: 3px;'
                                }).on('change', (e) => {
                                    if (!this.useDefaultTime) {
                                        this.selectedDateTimes.set(dateStr, e.target.value);
                                    }
                                })
                            ),
                            $('<button>', {
                                class: 'remove-date',
                                html: '<i class="fas fa-times"></i>',
                                style: 'background: none; border: none; color: #ff4444; cursor: pointer; padding: 5px;'
                            }).on('click', () => {
                                this.selectedDates.delete(dateStr);
                                this.selectedDateTimes.delete(dateStr);
                                this.updateCalendar();
                                this.updateSelectedDatesList();
                            })
                        );

                        $list.append($dateItem);
                    });
                };

                return calendarEdit;
            };

            if (!document.getElementById('modal-editar')) {
                const modalHtml = `
                    <div id="modal-editar" class="modal-editar">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2>Editar Aluno</h2>
                                <button class="close-modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form id="form-editar-aluno">
                                    <input type="hidden" name="aluno_id">
                                    <div class="form-group">
                                        <label for="edit-nome">Nome:</label>
                                        <input type="text" id="edit-nome" name="nome" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-email">Email:</label>
                                        <input type="email" id="edit-email" name="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-disciplina">Disciplina:</label>
                                        <select id="edit-disciplina" name="disciplina" class="select-disciplina">
                                            <option value="">Selecione uma disciplina</option>
                                        </select>
                                    </div>
                                    <div class="calendar-edit-container">
                                        <h3>Datas das Aulas</h3>
                                        <div id="calendario-edicao"></div>
                                        <div class="time-control-container">
                                            <div class="default-time-control">
                                                <label for="defaultTimeEdit">Horário padrão:
                                                    <input type="time" class="default-time-input" id="defaultTimeEdit" value="09:00">
                                                </label>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="useDefaultTimeEdit">
                                                    <span class="toggle-slider"></span>
                                                    <span class="sr-only">Usar horário padrão</span>
                                                </label>
                                                <span>Usar horário padrão</span>
                                            </div>
                                        </div>
                                        <div class="selected-dates-list"></div>
                                    </div>
                                    <button type="submit" class="btn-salvar">Salvar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);

                // Inicializa o calendário de edição
                setTimeout(() => {
                    calendarEdit = initializeCalendar();
                    isCalendarInitialized = true;

                    // Eventos do horário padrão
                    $('#useDefaultTimeEdit').on('change', function () {
                        if (calendarEdit) {
                            calendarEdit.useDefaultTime = this.checked;
                            if (this.checked) {
                                calendarEdit.defaultTime = $('#defaultTimeEdit').val();
                                calendarEdit.applyDefaultTimeToAll();
                            }
                            calendarEdit.updateSelectedDatesList();
                        }
                    });

                    $('#defaultTimeEdit').on('change', function () {
                        if (calendarEdit) {
                            calendarEdit.defaultTime = this.value;
                            if (calendarEdit.useDefaultTime) {
                                calendarEdit.applyDefaultTimeToAll();
                                calendarEdit.updateSelectedDatesList();
                            }
                        }
                    });

                    // Adiciona o evento de submit após o calendário estar pronto
                    const modal = document.getElementById('modal-editar');
                    modal.querySelector('#form-editar-aluno').addEventListener('submit', (e) => {
                        e.preventDefault();
                        if (calendarEdit) {
                            this.salvarEdicaoAluno(e.target, calendarEdit);
                        }
                    });

                    // Carrega as datas existentes no calendário após inicialização
                    if (calendarEdit) {
                        this.carregarDatasExistentes(aluno.id, calendarEdit);
                    }
                }, 100);

                // Adiciona eventos
                const modal = document.getElementById('modal-editar');
                modal.querySelector('.close-modal').addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            } else {
                // Se o modal já existe, reinicializa o calendário
                calendarEdit = initializeCalendar();
                this.carregarDatasExistentes(aluno.id, calendarEdit);
                document.getElementById('modal-editar').style.display = 'block';
            }

            // Carrega as disciplinas antes de preencher o formulário
            this.carregarDisciplinasParaEdicao().then(() => {
                // Preenche o formulário
                const modal = document.getElementById('modal-editar');
                modal.querySelector('[name="aluno_id"]').value = aluno.id;
                modal.querySelector('[name="nome"]').value = aluno.nome;
                modal.querySelector('[name="email"]').value = aluno.email || '';
                modal.querySelector('[name="disciplina"]').value = aluno.disciplina || '';

                modal.style.display = 'block';
            });
        }

        carregarDatasExistentes(alunoId, calendar) {
            if (!calendar) {
                console.error('Calendário não inicializado');
                return;
            }

            fetch(`api/buscar-aulas-aluno.php?aluno_id=${alunoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        calendar.selectedDates.clear();
                        calendar.selectedDateTimes.clear();

                        data.aulas.forEach(aula => {
                            // Ajusta a data para meio-dia UTC para evitar problemas com fuso horário
                            const [year, month, day] = aula.data_aula.split('-').map(Number);
                            const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                            const dateStr = date.toISOString().slice(0, 10);

                            calendar.selectedDates.add(dateStr);
                            calendar.selectedDateTimes.set(dateStr, aula.horario);
                        });

                        calendar.updateCalendar();
                        calendar.updateSelectedDatesList();
                    }
                });
        }

        salvarEdicaoAluno(form, calendar) {
            const alunoId = form.querySelector('[name="aluno_id"]').value;
            const nome = form.querySelector('[name="nome"]').value;
            const email = form.querySelector('[name="email"]').value;
            const disciplina = form.querySelector('[name="disciplina"]').value;

            // Coleta todas as datas e horários selecionados
            const aulas = [];
            calendar.selectedDates.forEach(dateStr => {
                aulas.push({
                    data: dateStr,
                    horario: calendar.selectedDateTimes.get(dateStr) || calendar.defaultTime
                });
            });

            fetch(`api/editar-aluno.php?aluno_id=${alunoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    email,
                    disciplina: disciplina,
                    aulas: aulas
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Atualiza a lista de alunos
                        this.loadAlunos();

                        // Fecha o modal
                        const modal = document.getElementById('modal-editar');
                        if (modal) {
                            modal.style.display = 'none';

                            // Limpa o calendário
                            calendar.selectedDates.clear();
                            calendar.selectedDateTimes.clear();
                            calendar.updateCalendar();
                            calendar.updateSelectedDatesList();

                            // Remove o modal para forçar uma reinicialização na próxima edição
                            modal.remove();
                        }

                        alert('Aluno atualizado com sucesso!');
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao atualizar aluno:', error);
                    alert('Erro ao atualizar aluno. Tente novamente.');
                });
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
            const modal = document.getElementById('modal-aulas');

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
                            fetch(`api/buscar-aulas-aluno.php?aluno_id=${this.currentAlunoId}`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        // Atualiza a tabela de aulas
                                        this.atualizarTabelaAulas(data.aulas, modal);
                                        // Atualiza a lista de alunos para refletir as mudanças
                                        this.loadAlunos();
                                    }
                                });
                        }
                        alert('Aula excluída com sucesso!');
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir aula:', error);
                    alert('Erro ao excluir aula. Tente novamente.');
                });
        }

        carregarDisciplinas() {
            fetch('api/listar-disciplinas.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.atualizarSelectDisciplinas(data.disciplinas);
                    }
                });
        }

        atualizarSelectDisciplinas(disciplinas) {
            const $selects = $('.select-disciplina');
            $selects.empty();

            disciplinas.forEach(disciplina => {
                $selects.append(`<option value="${disciplina.nome}">${disciplina.nome}</option>`);
            });
        }

        mostrarModalDisciplinas() {
            // Toggle: se já existe o modal, remove e retorna
            const existingModal = document.getElementById('modal-disciplinas');
            if (existingModal) {
                existingModal.remove();
                return;
            }

            const modalHtml = `
                <div id="modal-disciplinas" class="modal-disciplinas">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Gerenciar Disciplinas</h2>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="form-disciplina">
                                <div class="form-group">
                                    <label for="nova-disciplina">Nova Disciplina:</label>
                                    <input type="text" id="nova-disciplina" required>
                                    <button type="submit" class="btn-adicionar">Adicionar</button>
                                </div>
                            </form>
                            <div class="disciplinas-lista">
                                <h3>Disciplinas Cadastradas</h3>
                                <ul class="lista-disciplinas"></ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const btnGerenciar = document.querySelector('.btn-gerenciar-disciplinas');
            btnGerenciar.insertAdjacentHTML('afterend', modalHtml);

            const modal = document.getElementById('modal-disciplinas');

            // Adiciona evento para fechar no X
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });

            modal.querySelector('#form-disciplina').addEventListener('submit', (e) => {
                e.preventDefault();
                this.adicionarDisciplina(e.target);
            });

            this.atualizarListaDisciplinas();
        }

        atualizarListaDisciplinas() {
            fetch('api/listar-disciplinas.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const lista = document.querySelector('.lista-disciplinas');
                        lista.innerHTML = data.disciplinas.map(disciplina => `
                            <li>
                                ${disciplina.nome}
                                <button class="btn-remover-disciplina" data-id="${disciplina.id}" title="Remover Disciplina">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </li>
                        `).join('');

                        // Adiciona evento de remoção para os novos botões
                        lista.querySelectorAll('.btn-remover-disciplina').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                const disciplinaId = e.target.closest('.btn-remover-disciplina').dataset.id;
                                this.removerDisciplina(disciplinaId);
                            });
                        });
                    }
                });
        }

        adicionarDisciplina(form) {
            const nome = form.querySelector('#nova-disciplina').value;

            fetch('api/adicionar-disciplina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.atualizarListaDisciplinas();
                        this.carregarDisciplinas();
                        form.reset();
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    alert('Erro ao adicionar disciplina: ' + error.message);
                });
        }

        removerDisciplina(id) {
            if (confirm('Tem certeza que deseja remover esta disciplina?')) {
                fetch('api/remover-disciplina.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.atualizarListaDisciplinas();
                            this.carregarDisciplinas();
                        } else {
                            throw new Error(data.message);
                        }
                    })
                    .catch(error => {
                        alert('Erro ao remover disciplina: ' + error.message);
                    });
            }
        }

        // Novo método para carregar disciplinas de forma assíncrona
        carregarDisciplinasParaEdicao() {
            return fetch('api/listar-disciplinas.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const $select = $('#edit-disciplina');
                        $select.find('option:not(:first)').remove();

                        data.disciplinas.forEach(disciplina => {
                            $select.append(`<option value="${disciplina.nome}">${disciplina.nome}</option>`);
                        });
                    }
                })
                .catch(error => console.error('Erro ao carregar disciplinas:', error));
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