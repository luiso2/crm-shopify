import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyCustomersController } from './shopify-customers.controller';
import { ShopifyCustomersService } from './shopify-customers.service';
import { ShopifyCustomer } from './shopify-customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopifyCustomer])],
  controllers: [ShopifyCustomersController],
  providers: [ShopifyCustomersService],
  exports: [ShopifyCustomersService],
})
export class ShopifyCustomersModule {}
