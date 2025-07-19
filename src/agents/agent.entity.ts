import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany 
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ default: 'available' })
  status: string; // available, busy, offline

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ type: 'int', name: 'assigned_tickets', default: 0 })
  assignedTickets: number;

  @Column({ type: 'int', name: 'resolved_tickets', default: 0 })
  resolvedTickets: number;

  @Column({ type: 'decimal', name: 'avg_resolution_time', precision: 10, scale: 2, nullable: true })
  avgResolutionTime: number;

  @Column({ type: 'decimal', name: 'satisfaction_rating', precision: 3, scale: 2, nullable: true })
  satisfactionRating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
