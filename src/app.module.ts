import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductModule } from './app/product/product.module';
import { CustomerModule } from './app/customer/customer.module';
import { OrderItemModule } from './app/order-item/order-item.module';
import { OrderModule } from './app/order/order.module';
import { PaymentModule } from './app/payment-services/payment.module';


@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: '',
    password: '',
    database: 'ecommerce',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),
  CustomerModule,
  OrderItemModule,
  OrderModule,
  ProductModule,
  PaymentModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
