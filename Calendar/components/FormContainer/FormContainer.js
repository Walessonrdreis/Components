class FormContainer {
    constructor(containerId) {
        this.$container = $(`#${containerId}`);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDisciplinas();
    }

    setupEventListeners() {
        this.$container.on('click', '.btn-cadastrar', this.handleCadastro.bind(this));
        this.$container.on('click', '.btn-adicionar-disciplina', this.handleAdicionarDisciplina.bind(this));
    }

    handleCadastro() {
        const nome = this.$container.find('#nome').val();
        const email = this.$container.find('#email').val();
        const disciplina = this.$container.find('#disciplina').val();

        if (!nome) {
            alert('Por favor, preencha o nome do aluno.');
            return;
        }

        if (!email) {
            alert('Por favor, preencha o email do aluno.');
            return;
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
                disciplina
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Aluno cadastrado com sucesso!');
                    this.clearForm();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao cadastrar aluno:', error);
                alert('Erro ao cadastrar aluno. Tente novamente.');
            });
    }

    handleAdicionarDisciplina() {
        const novaDisciplina = this.$container.find('#nova-disciplina').val().trim();
        if (!novaDisciplina) {
            alert('Por favor, insira o nome da disciplina.');
            return;
        }

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
                    alert('Disciplina adicionada com sucesso!');
                    this.loadDisciplinas();
                    this.$container.find('#nova-disciplina').val('');
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao adicionar disciplina:', error);
                alert('Erro ao adicionar disciplina. Tente novamente.');
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