import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { OrderStatus } from '../order/order-status.enum';
import { encrypt } from '../../utils/utils';



@Injectable()
export class PaymentService {
  constructor(
 
  ) {}

  async createTransaction(orderId: string, totalAmount: number, customerEmail: string): Promise<any> {
     
    try {
        const amountInCents = totalAmount * 100 * 1000;
        const signature = await encrypt({
            reference: orderId,
            amount: amountInCents,
            currency: 'COP'
        });

        const transactionPayload = {
            amount_in_cents: amountInCents,
            currency: 'COP',
            signature,
            customer_email: customerEmail,
            payment_method: {
                installments: 1
            },
            reference: orderId,
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


// async handlePayment(data: { orderId: string; transactionResult: string }): Promise<void> {
//   // Validar datos de entrada
//   if (!data || !data.orderId || !data.transactionResult) {
//     throw new BadRequestException('Invalid payment data provided');
//   }

//   // Buscar orden
//   const order = await this.orderService.findOne(data.orderId);
//   if (!order) {
//     throw new NotFoundException(`Order with ID ${data.orderId} not found`);
//   }

//   // Actualizar estado de la orden basado en el resultado de la transacción
//   if (data.transactionResult !== 'success') {
//     await this.orderService.update(data.orderId, { status: OrderStatus.FAILED });
//     return;
//   }

//   // Actualizar estado de la orden a "Pagada"
//   await this.orderService.update(data.orderId, { status: OrderStatus.PAID });

//   // Actualizar stock de los productos
//   const productStockUpdates = order.items.map(async (item) => {
//     const product = await this.productService.findOne(item.product.id);
//     if (!product) {
//       throw new NotFoundException(`Product with ID ${item.product.id} not found`);
//     }

//     if (product.stock < item.quantity) {
//       throw new BadRequestException(
//         `Insufficient stock for Product ID ${item.product.id}. Available: ${product.stock}, Requested: ${item.quantity}`,
//       );
//     }

//     return this.productService.update(product.id, {
//       stock: product.stock - item.quantity,
//     });
//   });

//   // Ejecutar las actualizaciones concurrentemente
//   await Promise.all(productStockUpdates);
// }
}
