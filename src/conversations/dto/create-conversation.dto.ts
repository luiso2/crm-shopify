import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  @IsOptional()
  agentId?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsEnum(['chat', 'email', 'phone', 'social'])
  @IsOptional()
  channel?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
