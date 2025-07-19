import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripePaymentsService } from '../stripe-payments/stripe-payments.service';
import { StripeCustomersService } from '../stripe-customers/stripe-customers.service';
import { StripeSubscriptionsService } from '../stripe-subscriptions/stripe-subscriptions.service';
import { WebhooksService } from './webhooks.service';

@Injectable()
export class StripeWebhooksService {
  private readonly logger = new Logger(StripeWebhooksService.name);
  private stripe: Stripe;

  constructor(
    private readonly paymentsService: StripePaymentsService,
    private readonly customersService: StripeCustomersService,
    private readonly subscriptionsService: StripeSubscriptionsService,
    private readonly webhooksService: WebhooksService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async constructEvent(rawBody: Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    await this.webhooksService.logWebhook('stripe', event.type, event.data);

    try {
      switch (event.type) {
        // Eventos de pagos
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.succeeded':
          await this.handleChargeSucceeded(event.data.object as Stripe.Charge);
          break;

        case 'charge.failed':
          await this.handleChargeFailed(event.data.object as Stripe.Charge);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        // Eventos de clientes
        case 'customer.created':
          await this.handleCustomerCreated(event.data.object as Stripe.Customer);
          break;

        case 'customer.updated':
          await this.handleCustomerUpdated(event.data.object as Stripe.Customer);
          break;

        case 'customer.deleted':
          await this.handleCustomerDeleted(event.data.object as Stripe.Customer);
          break;

        // Eventos de suscripciones
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription);
          break;

        // Eventos de facturas
        case 'invoice.created':
          await this.handleInvoiceCreated(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        // Eventos de métodos de pago
        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
          break;

        case 'payment_method.detached':
          await this.handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook ${event.type}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Handlers de pagos
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // El payment ya debería existir, actualizarlo
    await this.paymentsService.updatePaymentStatus(paymentIntent.id, 'succeeded');
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.paymentsService.updatePaymentStatus(
      paymentIntent.id, 
      'failed',
      paymentIntent.last_payment_error?.message,
    );
  }

  private async handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
    const paymentData = {
      stripePaymentId: charge.id,
      customerId: charge.customer as string,
      amount: charge.amount,
      currency: charge.currency,
      status: 'succeeded',
      description: charge.description,
      paymentMethodId: charge.payment_method as string,
      paymentMethodType: charge.payment_method_details?.type,
      receiptUrl: charge.receipt_url,
      metadata: charge.metadata,
      billingDetails: charge.billing_details,
    };

    await this.paymentsService.createOrUpdateFromWebhook(paymentData);
  }

  private async handleChargeFailed(charge: Stripe.Charge): Promise<void> {
    await this.paymentsService.updatePaymentStatus(
      charge.id,
      'failed',
      charge.failure_message,
    );
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    await this.paymentsService.updatePaymentStatus(
      charge.id,
      charge.refunded ? 'refunded' : 'partially_refunded',
      null,
      charge.amount_refunded,
    );
  }

  // Handlers de clientes
  private async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
    await this.customersService.create({
      stripeCustomerId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      metadata: customer.metadata,
    });
  }

  private async handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
    try {
      const existingCustomer = await this.customersService.findByStripeId(customer.id);
      await this.customersService.syncWithStripe(existingCustomer.id);
    } catch (error) {
      // Si no existe, crearlo
      if (error.status === 404) {
        await this.handleCustomerCreated(customer);
      } else {
        throw error;
      }
    }
  }

  private async handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
    try {
      const existingCustomer = await this.customersService.findByStripeId(customer.id);
      await this.customersService.remove(existingCustomer.id);
    } catch (error) {
      this.logger.warn(`Customer ${customer.id} not found for deletion`);
    }
  }

  // Handlers de suscripciones
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    // Buscar el cliente local
    const customer = await this.customersService.findByStripeId(subscription.customer as string);
    
    await this.subscriptionsService.create({
      stripeSubscriptionId: subscription.id,
      customerId: customer.id,
      priceId: subscription.items.data[0].price.id,
      quantity: subscription.items.data[0].quantity,
      status: subscription.status,
      metadata: subscription.metadata,
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Buscar por stripeSubscriptionId
      const existingSub = await this.subscriptionsService.findOne(subscription.id);
      await this.subscriptionsService.syncWithStripe(existingSub.id);
    } catch (error) {
      // Si no existe, crearlo
      if (error.status === 404) {
        await this.handleSubscriptionCreated(subscription);
      } else {
        throw error;
      }
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      const existingSub = await this.subscriptionsService.findOne(subscription.id);
      await this.subscriptionsService.syncWithStripe(existingSub.id);
    } catch (error) {
      this.logger.warn(`Subscription ${subscription.id} not found for deletion`);
    }
  }

  private async handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    // Aquí podrías enviar un email al cliente avisando que su trial termina pronto
    this.logger.log(`Trial ending soon for subscription ${subscription.id}`);
  }

  // Handlers de facturas
  private async handleInvoiceCreated(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice created: ${invoice.id}`);
    // Podrías guardar la factura en la base de datos si lo necesitas
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Actualizar el pago asociado
    if (invoice.charge) {
      await this.paymentsService.updatePaymentStatus(invoice.charge as string, 'succeeded');
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Actualizar el pago y posiblemente la suscripción
    if (invoice.charge) {
      await this.paymentsService.updatePaymentStatus(invoice.charge as string, 'failed');
    }
    
    if (invoice.subscription) {
      this.logger.warn(`Payment failed for subscription ${invoice.subscription}`);
      // Aquí podrías enviar un email al cliente
    }
  }

  // Handlers de métodos de pago
  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    if (paymentMethod.customer) {
      try {
        const customer = await this.customersService.findByStripeId(paymentMethod.customer as string);
        await this.customersService.addPaymentMethod(customer.id, paymentMethod.id);
      } catch (error) {
        this.logger.warn(`Customer ${paymentMethod.customer} not found for payment method attachment`);
      }
    }
  }

  private async handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    // El método de pago fue desvinculado, actualizar los clientes que lo tenían
    this.logger.log(`Payment method ${paymentMethod.id} detached`);
  }
}
