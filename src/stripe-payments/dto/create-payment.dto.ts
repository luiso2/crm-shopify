import { IsString, IsNumber, IsOptional, IsObject, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  customerId: string;

  @IsNumber()
  @Min(50) // Minimum 50 cents
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'usd';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsObject()
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export class ProcessPaymentDto extends CreatePaymentDto {
  @IsString()
  paymentMethodId: string; // Required for processing
}
