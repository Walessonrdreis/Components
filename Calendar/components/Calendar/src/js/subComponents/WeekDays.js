/**
 * @fileoverview Componente dos dias da semana
 */

export class CalendarWeekDays {
    constructor(calendar) {
        this.calendar = calendar;
        this.$element = null;
    }

    render() {
        this.$element = $('<div>', { class: 'weekdays' });
        this.updateWeekDays();
        return this.$element;
    }

    updateWeekDays() {
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const orderedDays = [
            ...weekDays.slice(this.calendar.config.firstDayOfWeek),
            ...weekDays.slice(0, this.calendar.config.firstDayOfWeek)
        ];

        orderedDays.forEach(day => {
            $('<div>', {
                class: 'weekday',
                text: day
            }).appendTo(this.$element);
        });
    }
} 