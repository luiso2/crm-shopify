import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StripeCustomer } from '../stripe-customers/stripe-customer.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  PAUSED = 'paused',
}

@Entity('stripe_subscriptions')
export class StripeSubscription {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  stripeSubscriptionId: string;

  @Column()
  customerId: string;

  @Column()
  priceId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  productName: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; // Amount per period

  @Column({ default: 'usd' })
  currency: string;

  @Column()
  interval: string; // day, week, month, year

  @Column('int')
  intervalCount: number;

  @Column('timestamp', { nullable: true })
  currentPeriodStart: Date;

  @Column('timestamp', { nullable: true })
  currentPeriodEnd: Date;

  @Column('timestamp', { nullable: true })
  canceledAt: Date;

  @Column('timestamp', { nullable: true })
  cancelAt: Date;

  @Column('timestamp', { nullable: true })
  endedAt: Date;

  @Column('timestamp', { nullable: true })
  trialStart: Date;

  @Column('timestamp', { nullable: true })
  trialEnd: Date;

  @Column({ nullable: true })
  latestInvoiceId: string;

  @Column({ nullable: true })
  defaultPaymentMethodId: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ default: true })
  cancelAtPeriodEnd: boolean;

  @Column({ default: true })
  livemode: boolean;

  @Column('int', { default: 0 })
  daysUntilDue: number;

  @Column({ nullable: true })
  collectionMethod: string; // charge_automatically, send_invoice

  @Column('jsonb', { nullable: true })
  discount: {
    coupon: string;
    percentOff?: number;
    amountOff?: number;
    start: Date;
    end?: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => StripeCustomer)
  @JoinColumn({ name: 'customerId' })
  customer: StripeCustomer;
}
