/**
 * @fileoverview Componente de dias do calendário
 */

export class CalendarDays {
    constructor(calendar) {
        this.calendar = calendar;
        this.$element = null;
        this.clickData = {
            lastClick: 0,
            lastElement: null
        };
    }

    render() {
        this.$element = $('<div>', { class: 'days' });
        this.updateDays();
        return this.$element;
    }

    updateDays() {
        const year = this.calendar.currentDate.getFullYear();
        const month = this.calendar.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        this.$element.empty();

        // Adiciona dias vazios no início
        let firstDayOfWeek = firstDay.getDay() - this.calendar.config.firstDayOfWeek;
        if (firstDayOfWeek < 0) firstDayOfWeek += 7;

        for (let i = 0; i < firstDayOfWeek; i++) {
            this.$element.append($('<div>'));
        }

        // Adiciona os dias do mês
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const $dayElement = this.createDayElement(date);
            this.$element.append($dayElement);
        }
    }

    createDayElement(date) {
        const $dayElement = $('<div>', {
            class: 'calendar-day',
            'data-date': date.toISOString(),
            text: date.getDate()
        });

        if (this.isToday(date)) {
            $dayElement.addClass('today');
        }

        if (this.isHoliday(date)) {
            $dayElement.addClass('feriado')
                .attr('data-feriado', this.getHolidayName(date));
        }

        return $dayElement;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    isHoliday(date) {
        return !!this.getHolidayName(date);
    }

    getHolidayName(date) {
        const key = this.formatHolidayKey(date);
        return this.calendar.config.holidays[key];
    }

    formatHolidayKey(date) {
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        return `${dia}-${mes}`;
    }

    bindEvents() {
        this.$element.on('click', '.calendar-day', (e) => this.handleDayClick($(e.currentTarget)));
    }

    handleDayClick($day) {
        const date = $day.data('date');
        if (!date) return;

        if ($day.hasClass('feriado')) {
            this.handleHolidayClick($day, date);
        } else {
            this.calendar.updateSelectedDate(date);
        }
    }

    handleHolidayClick($day, date) {
        const currentTime = $.now();
        const isDoubleClick = (
            $day.get(0) === this.clickData.lastElement && 
            currentTime - this.clickData.lastClick <= this.calendar.config.doubleClickDelay
        );

        this.clickData = {
            lastClick: currentTime,
            lastElement: $day.get(0)
        };

        if (isDoubleClick) {
            this.calendar.updateSelectedDate(date);
        }
    }
} 