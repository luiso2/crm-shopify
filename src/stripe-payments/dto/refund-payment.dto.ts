import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class RefundPaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number; // Amount to refund in cents. If not provided, full refund

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  refundReason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}
