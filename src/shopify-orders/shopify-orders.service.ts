import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ShopifyOrder } from './shopify-order.entity';

@Injectable()
export class ShopifyOrdersService {
  constructor(
    @InjectRepository(ShopifyOrder)
    private shopifyOrdersRepository: Repository<ShopifyOrder>,
  ) {}

  async findAll(filters?: {
    customerId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ShopifyOrder[]> {
    const where: any = {};

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    return this.shopifyOrdersRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ShopifyOrder> {
    const order = await this.shopifyOrdersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Shopify order with ID ${id} not found`);
    }
    return order;
  }

  async findByShopifyId(shopifyOrderId: string): Promise<ShopifyOrder> {
    const order = await this.shopifyOrdersRepository.findOne({ where: { shopifyOrderId } });
    if (!order) {
      throw new NotFoundException(`Shopify order with Shopify ID ${shopifyOrderId} not found`);
    }
    return order;
  }

  async findByCustomer(customerId: string): Promise<ShopifyOrder[]> {
    return this.shopifyOrdersRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(orderData: Partial<ShopifyOrder>): Promise<ShopifyOrder> {
    // Generate unique ID if not provided
    if (!orderData.id) {
      orderData.id = this.generateUniqueId();
    }

    const newOrder = this.shopifyOrdersRepository.create(orderData);
    return this.shopifyOrdersRepository.save(newOrder);
  }

  async update(id: string, orderData: Partial<ShopifyOrder>): Promise<ShopifyOrder> {
    await this.shopifyOrdersRepository.update(id, orderData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.shopifyOrdersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shopify order with ID ${id} not found`);
    }
  }

  async getOrderStats(customerId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: any;
  }> {
    const query = this.shopifyOrdersRepository.createQueryBuilder('order');

    if (customerId) {
      query.where('order.customerId = :customerId', { customerId });
    }

    const orders = await query.getMany();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice.toString()), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
    };
  }

  private generateUniqueId(): string {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
