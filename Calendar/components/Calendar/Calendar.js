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
            this.defaultTime = '09:00';
            this.useDefaultTime = false;
            this.selectedDateTimes = new Map(); // Armazena data -> horário
            this.holidayConfirmed = false;
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

            // Listener para o toggle de horário padrão
            $('#useDefaultTime').on('change', (e) => {
                this.useDefaultTime = e.target.checked;
                if (this.useDefaultTime) {
                    this.defaultTime = $('#defaultTime').val();
                    this.applyDefaultTimeToAll();
                }
                this.updateSelectedDatesList();
                
                // Atualiza visual dos ícones e horários
                if (this.useDefaultTime) {
                    $('.time-icon').addClass('disabled');
                    $('.selected-time').addClass('disabled');
                } else {
                    $('.time-icon').removeClass('disabled');
                    $('.selected-time').removeClass('disabled');
                }
            });

            // Listener para mudança no horário padrão
            $('#defaultTime').on('change', (e) => {
                this.defaultTime = e.target.value;
                if (this.useDefaultTime) {
                    this.applyDefaultTimeToAll();
                    this.updateSelectedDatesList();
                }
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

        applyDefaultTimeToAll() {
            this.selectedDates.forEach(dateStr => {
                this.selectedDateTimes.set(dateStr, this.defaultTime);
            });
        }

        updateSelectedDatesList() {
            const $list = this.$container.find('.selected-dates-list');
            $list.empty();
            const $calendarContainer = $('.calendar-container');

            if (this.selectedDates.size === 0) {
                $calendarContainer.removeClass('has-selected-dates');
                $list.html('<p>Nenhuma data selecionada</p>');
                return;
            }

            $calendarContainer.addClass('has-selected-dates');

            const datesList = Array.from(this.selectedDates).sort();
            datesList.forEach(date => {
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const time = this.selectedDateTimes.get(date) || this.defaultTime;

                const $dateItem = $('<div>', {
                    class: 'selected-date-item'
                }).append(
                    $('<div>', { class: 'date-time-info' }).append(
                        $('<span>', { text: formattedDate }),
                        $('<span>', { 
                            class: `selected-time ${this.useDefaultTime ? 'disabled' : ''}`,
                            text: time 
                        }),
                        $('<i>', {
                            class: `fas fa-clock time-icon ${this.useDefaultTime ? 'disabled' : ''}`,
                            'data-date': date
                        })
                    ),
                    $('<button>', {
                        class: 'remove-date',
                        'data-date': date,
                        html: '<i class="fas fa-times"></i>'
                    })
                );

                $list.append($dateItem);
            });

            // Adiciona eventos para os ícones de relógio
            $list.on('click', '.time-icon:not(.disabled)', (e) => {
                const dateStr = $(e.currentTarget).data('date');
                this.showTimePopup($(e.currentTarget), dateStr);
            });

            // Mantém o evento de remoção
            $list.on('click', '.remove-date', (e) => {
                const dateStr = $(e.currentTarget).data('date');
                this.selectedDates.delete(dateStr);
                this.selectedDateTimes.delete(dateStr);
                this.updateCalendar();
                this.updateSelectedDatesList();
            });
        }

        showTimePopup($icon, dateStr) {
            // Remove qualquer popup existente
            $('.time-popup').remove();

            const currentTime = this.selectedDateTimes.get(dateStr) || this.defaultTime;
            
            const $popup = $('<div>', {
                class: 'time-popup active'
            }).append(
                $('<input>', {
                    type: 'time',
                    class: 'time-input',
                    value: currentTime
                }),
                $('<button>', {
                    text: 'Confirmar',
                    click: (e) => {
                        const newTime = $(e.target).siblings('.time-input').val();
                        this.selectedDateTimes.set(dateStr, newTime);
                        this.updateSelectedDatesList();
                        $popup.remove();
                    }
                })
            );

            $popup.css({
                top: $icon.offset().top + 25,
                left: $icon.offset().left
            });

            $('body').append($popup);

            // Fecha o popup ao clicar fora
            $(document).one('click', (e) => {
                if (!$(e.target).closest('.time-popup, .time-icon').length) {
                    $popup.remove();
                }
            });
        }

        _onDateClick(date) {
            const dateStr = $.datepicker.formatDate('yy-mm-dd', date);
            const holidayName = this._isHoliday(date);

            if (holidayName) {
                if (!this.holidayConfirmed) {
                    alert(`Este dia é feriado (${holidayName}). Clique novamente para selecionar mesmo assim.`);
                    this.holidayConfirmed = true;
                    return;
                }
                this.holidayConfirmed = false;
            }

            if (this.selectedDates.has(dateStr)) {
                this.selectedDates.delete(dateStr);
                this.selectedDateTimes.delete(dateStr);
            } else {
                this.selectedDates.add(dateStr);
                if (this.options.useDefaultTime) {
                    this.selectedDateTimes.set(dateStr, this.defaultTime);
                }
            }

            this.updateCalendar();
            this.updateSelectedDatesList();
        }

        _isHoliday(date) {
            const monthDay = $.datepicker.formatDate('mm-dd', date);
            return this.HOLIDAYS[monthDay] || null;
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