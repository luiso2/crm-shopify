import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class UpdateAgentDto {
  @IsEnum(['available', 'busy', 'offline'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsNumber()
  @IsOptional()
  assignedTickets?: number;

  @IsNumber()
  @IsOptional()
  resolvedTickets?: number;

  @IsNumber()
  @IsOptional()
  avgResolutionTime?: number;

  @IsNumber()
  @IsOptional()
  satisfactionRating?: number;
}
