import { IsString, IsEnum, IsOptional, IsObject, IsUUID } from 'class-validator';
import { MessageType, SenderType } from '../message.entity';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsUUID()
  conversationId: string;

  @IsString()
  @IsOptional()
  senderId?: string;

  @IsEnum(SenderType)
  @IsOptional()
  senderType?: SenderType = SenderType.USER;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsOptional()
  processingTime?: number;
}
