export const formatDate = (date) => {
    const dateObj = new Date(date + 'T12:00:00Z');
    return dateObj.toLocaleDateString('pt-BR');
}; 