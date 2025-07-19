import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Agent } from '../agents/agent.entity';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum LeadSource {
  WEBSITE = 'website',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  REFERRAL = 'referral',
  DIRECT = 'direct',
  SHOPIFY = 'shopify',
  OTHER = 'other',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  source: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ type: 'float', nullable: true })
  value: number;

  @Column({ name: 'assigned_agent', nullable: true })
  assignedAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'employee_count', nullable: true })
  employeeCount: string;

  @Column({ name: 'annual_revenue', nullable: true })
  annualRevenue: string;

  @Column({ name: 'last_contacted_at', nullable: true })
  lastContactedAt: Date;

  @Column({ name: 'converted_at', nullable: true })
  convertedAt: Date;

  @Column({ name: 'converted_to_customer_id', nullable: true })
  convertedToCustomerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'assigned_agent' })
  agent: Agent;
}
