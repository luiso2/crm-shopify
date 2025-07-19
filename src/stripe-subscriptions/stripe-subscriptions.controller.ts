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
import { StripeSubscriptionsService } from './stripe-subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stripe-subscriptions')
@UseGuards(JwtAuthGuard)
export class StripeSubscriptionsController {
  constructor(private readonly subscriptionsService: StripeSubscriptionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubscriptionDto: any) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.subscriptionsService.findAll({
      page: Number(page),
      limit: Number(limit),
      status,
      customerId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSubscriptionDto: any) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('atPeriodEnd') atPeriodEnd = true,
  ) {
    return this.subscriptionsService.cancel(id, atPeriodEnd);
  }

  @Post(':id/reactivate')
  async reactivate(@Param('id') id: string) {
    return this.subscriptionsService.reactivate(id);
  }

  @Post(':id/pause')
  async pause(@Param('id') id: string, @Body() pauseOptions: any) {
    return this.subscriptionsService.pause(id, pauseOptions);
  }

  @Post(':id/resume')
  async resume(@Param('id') id: string) {
    return this.subscriptionsService.resume(id);
  }

  @Put(':id/payment-method')
  async updatePaymentMethod(
    @Param('id') id: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    return this.subscriptionsService.updatePaymentMethod(id, paymentMethodId);
  }

  @Post(':id/sync')
  async syncWithStripe(@Param('id') id: string) {
    return this.subscriptionsService.syncWithStripe(id);
  }

  @Get('customer/:customerId')
  async getCustomerSubscriptions(
    @Param('customerId') customerId: string,
    @Query('status') status?: string,
  ) {
    return this.subscriptionsService.getCustomerSubscriptions(customerId, status);
  }

  @Get(':id/invoices')
  async getSubscriptionInvoices(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.subscriptionsService.getSubscriptionInvoices(id, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Post(':id/preview-changes')
  async previewChanges(@Param('id') id: string, @Body() changes: any) {
    return this.subscriptionsService.previewChanges(id, changes);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
