import { ERROR_MESSAGES } from '../constants';

/**
 * Formata uma data para o formato local (pt-BR)
 * @param {string} data - Data em formato ISO ou string
 * @returns {string} Data formatada
 */
export const formatarData = (data) => {
    if (!data) return 'Não agendada';
    try {
        const date = new Date(data + 'T12:00:00Z');
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        throw new Error(ERROR_MESSAGES.DATE_PARSE_ERROR);
    }
};

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto escapado
 */
export const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Valida os dados do aluno
 * @param {Object} aluno - Dados do aluno
 * @returns {boolean} Verdadeiro se os dados são válidos
 */
export const validarDadosAluno = (aluno) => {
    if (!aluno || typeof aluno !== 'object') {
        throw new Error(ERROR_MESSAGES.INVALID_ALUNO);
    }

    const camposObrigatorios = ['id', 'nome'];
    return camposObrigatorios.every(campo => aluno.hasOwnProperty(campo) && aluno[campo] !== null);
};

/**
 * Valida um callback
 * @param {Function} callback - Função de callback
 * @param {string} nome - Nome do callback para mensagem de erro
 */
export const validarCallback = (callback, nome) => {
    if (callback && typeof callback !== 'function') {
        throw new Error(`${ERROR_MESSAGES.INVALID_CALLBACK}: ${nome}`);
    }
};

/**
 * Gera classes CSS condicionais
 * @param {Object} classes - Objeto com classes e suas condições
 * @returns {string} String de classes CSS
 */
export const classNames = (classes) => {
    return Object.entries(classes)
        .filter(([_, condition]) => Boolean(condition))
        .map(([className]) => className)
        .join(' ');
};

/**
 * Debounce para funções
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const domUtils = {
    findAlunoId: ($container) => {
        return $container.find('.aluno-card').data('aluno-id');
    }
}; 