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
  Request,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('agentId') agentId?: string,
    @Query('customerId') customerId?: string,
    @Query('priority') priority?: string,
  ) {
    return this.conversationsService.findAll({
      status,
      agentId,
      customerId,
      priority,
    });
  }

  @Get('stats')
  getStats() {
    return this.conversationsService.getConversationStats();
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.conversationsService.getUnreadCount(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.conversationsService.getMessages(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(createConversationDto);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  addMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.conversationsService.addMessage(createMessageDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(id, updateConversationDto);
  }

  @Put(':id/assign')
  assignToAgent(
    @Param('id') id: string,
    @Body() body: { agentId: string },
  ) {
    return this.conversationsService.assignToAgent(id, body.agentId);
  }

  @Put(':id/mark-read')
  markMessagesAsRead(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.conversationsService.markMessagesAsRead(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }
}
