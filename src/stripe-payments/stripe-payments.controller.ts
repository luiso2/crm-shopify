import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StripePaymentsService } from './stripe-payments.service';
import { CreatePaymentDto, ProcessPaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentStatus } from './stripe-payment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stripe-payments')
@UseGuards(JwtAuthGuard)
export class StripePaymentsController {
  constructor(private readonly stripePaymentsService: StripePaymentsService) {}

  @Post('process')
  processPayment(@Body() processPaymentDto: ProcessPaymentDto) {
    return this.stripePaymentsService.processPayment(processPaymentDto);
  }

  @Post('intent')
  createPaymentIntent(@Body() createPaymentDto: CreatePaymentDto) {
    return this.stripePaymentsService.createPaymentIntent(createPaymentDto);
  }

  @Get()
  findAll(
    @Query('customerId') customerId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('orderId') orderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stripePaymentsService.findAll({
      customerId,
      status,
      orderId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('statistics')
  getStatistics(@Query('customerId') customerId?: string) {
    return this.stripePaymentsService.getStatistics(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stripePaymentsService.findOne(id);
  }

  @Get('stripe/:stripePaymentId')
  findByStripeId(@Param('stripePaymentId') stripePaymentId: string) {
    return this.stripePaymentsService.findByStripeId(stripePaymentId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.stripePaymentsService.updateStatus(id, status);
  }

  @Post(':id/refund')
  refundPayment(@Param('id') id: string, @Body() refundDto: RefundPaymentDto) {
    return this.stripePaymentsService.refundPayment(id, refundDto);
  }

  @Post('sync/:stripePaymentId')
  syncWithStripe(@Param('stripePaymentId') stripePaymentId: string) {
    return this.stripePaymentsService.syncWithStripe(stripePaymentId);
  }
}
