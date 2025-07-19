import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ShopifyWebhooksService } from './shopify-webhooks.service';
import { StripeWebhooksService } from './stripe-webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly shopifyWebhooksService: ShopifyWebhooksService,
    private readonly stripeWebhooksService: StripeWebhooksService,
  ) {}

  @Post('shopify')
  @HttpCode(HttpStatus.OK)
  async handleShopifyWebhook(
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
    @Body() body: any,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log(`Received Shopify webhook: ${topic}`);

    try {
      // Verificar HMAC si está configurado
      const rawBody = req.rawBody;
      if (process.env.SHOPIFY_WEBHOOK_SECRET && rawBody) {
        const isValid = await this.shopifyWebhooksService.verifyWebhook(
          rawBody,
          hmac,
        );
        if (!isValid) {
          throw new BadRequestException('Invalid webhook signature');
        }
      }

      // Procesar webhook según el topic
      await this.shopifyWebhooksService.handleWebhook(topic, body);

      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing Shopify webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log('Received Stripe webhook');

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Raw body is required for Stripe webhooks');
      }

      // Verificar y procesar webhook
      const event = await this.stripeWebhooksService.constructEvent(
        rawBody,
        signature,
      );

      await this.stripeWebhooksService.handleWebhook(event);

      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing Stripe webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('shopify/register')
  @HttpCode(HttpStatus.CREATED)
  async registerShopifyWebhooks() {
    return this.shopifyWebhooksService.registerWebhooks();
  }

  @Post('shopify/unregister')
  @HttpCode(HttpStatus.OK)
  async unregisterShopifyWebhooks() {
    return this.shopifyWebhooksService.unregisterWebhooks();
  }

  @Post('shopify/verify')
  @HttpCode(HttpStatus.OK)
  async verifyShopifyWebhooks() {
    return this.shopifyWebhooksService.listWebhooks();
  }
}
