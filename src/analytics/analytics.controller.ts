import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDashboardMetrics(startDate, endDate);
  }

  @Get('sales')
  async getSalesMetrics(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSalesMetrics(period, startDate, endDate);
  }

  @Get('customers')
  async getCustomerMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getCustomerMetrics(startDate, endDate);
  }

  @Get('products')
  async getProductMetrics(
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getProductMetrics(Number(limit), startDate, endDate);
  }

  @Get('revenue')
  async getRevenueMetrics(
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueMetrics(groupBy, startDate, endDate);
  }

  @Get('conversions')
  async getConversionMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getConversionMetrics(startDate, endDate);
  }

  @Get('support')
  async getSupportMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSupportMetrics(startDate, endDate);
  }

  @Get('subscriptions')
  async getSubscriptionMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSubscriptionMetrics(startDate, endDate);
  }

  @Get('kpis')
  async getKPIs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getKPIs(startDate, endDate);
  }

  @Get('export')
  async exportReport(
    @Query('type') type: 'sales' | 'customers' | 'products' | 'full' = 'full',
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.exportReport(type, format, startDate, endDate);
  }
}
