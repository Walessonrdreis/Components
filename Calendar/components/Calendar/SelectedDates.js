class SelectedDates {
    constructor(containerId) {
        this.$container = $(`#${containerId}`);
        this.init();
    }

    init() {
        this.updateSelectedDatesList();
    }

    updateSelectedDatesList(selectedDates = [], selectedDateTimes = new Map(), defaultTime = '09:00') {
        const $list = this.$container.find('.selected-dates-list');
        $list.empty();

        if (selectedDates.length === 0) {
            $list.html('<p>Nenhuma data selecionada</p>');
            return;
        }

        selectedDates.forEach(dateStr => {
            const [year, month, day] = dateStr.split('-');
            const formattedDate = new Date(year, parseInt(month) - 1, parseInt(day))
                .toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

            const time = selectedDateTimes.get(dateStr) || defaultTime;

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
                        style: 'padding: 2px 5px; border: 1px solid #ddd; border-radius: 3px;'
                    })
                ),
                $('<button>', {
                    class: 'remove-date',
                    html: '<i class="fas fa-times"></i>',
                    style: 'background: none; border: none; color: #ff4444; cursor: pointer; padding: 5px;'
                })
            );

            $list.append($dateItem);
        });
    }
}

// Registra o plugin jQuery para o componente SelectedDates
$.fn.selectedDates = function () {
    return this.each(function () {
        const selectedDates = new SelectedDates(this.id);
        $(this).data('selectedDates', selectedDates);
    });
}; 