import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    if (status) {
      return this.agentsService.findByStatus(status);
    }
    if (department) {
      return this.agentsService.findByDepartment(department);
    }
    return this.agentsService.findAll();
  }

  @Get('available')
  getAvailableAgent(@Query('department') department?: string) {
    return this.agentsService.getAvailableAgent(department);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.agentsService.findByUserId(userId);
  }

  @Get(':id/stats')
  getAgentStats(@Param('id') id: string) {
    return this.agentsService.getAgentStats(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.agentsService.updateStatus(id, body.status);
  }

  @Put(':id/increment-assigned')
  incrementAssignedTickets(@Param('id') id: string) {
    return this.agentsService.incrementAssignedTickets(id);
  }

  @Put(':id/increment-resolved')
  incrementResolvedTickets(@Param('id') id: string) {
    return this.agentsService.incrementResolvedTickets(id);
  }

  @Put(':id/metrics')
  updateMetrics(
    @Param('id') id: string,
    @Body() body: { avgResolutionTime: number; satisfactionRating: number },
  ) {
    return this.agentsService.updateMetrics(
      id,
      body.avgResolutionTime,
      body.satisfactionRating,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.agentsService.remove(id);
  }
}
