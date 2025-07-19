import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ShopifyOrdersService } from '../shopify-orders/shopify-orders.service';
import { ShopifyCustomersService } from '../shopify-customers/shopify-customers.service';
import { ShopifyProductsService } from '../shopify-products/shopify-products.service';
import { WebhooksService } from './webhooks.service';

@Injectable()
export class ShopifyWebhooksService {
  private readonly logger = new Logger(ShopifyWebhooksService.name);
  
  constructor(
    private readonly ordersService: ShopifyOrdersService,
    private readonly customersService: ShopifyCustomersService,
    private readonly productsService: ShopifyProductsService,
    private readonly webhooksService: WebhooksService,
  ) {}

  async verifyWebhook(rawBody: Buffer, hmac: string): Promise<boolean> {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('SHOPIFY_WEBHOOK_SECRET not configured');
      return true; // Permitir en desarrollo
    }

    const hash = createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    return hash === hmac;
  }

  async handleWebhook(topic: string, data: any): Promise<void> {
    await this.webhooksService.logWebhook('shopify', topic, data);

    switch (topic) {
      // Webhooks de órdenes
      case 'orders/create':
      case 'orders/updated':
        await this.handleOrderWebhook(data, topic);
        break;

      case 'orders/cancelled':
        await this.handleOrderCancelled(data);
        break;

      case 'orders/fulfilled':
        await this.handleOrderFulfilled(data);
        break;

      case 'orders/paid':
        await this.handleOrderPaid(data);
        break;

      // Webhooks de clientes
      case 'customers/create':
      case 'customers/update':
        await this.handleCustomerWebhook(data, topic);
        break;

      case 'customers/delete':
        await this.handleCustomerDelete(data);
        break;

      // Webhooks de productos
      case 'products/create':
      case 'products/update':
        await this.handleProductWebhook(data, topic);
        break;

      case 'products/delete':
        await this.handleProductDelete(data);
        break;

      // Webhooks de carritos
      case 'carts/create':
      case 'carts/update':
        await this.handleCartWebhook(data, topic);
        break;

      // Webhooks de checkouts
      case 'checkouts/create':
      case 'checkouts/update':
        await this.handleCheckoutWebhook(data, topic);
        break;

      default:
        this.logger.warn(`Unhandled webhook topic: ${topic}`);
    }
  }

  private async handleOrderWebhook(order: any, event: string): Promise<void> {
    try {
      const orderData = {
        id: order.id.toString(),
        orderNumber: order.order_number,
        email: order.email,
        totalPrice: order.total_price,
        subtotalPrice: order.subtotal_price,
        totalTax: order.total_tax,
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        processedAt: order.processed_at,
        customerId: order.customer?.id?.toString(),
        customerEmail: order.email,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        lineItems: order.line_items,
        shippingLines: order.shipping_lines,
        taxLines: order.tax_lines,
        discountCodes: order.discount_codes,
        note: order.note,
        tags: order.tags,
        cancelledAt: order.cancelled_at,
        closedAt: order.closed_at,
        metadata: {
          browser_ip: order.browser_ip,
          landing_site: order.landing_site,
          referring_site: order.referring_site,
          source_name: order.source_name,
        },
      };

      if (event === 'orders/create') {
        await this.ordersService.createFromWebhook(orderData);
      } else {
        await this.ordersService.updateFromWebhook(order.id.toString(), orderData);
      }
    } catch (error) {
      this.logger.error(`Error handling order webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleOrderCancelled(order: any): Promise<void> {
    try {
      await this.ordersService.updateOrderStatus(order.id.toString(), {
        financialStatus: 'cancelled',
        cancelledAt: order.cancelled_at,
        cancelReason: order.cancel_reason,
      });
    } catch (error) {
      this.logger.error(`Error handling order cancelled: ${error.message}`, error.stack);
    }
  }

  private async handleOrderFulfilled(order: any): Promise<void> {
    try {
      await this.ordersService.updateOrderStatus(order.id.toString(), {
        fulfillmentStatus: 'fulfilled',
        fulfilledAt: new Date(),
        fulfillments: order.fulfillments,
      });
    } catch (error) {
      this.logger.error(`Error handling order fulfilled: ${error.message}`, error.stack);
    }
  }

  private async handleOrderPaid(order: any): Promise<void> {
    try {
      await this.ordersService.updateOrderStatus(order.id.toString(), {
        financialStatus: 'paid',
        paidAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error handling order paid: ${error.message}`, error.stack);
    }
  }

  private async handleCustomerWebhook(customer: any, event: string): Promise<void> {
    try {
      const customerData = {
        id: customer.id.toString(),
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        ordersCount: customer.orders_count,
        totalSpent: customer.total_spent,
        verifiedEmail: customer.verified_email,
        taxExempt: customer.tax_exempt,
        tags: customer.tags,
        currency: customer.currency,
        acceptsMarketing: customer.accepts_marketing,
        acceptsMarketingUpdatedAt: customer.accepts_marketing_updated_at,
        addresses: customer.addresses,
        defaultAddress: customer.default_address,
        metadata: {
          note: customer.note,
          state: customer.state,
          marketingOptInLevel: customer.marketing_opt_in_level,
        },
      };

      if (event === 'customers/create') {
        await this.customersService.createFromWebhook(customerData);
      } else {
        await this.customersService.updateFromWebhook(customer.id.toString(), customerData);
      }
    } catch (error) {
      this.logger.error(`Error handling customer webhook: ${error.message}`, error.stack);
    }
  }

  private async handleCustomerDelete(customer: any): Promise<void> {
    try {
      await this.customersService.softDelete(customer.id.toString());
    } catch (error) {
      this.logger.error(`Error handling customer delete: ${error.message}`, error.stack);
    }
  }

  private async handleProductWebhook(product: any, event: string): Promise<void> {
    try {
      const productData = {
        id: product.id.toString(),
        title: product.title,
        bodyHtml: product.body_html,
        vendor: product.vendor,
        productType: product.product_type,
        handle: product.handle,
        publishedAt: product.published_at,
        templateSuffix: product.template_suffix,
        publishedScope: product.published_scope,
        tags: product.tags,
        variants: product.variants?.map((v: any) => ({
          id: v.id.toString(),
          productId: v.product_id.toString(),
          title: v.title,
          price: v.price,
          sku: v.sku,
          position: v.position,
          inventoryPolicy: v.inventory_policy,
          compareAtPrice: v.compare_at_price,
          fulfillmentService: v.fulfillment_service,
          inventoryManagement: v.inventory_management,
          option1: v.option1,
          option2: v.option2,
          option3: v.option3,
          taxable: v.taxable,
          barcode: v.barcode,
          grams: v.grams,
          weight: v.weight,
          weightUnit: v.weight_unit,
          inventoryQuantity: v.inventory_quantity,
          requiresShipping: v.requires_shipping,
        })),
        options: product.options,
        images: product.images?.map((img: any) => ({
          id: img.id.toString(),
          productId: img.product_id.toString(),
          position: img.position,
          src: img.src,
          width: img.width,
          height: img.height,
          alt: img.alt,
        })),
        image: product.image,
        metadata: {
          status: product.status,
          adminGraphqlApiId: product.admin_graphql_api_id,
        },
      };

      if (event === 'products/create') {
        await this.productsService.createFromWebhook(productData);
      } else {
        await this.productsService.updateFromWebhook(product.id.toString(), productData);
      }
    } catch (error) {
      this.logger.error(`Error handling product webhook: ${error.message}`, error.stack);
    }
  }

  private async handleProductDelete(product: any): Promise<void> {
    try {
      await this.productsService.remove(product.id.toString());
    } catch (error) {
      this.logger.error(`Error handling product delete: ${error.message}`, error.stack);
    }
  }

  private async handleCartWebhook(cart: any, event: string): Promise<void> {
    // Implementar lógica para carritos abandonados
    this.logger.log(`Cart ${event}: ${cart.id}`);
  }

  private async handleCheckoutWebhook(checkout: any, event: string): Promise<void> {
    // Implementar lógica para checkouts abandonados
    this.logger.log(`Checkout ${event}: ${checkout.id}`);
  }

  async registerWebhooks(): Promise<any> {
    // Esta función registraría los webhooks en Shopify
    // Requiere configuración adicional con la API de Shopify
    const webhookTopics = [
      'orders/create',
      'orders/updated',
      'orders/cancelled',
      'orders/fulfilled',
      'orders/paid',
      'customers/create',
      'customers/update',
      'customers/delete',
      'products/create',
      'products/update',
      'products/delete',
      'carts/create',
      'carts/update',
      'checkouts/create',
      'checkouts/update',
    ];

    // Por ahora retornar la lista de webhooks que se registrarían
    return {
      message: 'Webhook registration not implemented yet',
      topics: webhookTopics,
      endpoint: `${process.env.APP_URL}/webhooks/shopify`,
    };
  }

  async unregisterWebhooks(): Promise<any> {
    return {
      message: 'Webhook unregistration not implemented yet',
    };
  }

  async listWebhooks(): Promise<any> {
    return {
      message: 'Webhook listing not implemented yet',
    };
  }
}
