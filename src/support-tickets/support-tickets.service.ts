import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './support-ticket.entity';
import { CreateSupportTicketDto, TicketStatus } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private supportTicketsRepository: Repository<SupportTicket>,
  ) {}

  async create(createSupportTicketDto: CreateSupportTicketDto): Promise<SupportTicket> {
    // Generar número de ticket único
    const ticketNumber = await this.generateTicketNumber();
    
    const ticket = this.supportTicketsRepository.create({
      ...createSupportTicketDto,
      ticketNumber,
    });

    return await this.supportTicketsRepository.save(ticket);
  }

  async findAll(filters?: {
    status?: string;
    priority?: string;
    agentId?: string;
    customerId?: string;
  }): Promise<SupportTicket[]> {
    const query = this.supportTicketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .leftJoinAndSelect('ticket.agent', 'agent');

    if (filters?.status) {
      query.andWhere('ticket.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      query.andWhere('ticket.priority = :priority', { priority: filters.priority });
    }
    if (filters?.agentId) {
      query.andWhere('ticket.agentId = :agentId', { agentId: filters.agentId });
    }
    if (filters?.customerId) {
      query.andWhere('ticket.customerId = :customerId', { customerId: filters.customerId });
    }

    return await query.orderBy('ticket.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<SupportTicket> {
    const ticket = await this.supportTicketsRepository.findOne({
      where: { id },
      relations: ['customer', 'agent'],
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findByTicketNumber(ticketNumber: string): Promise<SupportTicket> {
    const ticket = await this.supportTicketsRepository.findOne({
      where: { ticketNumber },
      relations: ['customer', 'agent'],
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket ${ticketNumber} not found`);
    }

    return ticket;
  }

  async update(id: string, updateSupportTicketDto: UpdateSupportTicketDto): Promise<SupportTicket> {
    const ticket = await this.findOne(id);

    // Si se está resolviendo el ticket, actualizar fecha de resolución
    if (updateSupportTicketDto.status === TicketStatus.RESOLVED && ticket.status !== TicketStatus.RESOLVED) {
      updateSupportTicketDto.resolvedAt = new Date();
    }

    Object.assign(ticket, updateSupportTicketDto);
    return await this.supportTicketsRepository.save(ticket);
  }

  async assignAgent(ticketId: string, agentId: string): Promise<SupportTicket> {
    const ticket = await this.findOne(ticketId);
    ticket.agentId = agentId;
    ticket.status = TicketStatus.IN_PROGRESS;
    return await this.supportTicketsRepository.save(ticket);
  }

  async resolve(
    ticketId: string, 
    resolutionNotes: string,
    satisfactionRating?: number,
    feedbackComments?: string
  ): Promise<SupportTicket> {
    const ticket = await this.findOne(ticketId);
    
    ticket.status = TicketStatus.RESOLVED;
    ticket.resolutionNotes = resolutionNotes;
    ticket.resolvedAt = new Date();
    
    if (satisfactionRating) {
      ticket.satisfactionRating = satisfactionRating;
    }
    if (feedbackComments) {
      ticket.feedbackComments = feedbackComments;
    }

    return await this.supportTicketsRepository.save(ticket);
  }

  async close(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.findOne(ticketId);
    
    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException('Ticket must be resolved before closing');
    }

    ticket.status = TicketStatus.CLOSED;
    return await this.supportTicketsRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const result = await this.supportTicketsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Support ticket with ID ${id} not found`);
    }
  }

  async getStatistics(agentId?: string): Promise<any> {
    const query = this.supportTicketsRepository.createQueryBuilder('ticket');
    
    if (agentId) {
      query.where('ticket.agentId = :agentId', { agentId });
    }

    const total = await query.getCount();
    
    const byStatus = await query
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    const byPriority = await query
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.priority')
      .getRawMany();

    const avgResolutionTime = await query
      .select('AVG(EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt)) / 3600)', 'avgHours')
      .where('ticket.resolvedAt IS NOT NULL')
      .getRawOne();

    const avgSatisfaction = await query
      .select('AVG(ticket.satisfactionRating)', 'avgRating')
      .where('ticket.satisfactionRating IS NOT NULL')
      .getRawOne();

    return {
      total,
      byStatus,
      byPriority,
      avgResolutionTimeHours: avgResolutionTime?.avgHours || 0,
      avgSatisfactionRating: avgSatisfaction?.avgRating || 0,
    };
  }

  private async generateTicketNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const lastTicket = await this.supportTicketsRepository
      .createQueryBuilder('ticket')
      .where('ticket.ticketNumber LIKE :pattern', { pattern: `TKT-${year}${month}%` })
      .orderBy('ticket.ticketNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastTicket) {
      const lastSequence = parseInt(lastTicket.ticketNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `TKT-${year}${month}${sequence.toString().padStart(4, '0')}`;
  }
}
