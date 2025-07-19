import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ShopifyWebhooksService } from './shopify-webhooks.service';
import { StripeWebhooksService } from './stripe-webhooks.service';
import { ShopifyOrdersModule } from '../shopify-orders/shopify-orders.module';
import { ShopifyCustomersModule } from '../shopify-customers/shopify-customers.module';
import { ShopifyProductsModule } from '../shopify-products/shopify-products.module';
import { StripePaymentsModule } from '../stripe-payments/stripe-payments.module';
import { StripeCustomersModule } from '../stripe-customers/stripe-customers.module';
import { StripeSubscriptionsModule } from '../stripe-subscriptions/stripe-subscriptions.module';

@Module({
  imports: [
    ShopifyOrdersModule,
    ShopifyCustomersModule,
    ShopifyProductsModule,
    StripePaymentsModule,
    StripeCustomersModule,
    StripeSubscriptionsModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, ShopifyWebhooksService, StripeWebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
