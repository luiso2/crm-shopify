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
import { ShopifyCustomersService } from './shopify-customers.service';
import { ShopifyCustomer } from './shopify-customer.entity';

@Controller('shopify-customers')
export class ShopifyCustomersController {
  constructor(private readonly shopifyCustomersService: ShopifyCustomersService) {}

  @Get()
  findAll(
    @Query('acceptsMarketing') acceptsMarketing?: string,
    @Query('minSpent') minSpent?: string,
    @Query('minOrders') minOrders?: string,
  ): Promise<ShopifyCustomer[]> {
    const filters: any = {};
    
    if (acceptsMarketing !== undefined) {
      filters.acceptsMarketing = acceptsMarketing === 'true';
    }
    if (minSpent) {
      filters.minSpent = parseFloat(minSpent);
    }
    if (minOrders) {
      filters.minOrders = parseInt(minOrders);
    }

    return this.shopifyCustomersService.findAll(filters);
  }

  @Get('top')
  getTopCustomers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.shopifyCustomersService.getTopCustomers(limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ShopifyCustomer> {
    return this.shopifyCustomersService.findOne(id);
  }

  @Get('shopify/:shopifyId')
  findByShopifyId(@Param('shopifyId') shopifyId: string): Promise<ShopifyCustomer> {
    return this.shopifyCustomersService.findByShopifyId(shopifyId);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string): Promise<ShopifyCustomer> {
    return this.shopifyCustomersService.findByEmail(email);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() customerData: Partial<ShopifyCustomer>): Promise<ShopifyCustomer> {
    return this.shopifyCustomersService.create(customerData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() customerData: Partial<ShopifyCustomer>,
  ): Promise<ShopifyCustomer> {
    return this.shopifyCustomersService.update(id, customerData);
  }

  @Put(':id/order-stats')
  updateOrderStats(
    @Param('id') id: string,
    @Body('orderAmount') orderAmount: number,
  ): Promise<void> {
    return this.shopifyCustomersService.updateOrderStats(id, orderAmount);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.shopifyCustomersService.remove(id);
  }
}
