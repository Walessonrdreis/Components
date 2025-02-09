export const ALUNO_CARD_DEFAULTS = {
    aluno: null,
    onVerAulas: null,
    onVisualizarPDF: null,
    onEditar: null
};

/**
 * Classes CSS utilizadas no componente AlunoCard
 */
export const CSS_CLASSES = {
    container: 'aluno-card-v2',
    info: 'aluno-info',
    nome: 'aluno-nome',
    matricula: 'matricula-container',
    matriculaLabel: 'matricula-label',
    matriculaValor: 'matricula-valor',
    disciplina: 'disciplina',
    proximaAula: 'proxima-aula',
    actions: 'aluno-actions',
    loading: 'loading',
    error: 'error',
    buttons: {
        action: 'btn-action',
        pdf: 'btn-pdf',
        aulas: 'btn-aulas',
        editar: 'btn-editar',
        clicked: 'btn-clicked'
    }
};

/**
 * Mensagens de erro padrão
 */
export const ERROR_MESSAGES = {
    INVALID_ALUNO: 'Dados do aluno inválidos ou não fornecidos',
    INVALID_CONTAINER: 'Container não fornecido ou inválido',
    INVALID_CALLBACK: 'Callback inválido ou não fornecido',
    DATE_PARSE_ERROR: 'Erro ao processar data'
};

/**
 * Configurações padrão de animação
 */
export const ANIMATION_CONFIG = {
    duration: 300,
    tooltipDelay: 300,
    buttonClickDuration: 200
};

/**
 * Configurações de texto padrão
 */
export const TEXT_CONFIG = {
    matriculaDefault: 'Não informada',
    disciplinaDefault: 'Sem disciplina',
    proximaAulaDefault: 'Não agendada',
    tooltips: {
        pdf: 'Visualizar PDF',
        aulas: 'Ver aulas',
        editar: 'Editar aluno'
    }
}; 