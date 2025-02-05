/**
 * @fileoverview Configurações padrão do calendário
 */

import { HOLIDAYS } from '../utils/holidays.js';

export const defaultConfig = {
    theme: 'light',
    locale: 'pt-BR',
    firstDayOfWeek: 0,
    showToday: true,
    showNavigation: true,
    doubleClickDelay: 300,
    dateFormat: 'dd/mm/yy',
    holidays: HOLIDAYS,
    classes: {
        container: 'calendar-container',
        calendar: 'calendar',
        header: 'calendar-header',
        weekdays: 'weekdays',
        days: 'days',
        today: 'today',
        holiday: 'feriado',
        selected: 'selected'
    }
}; 