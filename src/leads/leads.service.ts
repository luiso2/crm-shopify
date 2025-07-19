import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from './lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    // Verificar si el lead ya existe por email
    const existingLead = await this.leadsRepository.findOne({
      where: { email: createLeadDto.email },
    });

    if (existingLead) {
      throw new BadRequestException(`Lead with email ${createLeadDto.email} already exists`);
    }

    const lead = this.leadsRepository.create(createLeadDto);
    return await this.leadsRepository.save(lead);
  }

  async findAll(filters?: {
    status?: LeadStatus;
    source?: string;
    assignedAgent?: string;
    company?: string;
  }): Promise<Lead[]> {
    const query = this.leadsRepository.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.agent', 'agent');

    if (filters?.status) {
      query.andWhere('lead.status = :status', { status: filters.status });
    }
    if (filters?.source) {
      query.andWhere('lead.source = :source', { source: filters.source });
    }
    if (filters?.assignedAgent) {
      query.andWhere('lead.assignedAgent = :assignedAgent', { assignedAgent: filters.assignedAgent });
    }
    if (filters?.company) {
      query.andWhere('lead.company ILIKE :company', { company: `%${filters.company}%` });
    }

    return await query.orderBy('lead.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: ['agent'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return await this.leadsRepository.save(lead);
  }

  async assignAgent(leadId: string, agentId: string): Promise<Lead> {
    const lead = await this.findOne(leadId);
    lead.assignedAgent = agentId;
    lead.status = LeadStatus.CONTACTED;
    lead.lastContactedAt = new Date();
    return await this.leadsRepository.save(lead);
  }

  async updateStatus(leadId: string, status: LeadStatus): Promise<Lead> {
    const lead = await this.findOne(leadId);
    
    // Validar transiciones de estado
    if (status === LeadStatus.CONVERTED && lead.status !== LeadStatus.QUALIFIED) {
      throw new BadRequestException('Lead must be qualified before converting');
    }

    lead.status = status;
    
    if (status === LeadStatus.CONTACTED) {
      lead.lastContactedAt = new Date();
    } else if (status === LeadStatus.CONVERTED) {
      lead.convertedAt = new Date();
    }

    return await this.leadsRepository.save(lead);
  }

  async convertToCustomer(leadId: string, customerId: string): Promise<Lead> {
    const lead = await this.findOne(leadId);
    
    if (lead.status === LeadStatus.CONVERTED) {
      throw new BadRequestException('Lead is already converted');
    }

    lead.status = LeadStatus.CONVERTED;
    lead.convertedAt = new Date();
    lead.convertedToCustomerId = customerId;
    
    return await this.leadsRepository.save(lead);
  }

  async remove(id: string): Promise<void> {
    const result = await this.leadsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }

  async getStatistics(agentId?: string): Promise<any> {
    const query = this.leadsRepository.createQueryBuilder('lead');
    
    if (agentId) {
      query.where('lead.assignedAgent = :agentId', { agentId });
    }

    const total = await query.getCount();
    
    const byStatus = await query
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    const bySource = await query
      .select('lead.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.source')
      .getRawMany();

    const conversionRate = await query
      .select('COUNT(CASE WHEN lead.status = :converted THEN 1 END)::float / COUNT(*)::float * 100', 'rate')
      .setParameter('converted', LeadStatus.CONVERTED)
      .getRawOne();

    const avgValue = await query
      .select('AVG(lead.value)', 'avgValue')
      .where('lead.value IS NOT NULL')
      .getRawOne();

    const recentLeads = await this.leadsRepository.find({
      where: agentId ? { assignedAgent: agentId } : {},
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      total,
      byStatus,
      bySource,
      conversionRate: conversionRate?.rate || 0,
      avgLeadValue: avgValue?.avgValue || 0,
      recentLeads,
    };
  }

  async bulkImport(leads: CreateLeadDto[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const leadData of leads) {
      try {
        await this.create(leadData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${leadData.email}: ${error.message}`);
      }
    }

    return results;
  }
}
