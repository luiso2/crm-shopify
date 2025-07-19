import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
    uploadedBy?: string
  ): Promise<File> {
    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const filename = `${fileId}${fileExtension}`;
    const filePath = path.join(this.uploadPath, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Save file info to database
    const fileEntity = this.filesRepository.create({
      id: fileId,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      uploadedBy,
      createdAt: new Date(),
    });

    return await this.filesRepository.save(fileEntity);
  }

  async findAll(filters?: {
    uploadedBy?: string;
    mimeType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<File[]> {
    const query = this.filesRepository.createQueryBuilder('file');

    if (filters?.uploadedBy) {
      query.andWhere('file.uploadedBy = :uploadedBy', { 
        uploadedBy: filters.uploadedBy 
      });
    }

    if (filters?.mimeType) {
      query.andWhere('file.mimeType LIKE :mimeType', { 
        mimeType: `%${filters.mimeType}%` 
      });
    }

    if (filters?.startDate) {
      query.andWhere('file.createdAt >= :startDate', { 
        startDate: filters.startDate 
      });
    }

    if (filters?.endDate) {
      query.andWhere('file.createdAt <= :endDate', { 
        endDate: filters.endDate 
      });
    }

    return await query.orderBy('file.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<File> {
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async getFileBuffer(id: string): Promise<{ buffer: Buffer; file: File }> {
    const file = await this.findOne(id);
    
    if (!fs.existsSync(file.path)) {
      throw new NotFoundException(`File not found on disk: ${file.path}`);
    }

    const buffer = fs.readFileSync(file.path);
    return { buffer, file };
  }

  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);
    
    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await this.filesRepository.remove(file);
  }

  async getStats(): Promise<any> {
    const totalFiles = await this.filesRepository.count();
    
    const totalSize = await this.filesRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'total')
      .getRawOne();

    const byType = await this.filesRepository
      .createQueryBuilder('file')
      .select('file.mimeType, COUNT(*) as count, SUM(file.size) as totalSize')
      .groupBy('file.mimeType')
      .getRawMany();

    const byUploader = await this.filesRepository
      .createQueryBuilder('file')
      .select('file.uploadedBy, COUNT(*) as count')
      .groupBy('file.uploadedBy')
      .getRawMany();

    return {
      totalFiles,
      totalSize: parseInt(totalSize?.total || '0'),
      averageSize: totalFiles > 0 ? parseInt(totalSize?.total || '0') / totalFiles : 0,
      byType,
      byUploader,
    };
  }
}
