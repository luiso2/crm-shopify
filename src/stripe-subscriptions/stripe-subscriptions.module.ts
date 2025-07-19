import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeSubscriptionsController } from './stripe-subscriptions.controller';
import { StripeSubscriptionsService } from './stripe-subscriptions.service';
import { StripeSubscription } from './stripe-subscription.entity';
import { StripeCustomersModule } from '../stripe-customers/stripe-customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StripeSubscription]),
    StripeCustomersModule,
  ],
  controllers: [StripeSubscriptionsController],
  providers: [StripeSubscriptionsService],
  exports: [StripeSubscriptionsService],
})
export class StripeSubscriptionsModule {}
