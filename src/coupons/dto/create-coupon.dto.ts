import { IsString, IsEnum, IsNumber, IsOptional, IsDate, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType, CouponStatus } from '../coupon.entity';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  value: number;

  @IsNumber()
  @IsOptional()
  minimumAmount?: number;

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @IsNumber()
  @IsOptional()
  maxUsesPerCustomer?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsEnum(CouponStatus)
  @IsOptional()
  status?: CouponStatus = CouponStatus.ACTIVE;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableProducts?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableCategories?: string[];

  @IsObject()
  @IsOptional()
  metadata?: any;
}
