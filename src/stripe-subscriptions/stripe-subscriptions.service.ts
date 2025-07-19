import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeSubscription, SubscriptionStatus } from './stripe-subscription.entity';
import { StripeCustomersService } from '../stripe-customers/stripe-customers.service';
import Stripe from 'stripe';

@Injectable()
export class StripeSubscriptionsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(StripeSubscription)
    private subscriptionRepository: Repository<StripeSubscription>,
    private stripeCustomersService: StripeCustomersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async create(createSubscriptionDto: any): Promise<StripeSubscription> {
    try {
      // Verificar que el cliente existe
      const customer = await this.stripeCustomersService.findOne(createSubscriptionDto.customerId);

      // Crear suscripción en Stripe
      const stripeSubscription = await this.stripe.subscriptions.create({
        customer: customer.stripeCustomerId,
        items: [
          {
            price: createSubscriptionDto.priceId,
            quantity: createSubscriptionDto.quantity || 1,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: createSubscriptionDto.metadata || {},
        trial_period_days: createSubscriptionDto.trialDays,
        coupon: createSubscriptionDto.couponId,
      });

      // Guardar en base de datos
      const subscription = this.subscriptionRepository.create({
        id: stripeSubscription.id,
        stripeSubscriptionId: stripeSubscription.id,
        customerId: customer.id,
        priceId: createSubscriptionDto.priceId,
        productId: stripeSubscription.items.data[0].price.product as string,
        status: stripeSubscription.status as SubscriptionStatus,
        quantity: stripeSubscription.items.data[0].quantity,
        amount: stripeSubscription.items.data[0].price.unit_amount / 100,
        currency: stripeSubscription.currency,
        interval: stripeSubscription.items.data[0].price.recurring.interval,
        intervalCount: stripeSubscription.items.data[0].price.recurring.interval_count,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        livemode: stripeSubscription.livemode,
        metadata: stripeSubscription.metadata,
        collectionMethod: stripeSubscription.collection_method,
        latestInvoiceId: stripeSubscription.latest_invoice as string,
        defaultPaymentMethodId: stripeSubscription.default_payment_method as string,
        trialStart: stripeSubscription.trial_start 
          ? new Date(stripeSubscription.trial_start * 1000) 
          : null,
        trialEnd: stripeSubscription.trial_end 
          ? new Date(stripeSubscription.trial_end * 1000) 
          : null,
      });

      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      throw new BadRequestException(`Error creating subscription: ${error.message}`);
    }
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    customerId?: string;
  }): Promise<{ data: StripeSubscription[]; total: number; page: number; totalPages: number }> {
    const { page, limit, status, customerId } = params;
    const skip = (page - 1) * limit;

    const query = this.subscriptionRepository.createQueryBuilder('subscription');

    if (status) {
      query.where('subscription.status = :status', { status });
    }

    if (customerId) {
      query.andWhere('subscription.customerId = :customerId', { customerId });
    }

    const [data, total] = await query
      .leftJoinAndSelect('subscription.customer', 'customer')
      .skip(skip)
      .take(limit)
      .orderBy('subscription.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<StripeSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async update(id: string, updateSubscriptionDto: any): Promise<StripeSubscription> {
    const subscription = await this.findOne(id);

    try {
      const updateParams: Stripe.SubscriptionUpdateParams = {};

      if (updateSubscriptionDto.quantity) {
        updateParams.items = [{
          id: (await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId))
            .items.data[0].id,
          quantity: updateSubscriptionDto.quantity,
        }];
      }

      if (updateSubscriptionDto.metadata) {
        updateParams.metadata = updateSubscriptionDto.metadata;
      }

      if (updateSubscriptionDto.coupon) {
        updateParams.coupon = updateSubscriptionDto.coupon;
      }

      if (updateSubscriptionDto.trialEnd) {
        updateParams.trial_end = Math.floor(new Date(updateSubscriptionDto.trialEnd).getTime() / 1000);
      }

      // Actualizar en Stripe
      const updatedStripeSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        updateParams,
      );

      // Actualizar en base de datos
      return await this.syncWithStripe(id);
    } catch (error) {
      throw new BadRequestException(`Error updating subscription: ${error.message}`);
    }
  }

  async cancel(id: string, atPeriodEnd: boolean = true): Promise<StripeSubscription> {
    const subscription = await this.findOne(id);

    try {
      if (atPeriodEnd) {
        // Cancelar al final del período
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        // Cancelar inmediatamente
        await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }

      return await this.syncWithStripe(id);
    } catch (error) {
      throw new BadRequestException(`Error canceling subscription: ${error.message}`);
    }
  }

  async reactivate(id: string): Promise<StripeSubscription> {
    const subscription = await this.findOne(id);

    if (!subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not scheduled for cancellation');
    }

    try {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      return await this.syncWithStripe(id);
    } catch (error) {
      throw new BadRequestException(`Error reactivating subscription: ${error.message}`);
    }
  }

  async pause(id: string, pauseOptions: any): Promise<StripeSubscription> {
    const subscription = await this.findOne(id);

    try {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        pause_collection: {
          behavior: 'void',
          resumes_at: pauseOptions.resumesAt 
            ? Math.floor(new Date(pauseOptions.resumesAt).getTime() / 1000) 
            : undefined,
        },
      });

      return await this.syncWithStripe(id);
    } catch (error) {
      throw new BadRequestException(`Error pausing subscription: ${error.message}`);
    }
  }

  async resume(id: string): Promise<StripeSubscription> {
    const subscription = await this.findOne(id);

    try {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        pause_collection: null,
      });

      return await this.syncWithStripe(id);
    } catch (error) {
      throw new BadRequestException(`Error resuming subscription: ${error.message}`);
    }
  }

  async updatePaymentMethod(id: string, paymentMethodId: string): Promise<StripeSubscription> {
    const subscription = await this.findOne(id);

    try {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        default_payment_method: paymentMethodId,
      });

      subscription.defaultPaymentMethodId = paymentMethodId;
      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      throw new BadRequestException(`Error updating payment method: ${error.message}`);
    }
  }

  async syncWithStripe(id: string): Promise<StripeSubscription> {
    const subscription = await this.findOne(id);

    try {
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
        { expand: ['items.data.price.product'] },
      );

      // Actualizar con datos de Stripe
      subscription.status = stripeSubscription.status as SubscriptionStatus;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      subscription.canceledAt = stripeSubscription.canceled_at 
        ? new Date(stripeSubscription.canceled_at * 1000) 
        : null;
      subscription.cancelAt = stripeSubscription.cancel_at 
        ? new Date(stripeSubscription.cancel_at * 1000) 
        : null;
      subscription.endedAt = stripeSubscription.ended_at 
        ? new Date(stripeSubscription.ended_at * 1000) 
        : null;
      subscription.latestInvoiceId = stripeSubscription.latest_invoice as string;
      subscription.defaultPaymentMethodId = stripeSubscription.default_payment_method as string;
      
      if (stripeSubscription.items.data[0]) {
        subscription.quantity = stripeSubscription.items.data[0].quantity;
        const price = stripeSubscription.items.data[0].price;
        subscription.amount = price.unit_amount / 100;
        subscription.productName = (price.product as Stripe.Product).name;
      }

      if (stripeSubscription.discount) {
        subscription.discount = {
          coupon: stripeSubscription.discount.coupon.id,
          percentOff: stripeSubscription.discount.coupon.percent_off,
          amountOff: stripeSubscription.discount.coupon.amount_off 
            ? stripeSubscription.discount.coupon.amount_off / 100 
            : undefined,
          start: new Date(stripeSubscription.discount.start * 1000),
          end: stripeSubscription.discount.end 
            ? new Date(stripeSubscription.discount.end * 1000) 
            : undefined,
        };
      }

      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      throw new BadRequestException(`Error syncing with Stripe: ${error.message}`);
    }
  }

  async getCustomerSubscriptions(
    customerId: string,
    status?: string,
  ): Promise<StripeSubscription[]> {
    const query = this.subscriptionRepository.createQueryBuilder('subscription');
    
    query.where('subscription.customerId = :customerId', { customerId });
    
    if (status) {
      query.andWhere('subscription.status = :status', { status });
    }

    return await query.orderBy('subscription.createdAt', 'DESC').getMany();
  }

  async getSubscriptionInvoices(
    id: string,
    params: { page: number; limit: number },
  ): Promise<any> {
    const subscription = await this.findOne(id);
    const { page, limit } = params;

    try {
      const invoices = await this.stripe.invoices.list({
        subscription: subscription.stripeSubscriptionId,
        limit,
      });

      return {
        data: invoices.data,
        has_more: invoices.has_more,
        page,
      };
    } catch (error) {
      throw new BadRequestException(`Error fetching invoices: ${error.message}`);
    }
  }

  async previewChanges(id: string, changes: any): Promise<any> {
    const subscription = await this.findOne(id);

    try {
      const items = [];
      
      if (changes.priceId || changes.quantity) {
        const currentItem = (await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId))
          .items.data[0];
        
        items.push({
          id: currentItem.id,
          price: changes.priceId || currentItem.price.id,
          quantity: changes.quantity || currentItem.quantity,
        });
      }

      const preview = await this.stripe.invoices.retrieveUpcoming({
        subscription: subscription.stripeSubscriptionId,
        subscription_items: items.length > 0 ? items : undefined,
        subscription_trial_end: changes.trialEnd 
          ? Math.floor(new Date(changes.trialEnd).getTime() / 1000) 
          : undefined,
      });

      return {
        amount_due: preview.amount_due / 100,
        currency: preview.currency,
        period_start: new Date(preview.period_start * 1000),
        period_end: new Date(preview.period_end * 1000),
        lines: preview.lines.data.map(line => ({
          description: line.description,
          amount: line.amount / 100,
          quantity: line.quantity,
        })),
      };
    } catch (error) {
      throw new BadRequestException(`Error previewing changes: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);

    // Solo eliminar de la base de datos local
    // Las suscripciones canceladas en Stripe se mantienen para historial
    await this.subscriptionRepository.remove(subscription);
  }
}
