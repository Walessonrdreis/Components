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
                        ${aulas.map(aula => `
                            <tr>
                                <td>${new Date(aula.data_aula).toLocaleDateString('pt-BR')}</td>
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
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Adiciona eventos para atualizar status e excluir
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

            modal.style.display = 'block';
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
                const calendarEdit = $('#calendario-edicao').calendar({
                    firstDayOfWeek: 0,
                    dateFormat: 'dd/mm/yy'
                }).data('calendar');

                // Adiciona eventos
                const modal = document.getElementById('modal-editar');
                modal.querySelector('.close-modal').addEventListener('click', () => {
                    modal.style.display = 'none';
                });

                modal.querySelector('#form-editar-aluno').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.salvarEdicaoAluno(e.target, calendarEdit);
                });

                // Eventos do horário padrão
                $('#useDefaultTimeEdit').on('change', function () {
                    calendarEdit.useDefaultTime = this.checked;
                });

                $('#defaultTimeEdit').on('change', function () {
                    calendarEdit.defaultTime = this.value;
                });
            }

            // Carrega as disciplinas antes de preencher o formulário
            this.carregarDisciplinasParaEdicao().then(() => {
                // Preenche o formulário
                const modal = document.getElementById('modal-editar');
                modal.querySelector('[name="aluno_id"]').value = aluno.id;
                modal.querySelector('[name="nome"]').value = aluno.nome;
                modal.querySelector('[name="email"]').value = aluno.email || '';
                modal.querySelector('[name="disciplina"]').value = aluno.disciplina || '';

                // Carrega as datas existentes no calendário
                this.carregarDatasExistentes(aluno.id);

                modal.style.display = 'block';
            });
        }

        carregarDatasExistentes(alunoId) {
            fetch(`api/buscar-aulas-aluno.php?aluno_id=${alunoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const calendar = $('#calendario-edicao').data('calendar');
                        calendar.selectedDates.clear();
                        calendar.selectedDateTimes.clear();

                        data.aulas.forEach(aula => {
                            const dateStr = aula.data_aula;
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
            calendar.selectedDates.forEach(date => {
                aulas.push({
                    data: date,
                    horario: calendar.selectedDateTimes.get(date) || calendar.defaultTime
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
                    disciplina: disciplina.toLowerCase(),
                    aulas: aulas
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Aluno atualizado com sucesso!');
                        this.loadAlunos();
                        document.getElementById('modal-editar').style.display = 'none';
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
                        alert('Aula excluída com sucesso!');
                        // Recarrega a lista de aulas
                        this.verAulas(this.currentAlunoId);
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
            if (!document.getElementById('modal-disciplinas')) {
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
                document.body.insertAdjacentHTML('beforeend', modalHtml);

                // Eventos do modal
                const modal = document.getElementById('modal-disciplinas');

                modal.querySelector('.close-modal').addEventListener('click', () => {
                    modal.style.display = 'none';
                });

                modal.querySelector('#form-disciplina').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.adicionarDisciplina(e.target);
                });

                // Delegação de eventos para remoção
                modal.querySelector('.lista-disciplinas').addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-remover')) {
                        const disciplinaId = e.target.dataset.id;
                        this.removerDisciplina(disciplinaId);
                    }
                });
            }

            this.atualizarListaDisciplinas();
            document.getElementById('modal-disciplinas').style.display = 'block';
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
                                <button class="btn-remover" data-id="${disciplina.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </li>
                        `).join('');
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