import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeCustomer } from './stripe-customer.entity';
import Stripe from 'stripe';

@Injectable()
export class StripeCustomersService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(StripeCustomer)
    private stripeCustomerRepository: Repository<StripeCustomer>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async create(createCustomerDto: any): Promise<StripeCustomer> {
    try {
      // Crear cliente en Stripe
      const stripeCustomer = await this.stripe.customers.create({
        email: createCustomerDto.email,
        name: createCustomerDto.name,
        phone: createCustomerDto.phone,
        address: createCustomerDto.address,
        metadata: createCustomerDto.metadata || {},
      });

      // Guardar en base de datos
      const customer = this.stripeCustomerRepository.create({
        id: stripeCustomer.id,
        stripeCustomerId: stripeCustomer.id,
        customerId: createCustomerDto.customerId,
        email: stripeCustomer.email,
        name: stripeCustomer.name,
        phone: stripeCustomer.phone,
        address: stripeCustomer.address as any,
        metadata: stripeCustomer.metadata,
        currency: stripeCustomer.currency || 'usd',
        balance: stripeCustomer.balance / 100, // Convertir de centavos a dólares
        livemode: stripeCustomer.livemode,
      });

      return await this.stripeCustomerRepository.save(customer);
    } catch (error) {
      throw new BadRequestException(`Error creating Stripe customer: ${error.message}`);
    }
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: StripeCustomer[]; total: number; page: number; totalPages: number }> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const query = this.stripeCustomerRepository.createQueryBuilder('customer');

    if (search) {
      query.where(
        'customer.email ILIKE :search OR customer.name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<StripeCustomer> {
    const customer = await this.stripeCustomerRepository.findOne({
      where: { id },
      relations: ['payments'],
    });

    if (!customer) {
      throw new NotFoundException(`Stripe customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByStripeId(stripeCustomerId: string): Promise<StripeCustomer> {
    const customer = await this.stripeCustomerRepository.findOne({
      where: { stripeCustomerId },
      relations: ['payments'],
    });

    if (!customer) {
      throw new NotFoundException(`Stripe customer with Stripe ID ${stripeCustomerId} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: any): Promise<StripeCustomer> {
    const customer = await this.findOne(id);

    try {
      // Actualizar en Stripe
      const stripeUpdate: Stripe.CustomerUpdateParams = {};
      if (updateCustomerDto.email) stripeUpdate.email = updateCustomerDto.email;
      if (updateCustomerDto.name) stripeUpdate.name = updateCustomerDto.name;
      if (updateCustomerDto.phone) stripeUpdate.phone = updateCustomerDto.phone;
      if (updateCustomerDto.address) stripeUpdate.address = updateCustomerDto.address;
      if (updateCustomerDto.metadata) stripeUpdate.metadata = updateCustomerDto.metadata;

      await this.stripe.customers.update(customer.stripeCustomerId, stripeUpdate);

      // Actualizar en base de datos
      Object.assign(customer, updateCustomerDto);
      return await this.stripeCustomerRepository.save(customer);
    } catch (error) {
      throw new BadRequestException(`Error updating Stripe customer: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);

    try {
      // Eliminar de Stripe (marcar como eliminado)
      await this.stripe.customers.del(customer.stripeCustomerId);

      // Eliminar de base de datos
      await this.stripeCustomerRepository.remove(customer);
    } catch (error) {
      throw new BadRequestException(`Error deleting Stripe customer: ${error.message}`);
    }
  }

  async syncWithStripe(id: string): Promise<StripeCustomer> {
    const customer = await this.findOne(id);

    try {
      // Obtener datos actualizados de Stripe
      const stripeCustomer = await this.stripe.customers.retrieve(customer.stripeCustomerId);

      if (stripeCustomer.deleted) {
        throw new BadRequestException('Customer has been deleted from Stripe');
      }

      // Actualizar con datos de Stripe
      customer.email = stripeCustomer.email;
      customer.name = stripeCustomer.name;
      customer.phone = stripeCustomer.phone;
      customer.address = stripeCustomer.address as any;
      customer.metadata = stripeCustomer.metadata;
      customer.currency = stripeCustomer.currency || 'usd';
      customer.balance = stripeCustomer.balance / 100;

      // Obtener métodos de pago
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customer.stripeCustomerId,
      });

      customer.paymentMethodIds = paymentMethods.data.map(pm => pm.id);
      
      return await this.stripeCustomerRepository.save(customer);
    } catch (error) {
      throw new BadRequestException(`Error syncing with Stripe: ${error.message}`);
    }
  }

  async addPaymentMethod(id: string, paymentMethodId: string): Promise<StripeCustomer> {
    const customer = await this.findOne(id);

    try {
      // Adjuntar método de pago al cliente en Stripe
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.stripeCustomerId,
      });

      // Actualizar lista de métodos de pago
      if (!customer.paymentMethodIds.includes(paymentMethodId)) {
        customer.paymentMethodIds.push(paymentMethodId);
        await this.stripeCustomerRepository.save(customer);
      }

      return customer;
    } catch (error) {
      throw new BadRequestException(`Error adding payment method: ${error.message}`);
    }
  }

  async removePaymentMethod(id: string, paymentMethodId: string): Promise<StripeCustomer> {
    const customer = await this.findOne(id);

    try {
      // Desadjuntar método de pago en Stripe
      await this.stripe.paymentMethods.detach(paymentMethodId);

      // Actualizar lista de métodos de pago
      customer.paymentMethodIds = customer.paymentMethodIds.filter(pmId => pmId !== paymentMethodId);
      
      // Si era el método por defecto, limpiarlo
      if (customer.defaultPaymentMethodId === paymentMethodId) {
        customer.defaultPaymentMethodId = null;
      }

      return await this.stripeCustomerRepository.save(customer);
    } catch (error) {
      throw new BadRequestException(`Error removing payment method: ${error.message}`);
    }
  }

  async setDefaultPaymentMethod(id: string, paymentMethodId: string): Promise<StripeCustomer> {
    const customer = await this.findOne(id);

    if (!customer.paymentMethodIds.includes(paymentMethodId)) {
      throw new BadRequestException('Payment method not found for this customer');
    }

    try {
      // Actualizar en Stripe
      await this.stripe.customers.update(customer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Actualizar en base de datos
      customer.defaultPaymentMethodId = paymentMethodId;
      return await this.stripeCustomerRepository.save(customer);
    } catch (error) {
      throw new BadRequestException(`Error setting default payment method: ${error.message}`);
    }
  }

  async getCustomerPayments(
    id: string,
    params: { page: number; limit: number },
  ): Promise<any> {
    const customer = await this.findOne(id);
    const { page, limit } = params;

    try {
      // Obtener pagos de Stripe
      const charges = await this.stripe.charges.list({
        customer: customer.stripeCustomerId,
        limit,
      });

      return {
        data: charges.data,
        has_more: charges.has_more,
        page,
      };
    } catch (error) {
      throw new BadRequestException(`Error fetching customer payments: ${error.message}`);
    }
  }
}
