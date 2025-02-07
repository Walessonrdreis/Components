class Notifications {
    constructor() {
        // Aguarda o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (!document.getElementById('notifications-container')) {
            const container = document.createElement('div');
            container.id = 'notifications-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'success', duration = 3000) {
        const container = document.getElementById('notifications-container');
        const notification = document.createElement('div');
        const id = 'notification-' + Date.now();

        notification.className = `notification notification-${type} notification-enter`;
        notification.id = id;

        const icon = this.getIcon(type);

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-message">${message}</div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        container.appendChild(notification);

        // Inicia a animação da barra de progresso
        const progress = notification.querySelector('.notification-progress');
        progress.style.transition = `width ${duration}ms linear`;

        // Força um reflow para que a transição funcione
        progress.offsetHeight;
        progress.style.width = '0%';

        // Adiciona evento para fechar a notificação
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(id));

        // Remove a notificação após o tempo definido
        setTimeout(() => this.hide(id), duration);
    }

    hide(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.classList.add('notification-exit');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    getIcon(type) {
        switch (type) {
            case 'success':
                return '<i class="fas fa-check-circle"></i>';
            case 'error':
                return '<i class="fas fa-exclamation-circle"></i>';
            case 'warning':
                return '<i class="fas fa-exclamation-triangle"></i>';
            case 'info':
                return '<i class="fas fa-info-circle"></i>';
            default:
                return '<i class="fas fa-bell"></i>';
        }
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }

    confirm(message) {
        return new Promise((resolve) => {
            const container = document.getElementById('notifications-container');
            const notification = document.createElement('div');
            const id = 'notification-confirm-' + Date.now();

            notification.className = 'notification notification-confirm';
            notification.id = id;

            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon"><i class="fas fa-question-circle"></i></div>
                    <div class="notification-message">${message}</div>
                    <div class="notification-actions">
                        <button class="btn-confirm">Confirmar</button>
                        <button class="btn-cancel">Cancelar</button>
                    </div>
                </div>
            `;

            container.appendChild(notification);

            const handleConfirm = () => {
                this.hide(id);
                resolve(true);
            };

            const handleCancel = () => {
                this.hide(id);
                resolve(false);
            };

            notification.querySelector('.btn-confirm').addEventListener('click', handleConfirm);
            notification.querySelector('.btn-cancel').addEventListener('click', handleCancel);
        });
    }
}

// Cria uma instância global apenas quando o DOM estiver pronto
$(document).ready(() => {
    window.notifications = new Notifications();
}); 