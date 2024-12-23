import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Product } from '../../entities/product.entity';
import { Customer } from '../../entities/customer.entity';
import { OrderStatus } from './order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(orderData: any): Promise<Order> {
    const customer = await this.customerRepository.findOneBy({ id: orderData.customerId });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${orderData.customerId} not found`);
    }

    const order = this.orderRepository.create({
      customer,
      status: OrderStatus.PENDING,
      items: [],
    });

    let totalAmount = 0;

    for (const itemData of orderData.items) {
      const product = await this.productRepository.findOneBy({ id: itemData.productId });
      if (!product) {
        throw new NotFoundException(`Product with ID ${itemData.productId} not found`);
      }

      const orderItem = this.orderItemRepository.create({
        product,
        quantity: itemData.quantity,
      });

      totalAmount += product.price * itemData.quantity;

      product.stock -= itemData.quantity;
      await this.productRepository.save(product);

      order.items.push(orderItem);
    }

    order.totalAmount = totalAmount;

    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['customer', 'items', 'items.product'] });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    const order = await this.orderRepository.preload({
      id: id,
      ...orderData,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.orderRepository.save(order);

    return order;
  }

  async remove(id: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    for (const item of order.items) {
      const product = await this.productRepository.findOneBy({ id: item.product.id });
      if (product) {
        product.stock += item.quantity;
        await this.productRepository.save(product);
      }
    }

    await this.orderRepository.delete(id);
  }

  async handlePayment(orderId: string, paymentResult: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (paymentResult === 'success') {
      order.status = OrderStatus.PAID;
    } else {
      order.status = OrderStatus.FAILED;
    }

    // Update the order status
    await this.orderRepository.save(order);

    return order;
  }
}
