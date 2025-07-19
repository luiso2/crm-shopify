import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';

export class CreateShopifyProductDto {
  @IsString()
  shopifyProductId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  handle: string;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  compareAtPrice?: number;

  @IsNumber()
  @IsOptional()
  inventory?: number = 0;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsObject()
  @IsOptional()
  images?: any;

  @IsObject()
  @IsOptional()
  variants?: any;
}
