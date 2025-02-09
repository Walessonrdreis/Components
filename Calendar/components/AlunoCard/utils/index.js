export const formatarData = (data) => {
    if (!data) return 'Não agendada';
    const date = new Date(data + 'T12:00:00Z');
    return date.toLocaleDateString('pt-BR');
};

export const domUtils = {
    findAlunoId: ($container) => {
        return $container.find('.aluno-card').data('aluno-id');
    }
}; 