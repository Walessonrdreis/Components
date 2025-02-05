/**
 * @fileoverview Componente de Calendário com jQuery
 * @version 1.0.0
 * @requires jQuery
 */

; (function ($) {
    'use strict';

    // Constantes de feriados
    const HOLIDAYS = {
        "01-01": "Ano Novo",
        "21-02": "Carnaval",
        "07-04": "Sexta-feira Santa",
        "21-04": "Tiradentes",
        "01-05": "Dia do Trabalho",
        "08-06": "Corpus Christi",
        "07-09": "Independência do Brasil",
        "12-10": "Nossa Senhora Aparecida",
        "02-11": "Finados",
        "15-11": "Proclamação da República",
        "25-12": "Natal"
    };

    class Calendar {
        constructor(config) {
            this.$container = $(`#${config.containerId}`);
            this.$dateInput = $('#data-selecionada');
            this.$selectedDatesContainer = $('#datas-selecionadas .selected-dates-list');
            this.options = $.extend({}, Calendar.defaults, config.options);
            this.currentDate = new Date();
            this.selectedDates = new Set(); // Armazena as datas selecionadas
            this.init();
        }

        init() {
            this.setupCalendarStructure();
            this.setupEventListeners();
            this.setupHolidayObserver();
        }

        setupCalendarStructure() {
            const $calendarHeader = $('<div>', { class: 'calendar-header' }).append(
                $('<button>', { class: 'prev-month' }).html('<i class="fas fa-chevron-left"></i>'),
                $('<h2>', { class: 'current-month' }),
                $('<button>', { class: 'next-month' }).html('<i class="fas fa-chevron-right"></i>')
            );

            const $weekDays = $('<div>', { class: 'weekdays' })
                .append(this.getWeekDaysNames());

            const $days = $('<div>', { class: 'days' });

            this.$container.empty().append($calendarHeader, $weekDays, $days);
            this.updateCalendar();
        }

        getWeekDaysNames() {
            const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            return weekDays
                .slice(this.options.firstDayOfWeek)
                .concat(weekDays.slice(0, this.options.firstDayOfWeek))
                .map(day => $('<div>', {
                    class: 'weekday',
                    text: day
                }));
        }

        updateCalendar() {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            // Atualiza o cabeçalho do mês
            const monthName = this.currentDate.toLocaleString('pt-BR', { month: 'long' });
            this.$container.find('.current-month')
                .text(`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`);

            const $daysContainer = this.$container.find('.days');
            $daysContainer.empty();

            // Gera os dias do mês
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            // Adiciona os dias vazios no início
            let firstDayOfWeek = firstDay.getDay() - this.options.firstDayOfWeek;
            if (firstDayOfWeek < 0) firstDayOfWeek += 7;

            for (let i = 0; i < firstDayOfWeek; i++) {
                $daysContainer.append($('<div>'));
            }

            // Adiciona os dias do mês
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(year, month, day);
                const dateStr = date.toISOString().split('T')[0];
                const $dayElement = $('<div>', {
                    class: 'calendar-day',
                    'data-date': dateStr,
                    text: day
                });

                if (this.isToday(date)) {
                    $dayElement.addClass('today');
                }

                if (this.selectedDates.has(dateStr)) {
                    $dayElement.addClass('selected');
                }

                $daysContainer.append($dayElement);
            }

            this.markHolidays();
        }

        setupEventListeners() {
            this.$container
                .on('click', '.prev-month', () => {
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                    this.updateCalendar();
                })
                .on('click', '.next-month', () => {
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                    this.updateCalendar();
                })
                .on('click', '.calendar-day', (e) => {
                    const $dayElement = $(e.currentTarget);
                    const dateStr = $dayElement.data('date');
                    if (!dateStr) return;

                    if (this.selectedDates.has(dateStr)) {
                        this.selectedDates.delete(dateStr);
                        $dayElement.removeClass('selected');
                    } else {
                        this.selectedDates.add(dateStr);
                        $dayElement.addClass('selected');
                    }

                    this.updateSelectedDatesList();
                });
        }

        setupHolidayObserver() {
            const observer = new MutationObserver(() => this.markHolidays());
            observer.observe(this.$container.get(0), {
                childList: true,
                subtree: true
            });

            // Marca os feriados iniciais após um pequeno delay
            setTimeout(() => this.markHolidays(), 100);
        }

        markHolidays() {
            const $days = this.$container.find('.calendar-day');
            $days.each((_, day) => {
                const $day = $(day);
                const date = new Date($day.data('date'));
                const key = this.getHolidayKey(date);

                if (HOLIDAYS[key]) {
                    $day.addClass('feriado')
                        .attr('data-feriado', HOLIDAYS[key]);
                }
            });
        }

        isToday(date) {
            const today = new Date();
            return date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        }

        getHolidayKey(date) {
            const dia = String(date.getDate()).padStart(2, '0');
            const mes = String(date.getMonth() + 1).padStart(2, '0');
            return `${dia}-${mes}`;
        }

        updateSelectedDatesList() {
            if (!this.$selectedDatesContainer.length) return;
            
            this.$selectedDatesContainer.empty();
            
            const sortedDates = Array.from(this.selectedDates).sort();
            
            // Adiciona ou remove a classe baseado na existência de datas selecionadas
            if (sortedDates.length > 0) {
                this.$container.closest('.calendar-container').addClass('has-selected-dates');
            } else {
                this.$container.closest('.calendar-container').removeClass('has-selected-dates');
            }
            
            sortedDates.forEach(dateStr => {
                const date = new Date(dateStr);
                const formattedDate = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const $dateItem = $('<div>', {
                    class: 'selected-date-item'
                }).append(
                    $('<span>', { text: formattedDate }),
                    $('<button>', {
                        class: 'remove-date',
                        'data-date': dateStr,
                        html: '<i class="fas fa-times"></i>'
                    })
                );

                this.$selectedDatesContainer.append($dateItem);
            });

            // Adiciona evento para remover datas
            this.$selectedDatesContainer.on('click', '.remove-date', (e) => {
                const dateStr = $(e.currentTarget).data('date');
                this.selectedDates.delete(dateStr);
                this.updateCalendar();
                this.updateSelectedDatesList();
            });
        }
    }

    // Configurações padrão do plugin
    Calendar.defaults = {
        theme: 'light',
        locale: 'pt-BR',
        firstDayOfWeek: 0,
        showToday: true,
        showNavigation: true,
        doubleClickDelay: 300,
        dateFormat: 'dd/mm/yy'
    };

    // Registra como plugin jQuery
    $.fn.calendar = function (options) {
        return this.each(function () {
            if (!$.data(this, 'calendar')) {
                $.data(this, 'calendar', new Calendar({
                    containerId: this.id,
                    options: options
                }));
            }
        });
    };

})(jQuery);

// Inicialização quando o documento estiver pronto
$(document).ready(function () {
    // Configuração regional do datepicker
    if ($.fn.datepicker) {
        $.datepicker.setDefaults($.datepicker.regional['pt-BR']);
    }

    // Inicializa o calendário
    $('#meu-calendario').calendar();
}); 