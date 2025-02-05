/**
 * @fileoverview Componente de input de data
 */

import { formatDate, parseDate } from '../utils/date.js';

export class CalendarInput {
    constructor(calendar) {
        this.calendar = calendar;
        this.$element = $('#data-selecionada');
        this.init();
    }

    init() {
        this.setupDatepicker();
        this.setupMask();
        this.bindEvents();
    }

    setupDatepicker() {
        if ($.fn.datepicker) {
            this.$element.datepicker({
                dateFormat: this.calendar.config.dateFormat,
                regional: this.calendar.config.locale,
                onSelect: (date) => this.handleDateSelect(date)
            });
        }
    }

    setupMask() {
        if ($.fn.mask) {
            this.$element.mask('99/99/9999');
        }
    }

    bindEvents() {
        this.$element.on('change', () => this.handleInputChange());
    }

    handleDateSelect(dateStr) {
        const date = parseDate(dateStr, this.calendar.config.dateFormat);
        this.calendar.setDate(date);
    }

    handleInputChange() {
        const dateStr = this.$element.val();
        if (dateStr) {
            const date = parseDate(dateStr, this.calendar.config.dateFormat);
            if (!isNaN(date.getTime())) {
                this.calendar.setDate(date);
            }
        }
    }

    updateValue(date) {
        const formattedDate = formatDate(date, this.calendar.config.dateFormat);
        this.$element.val(formattedDate);
    }
} 