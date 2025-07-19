import { IsString, IsNumber } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsString()
  customerId: string;

  @IsNumber()
  orderAmount: number;
}
