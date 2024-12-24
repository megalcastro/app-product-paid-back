import { Module } from '@nestjs/common';
import { WebHookService } from './webhook.service';
import { OrderModule } from '../order/order.module'; // Asegúrate de importar OrderModule
import { ProductModule } from '../product/product.module'; // Asegúrate de importar ProductModule
import { WebHookController } from './webhook.controller';

@Module({
  imports: [OrderModule, ProductModule],  // Agrega OrderModule y ProductModule
  providers: [WebHookService],
  controllers: [WebHookController],
})
export class WebHookModule {}
