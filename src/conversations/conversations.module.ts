import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { WidgetSessionsController } from './widget-sessions.controller';
import { WidgetSessionsService } from './widget-sessions.service';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { WidgetSession } from './widget-session.entity';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, WidgetSession]),
    AgentsModule,
  ],
  controllers: [ConversationsController, WidgetSessionsController],
  providers: [ConversationsService, WidgetSessionsService],
  exports: [ConversationsService, WidgetSessionsService],
})
export class ConversationsModule {}
