import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus, ReportType, ReportFormat } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly reportsPath = path.join(process.cwd(), 'reports');

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsPath)) {
      fs.mkdirSync(this.reportsPath, { recursive: true });
    }
  }

  async create(createReportDto: CreateReportDto, userId: string): Promise<Report> {
    const report = this.reportsRepository.create({
      id: uuidv4(),
      ...createReportDto,
      generatedBy: userId,
      status: ReportStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedReport = await this.reportsRepository.save(report);
    
    // Queue report generation (in a real app, this would be a job queue)
    this.generateReport(savedReport);
    
    return savedReport;
  }

  async findAll(filters?: {
    type?: ReportType;
    status?: ReportStatus;
    generatedBy?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Report[]> {
    const query = this.reportsRepository.createQueryBuilder('report');

    if (filters?.type) {
      query.andWhere('report.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters?.generatedBy) {
      query.andWhere('report.generatedBy = :generatedBy', { 
        generatedBy: filters.generatedBy 
      });
    }

    if (filters?.startDate) {
      query.andWhere('report.createdAt >= :startDate', { 
        startDate: filters.startDate 
      });
    }

    if (filters?.endDate) {
      query.andWhere('report.createdAt <= :endDate', { 
        endDate: filters.endDate 
      });
    }

    return await query.orderBy('report.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    
    // Delete file if exists
    if (report.filePath && fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }
    
    await this.reportsRepository.remove(report);
  }

  async getReportFile(id: string): Promise<{ buffer: Buffer; report: Report }> {
    const report = await this.findOne(id);
    
    if (!report.filePath || !fs.existsSync(report.filePath)) {
      throw new NotFoundException(`Report file not found`);
    }

    const buffer = fs.readFileSync(report.filePath);
    return { buffer, report };
  }

  private async generateReport(report: Report): Promise<void> {
    try {
      // Update status to processing
      report.status = ReportStatus.PROCESSING;
      report.startedAt = new Date();
      await this.reportsRepository.save(report);

      // Generate report based on type
      let data: any;
      switch (report.type) {
        case ReportType.SALES:
          data = await this.generateSalesReport(report.parameters);
          break;
        case ReportType.CUSTOMERS:
          data = await this.generateCustomersReport(report.parameters);
          break;
        case ReportType.PRODUCTS:
          data = await this.generateProductsReport(report.parameters);
          break;
        case ReportType.PAYMENTS:
          data = await this.generatePaymentsReport(report.parameters);
          break;
        case ReportType.SUPPORT:
          data = await this.generateSupportReport(report.parameters);
          break;
        default:
          data = await this.generateCustomReport(report.parameters);
      }

      // Save report based on format
      const filename = `${report.id}.${report.format.toLowerCase()}`;
      const filePath = path.join(this.reportsPath, filename);
      
      switch (report.format) {
        case ReportFormat.JSON:
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          break;
        case ReportFormat.CSV:
          // In a real app, use a CSV library
          const csv = this.convertToCSV(data);
          fs.writeFileSync(filePath, csv);
          break;
        default:
          // For PDF and Excel, you would use appropriate libraries
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }

      // Update report with results
      report.status = ReportStatus.COMPLETED;
      report.completedAt = new Date();
      report.filePath = filePath;
      report.fileSize = fs.statSync(filePath).size;
      report.result = { rowCount: data.length };
      
      await this.reportsRepository.save(report);
      
    } catch (error) {
      this.logger.error(`Error generating report ${report.id}:`, error);
      
      report.status = ReportStatus.FAILED;
      report.error = error.message;
      report.completedAt = new Date();
      
      await this.reportsRepository.save(report);
    }
  }

  private async generateSalesReport(parameters: any): Promise<any[]> {
    // Mock data - in real app, query from database
    return [
      { date: '2025-07-01', orders: 45, revenue: 5680.50, avgOrderValue: 126.23 },
      { date: '2025-07-02', orders: 52, revenue: 6234.75, avgOrderValue: 119.90 },
      { date: '2025-07-03', orders: 38, revenue: 4567.25, avgOrderValue: 120.19 },
    ];
  }

  private async generateCustomersReport(parameters: any): Promise<any[]> {
    // Mock data
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com', totalOrders: 15, totalSpent: 1890.50 },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', totalOrders: 8, totalSpent: 956.75 },
    ];
  }

  private async generateProductsReport(parameters: any): Promise<any[]> {
    // Mock data
    return [
      { id: '1', name: 'Product A', sold: 150, revenue: 4500.00, stock: 25 },
      { id: '2', name: 'Product B', sold: 87, revenue: 2610.00, stock: 142 },
    ];
  }

  private async generatePaymentsReport(parameters: any): Promise<any[]> {
    // Mock data
    return [
      { date: '2025-07-01', payments: 23, total: 2890.50, failed: 2 },
      { date: '2025-07-02', payments: 31, total: 3567.25, failed: 1 },
    ];
  }

  private async generateSupportReport(parameters: any): Promise<any[]> {
    // Mock data
    return [
      { date: '2025-07-01', tickets: 12, resolved: 10, avgResponseTime: '2.5 hours' },
      { date: '2025-07-02', tickets: 15, resolved: 14, avgResponseTime: '1.8 hours' },
    ];
  }

  private async generateCustomReport(parameters: any): Promise<any[]> {
    // Custom report logic based on parameters
    return [];
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  async getStats(): Promise<any> {
    const totalReports = await this.reportsRepository.count();
    const completedReports = await this.reportsRepository.count({ 
      where: { status: ReportStatus.COMPLETED } 
    });
    const failedReports = await this.reportsRepository.count({ 
      where: { status: ReportStatus.FAILED } 
    });
    
    const byType = await this.reportsRepository
      .createQueryBuilder('report')
      .select('report.type, COUNT(*) as count')
      .groupBy('report.type')
      .getRawMany();

    const byFormat = await this.reportsRepository
      .createQueryBuilder('report')
      .select('report.format, COUNT(*) as count')
      .groupBy('report.format')
      .getRawMany();

    return {
      totalReports,
      completedReports,
      failedReports,
      processingReports: totalReports - completedReports - failedReports,
      successRate: totalReports > 0 ? (completedReports / totalReports) * 100 : 0,
      byType,
      byFormat,
    };
  }
}
