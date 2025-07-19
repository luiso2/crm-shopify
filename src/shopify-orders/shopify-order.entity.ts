import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

@Entity('shopify_orders')
export class ShopifyOrder {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  shopifyOrderId: string;

  @Column()
  orderNumber: string;

  @Column()
  customerId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column('jsonb')
  items: any;

  @Column('jsonb', { nullable: true })
  shippingAddress: any;

  @Column('jsonb', { nullable: true })
  billingAddress: any;

  @Column({ nullable: true })
  fulfillmentStatus: string;

  @Column({ nullable: true })
  paymentStatus: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
