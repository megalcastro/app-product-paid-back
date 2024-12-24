import { Controller, Post, Body, Param, HttpException } from '@nestjs/common';
import { WebhookDto } from './webhook.dto';
import { WebHookService } from './webhook.service';

@Controller('webhook')
export class WebHookController {
  constructor(private readonly webhook: WebHookService) {}


  @Post()
  async handleWebhook(@Body() webhookData: WebhookDto) {
    try {
      console.log('Received Webhook:', webhookData);

      await this.webhook.handlePayments(webhookData.data.transaction);

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
