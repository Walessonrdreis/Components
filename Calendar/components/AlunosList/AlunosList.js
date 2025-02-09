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
                        <input type="text" class="search-input" placeholder="Buscar aluno...">
                    </div>
                </div>
                <div class="alunos-grid"></div>
            `);
        }

        loadAlunos() {
            fetch('api/listar-alunos.php')
                .then(response => response.json())
                .then(data => {
                    console.log('AlunosList - loadAlunos response:', data);
                    if (data.success) {
                        this.renderAlunos(data.alunos);
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar alunos:', error);
                    this.$container.find('.alunos-grid').html(`
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            Erro ao carregar alunos. Tente novamente.
                        </div>
                    `);
                });
        }

        renderAlunos(alunos) {
            const $grid = this.$container.find('.alunos-grid');
            $grid.empty();
            console.log('AlunosList - renderAlunos data:', alunos);

            if (alunos.length === 0) {
                $grid.html(`
                    <div class="no-alunos">
                        <i class="fas fa-users"></i>
                        <p>Nenhum aluno cadastrado</p>
                    </div>
                `);
                return;
            }

            alunos.forEach(aluno => {
                console.log('Criando card para aluno:', aluno);
                const $card = $('<div>', {
                    class: 'aluno-card-container',
                    id: `aluno-card-${aluno.id}`
                });
                $card.alunoCard({
                    aluno: aluno,
                    onVerAulas: (alunoId) => this.verAulas(alunoId),
                    onVisualizarPDF: (alunoId) => this.visualizarPDF(alunoId),
                    onEditar: (alunoId) => this.editarAluno(alunoId)
                });
                $grid.append($card);
            });
        }

        setupEventListeners() {
            // Busca de alunos
            this.$container.find('.search-input').on('input', $.debounce(300, (e) => {
                this.filterAlunos(e.target.value);
            }));
        }

        filterAlunos(searchTerm) {
            const $cards = this.$container.find('.aluno-card');
            searchTerm = searchTerm.toLowerCase();

            $cards.each(function () {
                const $card = $(this);
                const nome = $card.find('h4').text().toLowerCase();
                const disciplina = $card.find('.disciplina').text().toLowerCase();

                if (nome.includes(searchTerm) || disciplina.includes(searchTerm)) {
                    $card.show();
                } else {
                    $card.hide();
                }
            });
        }

        formatarData(data) {
            if (!data) return 'Não agendada';
            const date = new Date(data);
            return date.toLocaleDateString('pt-BR');
        }

        verAulas(alunoId) {
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
            const modal = $('<div>', {
                class: 'modal-aulas',
                html: `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2><i class="fas fa-calendar-alt"></i> Aulas do Aluno</h2>
                            <button class="close-modal"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <div class="info-aluno-container">
                                <div class="info-aluno-detalhes">
                                    <h3><i class="fas fa-user-circle"></i> ${aluno.nome}</h3>
                                     <div class="matricula-container">
                                    Matrícula: ${aluno.matricula || 'Não informada'}
                                    </div>
                                    <p><i class="fas fa-book"></i> Disciplina: ${aluno.disciplina || 'Sem disciplina'}</p>
                                </div>
                            </div>
                            <div class="aulas-grid"></div>
                        </div>
                    </div>
                `
            });

            // Adiciona o modal ao body
            $('body').append(modal);
            modal.fadeIn(200);

            // Atualiza a tabela de aulas
            this.atualizarTabelaAulas(aulas, modal);

            // Eventos do modal
            modal.on('click', '.close-modal', () => {
                modal.fadeOut(200, () => modal.remove());
            });

            modal.on('click', (e) => {
                if ($(e.target).is(modal)) {
                    modal.fadeOut(200, () => modal.remove());
                }
            });
        }

        atualizarTabelaAulas(aulas, modal) {
            const $grid = modal.find('.aulas-grid');
            $grid.html(`
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
                const date = new Date(aula.data_aula);
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

            // Eventos da tabela
            $grid.on('change', '.status-select', (e) => {
                const aulaId = $(e.target).data('aula-id');
                const novoStatus = e.target.value;
                this.atualizarStatusAula(aulaId, novoStatus);
            });

            $grid.on('click', '.btn-excluir', (e) => {
                const aulaId = $(e.target).closest('.btn-excluir').data('aula-id');
                if (confirm('Tem certeza que deseja excluir esta aula?')) {
                    this.excluirAula(aulaId);
                }
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
                        this.loadAlunos(); // Recarrega a lista de alunos
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir aula:', error);
                    alert('Erro ao excluir aula. Tente novamente.');
                });
        }

        visualizarPDF(alunoId) {
            window.open(`api/gerar-pdf-aluno.php?aluno_id=${alunoId}`, '_blank');
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

        editarAluno(alunoId) {
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
                                    this.preencherFormularioEdicao(data.aluno, aulasData.aulas, alunoId);
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

        preencherFormularioEdicao(aluno, aulas, alunoId) {
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

                const self = this; // Armazena a referência ao this
                $('<button>', {
                    type: 'button',
                    class: 'btn-deletar',
                    html: '<i class="fas fa-trash"></i> Deletar Aluno',
                    click: function () {
                        self.deletarAluno(alunoId);
                    }
                }).appendTo($botoesEdicao);

                $('<button>', {
                    type: 'button',
                    class: 'btn-cancelar',
                    html: '<i class="fas fa-times"></i> Cancelar',
                    click: () => this.cancelarEdicao()
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
                        this.cancelarEdicao();
                        this.loadAlunos();
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
                            this.cancelarEdicao();
                            this.loadAlunos();
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

        cancelarEdicao() {
            // Restaura o título original
            $('#form-container .section-title').html('<i class="fas fa-user-plus"></i> Cadastrar Novo Aluno');

            // Limpa os campos
            $('#nome').val('');
            $('#email').val('');
            $('#disciplina').val('');

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