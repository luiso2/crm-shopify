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
import { StripeCustomersService } from './stripe-customers.service';
import { StripeCustomer } from './stripe-customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stripe-customers')
@UseGuards(JwtAuthGuard)
export class StripeCustomersController {
  constructor(private readonly stripeCustomersService: StripeCustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: any) {
    return this.stripeCustomersService.create(createCustomerDto);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.stripeCustomersService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stripeCustomersService.findOne(id);
  }

  @Get('stripe/:stripeCustomerId')
  async findByStripeId(@Param('stripeCustomerId') stripeCustomerId: string) {
    return this.stripeCustomersService.findByStripeId(stripeCustomerId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.stripeCustomersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.stripeCustomersService.remove(id);
  }

  @Post(':id/sync')
  async syncWithStripe(@Param('id') id: string) {
    return this.stripeCustomersService.syncWithStripe(id);
  }

  @Post(':id/payment-method')
  async addPaymentMethod(
    @Param('id') id: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    return this.stripeCustomersService.addPaymentMethod(id, paymentMethodId);
  }

  @Delete(':id/payment-method/:paymentMethodId')
  async removePaymentMethod(
    @Param('id') id: string,
    @Param('paymentMethodId') paymentMethodId: string,
  ) {
    return this.stripeCustomersService.removePaymentMethod(id, paymentMethodId);
  }

  @Put(':id/default-payment-method')
  async setDefaultPaymentMethod(
    @Param('id') id: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    return this.stripeCustomersService.setDefaultPaymentMethod(id, paymentMethodId);
  }

  @Get(':id/payments')
  async getCustomerPayments(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.stripeCustomersService.getCustomerPayments(id, {
      page: Number(page),
      limit: Number(limit),
    });
  }
}
