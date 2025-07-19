import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';

export class UpdateConversationDto {
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @IsEnum(['open', 'in_progress', 'resolved', 'closed'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
