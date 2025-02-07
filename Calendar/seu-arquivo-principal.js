import AlunoCard from './components/AlunoCard/AlunoCard.js';
import AlunosList from './components/AlunosList/AlunosList.js';
import DisciplinaManager from './components/DisciplinaManager/DisciplinaManager.js';
import FormContainer from './components/FormContainer/FormContainer.js';
import ModalAulas from './components/ModalAulas/ModalAulas.js';
import ModalEditarAluno from './components/ModalEditarAluno/ModalEditarAluno.js';
import PdfViewer from './components/PdfViewer/PdfViewer.js';

// Inicialização dos componentes
$(document).ready(function () {
    // Inicializa AlunosList
    $('#alunos-list').alunosList();

    // Inicializa FormContainer
    $('#form-container').formContainer();

    // Inicializa DisciplinaManager
    $('#disciplina-manager').disciplinaManager();

    // Inicializa modais
    $('#modal-aulas').modalAulas();
    $('#modal-editar').modalEditarAluno();

    // Inicializa PDF Viewer
    const pdfViewer = new PdfViewer();

    // Setup de eventos globais
    setupGlobalEvents();
});

function setupGlobalEvents() {
    // Log para debug
    console.log('Verificando inicialização dos componentes...');

    // Teste de cada componente
    testComponents();
}

function testComponents() {
    // Teste AlunosList
    if ($('#alunos-list').data('alunosList')) {
        console.log('✅ AlunosList inicializado com sucesso');
    } else {
        console.error('❌ Erro ao inicializar AlunosList');
    }

    // Teste FormContainer
    if ($('#form-container').data('formContainer')) {
        console.log('✅ FormContainer inicializado com sucesso');
    } else {
        console.error('❌ Erro ao inicializar FormContainer');
    }

    // Teste DisciplinaManager
    if ($('#disciplina-manager').data('disciplinaManager')) {
        console.log('✅ DisciplinaManager inicializado com sucesso');
    } else {
        console.error('❌ Erro ao inicializar DisciplinaManager');
    }

    // Teste ModalAulas
    if ($('#modal-aulas').data('modalAulas')) {
        console.log('✅ ModalAulas inicializado com sucesso');
    } else {
        console.error('❌ Erro ao inicializar ModalAulas');
    }

    // Teste ModalEditarAluno
    if ($('#modal-editar').data('modalEditarAluno')) {
        console.log('✅ ModalEditarAluno inicializado com sucesso');
    } else {
        console.error('❌ Erro ao inicializar ModalEditarAluno');
    }
} 