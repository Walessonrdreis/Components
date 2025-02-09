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
        constructor(element, options) {
            this.$container = $(element);
            this.$dateInput = $('#data-selecionada');
            this.$selectedDatesContainer = $('#datas-selecionadas .selected-dates-list');
            this.options = $.extend({}, Calendar.defaults, options);
            this.selectedDates = new Set();
            this.selectedDateTimes = new Map();
            this.defaultTime = this.options.defaultTime || '09:00';
            this.useDefaultTime = false;
            this.holidayConfirmed = false;
            this.currentDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
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
                const dateStr = this.formatDateString(year, month + 1, day);

                const $dayElement = $('<div>', {
                    class: 'calendar-day',
                    'data-date': dateStr,
                    text: day
                });

                if (this.isToday(year, month, day)) {
                    $dayElement.addClass('today');
                    const todayDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                    const formattedToday = todayDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long'
                    });
                    $dayElement.attr('title', `Hoje - ${formattedToday}`);
                }

                if (this.selectedDates.has(dateStr)) {
                    $dayElement.addClass('selected');
                }

                // Início das modificações para desabilitar dias anteriores ao dia atual
                let dayDate = new Date(year, month, day);
                let current = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                current.setHours(0, 0, 0, 0);
                dayDate.setHours(0, 0, 0, 0);
                if (dayDate < current || dayDate.getDay() === 6) {
                    $dayElement.addClass('disabled');
                }
                // Fim das modificações

                $daysContainer.append($dayElement);
            }

            this.markHolidays();
        }

        formatDateString(year, month, day) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }

        isToday(year, month, day) {
            const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            return day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
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
                    if ($dayElement.hasClass('disabled')) {
                        return;
                    }
                    const dateStr = $dayElement.data('date');
                    if (!dateStr) return;

                    // Remove qualquer diálogo existente
                    $('.holiday-confirm-dialog').remove();

                    if (this.selectedDates.has(dateStr)) {
                        this.selectedDates.delete(dateStr);
                        $dayElement.removeClass('selected');
                        this.updateSelectedDatesList();
                        return;
                    }

                    const key = this.getHolidayKey(dateStr);
                    const holidayName = HOLIDAYS[key];

                    if (holidayName) {
                        // Cria o diálogo de confirmação
                        const $dialog = $('<div>', {
                            class: 'holiday-confirm-dialog'
                        }).append(
                            $('<div>', {
                                class: 'title',
                                text: `Essa data é ${holidayName}, tem certeza?`
                            }),
                            $('<div>', {
                                class: 'buttons'
                            }).append(
                                $('<button>', {
                                    class: 'confirm-btn',
                                    text: 'Sim',
                                    click: () => {
                                        this.selectedDates.add(dateStr);
                                        $dayElement.addClass('selected');
                                        this.updateSelectedDatesList();
                                        $dialog.remove();
                                    }
                                }),
                                $('<button>', {
                                    class: 'cancel-btn',
                                    text: 'Não',
                                    click: () => {
                                        $dialog.remove();
                                    }
                                })
                            )
                        );

                        $dayElement.append($dialog);

                        // Fecha o diálogo ao clicar fora
                        $(document).one('click', (e) => {
                            if (!$(e.target).closest('.holiday-confirm-dialog, .calendar-day').length) {
                                $dialog.remove();
                            }
                        });
                    } else {
                        this.selectedDates.add(dateStr);
                        $dayElement.addClass('selected');
                        this.updateSelectedDatesList();
                    }
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
                const dateStr = $day.data('date');
                const key = this.getHolidayKey(dateStr);

                if (HOLIDAYS[key]) {
                    $day.addClass('feriado')
                        .attr('data-feriado', HOLIDAYS[key]);
                }
            });
        }

        getHolidayKey(dateStr) {
            const [_, month, day] = dateStr.split('-');
            return `${day}-${month}`;
        }

        applyDefaultTimeToAll() {
            this.selectedDates.forEach(dateStr => {
                this.selectedDateTimes.set(dateStr, this.defaultTime);
            });
        }

        updateSelectedDatesList() {
            const $container = $('#datas-selecionadas');
            const $list = $container.find('.selected-dates-list');
            $list.empty();
            const $calendarContainer = $('.calendar-container');

            if (this.selectedDates.size === 0) {
                $calendarContainer.removeClass('has-selected-dates');
                $list.html('<p>Nenhuma data selecionada</p>');
                return;
            }

            $calendarContainer.addClass('has-selected-dates');

            const datesList = Array.from(this.selectedDates).sort();
            datesList.forEach(dateStr => {
                const [year, month, day] = dateStr.split('-');
                const formattedDate = new Date(year, parseInt(month) - 1, parseInt(day))
                    .toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                const time = this.selectedDateTimes.get(dateStr) || this.defaultTime;

                const $dateItem = $('<div>', {
                    class: 'selected-date-item',
                    style: 'display: flex; justify-content: space-between; align-items: center; margin: 5px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;'
                }).append(
                    $('<div>', {
                        class: 'date-info',
                        style: 'display: flex; align-items: center; gap: 10px;'
                    }).append(
                        $('<span>', {
                            text: formattedDate,
                            style: 'font-weight: 500;'
                        }),
                        $('<input>', {
                            type: 'time',
                            value: time,
                            class: 'time-input',
                            disabled: this.useDefaultTime,
                            style: 'padding: 2px 5px; border: 1px solid #ddd; border-radius: 3px;',
                            on: {
                                change: (e) => {
                                    if (!this.useDefaultTime) {
                                        this.selectedDateTimes.set(dateStr, e.target.value);
                                    }
                                }
                            }
                        })
                    ),
                    $('<button>', {
                        class: 'remove-date',
                        html: '<i class="fas fa-times"></i>',
                        style: 'background: none; border: none; color: #ff4444; cursor: pointer; padding: 5px;',
                        on: {
                            click: () => {
                                this.selectedDates.delete(dateStr);
                                this.selectedDateTimes.delete(dateStr);
                                this.updateCalendar();
                                this.updateSelectedDatesList();
                            }
                        }
                    })
                );

                $list.append($dateItem);
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

    // Adiciona métodos stub se não existirem para atualizar o calendário
    if (typeof Calendar.prototype.updateCalendar !== 'function') {
        Calendar.prototype.updateCalendar = function () {
            // Lógica para atualizar a representação visual do calendário
            console.log('Atualizando calendário...');
        };
    }

    if (typeof Calendar.prototype.updateSelectedDatesList !== 'function') {
        Calendar.prototype.updateSelectedDatesList = function () {
            // Lógica para atualizar a lista de datas selecionadas
            console.log('Atualizando lista de datas selecionadas...');
        };
    }

    // Registra o plugin jQuery para o componente Calendar
    $.fn.calendar = function (options) {
        return this.each(function () {
            const calendar = new Calendar(this, options);
            $(this).data('calendar', calendar);
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