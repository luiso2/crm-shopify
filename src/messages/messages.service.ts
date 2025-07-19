import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType, SenderType } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create({
      id: uuidv4(),
      ...createMessageDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.messagesRepository.save(message);
  }

  async findAll(filters?: {
    conversationId?: string;
    senderId?: string;
    senderType?: SenderType;
    type?: MessageType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Message[]> {
    const query = this.messagesRepository.createQueryBuilder('message');

    if (filters?.conversationId) {
      query.andWhere('message.conversationId = :conversationId', { 
        conversationId: filters.conversationId 
      });
    }

    if (filters?.senderId) {
      query.andWhere('message.senderId = :senderId', { 
        senderId: filters.senderId 
      });
    }

    if (filters?.senderType) {
      query.andWhere('message.senderType = :senderType', { 
        senderType: filters.senderType 
      });
    }

    if (filters?.type) {
      query.andWhere('message.type = :type', { 
        type: filters.type 
      });
    }

    if (filters?.startDate) {
      query.andWhere('message.createdAt >= :startDate', { 
        startDate: filters.startDate 
      });
    }

    if (filters?.endDate) {
      query.andWhere('message.createdAt <= :endDate', { 
        endDate: filters.endDate 
      });
    }

    return await query.orderBy('message.createdAt', 'ASC').getMany();
  }

  async findByConversation(conversationId: string): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(id: string, updateData: Partial<Message>): Promise<Message> {
    const message = await this.findOne(id);
    Object.assign(message, updateData, { updatedAt: new Date() });
    return await this.messagesRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.messagesRepository.remove(message);
  }

  async markAsRead(ids: string[]): Promise<void> {
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ 
        metadata: () => `jsonb_set(COALESCE(metadata, '{}'), '{read}', 'true')`,
        updatedAt: new Date()
      })
      .whereInIds(ids)
      .execute();
  }

  async getConversationStats(conversationId: string): Promise<any> {
    const messages = await this.findByConversation(conversationId);
    
    const stats = {
      totalMessages: messages.length,
      byType: {},
      bySender: {},
      averageResponseTime: 0,
      lastMessageAt: null,
    };

    messages.forEach(message => {
      // Count by type
      stats.byType[message.type] = (stats.byType[message.type] || 0) + 1;
      
      // Count by sender type
      stats.bySender[message.senderType] = (stats.bySender[message.senderType] || 0) + 1;
    });

    if (messages.length > 0) {
      stats.lastMessageAt = messages[messages.length - 1].createdAt;
    }

    return stats;
  }
}
