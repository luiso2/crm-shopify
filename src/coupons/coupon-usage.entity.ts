import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('coupon_usage')
export class CouponUsage {
  @PrimaryColumn()
  id: string;

  @Column()
  couponId: string;

  @ManyToOne(() => Coupon, coupon => coupon.usages)
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discountAmount: number;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  usedAt: Date;
}
