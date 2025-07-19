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
import { SupportTicketsService } from './support-tickets.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  create(@Body() createSupportTicketDto: CreateSupportTicketDto) {
    return this.supportTicketsService.create(createSupportTicketDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('agentId') agentId?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.supportTicketsService.findAll({
      status,
      priority,
      agentId,
      customerId,
    });
  }

  @Get('statistics')
  getStatistics(@Query('agentId') agentId?: string) {
    return this.supportTicketsService.getStatistics(agentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportTicketsService.findOne(id);
  }

  @Get('number/:ticketNumber')
  findByTicketNumber(@Param('ticketNumber') ticketNumber: string) {
    return this.supportTicketsService.findByTicketNumber(ticketNumber);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupportTicketDto: UpdateSupportTicketDto) {
    return this.supportTicketsService.update(id, updateSupportTicketDto);
  }

  @Patch(':id/assign')
  assignAgent(@Param('id') id: string, @Body('agentId') agentId: string) {
    return this.supportTicketsService.assignAgent(id, agentId);
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body() body: {
      resolutionNotes: string;
      satisfactionRating?: number;
      feedbackComments?: string;
    },
  ) {
    return this.supportTicketsService.resolve(
      id,
      body.resolutionNotes,
      body.satisfactionRating,
      body.feedbackComments,
    );
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.supportTicketsService.close(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportTicketsService.remove(id);
  }
}
