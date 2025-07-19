import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm';

@Entity('widget_sessions')
export class WidgetSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', unique: true })
  sessionId: string;

  @Column({ name: 'visitor_id', nullable: true })
  visitorId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ nullable: true, name: 'visitor_name' })
  visitorName: string;

  @Column({ nullable: true, name: 'visitor_email' })
  visitorEmail: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  device: string;

  @Column({ name: 'page_url', type: 'text', nullable: true })
  pageUrl: string;

  @Column({ name: 'referrer_url', type: 'text', nullable: true })
  referrerUrl: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'last_activity', nullable: true })
  lastActivity: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
