import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shopify_customers')
export class ShopifyCustomer {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  shopifyCustomerId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  acceptsMarketing: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ default: 0 })
  ordersCount: number;

  @Column('jsonb', { nullable: true })
  tags: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
