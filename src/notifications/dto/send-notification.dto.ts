import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority } from '../notification.entity';

export class SendNotificationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledFor?: Date;

  @IsOptional()
  @IsObject()
  options?: {
    email?: {
      from?: string;
      replyTo?: string;
      cc?: string[];
      bcc?: string[];
      attachments?: any[];
    };
    sms?: {
      from?: string;
    };
    push?: {
      icon?: string;
      badge?: number;
      sound?: string;
      data?: Record<string, any>;
    };
  };
}
