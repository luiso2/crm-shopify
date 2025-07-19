import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  code: string;

  @IsString()
  customerId: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsNumber()
  orderAmount: number;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
