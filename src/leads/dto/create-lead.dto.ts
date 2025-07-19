import { IsString, IsEmail, IsOptional, IsNumber, IsEnum, IsObject } from 'class-validator';
import { LeadStatus, LeadSource } from '../lead.entity';

export class CreateLeadDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus = LeadStatus.NEW;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  assignedAgent?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  employeeCount?: string;

  @IsOptional()
  @IsString()
  annualRevenue?: string;
}
