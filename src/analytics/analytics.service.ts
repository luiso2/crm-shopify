import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ShopifyOrder } from '../shopify-orders/shopify-order.entity';
import { ShopifyCustomer } from '../shopify-customers/shopify-customer.entity';
import { ShopifyProduct } from '../shopify-products/shopify-product.entity';
import { StripePayment } from '../stripe-payments/stripe-payment.entity';
import { StripeSubscription } from '../stripe-subscriptions/stripe-subscription.entity';
import { Lead } from '../leads/lead.entity';
import { SupportTicket } from '../support-tickets/support-ticket.entity';
import { Conversation } from '../conversations/conversation.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ShopifyOrder)
    private shopifyOrderRepository: Repository<ShopifyOrder>,
    @InjectRepository(ShopifyCustomer)
    private shopifyCustomerRepository: Repository<ShopifyCustomer>,
    @InjectRepository(ShopifyProduct)
    private shopifyProductRepository: Repository<ShopifyProduct>,
    @InjectRepository(StripePayment)
    private stripePaymentRepository: Repository<StripePayment>,
    @InjectRepository(StripeSubscription)
    private stripeSubscriptionRepository: Repository<StripeSubscription>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(SupportTicket)
    private supportTicketRepository: Repository<SupportTicket>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  private getDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 días por defecto
    return { start, end };
  }

  async getDashboardMetrics(startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const [
      totalOrders,
      totalCustomers,
      totalRevenue,
      activeSubscriptions,
      pendingTickets,
      newLeads,
    ] = await Promise.all([
      this.shopifyOrderRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.shopifyCustomerRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.shopifyOrderRepository
        .createQueryBuilder('order')
        .select('SUM(CAST(order.totalPrice AS DECIMAL))', 'total')
        .where('order.createdAt BETWEEN :start AND :end', { start: start.toISOString(), end: end.toISOString() })
        .getRawOne(),
      this.stripeSubscriptionRepository.count({
        where: {
          status: 'active',
        },
      }),
      this.supportTicketRepository.count({
        where: {
          status: 'open',
        },
      }),
      this.leadRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
    ]);

    return {
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue?.total || 0,
      activeSubscriptions,
      pendingTickets,
      newLeads,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };
  }

  async getSalesMetrics(period: 'day' | 'week' | 'month' | 'year', startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const orders = await this.shopifyOrderRepository.find({
      where: {
        createdAt: Between(start.toISOString(), end.toISOString()),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    // Agrupar por período
    const groupedData = new Map();
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          period: key,
          orders: 0,
          revenue: 0,
          items: [],
        });
      }

      const data = groupedData.get(key);
      data.orders += 1;
      data.revenue += parseFloat(order.totalPrice || '0');
      if (order.items) {
        data.items.push(...order.items);
      }
    });

    return {
      period,
      data: Array.from(groupedData.values()),
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || '0'), 0),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || '0'), 0) / orders.length 
          : 0,
      },
    };
  }

  async getCustomerMetrics(startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const [newCustomers, returningCustomers, topCustomers] = await Promise.all([
      this.shopifyCustomerRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.shopifyOrderRepository
        .createQueryBuilder('order')
        .select('COUNT(DISTINCT order.customerId)', 'count')
        .where('order.createdAt BETWEEN :start AND :end', { start: start.toISOString(), end: end.toISOString() })
        .andWhere('order.customerId IN (SELECT customerId FROM shopify_orders GROUP BY customerId HAVING COUNT(*) > 1)')
        .getRawOne(),
      this.shopifyOrderRepository
        .createQueryBuilder('order')
        .select('order.customerId', 'customerId')
        .addSelect('COUNT(*)', 'orderCount')
        .addSelect('SUM(CAST(order.totalPrice AS DECIMAL))', 'totalSpent')
        .where('order.createdAt BETWEEN :start AND :end', { start: start.toISOString(), end: end.toISOString() })
        .groupBy('order.customerId')
        .orderBy('totalSpent', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    return {
      newCustomers,
      returningCustomers: returningCustomers?.count || 0,
      topCustomers,
      customerLifetimeValue: 0, // TODO: Implementar cálculo real
    };
  }

  async getProductMetrics(limit: number, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const topProducts = await this.shopifyOrderRepository
      .createQueryBuilder('order')
      .select('item.productId', 'productId')
      .addSelect('item.title', 'productName')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('SUM(CAST(item.quantity AS INTEGER))', 'totalQuantity')
      .addSelect('SUM(CAST(item.price AS DECIMAL) * CAST(item.quantity AS INTEGER))', 'totalRevenue')
      .from(subQuery => {
        return subQuery
          .select('order.id', 'orderId')
          .addSelect("jsonb_array_elements(order.items) ->> 'productId'", 'productId')
          .addSelect("jsonb_array_elements(order.items) ->> 'title'", 'title')
          .addSelect("jsonb_array_elements(order.items) ->> 'quantity'", 'quantity')
          .addSelect("jsonb_array_elements(order.items) ->> 'price'", 'price')
          .from(ShopifyOrder, 'order')
          .where('order.createdAt BETWEEN :start AND :end', { start: start.toISOString(), end: end.toISOString() });
      }, 'item')
      .groupBy('item.productId')
      .addGroupBy('item.title')
      .orderBy('totalRevenue', 'DESC')
      .limit(limit)
      .getRawMany();

    const inventory = await this.shopifyProductRepository.find({
      select: ['id', 'title', 'inventoryQuantity'],
      order: {
        inventoryQuantity: 'ASC',
      },
      take: 10,
    });

    return {
      topProducts,
      lowStockProducts: inventory.filter(p => p.inventoryQuantity < 10),
      outOfStockProducts: inventory.filter(p => p.inventoryQuantity === 0),
    };
  }

  async getRevenueMetrics(groupBy: 'day' | 'week' | 'month', startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const [shopifyRevenue, stripeRevenue] = await Promise.all([
      this.shopifyOrderRepository.find({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
        select: ['createdAt', 'totalPrice'],
        order: {
          createdAt: 'ASC',
        },
      }),
      this.stripePaymentRepository.find({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
          status: 'succeeded',
        },
        select: ['createdAt', 'amount'],
        order: {
          createdAt: 'ASC',
        },
      }),
    ]);

    // Combinar y agrupar datos
    const revenueData = new Map();

    const processRevenue = (items: any[], source: string) => {
      items.forEach(item => {
        const date = new Date(item.createdAt);
        let key: string;

        switch (groupBy) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
        }

        if (!revenueData.has(key)) {
          revenueData.set(key, {
            period: key,
            shopifyRevenue: 0,
            stripeRevenue: 0,
            totalRevenue: 0,
          });
        }

        const data = revenueData.get(key);
        if (source === 'shopify') {
          data.shopifyRevenue += parseFloat(item.totalPrice || '0');
        } else {
          data.stripeRevenue += item.amount / 100; // Stripe amount está en centavos
        }
        data.totalRevenue = data.shopifyRevenue + data.stripeRevenue;
      });
    };

    processRevenue(shopifyRevenue, 'shopify');
    processRevenue(stripeRevenue, 'stripe');

    return {
      groupBy,
      data: Array.from(revenueData.values()),
      summary: {
        totalShopifyRevenue: shopifyRevenue.reduce((sum, order) => sum + parseFloat(order.totalPrice || '0'), 0),
        totalStripeRevenue: stripeRevenue.reduce((sum, payment) => sum + payment.amount / 100, 0),
        totalRevenue: shopifyRevenue.reduce((sum, order) => sum + parseFloat(order.totalPrice || '0'), 0) +
                     stripeRevenue.reduce((sum, payment) => sum + payment.amount / 100, 0),
      },
    };
  }

  async getConversionMetrics(startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const [totalLeads, convertedLeads, conversations, conversionsFromChat] = await Promise.all([
      this.leadRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.leadRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
          status: 'converted',
        },
      }),
      this.conversationRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.conversationRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
          // Asumiendo que hay un campo que indica conversión
        },
      }),
    ]);

    return {
      totalLeads,
      convertedLeads,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      conversations,
      conversionsFromChat,
      chatConversionRate: conversations > 0 ? (conversionsFromChat / conversations) * 100 : 0,
    };
  }

  async getSupportMetrics(startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const [totalTickets, openTickets, resolvedTickets, avgResolutionTime] = await Promise.all([
      this.supportTicketRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.supportTicketRepository.count({
        where: {
          status: 'open',
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.supportTicketRepository.count({
        where: {
          status: 'resolved',
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.supportTicketRepository
        .createQueryBuilder('ticket')
        .select('AVG(EXTRACT(EPOCH FROM (ticket.updatedAt - ticket.createdAt)))', 'avgTime')
        .where('ticket.status = :status', { status: 'resolved' })
        .andWhere('ticket.createdAt BETWEEN :start AND :end', { start: start.toISOString(), end: end.toISOString() })
        .getRawOne(),
    ]);

    const ticketsByPriority = await this.supportTicketRepository
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.createdAt BETWEEN :start AND :end', { start: start.toISOString(), end: end.toISOString() })
      .groupBy('ticket.priority')
      .getRawMany();

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0,
      avgResolutionTimeHours: avgResolutionTime?.avgTime ? avgResolutionTime.avgTime / 3600 : 0,
      ticketsByPriority,
    };
  }

  async getSubscriptionMetrics(startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const [activeSubscriptions, newSubscriptions, canceledSubscriptions, mrr] = await Promise.all([
      this.stripeSubscriptionRepository.count({
        where: {
          status: 'active',
        },
      }),
      this.stripeSubscriptionRepository.count({
        where: {
          createdAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.stripeSubscriptionRepository.count({
        where: {
          status: 'canceled',
          updatedAt: Between(start.toISOString(), end.toISOString()),
        },
      }),
      this.stripeSubscriptionRepository
        .createQueryBuilder('subscription')
        .select('SUM(CAST(subscription.amount AS DECIMAL))', 'total')
        .where('subscription.status = :status', { status: 'active' })
        .getRawOne(),
    ]);

    const churnRate = activeSubscriptions > 0 
      ? (canceledSubscriptions / (activeSubscriptions + canceledSubscriptions)) * 100 
      : 0;

    return {
      activeSubscriptions,
      newSubscriptions,
      canceledSubscriptions,
      monthlyRecurringRevenue: mrr?.total || 0,
      churnRate,
      netGrowth: newSubscriptions - canceledSubscriptions,
    };
  }

  async getKPIs(startDate?: string, endDate?: string) {
    const [
      dashboard,
      sales,
      customers,
      support,
      subscriptions,
    ] = await Promise.all([
      this.getDashboardMetrics(startDate, endDate),
      this.getSalesMetrics('month', startDate, endDate),
      this.getCustomerMetrics(startDate, endDate),
      this.getSupportMetrics(startDate, endDate),
      this.getSubscriptionMetrics(startDate, endDate),
    ]);

    return {
      revenue: {
        total: dashboard.totalRevenue,
        recurring: subscriptions.monthlyRecurringRevenue,
        averageOrderValue: sales.summary.averageOrderValue,
      },
      customers: {
        total: dashboard.totalCustomers,
        new: customers.newCustomers,
        returning: customers.returningCustomers,
      },
      operations: {
        orders: dashboard.totalOrders,
        tickets: support.totalTickets,
        ticketResolutionRate: support.resolutionRate,
      },
      growth: {
        subscriptionChurn: subscriptions.churnRate,
        netSubscriptionGrowth: subscriptions.netGrowth,
        newLeads: dashboard.newLeads,
      },
    };
  }

  async exportReport(type: 'sales' | 'customers' | 'products' | 'full', format: 'json' | 'csv', startDate?: string, endDate?: string) {
    let data: any;

    switch (type) {
      case 'sales':
        data = await this.getSalesMetrics('day', startDate, endDate);
        break;
      case 'customers':
        data = await this.getCustomerMetrics(startDate, endDate);
        break;
      case 'products':
        data = await this.getProductMetrics(50, startDate, endDate);
        break;
      case 'full':
        data = {
          dashboard: await this.getDashboardMetrics(startDate, endDate),
          sales: await this.getSalesMetrics('day', startDate, endDate),
          customers: await this.getCustomerMetrics(startDate, endDate),
          products: await this.getProductMetrics(50, startDate, endDate),
          kpis: await this.getKPIs(startDate, endDate),
        };
        break;
    }

    if (format === 'csv') {
      // TODO: Implementar conversión a CSV
      throw new Error('CSV export not implemented yet');
    }

    return {
      type,
      format,
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString(),
      },
      data,
    };
  }
}
