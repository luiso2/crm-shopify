import { IsString, IsOptional, IsEnum, IsArray, IsInt, Min, Max } from 'class-validator';

export enum TicketStatus {
  OPEN = 'open',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketCategory {
  BILLING = 'billing',
  TECHNICAL = 'technical',
  GENERAL = 'general',
  FEATURE_REQUEST = 'feature_request',
  BUG = 'bug',
}

export class CreateSupportTicketDto {
  @IsString()
  customerId: string;

  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus = TicketStatus.OPEN;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority = TicketPriority.MEDIUM;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
