<?php
class Calendar {
    private $options;
    private $currentDate;
    private $holidays;

    public function __construct($options = []) {
        $this->options = array_merge([
            'theme' => 'light',
            'locale' => 'pt-BR',
            'firstDayOfWeek' => 0,
            'showToday' => true,
            'showNavigation' => true,
            'containerId' => 'calendar-php'
        ], $options);

        $this->currentDate = new DateTime();
        $this->holidays = require_once __DIR__ . '/constants/holidays.php';
    }

    public function render() {
        $html = $this->getStyles();
        $html .= '<div class="calendar-container">';
        $html .= '<input type="text" id="data-selecionada" class="date-input" readonly placeholder="Selecione uma data">';
        $html .= '<div id="' . $this->options['containerId'] . '" class="calendar">';
        $html .= $this->renderHeader();
        $html .= $this->renderWeekDays();
        $html .= $this->renderDays();
        $html .= '</div></div>';
        $html .= $this->getScripts();
        return $html;
    }

    private function renderHeader() {
        $monthYear = strftime('%B %Y', $this->currentDate->getTimestamp());
        $monthYear = ucfirst($monthYear);
        
        return '
        <div class="calendar-header">
            <button class="prev-month">
                <i class="fas fa-chevron-left"></i>
            </button>
            <h2 class="current-month">' . $monthYear . '</h2>
            <button class="next-month">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>';
    }

    private function renderWeekDays() {
        $weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        $html = '<div class="weekdays">';
        
        for ($i = $this->options['firstDayOfWeek']; $i < $this->options['firstDayOfWeek'] + 7; $i++) {
            $dayIndex = $i % 7;
            $html .= '<div class="weekday">' . $weekDays[$dayIndex] . '</div>';
        }
        
        $html .= '</div>';
        return $html;
    }

    private function renderDays() {
        $html = '<div class="days">';
        
        $year = $this->currentDate->format('Y');
        $month = $this->currentDate->format('m');
        
        $firstDay = new DateTime("$year-$month-01");
        $lastDay = new DateTime("$year-$month-" . $firstDay->format('t'));
        
        // Adiciona dias vazios no início
        $firstDayOfWeek = $firstDay->format('w') - $this->options['firstDayOfWeek'];
        if ($firstDayOfWeek < 0) $firstDayOfWeek += 7;
        
        for ($i = 0; $i < $firstDayOfWeek; $i++) {
            $html .= '<div></div>';
        }
        
        // Adiciona os dias do mês
        $currentDay = clone $firstDay;
        while ($currentDay <= $lastDay) {
            $dayClasses = ['calendar-day'];
            $dayData = '';
            
            // Verifica se é hoje
            if ($this->isToday($currentDay)) {
                $dayClasses[] = 'today';
            }
            
            // Verifica se é feriado
            $holidayKey = $currentDay->format('d-m');
            if (isset($this->holidays[$holidayKey])) {
                $dayClasses[] = 'feriado';
                $dayData = ' data-feriado="' . $this->holidays[$holidayKey] . '"';
            }
            
            $html .= sprintf(
                '<div class="%s" data-date="%s"%s>%s</div>',
                implode(' ', $dayClasses),
                $currentDay->format('Y-m-d'),
                $dayData,
                $currentDay->format('j')
            );
            
            $currentDay->modify('+1 day');
        }
        
        $html .= '</div>';
        return $html;
    }

    private function isToday($date) {
        $today = new DateTime();
        return $date->format('Y-m-d') === $today->format('Y-m-d');
    }

    private function getStyles() {
        return '<link rel="stylesheet" href="calendarPhp/assets/calendar.css">';
    }

    private function getScripts() {
        return '
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js"></script>
        <script src="calendarPhp/assets/calendar.js"></script>
        <script>
            $(document).ready(function() {
                $("#' . $this->options['containerId'] . '").calendar(' . json_encode($this->options) . ');
                $("#data-selecionada").mask("99/99/9999");
            });
        </script>';
    }

    public function setCurrentDate(DateTime $date) {
        $this->currentDate = $date;
    }

    public function renderContent() {
        $html = $this->renderHeader();
        $html .= $this->renderWeekDays();
        $html .= $this->renderDays();
        return $html;
    }
} 