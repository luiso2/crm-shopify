import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageType, SenderType } from './message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  findAll(
    @Query('conversationId') conversationId?: string,
    @Query('senderId') senderId?: string,
    @Query('senderType') senderType?: SenderType,
    @Query('type') type?: MessageType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Message[]> {
    const filters = {
      conversationId,
      senderId,
      senderType,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.messagesService.findAll(filters);
  }

  @Get('conversation/:conversationId')
  findByConversation(
    @Param('conversationId') conversationId: string
  ): Promise<Message[]> {
    return this.messagesService.findByConversation(conversationId);
  }

  @Get('conversation/:conversationId/stats')
  getConversationStats(@Param('conversationId') conversationId: string) {
    return this.messagesService.getConversationStats(conversationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Message> {
    return this.messagesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.messagesService.remove(id);
  }

  @Post('mark-as-read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Body('ids') ids: string[]): Promise<void> {
    return this.messagesService.markAsRead(ids);
  }
}
