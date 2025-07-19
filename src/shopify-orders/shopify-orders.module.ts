import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyOrdersController } from './shopify-orders.controller';
import { ShopifyOrdersService } from './shopify-orders.service';
import { ShopifyOrder } from './shopify-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopifyOrder])],
  controllers: [ShopifyOrdersController],
  providers: [ShopifyOrdersService],
  exports: [ShopifyOrdersService],
})
export class ShopifyOrdersModule {}
