import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

import { generateSignature } from '../../utils/utils';

type CreateTransactionParams = {
    orderId: string;
    totalAmount: number;
    customerEmail: string;
    installments: number;
    tokenCard: string;
  };



@Injectable()
export class PaymentService {

    private baseUrlTransaction = process.env.BASE_URL_TRANSACTION;
    private publicKey = process.env.PUBLIC_KEY;
  constructor(
    
  ) {}

   async createTransaction({
    orderId,
    totalAmount,
    customerEmail,
    installments = 0,
    tokenCard,
  }: CreateTransactionParams): Promise<any> {
    try {
      const privateKey = process.env.PRIVATE_KEY;
      
  
      if (!privateKey || !this.baseUrlTransaction) {
        throw new HttpException(
          'Missing required environment variables.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      const amountInCents = totalAmount * 100;
  

      const signature = generateSignature({
        amount_in_cents: amountInCents,
        reference: orderId,
        currency: 'COP',
      });

      let acceptance_token = await this.generateAcceptanceToken();

      console.log(acceptance_token);
  
      const transactionPayload = {
        amount_in_cents: amountInCents,
        currency: 'COP',
        acceptance_token: acceptance_token,
        signature,
        customer_email: customerEmail,
        payment_method_type: "CARD",
        payment_method: {
        type: "CARD",
        installments,
        token: tokenCard,
        },
        reference: orderId,
      };
  
      const config = {
        headers: {
          Authorization: `Bearer ${privateKey}`,
        },
      };
  
      const { data } = await axios.post(
        `${this.baseUrlTransaction}/v1/transactions`,
        transactionPayload,
        config
      );
  
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const errorMessage =
          error.response?.data || 'An error occurred while processing the payment';
        throw new HttpException(errorMessage, statusCode);
      } else {
        throw new HttpException('Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async generateAcceptanceToken() {

    console.log(this.baseUrlTransaction);
    console.log(this.publicKey);
    try {   
        const { data } = await axios.get(`${this.baseUrlTransaction}/v1/merchants/${this.publicKey}`);

          console.log(data);
          return data.data.presigned_acceptance.acceptance_token;
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const errorMessage =
          error.response?.data || 'An error occurred while processing the pay,ment';
  }

}
  }


}