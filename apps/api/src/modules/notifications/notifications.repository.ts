import { demoNotifications } from "../demo-data.js";

export class NotificationsRepository {
  private readonly notifications = new Map(demoNotifications.map((notification) => [notification.id, notification]));

  list() {
    return Array.from(this.notifications.values());
  }

  markRead(notificationId: string) {
    const notification = this.notifications.get(notificationId);

    if (!notification) {
      return null;
    }

    notification.read = true;
    return notification;
  }
}
