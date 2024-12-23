import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-transaction/:orderId')
  async createTransaction(@Param('orderId') orderId: string) {
    const transactionId = await this.paymentService.createTransaction(orderId);
    return { transactionId };
  }

  @Post('handle-payment/:orderId')
  async handlePayment(
    @Param('orderId') orderId: string,
    @Body('transactionResult') transactionResult: string
  ) {
    await this.paymentService.handlePayment(orderId, transactionResult);
    return { message: 'Payment processed successfully' };
  }
}
