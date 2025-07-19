import { PartialType } from '@nestjs/mapped-types';
import { CreateSupportTicketDto, TicketStatus } from './create-support-ticket.dto';
import { IsString, IsOptional, IsDate, IsInt, Min, Max, IsEnum } from 'class-validator';

export class UpdateSupportTicketDto extends PartialType(CreateSupportTicketDto) {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsDate()
  resolvedAt?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  satisfactionRating?: number;

  @IsOptional()
  @IsString()
  feedbackComments?: string;
}
