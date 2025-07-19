import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ShopifyOrdersService } from './shopify-orders.service';
import { ShopifyOrder } from './shopify-order.entity';

@Controller('shopify-orders')
export class ShopifyOrdersController {
  constructor(private readonly shopifyOrdersService: ShopifyOrdersService) {}

  @Get()
  findAll(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ShopifyOrder[]> {
    const filters: any = {};
    
    if (customerId) filters.customerId = customerId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.shopifyOrdersService.findAll(filters);
  }

  @Get('stats')
  getStats(@Query('customerId') customerId?: string) {
    return this.shopifyOrdersService.getOrderStats(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ShopifyOrder> {
    return this.shopifyOrdersService.findOne(id);
  }

  @Get('shopify/:shopifyId')
  findByShopifyId(@Param('shopifyId') shopifyId: string): Promise<ShopifyOrder> {
    return this.shopifyOrdersService.findByShopifyId(shopifyId);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string): Promise<ShopifyOrder[]> {
    return this.shopifyOrdersService.findByCustomer(customerId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() orderData: Partial<ShopifyOrder>): Promise<ShopifyOrder> {
    return this.shopifyOrdersService.create(orderData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() orderData: Partial<ShopifyOrder>,
  ): Promise<ShopifyOrder> {
    return this.shopifyOrdersService.update(id, orderData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.shopifyOrdersService.remove(id);
  }
}
