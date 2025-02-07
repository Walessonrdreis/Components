// Importação dos componentes
import AlunoCard from './components/AlunoCard/AlunoCard.js';
import AlunosList from './components/AlunosList/AlunosList.js';
import DisciplinaManager from './components/DisciplinaManager/DisciplinaManager.js';
import FormContainer from './components/FormContainer/FormContainer.js';
import ModalAulas from './components/ModalAulas/ModalAulas.js';
import ModalEditarAluno from './components/ModalEditarAluno/ModalEditarAluno.js';
import PdfViewer from './components/PdfViewer/PdfViewer.js';

// Mantém o código existente e adiciona as novas inicializações
$(document).ready(function () {
    // Inicializa os componentes principais
    const calendar = $('#meu-calendario').calendar().data('calendar');
    const alunosList = $('#lista-alunos').alunosList().data('alunosList');
    const disciplinaManager = $('#disciplina-manager').disciplinaManager().data('disciplinaManager');
    const formContainer = $('#form-container').formContainer().data('formContainer');

    // Disponibiliza o alunosList globalmente para comunicação entre componentes
    window.alunosList = alunosList;

    // Carrega as disciplinas no select
    // Mover para o componente FormContainer
    // function carregarDisciplinas() {
    //     fetch('api/listar-disciplinas.php')
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data.success) {
    //                 const $select = $('#disciplina');
    //                 $select.find('option:not(:first)').remove();

    //                 data.disciplinas.forEach(disciplina => {
    //                     $select.append(`<option value="${disciplina.nome}">${disciplina.nome}</option>`);
    //                 });
    //             }
    //         })
    //         .catch(error => console.error('Erro ao carregar disciplinas:', error));
    // }

    // Carrega as disciplinas inicialmente
    // carregarDisciplinas();

    // Gerenciar Disciplinas - Apenas o botão controla a visibilidade
    $('#toggle-disciplina-manager').on('click', function (e) {
        e.preventDefault();
        disciplinaManager.toggleDisciplinaManager();
    });

    // Evento do botão cadastrar
    // Remover o registro duplicado do evento de clique no botão 'Cadastrar Aluno'
    // $('#btn-cadastrar').on('click', function () {
    //     // Código duplicado removido
    // });

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

    // Previne que cliques dentro do disciplina-manager fechem o container
    $('#disciplina-manager').on('click', function (e) {
        e.stopPropagation();
    });

    // Inicializa os componentes reestruturados
    initializeComponents();
    
    // Verifica se está tudo funcionando
    verifyComponents();
});

function initializeComponents() {
    try {
        // Inicializa cada componente
        $('#alunos-list').alunosList();
        $('#form-container').formContainer();
        $('#disciplina-manager').disciplinaManager();
        $('#modal-aulas').modalAulas();
        $('#modal-editar').modalEditarAluno();
        
        // Inicializa PDF Viewer
        window.pdfViewer = new PdfViewer();
        
        console.log('✅ Componentes inicializados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar componentes:', error);
    }
}

function verifyComponents() {
    const components = {
        'AlunosList': '#alunos-list',
        'FormContainer': '#form-container',
        'DisciplinaManager': '#disciplina-manager',
        'ModalAulas': '#modal-aulas',
        'ModalEditarAluno': '#modal-editar'
    };

    Object.entries(components).forEach(([name, selector]) => {
        const component = $(selector).data(name.toLowerCase());
        if (component) {
            console.log(`✅ ${name} inicializado com sucesso`);
        } else {
            console.error(`❌ Erro ao inicializar ${name}`);
        }
    });
}
