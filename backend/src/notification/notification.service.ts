import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private notifications: any[] = [];

  constructor(private readonly notificationGateway: NotificationGateway) {}

  create(notification: { userId: number; message: string }) {
    this.notifications.push(notification);
    this.notificationGateway.sendNotification(notification);
    return notification;
  }

  findAll(userId: number) {
    return this.notifications.filter(n => n.userId === userId);
  }
}