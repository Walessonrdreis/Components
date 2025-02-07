class AlunosListHeader {
    constructor(containerId, options = {}) {
        this.$container = $(`#${containerId}`);
        this.options = $.extend({}, AlunosListHeader.defaults, options);
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.$container.html(`
            <div class="alunos-list-header">
                <h3><i class="fas fa-users"></i> ${this.options.title || 'Alunos Cadastrados'}</h3>
                <div class="alunos-search">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" class="search-input" placeholder="${this.options.searchPlaceholder || 'Buscar aluno...'}">
                </div>
            </div>
        `);
    }

    setupEventListeners() {
        const $searchInput = this.$container.find('.search-input');

        $searchInput.on('input', $.debounce(300, (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.options.onSearch && this.options.onSearch(searchTerm);
        }));
    }

    // Método para atualizar o título
    setTitle(newTitle) {
        this.$container.find('h3').html(`<i class="fas fa-users"></i> ${newTitle}`);
    }

    // Método para atualizar o placeholder da busca
    setSearchPlaceholder(newPlaceholder) {
        this.$container.find('.search-input').attr('placeholder', newPlaceholder);
    }
}

// Configurações padrão
AlunosListHeader.defaults = {
    title: 'Alunos Cadastrados',
    searchPlaceholder: 'Buscar aluno...',
    onSearch: null
};

// Registra como plugin jQuery
$.fn.alunosListHeader = function (options) {
    return this.each(function () {
        if (!$.data(this, 'alunosListHeader')) {
            $.data(this, 'alunosListHeader', new AlunosListHeader(this.id, options));
        }
    });
}; 