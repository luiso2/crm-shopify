import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StripePayment } from '../stripe-payments/stripe-payment.entity';

@Entity('stripe_customers')
export class StripeCustomer {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  customerId: string; // Reference to local customer

  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column('jsonb', { nullable: true })
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ nullable: true })
  defaultPaymentMethodId: string;

  @Column('text', { array: true, default: '{}' })
  paymentMethodIds: string[];

  @Column({ default: 'usd' })
  currency: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  livemode: boolean;

  @OneToMany(() => StripePayment, payment => payment.stripeCustomer)
  payments: StripePayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
