import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() notificationData: { userId: number; message: string }) {
    return this.notificationService.create(notificationData);
  }

  @Get(':userId')
  async findAll(@Param('userId') userId: number) {
    return this.notificationService.findAll(userId);
  }
}