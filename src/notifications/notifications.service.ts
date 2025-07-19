import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification, NotificationStatus, NotificationType } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { emailTemplates } from './templates/email.templates';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async sendNotification(sendNotificationDto: SendNotificationDto): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // Determinar usuarios destinatarios
    let userIds: string[] = [];
    if (sendNotificationDto.userId) {
      userIds = [sendNotificationDto.userId];
    } else if (sendNotificationDto.userIds) {
      userIds = sendNotificationDto.userIds;
    }

    // Crear notificaciones para cada usuario
    for (const userId of userIds) {
      const notification = await this.create({
        userId,
        type: sendNotificationDto.type,
        title: sendNotificationDto.title,
        content: sendNotificationDto.content,
        priority: sendNotificationDto.priority,
        metadata: sendNotificationDto.metadata,
        template: sendNotificationDto.template,
        templateData: sendNotificationDto.templateData,
        scheduledFor: sendNotificationDto.scheduledFor,
      });

      // Si no está programada, enviar inmediatamente
      if (!sendNotificationDto.scheduledFor) {
        await this.processNotification(notification, sendNotificationDto.options);
      }

      notifications.push(notification);
    }

    return notifications;
  }

  async processNotification(notification: Notification, options?: any): Promise<void> {
    try {
      this.logger.log(`Processing notification ${notification.id} of type ${notification.type}`);

      switch (notification.type) {
        case NotificationType.EMAIL:
          await this.sendEmail(notification, options?.email);
          break;
        case NotificationType.SMS:
          await this.sendSMS(notification, options?.sms);
          break;
        case NotificationType.PUSH:
          await this.sendPushNotification(notification, options?.push);
          break;
        case NotificationType.IN_APP:
          // Las notificaciones in-app solo se marcan como enviadas
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          break;
      }

      await this.notificationRepository.save(notification);
    } catch (error) {
      this.logger.error(`Failed to process notification ${notification.id}:`, error);
      notification.status = NotificationStatus.FAILED;
      notification.failedAt = new Date();
      notification.failureReason = error.message;
      notification.retryCount++;
      await this.notificationRepository.save(notification);
    }
  }

  private async sendEmail(notification: Notification, options?: any): Promise<void> {
    // TODO: Integrar con un servicio de email real (SendGrid, AWS SES, etc.)
    this.logger.log(`Sending email to user ${notification.userId}: ${notification.title}`);
    
    // Simular envío exitoso
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
    
    // En producción, aquí iría la lógica real de envío
    // Por ejemplo:
    // await this.emailService.send({
    //   to: user.email,
    //   subject: notification.title,
    //   html: notification.content,
    //   ...options
    // });
  }

  private async sendSMS(notification: Notification, options?: any): Promise<void> {
    // TODO: Integrar con un servicio de SMS real (Twilio, AWS SNS, etc.)
    this.logger.log(`Sending SMS to user ${notification.userId}: ${notification.title}`);
    
    // Simular envío exitoso
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
  }

  private async sendPushNotification(notification: Notification, options?: any): Promise<void> {
    // TODO: Integrar con un servicio de push notifications (FCM, OneSignal, etc.)
    this.logger.log(`Sending push notification to user ${notification.userId}: ${notification.title}`);
    
    // Simular envío exitoso
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
  }

  async findAll(filters?: {
    userId?: string;
    type?: NotificationType;
    status?: NotificationStatus;
    priority?: string;
  }): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification');

    if (filters?.userId) {
      query.andWhere('notification.userId = :userId', { userId: filters.userId });
    }
    if (filters?.type) {
      query.andWhere('notification.type = :type', { type: filters.type });
    }
    if (filters?.status) {
      query.andWhere('notification.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      query.andWhere('notification.priority = :priority', { priority: filters.priority });
    }

    return await query.orderBy('notification.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    return await this.notificationRepository.save(notification);
  }

  async markManyAsRead(ids: string[]): Promise<void> {
    await this.notificationRepository.update(
      { id: In(ids) },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }

  async getUserNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const query = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (options?.unreadOnly) {
      query.andWhere('notification.status != :status', { status: NotificationStatus.READ });
    }

    const total = await query.getCount();
    
    const unread = await this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.SENT,
      },
    });

    const notifications = await query
      .orderBy('notification.createdAt', 'DESC')
      .limit(options?.limit || 20)
      .offset(options?.offset || 0)
      .getMany();

    return { notifications, total, unread };
  }

  async remove(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async removeOldNotifications(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('status IN (:...statuses)', {
        statuses: [NotificationStatus.READ, NotificationStatus.FAILED],
      })
      .execute();

    this.logger.log(`Deleted ${result.affected} old notifications`);
  }

  // Procesar notificaciones programadas cada minuto
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const scheduledNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledFor: LessThanOrEqual(now),
      },
    });

    for (const notification of scheduledNotifications) {
      await this.processNotification(notification);
    }
  }

  // Reintentar notificaciones fallidas cada 5 minutos
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications(): Promise<void> {
    const failedNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.FAILED,
        retryCount: LessThanOrEqual(3), // Máximo 3 reintentos
      },
    });

    for (const notification of failedNotifications) {
      await this.processNotification(notification);
    }
  }

  // Limpiar notificaciones antiguas cada día a las 2 AM
  @Cron('0 2 * * *')
  async cleanupOldNotifications(): Promise<void> {
    await this.removeOldNotifications(30);
  }

  // Métodos de utilidad para templates
  async sendFromTemplate(
    templateName: string,
    userId: string,
    data: Record<string, any>,
    type: NotificationType = NotificationType.EMAIL
  ): Promise<Notification> {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Renderizar template con los datos
    const title = this.renderTemplate(template.subject, data);
    const content = type === NotificationType.EMAIL 
      ? this.renderTemplate(template.html, data)
      : this.renderTemplate(template.text, data);

    return await this.sendNotification({
      userId,
      type,
      title,
      content,
      template: templateName,
      templateData: data,
    }).then(notifications => notifications[0]);
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Métodos de conveniencia
  async sendWelcomeEmail(userId: string, userName: string): Promise<Notification> {
    return await this.sendFromTemplate('welcome', userId, {
      userName,
      appName: 'CRM Shopify',
      loginUrl: process.env.APP_URL || 'https://crm-shopify.com',
      year: new Date().getFullYear(),
    });
  }

  async sendOrderConfirmation(userId: string, orderData: any): Promise<Notification> {
    return await this.sendFromTemplate('orderConfirmation', userId, {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      orderDate: orderData.orderDate,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      appName: 'CRM Shopify',
      year: new Date().getFullYear(),
    });
  }

  async sendPasswordReset(userId: string, resetData: any): Promise<Notification> {
    return await this.sendFromTemplate('passwordReset', userId, {
      userName: resetData.userName,
      resetUrl: resetData.resetUrl,
      expiryHours: 24,
      ipAddress: resetData.ipAddress,
      userAgent: resetData.userAgent,
      requestTime: new Date().toLocaleString(),
      appName: 'CRM Shopify',
      year: new Date().getFullYear(),
    });
  }
}
