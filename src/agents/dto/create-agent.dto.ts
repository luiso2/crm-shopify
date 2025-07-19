import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export class CreateAgentDto {
  @IsUUID()
  userId: string;

  @IsEnum(['available', 'busy', 'offline'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  specialization?: string;
}
