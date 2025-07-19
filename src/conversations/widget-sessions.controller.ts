import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Param,
  Headers,
  Ip,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { WidgetSessionsService } from './widget-sessions.service';

@Controller('widget-sessions')
export class WidgetSessionsController {
  constructor(private readonly widgetSessionsService: WidgetSessionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSession(
    @Body() body: {
      visitorId?: string;
      userId?: string;
      visitorName?: string;
      visitorEmail?: string;
      pageUrl?: string;
      referrerUrl?: string;
    },
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.widgetSessionsService.createSession({
      ...body,
      userAgent,
      ipAddress,
    });
  }

  @Put(':sessionId')
  updateSession(
    @Param('sessionId') sessionId: string,
    @Body() updates: any,
  ) {
    return this.widgetSessionsService.updateSession(sessionId, updates);
  }

  @Put(':sessionId/activity')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateActivity(@Param('sessionId') sessionId: string) {
    return this.widgetSessionsService.updateActivity(sessionId);
  }

  @Put(':sessionId/end')
  @HttpCode(HttpStatus.NO_CONTENT)
  endSession(@Param('sessionId') sessionId: string) {
    return this.widgetSessionsService.endSession(sessionId);
  }

  @Get('active')
  getActiveSessions() {
    return this.widgetSessionsService.getActiveSessions();
  }

  @Get('stats')
  getStats() {
    return this.widgetSessionsService.getSessionStats();
  }

  @Get(':sessionId')
  findOne(@Param('sessionId') sessionId: string) {
    return this.widgetSessionsService.findBySessionId(sessionId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.widgetSessionsService.findActiveSessionsByUser(userId);
  }

  @Get('visitor/:visitorId')
  findByVisitor(@Param('visitorId') visitorId: string) {
    return this.widgetSessionsService.findActiveSessionsByVisitor(visitorId);
  }
}
