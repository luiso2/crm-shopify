import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripePayment, PaymentStatus } from './stripe-payment.entity';
import { CreatePaymentDto, ProcessPaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Injectable()
export class StripePaymentsService {
  constructor(
    @InjectRepository(StripePayment)
    private stripePaymentsRepository: Repository<StripePayment>,
  ) {}

  // Note: This is a mock implementation. In a real application, you would integrate with Stripe API
  async processPayment(processPaymentDto: ProcessPaymentDto): Promise<StripePayment> {
    // In a real implementation, you would:
    // 1. Initialize Stripe SDK
    // 2. Create payment intent with Stripe
    // 3. Process the payment
    // 4. Handle the response

    const stripePaymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = this.stripePaymentsRepository.create({
      ...processPaymentDto,
      stripePaymentId,
      status: PaymentStatus.PROCESSING,
      billing_details: processPaymentDto.billingDetails,
    });

    const savedPayment = await this.stripePaymentsRepository.save(payment);

    // Simulate payment processing
    setTimeout(async () => {
      savedPayment.status = PaymentStatus.SUCCEEDED;
      savedPayment.receiptUrl = `https://stripe.com/receipts/${stripePaymentId}`;
      await this.stripePaymentsRepository.save(savedPayment);
    }, 2000);

    return savedPayment;
  }

  async createPaymentIntent(createPaymentDto: CreatePaymentDto): Promise<StripePayment> {
    const stripePaymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = this.stripePaymentsRepository.create({
      ...createPaymentDto,
      stripePaymentId,
      status: PaymentStatus.PENDING,
      billing_details: createPaymentDto.billingDetails,
    });

    return await this.stripePaymentsRepository.save(payment);
  }

  async findAll(filters?: {
    customerId?: string;
    status?: PaymentStatus;
    orderId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<StripePayment[]> {
    const query = this.stripePaymentsRepository.createQueryBuilder('payment');

    if (filters?.customerId) {
      query.andWhere('payment.customerId = :customerId', { customerId: filters.customerId });
    }
    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }
    if (filters?.orderId) {
      query.andWhere('payment.orderId = :orderId', { orderId: filters.orderId });
    }
    if (filters?.startDate) {
      query.andWhere('payment.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('payment.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return await query.orderBy('payment.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<StripePayment> {
    const payment = await this.stripePaymentsRepository.findOne({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByStripeId(stripePaymentId: string): Promise<StripePayment> {
    const payment = await this.stripePaymentsRepository.findOne({
      where: { stripePaymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with Stripe ID ${stripePaymentId} not found`);
    }

    return payment;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<StripePayment> {
    const payment = await this.findOne(id);
    payment.status = status;
    return await this.stripePaymentsRepository.save(payment);
  }

  async refundPayment(id: string, refundDto: RefundPaymentDto): Promise<StripePayment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Can only refund successful payments');
    }

    const refundAmount = refundDto.amount || payment.amount;
    const totalRefunded = payment.refundAmount + refundAmount;

    if (totalRefunded > payment.amount) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    // In a real implementation, you would call Stripe API to process the refund
    payment.refundAmount = totalRefunded;
    payment.status = totalRefunded === payment.amount 
      ? PaymentStatus.REFUNDED 
      : PaymentStatus.PARTIALLY_REFUNDED;

    if (refundDto.reason) {
      payment.metadata = {
        ...payment.metadata,
        refundReason: refundDto.reason,
        refundedAt: new Date().toISOString(),
      };
    }

    return await this.stripePaymentsRepository.save(payment);
  }

  async getStatistics(customerId?: string): Promise<any> {
    const query = this.stripePaymentsRepository.createQueryBuilder('payment');
    
    if (customerId) {
      query.where('payment.customerId = :customerId', { customerId });
    }

    const totalPayments = await query.getCount();
    
    const totalRevenue = await query
      .select('SUM(payment.amount - payment.refundAmount)', 'total')
      .where('payment.status IN (:...statuses)', { 
        statuses: [PaymentStatus.SUCCEEDED, PaymentStatus.PARTIALLY_REFUNDED] 
      })
      .getRawOne();

    const byStatus = await query
      .select('payment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .groupBy('payment.status')
      .getRawMany();

    const monthlyRevenue = await query
      .select('DATE_TRUNC(\'month\', payment.createdAt)', 'month')
      .addSelect('SUM(payment.amount - payment.refundAmount)', 'revenue')
      .where('payment.status IN (:...statuses)', { 
        statuses: [PaymentStatus.SUCCEEDED, PaymentStatus.PARTIALLY_REFUNDED] 
      })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    const avgTransactionValue = await query
      .select('AVG(payment.amount)', 'avg')
      .where('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
      .getRawOne();

    return {
      totalPayments,
      totalRevenue: totalRevenue?.total || 0,
      byStatus,
      monthlyRevenue,
      avgTransactionValue: avgTransactionValue?.avg || 0,
    };
  }

  async syncWithStripe(stripePaymentId: string): Promise<StripePayment> {
    // In a real implementation, this would fetch the latest payment data from Stripe
    const payment = await this.findByStripeId(stripePaymentId);
    
    // Mock update - in reality, you'd update with data from Stripe
    payment.updatedAt = new Date();
    
    return await this.stripePaymentsRepository.save(payment);
  }
}
