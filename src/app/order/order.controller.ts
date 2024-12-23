import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../../entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() orderData: any): Promise<Order> {
    return this.orderService.create(orderData);
  }

  @Get()
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Put(':id/payment')
  async handlePayment(
    @Param('id') id: string,
    @Body() paymentResult: { result: string },
  ): Promise<Order> {
    return this.orderService.handlePayment(id, paymentResult.result);
  }
}
