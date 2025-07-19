import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopifyProduct } from './shopify-product.entity';
import { CreateShopifyProductDto } from './dto/create-shopify-product.dto';
import { UpdateShopifyProductDto } from './dto/update-shopify-product.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShopifyProductsService {
  private readonly logger = new Logger(ShopifyProductsService.name);

  constructor(
    @InjectRepository(ShopifyProduct)
    private shopifyProductsRepository: Repository<ShopifyProduct>,
  ) {}

  async create(createProductDto: CreateShopifyProductDto): Promise<ShopifyProduct> {
    const product = this.shopifyProductsRepository.create({
      id: uuidv4(),
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.shopifyProductsRepository.save(product);
  }

  async findAll(filters?: {
    isActive?: boolean;
    vendor?: string;
    productType?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ShopifyProduct[]> {
    const query = this.shopifyProductsRepository.createQueryBuilder('product');

    if (filters?.isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { 
        isActive: filters.isActive 
      });
    }

    if (filters?.vendor) {
      query.andWhere('product.vendor = :vendor', { 
        vendor: filters.vendor 
      });
    }

    if (filters?.productType) {
      query.andWhere('product.productType = :productType', { 
        productType: filters.productType 
      });
    }

    if (filters?.minPrice) {
      query.andWhere('product.price >= :minPrice', { 
        minPrice: filters.minPrice 
      });
    }

    if (filters?.maxPrice) {
      query.andWhere('product.price <= :maxPrice', { 
        maxPrice: filters.maxPrice 
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.handle ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query.orderBy('product.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<ShopifyProduct> {
    const product = await this.shopifyProductsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findByShopifyId(shopifyProductId: string): Promise<ShopifyProduct> {
    const product = await this.shopifyProductsRepository.findOne({ 
      where: { shopifyProductId } 
    });
    if (!product) {
      throw new NotFoundException(`Product with Shopify ID ${shopifyProductId} not found`);
    }
    return product;
  }

  async update(
    id: string, 
    updateProductDto: UpdateShopifyProductDto
  ): Promise<ShopifyProduct> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto, { updatedAt: new Date() });
    return await this.shopifyProductsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.shopifyProductsRepository.remove(product);
  }

  async syncFromShopify(shopifyProducts: any[]): Promise<ShopifyProduct[]> {
    const syncedProducts: ShopifyProduct[] = [];
    
    for (const shopifyProduct of shopifyProducts) {
      try {
        // Check if product already exists
        let product = await this.shopifyProductsRepository.findOne({
          where: { shopifyProductId: shopifyProduct.id.toString() }
        });

        const productData = {
          shopifyProductId: shopifyProduct.id.toString(),
          title: shopifyProduct.title,
          description: shopifyProduct.body_html || '',
          handle: shopifyProduct.handle,
          productType: shopifyProduct.product_type,
          vendor: shopifyProduct.vendor,
          tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
          price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
          compareAtPrice: shopifyProduct.variants[0]?.compare_at_price 
            ? parseFloat(shopifyProduct.variants[0].compare_at_price) 
            : null,
          inventory: shopifyProduct.variants.reduce((sum, variant) => 
            sum + (variant.inventory_quantity || 0), 0
          ),
          images: shopifyProduct.images,
          variants: shopifyProduct.variants,
          isActive: shopifyProduct.status === 'active',
        };

        if (product) {
          // Update existing product
          Object.assign(product, productData, { updatedAt: new Date() });
        } else {
          // Create new product
          product = this.shopifyProductsRepository.create({
            id: uuidv4(),
            ...productData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        const savedProduct = await this.shopifyProductsRepository.save(product);
        syncedProducts.push(savedProduct);
        
      } catch (error) {
        this.logger.error(`Error syncing product ${shopifyProduct.id}:`, error);
      }
    }

    this.logger.log(`Synced ${syncedProducts.length} products from Shopify`);
    return syncedProducts;
  }

  async updateInventory(id: string, inventory: number): Promise<ShopifyProduct> {
    const product = await this.findOne(id);
    product.inventory = inventory;
    product.updatedAt = new Date();
    return await this.shopifyProductsRepository.save(product);
  }

  async toggleActive(id: string): Promise<ShopifyProduct> {
    const product = await this.findOne(id);
    product.isActive = !product.isActive;
    product.updatedAt = new Date();
    return await this.shopifyProductsRepository.save(product);
  }

  async getStats(): Promise<any> {
    const totalProducts = await this.shopifyProductsRepository.count();
    const activeProducts = await this.shopifyProductsRepository.count({ 
      where: { isActive: true } 
    });
    const outOfStock = await this.shopifyProductsRepository.count({ 
      where: { inventory: 0 } 
    });
    
    const avgPrice = await this.shopifyProductsRepository
      .createQueryBuilder('product')
      .select('AVG(product.price)', 'avg')
      .getRawOne();

    const byVendor = await this.shopifyProductsRepository
      .createQueryBuilder('product')
      .select('product.vendor, COUNT(*) as count')
      .groupBy('product.vendor')
      .getRawMany();

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      outOfStock,
      averagePrice: parseFloat(avgPrice?.avg || '0'),
      byVendor,
    };
  }
}
