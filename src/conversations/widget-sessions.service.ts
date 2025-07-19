import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WidgetSession } from './widget-session.entity';
import * as crypto from 'crypto';

@Injectable()
export class WidgetSessionsService {
  constructor(
    @InjectRepository(WidgetSession)
    private widgetSessionRepository: Repository<WidgetSession>,
  ) {}

  async createSession(data: {
    visitorId?: string;
    userId?: string;
    visitorName?: string;
    visitorEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    pageUrl?: string;
    referrerUrl?: string;
  }): Promise<WidgetSession> {
    const sessionId = this.generateSessionId();
    
    const session = this.widgetSessionRepository.create({
      sessionId,
      ...data,
      lastActivity: new Date(),
    });

    // Parse user agent for browser, OS, device info
    if (data.userAgent) {
      const parsedUA = this.parseUserAgent(data.userAgent);
      session.browser = parsedUA.browser;
      session.os = parsedUA.os;
      session.device = parsedUA.device;
    }

    return this.widgetSessionRepository.save(session);
  }

  async updateSession(sessionId: string, updates: Partial<WidgetSession>): Promise<WidgetSession> {
    await this.widgetSessionRepository.update(
      { sessionId },
      {
        ...updates,
        lastActivity: new Date(),
      }
    );

    return this.widgetSessionRepository.findOne({ where: { sessionId } });
  }

  async findBySessionId(sessionId: string): Promise<WidgetSession | null> {
    return this.widgetSessionRepository.findOne({ where: { sessionId } });
  }

  async findActiveSessionsByUser(userId: string): Promise<WidgetSession[]> {
    return this.widgetSessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActivity: 'DESC' },
    });
  }

  async findActiveSessionsByVisitor(visitorId: string): Promise<WidgetSession[]> {
    return this.widgetSessionRepository.find({
      where: { visitorId, isActive: true },
      order: { lastActivity: 'DESC' },
    });
  }

  async getActiveSessions(): Promise<WidgetSession[]> {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    return this.widgetSessionRepository
      .createQueryBuilder('session')
      .where('session.isActive = true')
      .andWhere('session.lastActivity > :thirtyMinutesAgo', { thirtyMinutesAgo })
      .orderBy('session.lastActivity', 'DESC')
      .getMany();
  }

  async endSession(sessionId: string): Promise<void> {
    await this.widgetSessionRepository.update(
      { sessionId },
      { isActive: false }
    );
  }

  async updateActivity(sessionId: string): Promise<void> {
    await this.widgetSessionRepository.update(
      { sessionId },
      { lastActivity: new Date() }
    );
  }

  async getSessionStats() {
    const totalSessions = await this.widgetSessionRepository.count();
    const activeSessions = await this.widgetSessionRepository.count({
      where: { isActive: true },
    });

    const browserStats = await this.widgetSessionRepository
      .createQueryBuilder('session')
      .select('session.browser', 'browser')
      .addSelect('COUNT(*)', 'count')
      .groupBy('session.browser')
      .getRawMany();

    const osStats = await this.widgetSessionRepository
      .createQueryBuilder('session')
      .select('session.os', 'os')
      .addSelect('COUNT(*)', 'count')
      .groupBy('session.os')
      .getRawMany();

    const deviceStats = await this.widgetSessionRepository
      .createQueryBuilder('session')
      .select('session.device', 'device')
      .addSelect('COUNT(*)', 'count')
      .groupBy('session.device')
      .getRawMany();

    return {
      total: totalSessions,
      active: activeSessions,
      byBrowser: browserStats,
      byOS: osStats,
      byDevice: deviceStats,
    };
  }

  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
  } {
    // Simplified UA parsing - in production, use a library like 'ua-parser-js'
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'MacOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Device detection
    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet')) device = 'Tablet';

    return { browser, os, device };
  }
}
