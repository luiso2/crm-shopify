import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';
import { IsOptional, IsDate } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsOptional()
  @IsDate()
  lastContactedAt?: Date;

  @IsOptional()
  @IsDate()
  convertedAt?: Date;

  @IsOptional()
  convertedToCustomerId?: string;
}
