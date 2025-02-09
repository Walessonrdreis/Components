import Notifications from './core/Notifications.js';

// Injecção automática de estilos para o componente Notifications aprimorados
(function () {
  const styleId = 'notifications-component-styles';
  if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* Estilos do componente Notifications aprimorados */
      .notification {
        background: #fff;
        color: #333;
        border: 1px solid #ccc;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        opacity: 0;
        animation: fadeIn 0.5s forwards;
        position: relative;
        transition: transform 0.3s ease;
      }
      .notification:hover {
        transform: scale(1.02);
      }
      .notification-success {
        border-color: #28a745;
        background: #e9f7ef;
        color: #155724;
      }
      .notification button.close {
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #aaa;
        transition: color 0.3s ease;
      }
      .notification button.close:hover {
        color: #333;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      /* Estilo para o contêiner das notificações */
      #notificacoes {
        position: fixed;
        top: 10px;
        right: 10px;
        max-width: 30vw;
        max-height: 90vh;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: flex-end;
        z-index: 9999;
      }
      /* Estilos para a barra de progresso */
      .progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        background-color: #007bff;
        width: 100%;
        animation: progressBar 3s linear forwards;
      }
      @keyframes progressBar {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
})();

export default Notifications; 