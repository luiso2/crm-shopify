import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportType, ReportStatus } from './report.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createReportDto: CreateReportDto,
    @Request() req,
  ): Promise<Report> {
    return this.reportsService.create(createReportDto, req.user?.userId);
  }

  @Get()
  findAll(
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
    @Query('generatedBy') generatedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Report[]> {
    const filters = {
      type,
      status,
      generatedBy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.reportsService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.reportsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findOne(id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, report } = await this.reportsService.getReportFile(id);
    
    const mimeTypes = {
      PDF: 'application/pdf',
      EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      CSV: 'text/csv',
      JSON: 'application/json',
    };
    
    res.set({
      'Content-Type': mimeTypes[report.format],
      'Content-Disposition': `attachment; filename="${report.name}.${report.format.toLowerCase()}"`,
      'Content-Length': report.fileSize,
    });
    
    res.send(buffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.reportsService.remove(id);
  }
}
