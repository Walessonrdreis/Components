/**
 * @fileoverview Componente do cabeçalho do calendário
 */

export class CalendarHeader {
    constructor(calendar) {
        this.calendar = calendar;
        this.$element = null;
    }

    render() {
        this.$element = $('<div>', { class: 'calendar-header' }).append(
            this.createNavigationButton('prev'),
            this.createMonthDisplay(),
            this.createNavigationButton('next')
        );

        return this.$element;
    }

    createNavigationButton(direction) {
        const icon = direction === 'prev' ? 'fa-chevron-left' : 'fa-chevron-right';
        return $('<button>', {
            class: `${direction}-month`,
            html: `<i class="fas ${icon}"></i>`
        });
    }

    createMonthDisplay() {
        return $('<h2>', { class: 'current-month' });
    }

    updateMonth(date) {
        const monthName = date.toLocaleString('pt-BR', { month: 'long' });
        const year = date.getFullYear();
        this.$element.find('.current-month')
            .text(`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`);
    }
} 