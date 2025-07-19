import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopifyCustomer } from './shopify-customer.entity';

@Injectable()
export class ShopifyCustomersService {
  constructor(
    @InjectRepository(ShopifyCustomer)
    private shopifyCustomersRepository: Repository<ShopifyCustomer>,
  ) {}

  async findAll(filters?: {
    acceptsMarketing?: boolean;
    minSpent?: number;
    minOrders?: number;
  }): Promise<ShopifyCustomer[]> {
    const query = this.shopifyCustomersRepository.createQueryBuilder('customer');

    if (filters?.acceptsMarketing !== undefined) {
      query.andWhere('customer.accepts_marketing = :acceptsMarketing', { 
        acceptsMarketing: filters.acceptsMarketing 
      });
    }

    if (filters?.minSpent !== undefined) {
      query.andWhere('customer.totalSpent >= :minSpent', { 
        minSpent: filters.minSpent 
      });
    }

    if (filters?.minOrders !== undefined) {
      query.andWhere('customer.ordersCount >= :minOrders', { 
        minOrders: filters.minOrders 
      });
    }

    return query.orderBy('customer.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<ShopifyCustomer> {
    const customer = await this.shopifyCustomersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Shopify customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByShopifyId(shopifyCustomerId: string): Promise<ShopifyCustomer> {
    const customer = await this.shopifyCustomersRepository.findOne({ 
      where: { shopifyCustomerId } 
    });
    if (!customer) {
      throw new NotFoundException(`Shopify customer with Shopify ID ${shopifyCustomerId} not found`);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<ShopifyCustomer> {
    const customer = await this.shopifyCustomersRepository.findOne({ where: { email } });
    if (!customer) {
      throw new NotFoundException(`Shopify customer with email ${email} not found`);
    }
    return customer;
  }

  async create(customerData: Partial<ShopifyCustomer>): Promise<ShopifyCustomer> {
    // Check if customer with shopifyCustomerId already exists
    if (customerData.shopifyCustomerId) {
      const existing = await this.shopifyCustomersRepository.findOne({ 
        where: { shopifyCustomerId: customerData.shopifyCustomerId } 
      });
      if (existing) {
        throw new ConflictException(`Customer with Shopify ID ${customerData.shopifyCustomerId} already exists`);
      }
    }

    // Generate unique ID if not provided
    if (!customerData.id) {
      customerData.id = this.generateUniqueId();
    }

    const newCustomer = this.shopifyCustomersRepository.create(customerData);
    return this.shopifyCustomersRepository.save(newCustomer);
  }

  async update(id: string, customerData: Partial<ShopifyCustomer>): Promise<ShopifyCustomer> {
    // Check if updating shopifyCustomerId to one that already exists
    if (customerData.shopifyCustomerId) {
      const existing = await this.shopifyCustomersRepository.findOne({ 
        where: { shopifyCustomerId: customerData.shopifyCustomerId } 
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Customer with Shopify ID ${customerData.shopifyCustomerId} already exists`);
      }
    }

    await this.shopifyCustomersRepository.update(id, customerData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.shopifyCustomersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shopify customer with ID ${id} not found`);
    }
  }

  async updateOrderStats(id: string, orderAmount: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.shopifyCustomersRepository.update(id, {
      ordersCount: customer.ordersCount + 1,
      totalSpent: parseFloat(customer.totalSpent.toString()) + orderAmount,
    });
  }

  async getTopCustomers(limit: number = 10): Promise<ShopifyCustomer[]> {
    return this.shopifyCustomersRepository.find({
      order: { totalSpent: 'DESC' },
      take: limit,
    });
  }

  private generateUniqueId(): string {
    return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
