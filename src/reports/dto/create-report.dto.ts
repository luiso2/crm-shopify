import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ReportType, ReportFormat } from '../report.entity';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat = ReportFormat.PDF;

  @IsObject()
  parameters: any;
}
