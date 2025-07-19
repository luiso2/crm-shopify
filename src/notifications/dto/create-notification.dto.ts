import { IsString, IsEnum, IsOptional, IsObject, IsDate, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority } from '../notification.entity';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

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
}
