import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyProductsController } from './shopify-products.controller';
import { ShopifyProductsService } from './shopify-products.service';
import { ShopifyProduct } from './shopify-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopifyProduct])],
  controllers: [ShopifyProductsController],
  providers: [ShopifyProductsService],
  exports: [ShopifyProductsService],
})
export class ShopifyProductsModule {}
