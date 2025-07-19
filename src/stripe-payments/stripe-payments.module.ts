import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripePaymentsService } from './stripe-payments.service';
import { StripePaymentsController } from './stripe-payments.controller';
import { StripePayment } from './stripe-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StripePayment])],
  controllers: [StripePaymentsController],
  providers: [StripePaymentsService],
  exports: [StripePaymentsService],
})
export class StripePaymentsModule {}
