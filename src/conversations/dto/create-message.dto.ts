import { IsString, IsOptional, IsUUID, IsEnum, IsArray, IsObject } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  senderId: string;

  @IsEnum(['customer', 'agent', 'system'])
  senderType: string;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: any[];

  @IsObject()
  @IsOptional()
  metadata?: any;
}
