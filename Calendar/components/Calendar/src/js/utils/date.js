/**
 * @fileoverview Utilitários para manipulação de datas
 */

export const formatDate = (date, format = 'dd/mm/yyyy') => {
    if ($.fn.datepicker) {
        return $.datepicker.formatDate(format, date);
    }
    return date.toLocaleDateString('pt-BR');
};

export const parseDate = (dateString, format = 'dd/mm/yyyy') => {
    if ($.fn.datepicker) {
        return $.datepicker.parseDate(format, dateString);
    }
    return new Date(dateString);
}; 