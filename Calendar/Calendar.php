<?php
class Calendar {
    public function render() {
        return '
        <div id="calendar-root"></div>
        <script type="module">
            import Calendar from "./components/Calendar/Calendar.js";
            
            const calendar = new Calendar();
            const root = document.getElementById("calendar-root");
            root.appendChild(calendar.getContainer());
            
            // Verifica se o calendário deve ser exibido baseado na resposta
            function updateCalendarVisibility(value) {
                calendar.enable(value.toLowerCase());
            }
            
            // Expõe a função globalmente para ser usada por outros componentes
            window.updateCalendarVisibility = updateCalendarVisibility;
        </script>';
    }
}
