import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('files')
export class File {
  @PrimaryColumn()
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  uploadedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
