import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponStatus, CouponType } from './coupon.entity';
import { CouponUsage } from './coupon-usage.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private couponUsageRepository: Repository<CouponUsage>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    // Check if code already exists
    const existingCoupon = await this.couponsRepository.findOne({
      where: { code: createCouponDto.code },
    });

    if (existingCoupon) {
      throw new BadRequestException(`Coupon with code ${createCouponDto.code} already exists`);
    }

    const coupon = this.couponsRepository.create({
      id: uuidv4(),
      ...createCouponDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.couponsRepository.save(coupon);
  }

  async findAll(filters?: {
    status?: CouponStatus;
    type?: CouponType;
    search?: string;
  }): Promise<Coupon[]> {
    const query = this.couponsRepository.createQueryBuilder('coupon');

    if (filters?.status) {
      query.andWhere('coupon.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('coupon.type = :type', { type: filters.type });
    }

    if (filters?.search) {
      query.andWhere(
        '(coupon.code ILIKE :search OR coupon.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Update expired coupons
    await this.updateExpiredCoupons();

    return await query.orderBy('coupon.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({ 
      where: { id },
      relations: ['usages'] 
    });
    
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({ 
      where: { code: code.toUpperCase() },
      relations: ['usages']
    });
    
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    Object.assign(coupon, updateCouponDto, { updatedAt: new Date() });
    return await this.couponsRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponsRepository.remove(coupon);
  }

  async validateCoupon(code: string, customerId: string, orderAmount: number): Promise<{
    valid: boolean;
    reason?: string;
    discountAmount?: number;
  }> {
    try {
      const coupon = await this.findByCode(code);
      
      // Check if coupon is active
      if (coupon.status !== CouponStatus.ACTIVE) {
        return { valid: false, reason: 'Coupon is not active' };
      }

      // Check validity dates
      const now = new Date();
      if (coupon.validFrom && now < coupon.validFrom) {
        return { valid: false, reason: 'Coupon is not yet valid' };
      }
      
      if (coupon.validUntil && now > coupon.validUntil) {
        return { valid: false, reason: 'Coupon has expired' };
      }

      // Check max uses
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        return { valid: false, reason: 'Coupon has reached maximum uses' };
      }

      // Check customer usage limit
      if (coupon.maxUsesPerCustomer) {
        const customerUsageCount = await this.couponUsageRepository.count({
          where: { couponId: coupon.id, customerId }
        });
        
        if (customerUsageCount >= coupon.maxUsesPerCustomer) {
          return { valid: false, reason: 'You have already used this coupon the maximum number of times' };
        }
      }

      // Check minimum amount
      if (coupon.minimumAmount && orderAmount < coupon.minimumAmount) {
        return { valid: false, reason: `Order amount must be at least ${coupon.minimumAmount}` };
      }

      // Calculate discount
      let discountAmount = 0;
      switch (coupon.type) {
        case CouponType.PERCENTAGE:
          discountAmount = (orderAmount * coupon.value) / 100;
          break;
        case CouponType.FIXED_AMOUNT:
          discountAmount = Math.min(coupon.value, orderAmount);
          break;
        case CouponType.FREE_SHIPPING:
          // This would be handled separately
          discountAmount = 0;
          break;
      }

      return { valid: true, discountAmount };
      
    } catch (error) {
      return { valid: false, reason: 'Invalid coupon code' };
    }
  }

  async applyCoupon(applyCouponDto: ApplyCouponDto): Promise<CouponUsage> {
    const validation = await this.validateCoupon(
      applyCouponDto.code,
      applyCouponDto.customerId,
      applyCouponDto.orderAmount
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const coupon = await this.findByCode(applyCouponDto.code);

    // Create usage record
    const usage = this.couponUsageRepository.create({
      id: uuidv4(),
      couponId: coupon.id,
      customerId: applyCouponDto.customerId,
      orderId: applyCouponDto.orderId,
      discountAmount: validation.discountAmount,
      metadata: applyCouponDto.metadata,
      usedAt: new Date(),
    });

    await this.couponUsageRepository.save(usage);

    // Update coupon usage count
    coupon.currentUses += 1;
    await this.couponsRepository.save(coupon);

    return usage;
  }

  async getCouponUsage(couponId: string): Promise<CouponUsage[]> {
    return await this.couponUsageRepository.find({
      where: { couponId },
      order: { usedAt: 'DESC' },
    });
  }

  async getCustomerCoupons(customerId: string): Promise<CouponUsage[]> {
    return await this.couponUsageRepository.find({
      where: { customerId },
      relations: ['coupon'],
      order: { usedAt: 'DESC' },
    });
  }

  async updateExpiredCoupons(): Promise<void> {
    await this.couponsRepository
      .createQueryBuilder()
      .update(Coupon)
      .set({ status: CouponStatus.EXPIRED })
      .where('validUntil < :now', { now: new Date() })
      .andWhere('status != :expired', { expired: CouponStatus.EXPIRED })
      .execute();
  }

  async getStats(): Promise<any> {
    const totalCoupons = await this.couponsRepository.count();
    const activeCoupons = await this.couponsRepository.count({ 
      where: { status: CouponStatus.ACTIVE } 
    });
    
    const totalUsage = await this.couponUsageRepository.count();
    
    const totalDiscount = await this.couponUsageRepository
      .createQueryBuilder('usage')
      .select('SUM(usage.discountAmount)', 'total')
      .getRawOne();

    const byType = await this.couponsRepository
      .createQueryBuilder('coupon')
      .select('coupon.type, COUNT(*) as count')
      .groupBy('coupon.type')
      .getRawMany();

    const topCoupons = await this.couponsRepository
      .createQueryBuilder('coupon')
      .select('coupon.*, COUNT(usage.id) as usageCount')
      .leftJoin('coupon.usages', 'usage')
      .groupBy('coupon.id')
      .orderBy('usageCount', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons: totalCoupons - activeCoupons,
      totalUsage,
      totalDiscountGiven: parseFloat(totalDiscount?.total || '0'),
      byType,
      topCoupons,
    };
  }
}
