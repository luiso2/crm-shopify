import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private agentsService: AgentsService,
  ) {}

  async findAll(filters?: {
    status?: string;
    agentId?: string;
    customerId?: string;
    priority?: string;
  }): Promise<Conversation[]> {
    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.customer', 'customer')
      .leftJoinAndSelect('conversation.agent', 'agent')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .orderBy('conversation.updatedAt', 'DESC');

    if (filters?.status) {
      query.andWhere('conversation.status = :status', { status: filters.status });
    }
    if (filters?.agentId) {
      query.andWhere('conversation.agentId = :agentId', { agentId: filters.agentId });
    }
    if (filters?.customerId) {
      query.andWhere('conversation.customerId = :customerId', { customerId: filters.customerId });
    }
    if (filters?.priority) {
      query.andWhere('conversation.priority = :priority', { priority: filters.priority });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['customer', 'agent', 'messages', 'messages.sender'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async create(createConversationDto: CreateConversationDto): Promise<Conversation> {
    // Auto-assign to available agent if not specified
    if (!createConversationDto.agentId) {
      const availableAgent = await this.agentsService.getAvailableAgent();
      if (availableAgent) {
        createConversationDto.agentId = availableAgent.id;
        await this.agentsService.incrementAssignedTickets(availableAgent.id);
      }
    }

    const conversation = this.conversationRepository.create({
      ...createConversationDto,
      status: 'open',
      priority: createConversationDto.priority || 'medium',
      channel: createConversationDto.channel || 'chat',
    });

    return this.conversationRepository.save(conversation);
  }

  async update(id: string, updateConversationDto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.findOne(id);
    
    // If assigning to new agent
    if (updateConversationDto.agentId && updateConversationDto.agentId !== conversation.agentId) {
      // Decrement old agent's tickets if exists
      if (conversation.agentId) {
        await this.agentsService.incrementResolvedTickets(conversation.agentId);
      }
      // Increment new agent's tickets
      await this.agentsService.incrementAssignedTickets(updateConversationDto.agentId);
    }

    // If resolving/closing conversation
    if (updateConversationDto.status && 
        ['resolved', 'closed'].includes(updateConversationDto.status) && 
        conversation.agentId) {
      await this.agentsService.incrementResolvedTickets(conversation.agentId);
    }

    Object.assign(conversation, updateConversationDto);
    
    return this.conversationRepository.save(conversation);
  }

  async addMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const conversation = await this.findOne(createMessageDto.conversationId);
    
    const message = this.messageRepository.create(createMessageDto);
    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's updatedAt
    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    return savedMessage;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = false')
      .execute();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.conversation', 'conversation')
      .where('conversation.customerId = :userId OR conversation.agentId IN (SELECT id FROM agents WHERE userId = :userId)', { userId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isRead = false')
      .getCount();
  }

  async assignToAgent(conversationId: string, agentId: string): Promise<Conversation> {
    const conversation = await this.findOne(conversationId);
    
    // Update agent assignment
    const updateDto: UpdateConversationDto = {
      agentId,
      status: 'in_progress',
    };

    return this.update(conversationId, updateDto);
  }

  async getConversationStats() {
    const stats = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select('conversation.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('conversation.status')
      .getRawMany();

    const priorityStats = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select('conversation.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('conversation.status NOT IN (:...statuses)', { statuses: ['resolved', 'closed'] })
      .groupBy('conversation.priority')
      .getRawMany();

    const channelStats = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select('conversation.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('conversation.channel')
      .getRawMany();

    return {
      byStatus: stats,
      byPriority: priorityStats,
      byChannel: channelStats,
      total: stats.reduce((sum, s) => sum + parseInt(s.count), 0),
      active: stats
        .filter(s => !['resolved', 'closed'].includes(s.status))
        .reduce((sum, s) => sum + parseInt(s.count), 0),
    };
  }

  async remove(id: string): Promise<void> {
    const conversation = await this.findOne(id);
    
    // Delete all messages first
    await this.messageRepository.delete({ conversationId: id });
    
    // Then delete conversation
    await this.conversationRepository.remove(conversation);
  }
}
