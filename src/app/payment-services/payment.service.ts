import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

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

}
