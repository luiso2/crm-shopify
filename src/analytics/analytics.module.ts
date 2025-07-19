import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyOrder } from '../shopify-orders/shopify-order.entity';
import { ShopifyCustomer } from '../shopify-customers/shopify-customer.entity';
import { ShopifyProduct } from '../shopify-products/shopify-product.entity';
import { StripePayment } from '../stripe-payments/stripe-payment.entity';
import { StripeSubscription } from '../stripe-subscriptions/stripe-subscription.entity';
import { Lead } from '../leads/lead.entity';
import { SupportTicket } from '../support-tickets/support-ticket.entity';
import { Conversation } from '../conversations/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopifyOrder,
      ShopifyCustomer,
      ShopifyProduct,
      StripePayment,
      StripeSubscription,
      Lead,
      SupportTicket,
      Conversation,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
