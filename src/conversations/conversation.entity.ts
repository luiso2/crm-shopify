import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn 
} from 'typeorm';
import { User } from '../users/user.entity';
import { Agent } from '../agents/agent.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'agent_id', nullable: true })
  agentId: string;

  @Column({ default: 'open' })
  status: string; // open, in_progress, resolved, closed

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  priority: string; // low, medium, high, urgent

  @Column({ nullable: true })
  channel: string; // chat, email, phone, social

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

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

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
}
