import { Controller, Post, Body, Param, HttpException } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-transaction/:orderId')
  async createTransaction(@Param('orderId') orderId: string) {
    //const transactionId = await this.paymentService.createTransaction(orderId);
   // return { transactionId };
  }

}
