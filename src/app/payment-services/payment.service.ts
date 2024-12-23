import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { OrderStatus } from '../order/order-status.enum';
import { encrypt } from '../../utils/utils';



@Injectable()
export class PaymentService {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  async createTransaction(orderId: string): Promise<string> {
    try {
        const order = await this.orderService.findOne(orderId);
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const amountInCents = order.totalAmount * 100 * 1000;
        const signature = await encrypt({
            reference: order.id,
            amount: amountInCents,
            currency: 'COP'
        });

        const transactionPayload = {
            amount_in_cents: amountInCents,
            currency: 'COP',
            signature,
            customer_email: order.customer.email,
            payment_method: {
                installments: 1
            },
            reference: order.id,
            payment_source_id: 25841
        };

        console.log('payload',transactionPayload);

        const privateKey = process.env.PRIVATE_KEY;

        const config = {
            headers: {
                Authorization: `Bearer ${privateKey}`
            }
        };

        const { data } = await axios.post(
            `${process.env.BASE_URL_TRANSACTION}/v1/transactions`,
            transactionPayload,
            config
        );

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
          
          const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
          const errorMessage = error.response?.data || 'An error occurred while processing the payment';
          throw new HttpException(errorMessage, statusCode);
        } else {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}



  async handlePayment(orderId: string, transactionResult: string): Promise<void> {

    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (transactionResult === 'success') {
      await this.orderService.update(orderId, { status: OrderStatus.PAID });

      for (const item of order.items) {
        const product = await this.productService.findOne(item.product.id);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.product.id} not found`);
        }

        product.stock -= item.quantity;
        await this.productService.update(product.id, { stock: product.stock });
      }
    } else {
      await this.orderService.update(orderId, { status: OrderStatus.FAILED });
    }
  }
}
