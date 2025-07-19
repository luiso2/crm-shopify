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
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ShopifyProductsService } from './shopify-products.service';
import { CreateShopifyProductDto } from './dto/create-shopify-product.dto';
import { UpdateShopifyProductDto } from './dto/update-shopify-product.dto';
import { ShopifyProduct } from './shopify-product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shopify/products')
@UseGuards(JwtAuthGuard)
export class ShopifyProductsController {
  constructor(private readonly shopifyProductsService: ShopifyProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateShopifyProductDto): Promise<ShopifyProduct> {
    return this.shopifyProductsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('isActive') isActive?: string,
    @Query('vendor') vendor?: string,
    @Query('productType') productType?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
  ): Promise<ShopifyProduct[]> {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      vendor,
      productType,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
    };

    return this.shopifyProductsService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.shopifyProductsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ShopifyProduct> {
    return this.shopifyProductsService.findOne(id);
  }

  @Get('shopify/:shopifyId')
  findByShopifyId(@Param('shopifyId') shopifyId: string): Promise<ShopifyProduct> {
    return this.shopifyProductsService.findByShopifyId(shopifyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateShopifyProductDto,
  ): Promise<ShopifyProduct> {
    return this.shopifyProductsService.update(id, updateProductDto);
  }

  @Put(':id/inventory')
  updateInventory(
    @Param('id') id: string,
    @Body('inventory') inventory: number,
  ): Promise<ShopifyProduct> {
    return this.shopifyProductsService.updateInventory(id, inventory);
  }

  @Put(':id/toggle-active')
  toggleActive(@Param('id') id: string): Promise<ShopifyProduct> {
    return this.shopifyProductsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.shopifyProductsService.remove(id);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  syncFromShopify(@Body() shopifyProducts: any[]): Promise<ShopifyProduct[]> {
    return this.shopifyProductsService.syncFromShopify(shopifyProducts);
  }
}
