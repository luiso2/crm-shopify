import { PartialType } from '@nestjs/mapped-types';
import { CreateShopifyProductDto } from './create-shopify-product.dto';

export class UpdateShopifyProductDto extends PartialType(CreateShopifyProductDto) {}
