import { notificationTemplate } from '../../templates/notification.html';

export default class NotificationItem {
  constructor(notification, config) {
    this.config = config;
    this.notification = notification;
    this.element = this.createNotification();
  }

  createNotification() {
    const template = notificationTemplate
      .replace('{{type}}', this.notification.type)
      .replace('{{title}}', this.notification.title)
      .replace('{{message}}', this.notification.message);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;
    return wrapper.firstElementChild;
  }

  remove() {
    this.element.classList.add('hide');
    setTimeout(() => this.element.remove(), 300);
  }
} 