import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(['en', 'es', 'pt', 'fr', 'de', 'it', 'zh', 'ja'])
  language?: string;

  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: string;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
