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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { Coupon, CouponStatus, CouponType } from './coupon.entity';
import { CouponUsage } from './coupon-usage.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCouponDto: CreateCouponDto): Promise<Coupon> {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  findAll(
    @Query('status') status?: CouponStatus,
    @Query('type') type?: CouponType,
    @Query('search') search?: string,
  ): Promise<Coupon[]> {
    return this.couponsService.findAll({ status, type, search });
  }

  @Get('stats')
  getStats() {
    return this.couponsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Coupon> {
    return this.couponsService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<Coupon> {
    return this.couponsService.findByCode(code);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.couponsService.remove(id);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validateCoupon(@Body() validateCouponDto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(
      validateCouponDto.code,
      validateCouponDto.customerId,
      validateCouponDto.orderAmount,
    );
  }

  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  applyCoupon(@Body() applyCouponDto: ApplyCouponDto): Promise<CouponUsage> {
    return this.couponsService.applyCoupon(applyCouponDto);
  }

  @Get(':id/usage')
  getCouponUsage(@Param('id') id: string): Promise<CouponUsage[]> {
    return this.couponsService.getCouponUsage(id);
  }

  @Get('customer/:customerId')
  getCustomerCoupons(@Param('customerId') customerId: string): Promise<CouponUsage[]> {
    return this.couponsService.getCustomerCoupons(customerId);
  }
}
