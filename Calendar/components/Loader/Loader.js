class Loader {
    constructor() {
        // Aguarda o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (!document.getElementById('loader-container')) {
            const container = document.createElement('div');
            container.id = 'loader-container';
            container.innerHTML = `
                <div class="loader-overlay"></div>
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">Carregando...</div>
                    <div class="loader-progress">
                        <div class="loader-progress-bar"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
        }
    }

    show(message = 'Carregando...', duration = 1000) {
        const container = document.getElementById('loader-container');
        const text = container.querySelector('.loader-text');
        const progressBar = container.querySelector('.loader-progress-bar');

        text.textContent = message;
        container.classList.add('active');

        // Simula progresso
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '0%';

        // Força um reflow
        progressBar.offsetHeight;
        progressBar.style.width = '100%';

        return new Promise(resolve => {
            setTimeout(() => {
                this.hide();
                resolve();
            }, duration);
        });
    }

    hide() {
        const container = document.getElementById('loader-container');
        container.classList.remove('active');
    }
}

// Cria uma instância global apenas quando o DOM estiver pronto
$(document).ready(() => {
    window.loader = new Loader();
}); 