/**
 * @fileoverview Classe principal do Calendário
 * @version 2.0.0
 * @requires jQuery
 */

import { CalendarHeader } from '../subComponents/Header.js';
import { CalendarWeekDays } from '../subComponents/WeekDays.js';
import { CalendarDays } from '../subComponents/Days.js';
import { CalendarInput } from '../subComponents/Input.js';
import { defaultConfig } from './config.js';
import { formatDate, parseDate } from '../utils/date.js';
import { HOLIDAYS } from '../utils/holidays.js';

;(function($) {
    'use strict';

    class Calendar {
        constructor(config) {
            this.init(config);
        }

        init(config) {
            this.config = $.extend(true, {}, defaultConfig, config);
            this.initializeComponents();
            this.bindEvents();
        }

        initializeComponents() {
            this.$container = $(`#${this.config.containerId}`);
            this.header = new CalendarHeader(this);
            this.weekDays = new CalendarWeekDays(this);
            this.days = new CalendarDays(this);
            this.input = new CalendarInput(this);
            
            this.render();
        }

        render() {
            this.$container.empty().append(
                this.header.render(),
                this.weekDays.render(),
                this.days.render()
            );
        }

        // ... resto dos métodos
    }

    // Registra como plugin jQuery
    $.fn.calendar = function(options) {
        return this.each(function() {
            if (!$.data(this, 'calendar')) {
                $.data(this, 'calendar', new Calendar({
                    containerId: this.id,
                    ...options
                }));
            }
        });
    };

})(jQuery); 