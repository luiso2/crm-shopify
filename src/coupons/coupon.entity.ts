import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CouponUsage } from './coupon-usage.entity';

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

@Entity('shopify_coupons')
export class Coupon {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: CouponType,
  })
  type: CouponType;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimumAmount: number;

  @Column({ nullable: true })
  maxUses: number;

  @Column({ default: 0 })
  currentUses: number;

  @Column({ nullable: true })
  maxUsesPerCustomer: number;

  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus;

  @Column('text', { array: true, nullable: true })
  applicableProducts: string[];

  @Column('text', { array: true, nullable: true })
  applicableCategories: string[];

  @Column('jsonb', { nullable: true })
  metadata: any;

  @OneToMany(() => CouponUsage, usage => usage.coupon)
  usages: CouponUsage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
