import { containerTemplate } from '../templates/notificationGroup.html';

export const DEFAULT_CONFIG = {
  position: 'top-right',
  autoClose: true,
  duration: 5000,
  maxNotifications: 5,
  templates: {
    container: containerTemplate
  }
}; 