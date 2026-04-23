import { ApiError } from "../../http/errors.js";
import { NotificationsRepository } from "./notifications.repository.js";

export class NotificationsService {
  constructor(private readonly notifications = new NotificationsRepository()) {}

  list() {
    return {
      notifications: this.notifications.list()
    };
  }

  markRead(notificationId: string) {
    const notification = this.notifications.markRead(notificationId);

    if (!notification) {
      throw new ApiError(404, "notification_not_found", "No notification exists for that ID.");
    }

    return notification;
  }
}
