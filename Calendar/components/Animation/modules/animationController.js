import { ANIMATION_SPEED, START_COLOR, END_COLOR } from '../constants/animationConstants.js';
import { animateElement } from './animationUtil.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('animationContainer');

    // Carrega o template HTML do componente
    try {
        const templateUrl = new URL('../templates/animationTemplate.html', import.meta.url);
        const response = await fetch(templateUrl.href);
        const templateContent = await response.text();
        container.innerHTML = templateContent;
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar template.</p>';
    }

    // Inicializa a animação alternando entre as cores definidas
    animateElement(container, START_COLOR, END_COLOR, ANIMATION_SPEED);
}); 