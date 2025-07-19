import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationType, NotificationStatus } from './notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  send(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.sendNotification(sendNotificationDto);
  }

  @Post('send-to-all')
  @HttpCode(HttpStatus.CREATED)
  async sendToAll(@Body() sendNotificationDto: Omit<SendNotificationDto, 'userId' | 'userIds'>) {
    // TODO: Obtener todos los usuarios activos y enviarles la notificación
    // Por ahora, solo un placeholder
    return { message: 'Notification queued for all users' };
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('priority') priority?: string,
  ) {
    return this.notificationsService.findAll({ userId, type, status, priority });
  }

  @Get('my')
  getMyNotifications(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationsService.getUserNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-many')
  markManyAsRead(@Body('ids') ids: string[]) {
    return this.notificationsService.markManyAsRead(ids);
  }

  @Patch('my/read-all')
  async markAllAsRead(@Request() req) {
    const { notifications } = await this.notificationsService.getUserNotifications(req.user.id, {
      unreadOnly: true,
    });
    const ids = notifications.map(n => n.id);
    if (ids.length > 0) {
      await this.notificationsService.markManyAsRead(ids);
    }
    return { message: `Marked ${ids.length} notifications as read` };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete('cleanup/:days')
  async cleanup(@Param('days') days: string) {
    await this.notificationsService.removeOldNotifications(Number(days));
    return { message: `Cleaned up notifications older than ${days} days` };
  }

  // Endpoints para templates específicos
  @Post('welcome')
  @HttpCode(HttpStatus.CREATED)
  sendWelcome(@Body() data: { userId: string; userName: string }) {
    return this.notificationsService.sendWelcomeEmail(data.userId, data.userName);
  }

  @Post('order-confirmation')
  @HttpCode(HttpStatus.CREATED)
  sendOrderConfirmation(@Body() data: { userId: string; orderData: any }) {
    return this.notificationsService.sendOrderConfirmation(data.userId, data.orderData);
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.CREATED)
  sendPasswordReset(@Body() data: { userId: string; resetData: any }) {
    return this.notificationsService.sendPasswordReset(data.userId, data.resetData);
  }

  // Test endpoints (solo en desarrollo)
  @Post('test')
  @HttpCode(HttpStatus.CREATED)
  async sendTestNotification(@Request() req) {
    return await this.notificationsService.sendNotification({
      userId: req.user.id,
      type: NotificationType.IN_APP,
      title: 'Test Notification',
      content: 'This is a test notification sent at ' + new Date().toISOString(),
      priority: 'medium',
    });
  }
}
