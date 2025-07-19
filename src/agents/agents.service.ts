import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './agent.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
  ) {}

  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async findByUserId(userId: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with user ID ${userId} not found`);
    }

    return agent;
  }

  async findByStatus(status: string): Promise<Agent[]> {
    return this.agentRepository.find({
      where: { status },
      relations: ['user'],
      order: { assignedTickets: 'ASC' }, // Prioritize agents with fewer tickets
    });
  }

  async findByDepartment(department: string): Promise<Agent[]> {
    return this.agentRepository.find({
      where: { department },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    // Check if agent already exists for this user
    const existingAgent = await this.agentRepository.findOne({
      where: { userId: createAgentDto.userId },
    });

    if (existingAgent) {
      throw new ConflictException('Agent already exists for this user');
    }

    const agent = this.agentRepository.create({
      ...createAgentDto,
      status: createAgentDto.status || 'available',
    });

    return this.agentRepository.save(agent);
  }

  async update(id: string, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.findOne(id);
    
    Object.assign(agent, updateAgentDto);
    
    return this.agentRepository.save(agent);
  }

  async updateStatus(id: string, status: string): Promise<Agent> {
    const agent = await this.findOne(id);
    agent.status = status;
    return this.agentRepository.save(agent);
  }

  async incrementAssignedTickets(id: string): Promise<Agent> {
    const agent = await this.findOne(id);
    agent.assignedTickets += 1;
    return this.agentRepository.save(agent);
  }

  async incrementResolvedTickets(id: string): Promise<Agent> {
    const agent = await this.findOne(id);
    agent.resolvedTickets += 1;
    agent.assignedTickets = Math.max(0, agent.assignedTickets - 1);
    return this.agentRepository.save(agent);
  }

  async updateMetrics(id: string, avgResolutionTime: number, satisfactionRating: number): Promise<Agent> {
    const agent = await this.findOne(id);
    
    // Calculate new average resolution time
    if (agent.avgResolutionTime) {
      agent.avgResolutionTime = (agent.avgResolutionTime + avgResolutionTime) / 2;
    } else {
      agent.avgResolutionTime = avgResolutionTime;
    }

    // Calculate new satisfaction rating
    if (agent.satisfactionRating) {
      agent.satisfactionRating = (agent.satisfactionRating + satisfactionRating) / 2;
    } else {
      agent.satisfactionRating = satisfactionRating;
    }

    return this.agentRepository.save(agent);
  }

  async getAgentStats(id: string) {
    const agent = await this.findOne(id);
    
    return {
      id: agent.id,
      userId: agent.userId,
      status: agent.status,
      department: agent.department,
      stats: {
        assignedTickets: agent.assignedTickets,
        resolvedTickets: agent.resolvedTickets,
        avgResolutionTime: agent.avgResolutionTime,
        satisfactionRating: agent.satisfactionRating,
        performanceScore: this.calculatePerformanceScore(agent),
      },
    };
  }

  async getAvailableAgent(department?: string): Promise<Agent | null> {
    const query = this.agentRepository
      .createQueryBuilder('agent')
      .leftJoinAndSelect('agent.user', 'user')
      .where('agent.status = :status', { status: 'available' });

    if (department) {
      query.andWhere('agent.department = :department', { department });
    }

    // Get agent with least assigned tickets
    query.orderBy('agent.assignedTickets', 'ASC');

    return query.getOne();
  }

  async remove(id: string): Promise<void> {
    const agent = await this.findOne(id);
    await this.agentRepository.remove(agent);
  }

  private calculatePerformanceScore(agent: Agent): number {
    let score = 0;
    
    // Base score from resolved tickets (max 40 points)
    score += Math.min(40, agent.resolvedTickets * 0.5);
    
    // Satisfaction rating (max 30 points)
    if (agent.satisfactionRating) {
      score += (agent.satisfactionRating / 5) * 30;
    }
    
    // Resolution time (max 30 points)
    if (agent.avgResolutionTime) {
      // Assume 24 hours is average, less is better
      const timeScore = Math.max(0, 30 - (agent.avgResolutionTime / 24) * 15);
      score += timeScore;
    }
    
    return Math.round(score);
  }
}
