import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shopify_products')
export class ShopifyProduct {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  shopifyProductId: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  handle: string;

  @Column({ nullable: true })
  productType: string;

  @Column({ nullable: true })
  vendor: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ default: 0 })
  inventory: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  images: any;

  @Column('jsonb', { nullable: true })
  variants: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
