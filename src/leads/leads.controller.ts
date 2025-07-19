import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus } from './lead.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Post('bulk-import')
  bulkImport(@Body() leads: CreateLeadDto[]) {
    return this.leadsService.bulkImport(leads);
  }

  @Get()
  findAll(
    @Query('status') status?: LeadStatus,
    @Query('source') source?: string,
    @Query('assignedAgent') assignedAgent?: string,
    @Query('company') company?: string,
  ) {
    return this.leadsService.findAll({
      status,
      source,
      assignedAgent,
      company,
    });
  }

  @Get('statistics')
  getStatistics(@Query('agentId') agentId?: string) {
    return this.leadsService.getStatistics(agentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/assign')
  assignAgent(@Param('id') id: string, @Body('agentId') agentId: string) {
    return this.leadsService.assignAgent(id, agentId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: LeadStatus) {
    return this.leadsService.updateStatus(id, status);
  }

  @Patch(':id/convert')
  convertToCustomer(@Param('id') id: string, @Body('customerId') customerId: string) {
    return this.leadsService.convertToCustomer(id, customerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
