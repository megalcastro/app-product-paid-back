import { Controller, Post, Body, Param, HttpException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { WebhookDto } from './webhook.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-transaction/:orderId')
  async createTransaction(@Param('orderId') orderId: string) {
    const transactionId = await this.paymentService.createTransaction(orderId);
    return { transactionId };
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: WebhookDto) {
    try {
      console.log('Received Webhook:', webhookData);

    
     // await this.paymentService.handlePayment(webhookData.data.transaction);

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error handling webhook:', error.message);
      throw new HttpException(
        { message: 'Failed to process webhook', error: error.message },
        500
      );
    }
  }

}
