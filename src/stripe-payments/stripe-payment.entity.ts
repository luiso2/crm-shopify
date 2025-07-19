import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StripeCustomer } from '../stripe-customers/stripe-customer.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

@Entity('stripe_payments')
export class StripePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stripe_payment_id', unique: true })
  stripePaymentId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ type: 'int' })
  amount: number; // Amount in cents

  @Column({ default: 'usd' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'payment_method_id', nullable: true })
  paymentMethodId: string;

  @Column({ name: 'payment_method_type', nullable: true })
  paymentMethodType: string; // card, bank_transfer, etc.

  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl: string;

  @Column({ name: 'refund_amount', type: 'int', default: 0 })
  refundAmount: number; // Amount refunded in cents

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ name: 'invoice_id', nullable: true })
  invoiceId: string;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  @Column({ type: 'jsonb', nullable: true })
  billing_details: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => StripeCustomer, customer => customer.payments)
  @JoinColumn({ name: 'customer_id' })
  stripeCustomer: StripeCustomer;
}
