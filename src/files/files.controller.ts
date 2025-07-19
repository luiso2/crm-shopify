import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { File } from './file.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<File> {
    return this.filesService.saveFile(file, req.user?.userId);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @HttpCode(HttpStatus.CREATED)
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ): Promise<File[]> {
    const uploadedFiles: File[] = [];
    
    for (const file of files) {
      const savedFile = await this.filesService.saveFile(file, req.user?.userId);
      uploadedFiles.push(savedFile);
    }
    
    return uploadedFiles;
  }

  @Get()
  findAll(
    @Query('uploadedBy') uploadedBy?: string,
    @Query('mimeType') mimeType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<File[]> {
    const filters = {
      uploadedBy,
      mimeType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.filesService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.filesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<File> {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, file } = await this.filesService.getFileBuffer(id);
    
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': file.size,
    });
    
    res.send(buffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.filesService.remove(id);
  }
}
