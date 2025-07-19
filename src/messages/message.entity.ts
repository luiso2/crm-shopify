import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Conversation } from '../conversations/conversation.entity';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export enum SenderType {
  USER = 'USER',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
  CUSTOMER = 'CUSTOMER',
}

@Entity('messages')
export class Message {
  @PrimaryColumn()
  id: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation, conversation => conversation.id)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ nullable: true })
  senderId: string;

  @Column({
    type: 'enum',
    enum: SenderType,
    default: SenderType.USER,
  })
  senderType: SenderType;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ nullable: true })
  processingTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
