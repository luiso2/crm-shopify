import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeCustomersController } from './stripe-customers.controller';
import { StripeCustomersService } from './stripe-customers.service';
import { StripeCustomer } from './stripe-customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StripeCustomer])],
  controllers: [StripeCustomersController],
  providers: [StripeCustomersService],
  exports: [StripeCustomersService],
})
export class StripeCustomersModule {}
