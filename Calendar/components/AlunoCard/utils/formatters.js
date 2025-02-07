export const formatDate = (date) => {
    if (!date) return 'Não agendada';
    const dateObj = new Date(date + 'T12:00:00Z');
    return dateObj.toLocaleDateString('pt-BR');
}; 