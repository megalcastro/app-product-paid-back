import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { Product } from 'src/entities/product.entity';
import { Customer } from 'src/entities/customer.entity';
import { PaymentService } from '../payment-services/payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Customer]),
  ],
  providers: [OrderService, PaymentService],
  controllers: [OrderController]
})
export class OrderModule {}
