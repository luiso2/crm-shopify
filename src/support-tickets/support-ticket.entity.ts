import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { User } from '../users/user.entity';
import { Agent } from '../agents/agent.entity';

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_number', unique: true })
  ticketNumber: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'agent_id', nullable: true })
  agentId: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'open' })
  status: string; // open, pending, in_progress, resolved, closed

  @Column({ default: 'medium' })
  priority: string; // low, medium, high, urgent

  @Column({ nullable: true })
  category: string; // billing, technical, general, feature_request, bug

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'satisfaction_rating', type: 'int', nullable: true })
  satisfactionRating: number; // 1-5

  @Column({ name: 'feedback_comments', type: 'text', nullable: true })
  feedbackComments: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;
}
