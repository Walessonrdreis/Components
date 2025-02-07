class FormContainer {
    constructor(containerId) {
        this.$container = $(`#${containerId}`);
        this.lastCadastro = null; // Armazena os dados do último cadastro
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDisciplinas();
    }

    setupEventListeners() {
        // Remove qualquer evento de clique existente
        this.$container.off('click', '.btn-cadastrar');

        // Adiciona o evento de clique sem debounce
        this.$container.on('click', '.btn-cadastrar', (e) => {
            e.preventDefault();
            if (!this.isSubmitting) {
                this.handleCadastro();
            }
        });

        this.$container.on('click', '.btn-adicionar-disciplina', this.handleAdicionarDisciplina.bind(this));
    }

    handleCadastro() {
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        const $button = this.$container.find('.btn-cadastrar');
        $button.prop('disabled', true);

        const nome = this.$container.find('#nome').val();
        const email = this.$container.find('#email').val();
        const disciplina = this.$container.find('#disciplina').val();
        const calendar = $('#meu-calendario').data('calendar');

        // Validações
        if (!nome || !email) {
            if (!nome) notifications.warning('Por favor, preencha o nome do aluno.');
            else if (!email) notifications.warning('Por favor, preencha o email do aluno.');

            this.isSubmitting = false;
            $button.prop('disabled', false);
            return;
        }

        // Coleta dados das aulas
        const aulas = [];
        if (calendar && calendar.selectedDates) {
            calendar.selectedDates.forEach(dateStr => {
                aulas.push({
                    data: dateStr,
                    horario: calendar.selectedDateTimes.get(dateStr) || calendar.defaultTime
                });
            });
        }

        const currentCadastro = { nome, email, disciplina, aulas };

        // Verifica se os dados são idênticos ao último cadastro
        if (JSON.stringify(currentCadastro) === JSON.stringify(this.lastCadastro)) {
            notifications.warning('Cadastro duplicado detectado. Nenhuma ação foi realizada.');
            this.isSubmitting = false;
            $button.prop('disabled', false);
            return;
        }

        this.lastCadastro = currentCadastro;

        loader.show('Cadastrando aluno...', 800).then(() => {
            // Envia os dados para a API
            fetch('api/cadastrar-aluno.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentCadastro)
            })
                .then(async response => {
                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Erro ao cadastrar aluno');
                    }

                    // Limpa o formulário e o calendário
                    this.clearForm();
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
                    // Mostra mensagem de sucesso após limpar
                    notifications.success('Aluno cadastrado com sucesso!');
                })
                .catch(error => {
                    if (!this.isSubmitting) return; // Evita mostrar erro se já foi tratado
                    console.error('Erro ao cadastrar aluno:', error);
                    notifications.error('Erro ao cadastrar aluno. Tente novamente.');
                })
                .finally(() => {
                    this.isSubmitting = false;
                    $button.prop('disabled', false);
                });
        });
    }

    handleAdicionarDisciplina() {
        const novaDisciplina = this.$container.find('#nova-disciplina').val().trim();
        if (!novaDisciplina) {
            notifications.warning('Por favor, insira o nome da disciplina.');
            return;
        }

        loader.show('Adicionando disciplina...', 500).then(() => {
            // Envia a nova disciplina para a API
            fetch('api/adicionar-disciplina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome: novaDisciplina })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        notifications.success('Disciplina adicionada com sucesso!');
                        this.loadDisciplinas();
                        this.$container.find('#nova-disciplina').val('');
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao adicionar disciplina:', error);
                    notifications.error('Erro ao adicionar disciplina. Tente novamente.');
                });
        });
    }

    loadDisciplinas() {
        fetch('api/listar-disciplinas.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const $select = this.$container.find('#disciplina');
                    $select.find('option:not(:first)').remove();
                    data.disciplinas.forEach(disciplina => {
                        $select.append(`<option value="${disciplina.nome}">${disciplina.nome}</option>`);
                    });
                }
            })
            .catch(error => console.error('Erro ao carregar disciplinas:', error));
    }

    clearForm() {
        this.$container.find('#nome').val('');
        this.$container.find('#email').val('');
        this.$container.find('#disciplina').val('');
    }
}

// Registra o plugin jQuery para o componente FormContainer
$.fn.formContainer = function () {
    return this.each(function () {
        const formContainer = new FormContainer(this.id);
        $(this).data('formContainer', formContainer);
    });
}; 