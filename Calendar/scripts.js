
        $(document).ready(function () {
            const calendar = $('#meu-calendario').calendar({
                firstDayOfWeek: 0,
                dateFormat: 'dd/mm/yy'
            }).data('calendar');

            // Inicializa a lista de alunos
            const alunosList = $('#lista-alunos').alunosList().data('alunosList');
            window.alunosList = alunosList;

            // Carrega as disciplinas no select
            function carregarDisciplinas() {
                fetch('api/listar-disciplinas.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const $select = $('#disciplina');
                            $select.find('option:not(:first)').remove();

                            data.disciplinas.forEach(disciplina => {
                                $select.append(`<option value="${disciplina.nome}">${disciplina.nome}</option>`);
                            });
                        }
                    })
                    .catch(error => console.error('Erro ao carregar disciplinas:', error));
            }

            // Carrega as disciplinas inicialmente
            carregarDisciplinas();

            // Gerenciar Disciplinas
            $('.btn-gerenciar-disciplinas').on('click', function () {
                if (window.alunosList) {
                    window.alunosList.mostrarModalDisciplinas();
                } else {
                    console.error('AlunosList não está inicializado corretamente');
                }
            });

            // Evento do botão cadastrar
            $('#btn-cadastrar').on('click', function () {
                const nome = $('#nome').val();
                const email = $('#email').val();
                const disciplina = $('#disciplina').val();

                if (!nome) {
                    alert('Por favor, preencha o nome do aluno.');
                    return;
                }

                if (!email) {
                    alert('Por favor, preencha o email do aluno.');
                    return;
                }

                // Coleta as datas e horários selecionados
                const aulas = [];
                if (calendar && calendar.selectedDates) {
                    calendar.selectedDates.forEach(dateStr => {
                        aulas.push({
                            data: dateStr,
                            horario: calendar.selectedDateTimes.get(dateStr) || calendar.defaultTime
                        });
                    });
                }

                // Envia os dados para a API
                fetch('api/cadastrar-aluno.php', {
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
                            // Limpa os campos
                            $('#nome').val('');
                            $('#email').val('');
                            $('#disciplina').val('');

                            // Limpa o calendário
                            if (calendar) {
                                calendar.selectedDates.clear();
                                calendar.selectedDateTimes.clear();
                                calendar.updateCalendar();
                                calendar.updateSelectedDatesList();
                            }

                            // Atualiza a lista de alunos
                            if (window.alunosList) {
                                window.alunosList.loadAlunos();
                            }

                            alert('Aluno cadastrado com sucesso!');
                        } else {
                            throw new Error(data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao cadastrar aluno:', error);
                        alert('Erro ao cadastrar aluno. Tente novamente.');
                    });
            });

            // Atualiza as informações quando houver mudança nos campos
            $('#nome, #email, #disciplina').on('change keyup', function () {
                const nome = $('#nome').val();
                const email = $('#email').val();
                const disciplina = $('#disciplina option:selected').text();

                if (nome || email || disciplina) {
                    $('.nome-aluno').text(nome || 'Não informado');
                    $('.email-aluno').text(email || 'Não informado');
                    $('.disciplina-aluno').text(disciplina !== 'Selecione uma disciplina (opcional)' ? disciplina : 'Não informada');
                    $('.info-aluno-container').show();
                } else {
                    $('.info-aluno-container').hide();
                }
            });
        });
