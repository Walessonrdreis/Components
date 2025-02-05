/**
 * @fileoverview Componente de Calendário Profissional com jQuery
 * @version 2.1.0
 * @requires jQuery 3.6.0+
 * @requires jQuery UI 1.13.2+
 */

;(function($, window, document, undefined) {
    'use strict';

    /**
     * Classe principal do Calendário
     * @class Calendar
     */
    class Calendar {
        /**
         * @constructor
         * @param {string} containerId - ID do container do calendário
         * @param {Object} options - Opções de configuração
         */
        constructor(containerId, options = {}) {
            this.$container = $(`#${containerId}`);
            this.$dateInput = $('#data-selecionada');
            this.$currentMonth = null;
            this.$daysContainer = null;
            this.$navigation = null;
            
            this.options = $.extend(true, {}, Calendar.defaults, options);
            this.clickData = $.extend({}, { lastClick: 0, lastElement: null });
            
            this.init();
        }

        /**
         * Inicializa o calendário
         * @private
         */
        init() {
            this.createStructure();
            this.bindEvents();
            this.setupDatepicker();
            this.setupMask();
        }

        /**
         * Cria a estrutura do calendário
         * @private
         */
        createStructure() {
            const $header = $('<div>').addClass('calendar-header');
            const $prevBtn = $('<button>').addClass('prev-month').html('<i class="fas fa-chevron-left"></i>');
            const $nextBtn = $('<button>').addClass('next-month').html('<i class="fas fa-chevron-right"></i>');
            this.$currentMonth = $('<h2>').addClass('current-month');
            this.$daysContainer = $('<div>').addClass('days');
            this.$navigation = $header.append($prevBtn, this.$currentMonth, $nextBtn);

            this.$container.empty().append(
                this.$navigation,
                this.createWeekDays(),
                this.$daysContainer
            );
        }

        /**
         * Cria os dias da semana
         * @private
         * @returns {jQuery} Elemento jQuery com os dias da semana
         */
        createWeekDays() {
            const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const $weekDays = $('<div>').addClass('weekdays');
            
            $.each(weekDays, (i, day) => {
                $('<div>')
                    .addClass('weekday')
                    .text(day)
                    .appendTo($weekDays);
            });

            return $weekDays;
        }

        /**
         * Configura os eventos
         * @private
         */
        bindEvents() {
            this.$container
                .on('click', '.prev-month', () => this.navigateMonth(-1))
                .on('click', '.next-month', () => this.navigateMonth(1))
                .on('click', '.calendar-day', (e) => this.handleDayClick($(e.currentTarget)));

            $(window).on('resize', $.throttle(250, () => this.handleResize()));
        }

        /**
         * Configura o datepicker e máscara
         * @private
         */
        setupDatepicker() {
            if ($.fn.datepicker) {
                this.$dateInput.datepicker({
                    dateFormat: this.options.dateFormat,
                    regional: this.options.locale,
                    onSelect: (date) => this.handleDateSelect(date)
                });
            }
        }

        /**
         * Configura a máscara do input
         * @private
         */
        setupMask() {
            if ($.fn.mask) {
                this.$dateInput.mask('99/99/9999');
            }
        }

        /**
         * Manipula o clique em um dia
         * @param {jQuery} $day - Elemento do dia clicado
         * @private
         */
        handleDayClick($day) {
            const date = $day.data('date');
            if (!date) return;

            if ($day.hasClass('feriado')) {
                this.handleHolidayClick($day, date);
            } else {
                this.updateSelectedDate(date);
            }
        }

        /**
         * Manipula o clique em um feriado
         * @param {jQuery} $day - Elemento do feriado
         * @param {string} date - Data selecionada
         * @private
         */
        handleHolidayClick($day, date) {
            const currentTime = $.now();
            const isDoubleClick = (
                $day.get(0) === this.clickData.lastElement && 
                currentTime - this.clickData.lastClick <= this.options.doubleClickDelay
            );

            $.extend(this.clickData, {
                lastClick: currentTime,
                lastElement: $day.get(0)
            });

            if (isDoubleClick) {
                this.updateSelectedDate(date);
            }
        }

        /**
         * Atualiza a data selecionada
         * @param {string} dateStr - Data em formato ISO
         * @private
         */
        updateSelectedDate(dateStr) {
            const $date = $(new Date(dateStr));
            const formattedDate = this.formatDate($date.get(0));
            
            this.$dateInput
                .val(formattedDate)
                .trigger('change')
                .trigger('calendar:dateSelected', [$date.get(0)]);
        }

        /**
         * Navega entre os meses
         * @param {number} direction - Direção da navegação
         * @private
         */
        navigateMonth(direction) {
            const $loadingOverlay = $('<div>').addClass('calendar-loading');
            
            $.ajax({
                url: this.options.ajaxUrl,
                method: 'POST',
                data: {
                    direction,
                    containerId: this.$container.attr('id'),
                    currentMonth: this.getCurrentMonth()
                },
                beforeSend: () => {
                    this.$container
                        .addClass('loading')
                        .append($loadingOverlay);
                }
            })
            .done((response) => {
                if (response.success) {
                    const $newContent = $(response.html);
                    this.$container
                        .html($newContent)
                        .trigger('calendar:monthChanged', [response.month, response.year]);
                }
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                this.showError($.i18n('errorNavigating'));
                console.error('Ajax error:', errorThrown);
            })
            .always(() => {
                $loadingOverlay.fadeOut(() => {
                    this.$container.removeClass('loading');
                    $loadingOverlay.remove();
                });
            });
        }

        /**
         * Obtém o mês atual da URL ou data atual
         * @returns {number}
         * @private
         */
        getCurrentMonth() {
            const urlParams = new URLSearchParams(window.location.search);
            return parseInt(urlParams.get('month')) || new Date().getMonth() + 1;
        }

        /**
         * Formata uma data
         * @param {Date} date - Data para formatar
         * @returns {string} Data formatada
         * @private
         */
        formatDate(date) {
            if ($.fn.datepicker) {
                return $.datepicker.formatDate('dd/mm/yy', date);
            }
            return date.toLocaleDateString('pt-BR');
        }

        /**
         * Exibe mensagem de erro
         * @param {string} message - Mensagem de erro
         * @private
         */
        showError(message) {
            $('<div>')
                .addClass('calendar-error')
                .text(message)
                .appendTo(this.$container)
                .delay(3000)
                .fadeOut(() => $(this).remove());
        }

        /**
         * Configurações padrão
         * @static
         */
        static defaults = {
            ajaxUrl: 'calendarPhp/ajax/updateMonth.php',
            doubleClickDelay: 300,
            dateFormat: 'dd/mm/yy',
            locale: 'pt-BR'
        };
    }

    // Registra o plugin jQuery
    $.fn.calendar = function(options) {
        return this.each(function() {
            if (!$.data(this, 'calendar')) {
                $.data(this, 'calendar', new Calendar(this.id, options));
            }
        });
    };

})(jQuery, window, document);

// Inicialização com jQuery
$(() => {
    // Configurações regionais
    if ($.fn.datepicker) {
        $.datepicker.setDefaults($.datepicker.regional['pt-BR']);
    }

    // Inicializa o calendário
    $('#calendar-php').calendar();
}); 